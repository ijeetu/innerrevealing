import { PoolConnection,ResultSetHeader,RowDataPacket } from 'mysql2/promise';
import { SessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { audit,enumValue,safeHttps,transaction } from '../admin/core';
import { mediaAdmin,storeMediaFile } from '../admin/media';
import { notify } from '../notifications';
import { rateLimit } from '../rate-limit';
import { assertLessonSequence } from '../lesson-access';
import { accessCourse,getRow,idValue,isStaff,jsonArray,pageData,pointsValue,safeContent,staffOnly,textValue,upsertAssignmentForLesson } from './education-core';

export async function assignmentFromInput(body:Record<string,unknown>,connection:PoolConnection|ReturnType<typeof database>=database()) {
  if(body.assignment_id||body.assignment_type_id)return getRow('ir_assignments',idValue(body.assignment_id||body.assignment_type_id),connection);
  const slug=String(body.assignment_slug||body.slug||'');if(/^assignment-\d+$/.test(slug))return getRow('ir_assignments',idValue(slug.slice(11)),connection);
  throw new ApiError(422,'Choose an assignment.');
}

export async function getAssignmentCurriculum(connection:PoolConnection|ReturnType<typeof database>,assignmentId:number) {
  const row=await getRow('ir_assignments',assignmentId,connection);const lesson=await getRow('ir_lessons',Number(row.lesson_id),connection);const chapter=await getRow('ir_chapters',Number(lesson.chapter_id),connection);const course=await getRow('ir_courses',Number(row.course_id),connection);
  let media=null;if(row.media_id)media=await getRow('ir_media',Number(row.media_id),connection);
  return {...row,id:Number(row.id),lesson_id:Number(row.lesson_id),slug:`assignment-${row.id}`,title:row.title,description:row.description,instructions:row.instructions,points:String(row.points),due_days:Number(row.due_days),max_file_size:Number(row.max_file_size),allowed_file_types:jsonArray<string>(row.allowed_file_types),media:media?`/api/media/${media.id}`:'',media_url:media?`/api/media/${media.id}`:'',media_extension:media?String(media.original_name).split('.').pop():'',is_active:Boolean(row.is_active),can_skip:Boolean(row.can_skip),order:Number(lesson.position),chapter_order:Number(chapter.position),type:'assignment',chapter:{id:Number(chapter.id),title:chapter.title,chapter_order:Number(chapter.position),is_active:true},course:{id:Number(course.id),title:course.title,slug:course.slug}};
}

async function submissionFiles(submissionId:number,connection:PoolConnection|ReturnType<typeof database>=database()) {
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT f.*,m.original_name,m.mime_type,m.byte_size,m.kind FROM ir_assignment_files f LEFT JOIN ir_media m ON m.id=f.media_id WHERE submission_id=? ORDER BY f.id',[submissionId]);
  return rows.map(row=>({id:Number(row.id),media_id:row.media_id?Number(row.media_id):null,type:row.media_id?'file':'url',file:row.media_id?`/api/media/${row.media_id}`:row.url,url:row.media_id?`/api/media/${row.media_id}`:row.url,file_extension:row.original_name?String(row.original_name).split('.').pop():'url',file_name:row.original_name||row.url,file_type:row.mime_type||'url',file_size:row.byte_size?Number(row.byte_size):null}));
}

async function studentSubmission(row:RowDataPacket) {
  const files=await submissionFiles(Number(row.id));const first=files[0];
  return {id:Number(row.id),submitted_file:first?.file||null,file_name:first?.file_name||null,file_size:first?.file_size||null,file_type:first?.file_type||null,status:row.status,status_label:row.status==='accepted'?'Accepted':row.status==='rejected'?'Rejected':'Submitted',feedback:row.feedback,grade:row.points===null?null:Number(row.points),comment:row.comment,submitted_at:row.submitted_at,submitted_at_formatted:row.submitted_at,time_ago:'',updated_at:row.updated_at,can_resubmit:row.status==='rejected',can_edit:row.status!=='accepted',can_delete:false,files};
}

export async function studentAssignment(row:RowDataPacket,user:SessionUser) {
  const assignment=await getAssignmentCurriculum(database(),Number(row.id));
  const [rows]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_assignment_submissions WHERE assignment_id=? AND user_id=? ORDER BY id DESC',[row.id,user.id]);
  const submissions=await Promise.all(rows.map(studentSubmission));
  return {...assignment,is_skip:0,created_at_formatted:row.created_at,time_ago:'',submissions,submission_stats:{total_submissions:rows.length,accepted_submissions:rows.filter(item=>item.status==='accepted').length,rejected_submissions:rows.filter(item=>item.status==='rejected').length,pending_submissions:rows.filter(item=>item.status==='submitted').length,latest_status:rows[0]?.status||null,has_submissions:rows.length>0}};
}

export async function learnerAssignments(body:Record<string,unknown>,user:SessionUser) {
  let courseId=body.course_id?idValue(body.course_id):null;
  if(body.chapter_id){const chapter=await getRow('ir_chapters',idValue(body.chapter_id));if(courseId&&courseId!==Number(chapter.course_id))throw new ApiError(422,'This chapter belongs to a different course.');courseId=Number(chapter.course_id);}
  if(courseId)await accessCourse(user,courseId);
  const values:(number|string)[]=[];
  let access='';if(!isStaff(user)){access=" AND EXISTS(SELECT 1 FROM ir_enrollments e WHERE e.user_id=? AND e.course_id=a.course_id AND e.status='active')";values.push(user.id);}
  if(courseId){access+=' AND a.course_id=?';values.push(courseId);}
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT a.*,l.chapter_id,c.title course_name,c.image course_image,ch.title chapter_title FROM ir_assignments a JOIN ir_lessons l ON l.id=a.lesson_id JOIN ir_chapters ch ON ch.id=l.chapter_id JOIN ir_courses c ON c.id=a.course_id WHERE a.is_active=1 AND l.is_published=1 AND c.status='published'${access} ORDER BY ch.position,l.position,a.id LIMIT 1000`,values);
  const chapters=new Map<number,{chapter_id:number;chapter_title:string;course_name:string;course_image:string;course_id:number;assignments:unknown[]}>();
  for(const row of rows){const chapterId=Number(row.chapter_id);if(!chapters.has(chapterId))chapters.set(chapterId,{chapter_id:chapterId,chapter_title:row.chapter_title,course_name:row.course_name,course_image:row.course_image,course_id:Number(row.course_id),assignments:[]});chapters.get(chapterId)!.assignments.push(await studentAssignment(row,user));}
  const all=Array.from(chapters.values());return {chapters:all,current_chapter_assignments:body.chapter_id?all.filter(chapter=>chapter.chapter_id===Number(body.chapter_id)):all};
}

async function submitAssignment(body:Record<string,unknown>,user:SessionUser,editing:boolean) {
  let existing:RowDataPacket|null=null;
  if(editing){existing=await getRow('ir_assignment_submissions',idValue(body.id||body.submission_id));if(Number(existing.user_id)!==user.id)throw new ApiError(404,'Submission not found.');if(existing.status==='accepted')throw new ApiError(409,'An accepted submission cannot be changed.');}
  const assignment=existing?await getRow('ir_assignments',Number(existing.assignment_id)):await assignmentFromInput(body);
  await accessCourse(user,Number(assignment.course_id),false);
  await assertLessonSequence(user,Number(assignment.lesson_id));
  const lesson=await getRow('ir_lessons',Number(assignment.lesson_id));if(!assignment.is_active||!lesson.is_published)throw new ApiError(404,'This assignment is not available.');
  const comment=body.comment===undefined?String(existing?.comment||''):String(body.comment).trim();if(comment.length>10000)throw new ApiError(422,'Your comment is too long.');
  const rawFiles=Array.isArray(body.files)?body.files:body.file?[body.file]:[];
  if(rawFiles.length>5)throw new ApiError(422,'Upload at most five files per submission.');
  const files=rawFiles.filter((file):file is File=>file instanceof File&&file.size>0);
  if(files.length!==rawFiles.length)throw new ApiError(422,'Choose valid, nonempty files.');
  const urls=(Array.isArray(body.urls)?body.urls:[]).map(value=>safeHttps(value,'Submission link'));
  if(urls.length>5)throw new ApiError(422,'Provide at most five links.');
  if(!editing&&!comment&&!files.length&&!urls.length)throw new ApiError(422,'Add a file, link or comment before submitting.');
  if(files.length)await rateLimit('assignment-files',String(user.id),20,3600);
  const [usage]=await database().execute<RowDataPacket[]>('SELECT COALESCE(SUM(byte_size),0) total FROM ir_media WHERE uploaded_by=?',[user.id]);
  const quota=Math.max(50,Number(process.env.UPLOAD_USER_QUOTA_MB)||500)*1024*1024;
  if(!isStaff(user)&&Number(usage[0].total)+files.reduce((sum,file)=>sum+file.size,0)>quota)throw new ApiError(413,'Your upload storage limit has been reached. Contact the centre for help.');
  const allowed=jsonArray<string>(assignment.allowed_file_types);const uploads:Awaited<ReturnType<typeof storeMediaFile>>[]=[];
  try {
    for(const file of files){const media=await storeMediaFile(file,user,'course',Number(assignment.max_file_size||10)*1024*1024);uploads.push(media);if(allowed.length&&!allowed.includes(media.kind))throw new ApiError(422,'This file type is not allowed for this assignment.');}
    return await transaction(async connection=>{
      await accessCourse(user,Number(assignment.course_id),false,connection);
      await getRow('ir_assignments',Number(assignment.id),connection,true);
      let id=existing?Number(existing.id):null;
      if(id){const locked=await getRow('ir_assignment_submissions',id,connection,true);if(locked.status==='accepted')throw new ApiError(409,'An accepted submission cannot be changed.');await connection.execute("UPDATE ir_assignment_submissions SET comment=?,status='submitted',points=NULL,feedback=NULL,reviewed_by=NULL,submitted_at=UTC_TIMESTAMP() WHERE id=? AND user_id=?",[comment,id,user.id]);}
      else {
        const [latest]=await connection.execute<RowDataPacket[]>('SELECT status FROM ir_assignment_submissions WHERE assignment_id=? AND user_id=? ORDER BY id DESC LIMIT 1 FOR UPDATE',[assignment.id,user.id]);
        if(latest[0]?.status==='accepted')throw new ApiError(409,'Your assignment is already accepted.');
        const [insert]=await connection.execute<ResultSetHeader>('INSERT INTO ir_assignment_submissions(assignment_id,user_id,comment) VALUES(?,?,?)',[assignment.id,user.id,comment]);id=insert.insertId;
      }
      if(uploads.length||urls.length){if(editing)await connection.execute('DELETE FROM ir_assignment_files WHERE submission_id=?',[id]);for(const media of uploads)await connection.execute('INSERT INTO ir_assignment_files(submission_id,media_id) VALUES(?,?)',[id,media.id]);for(const url of urls)await connection.execute('INSERT INTO ir_assignment_files(submission_id,url) VALUES(?,?)',[id,url]);}
      await audit(connection,user,editing?'assignment.submission.update':'assignment.submit','assignment_submission',id,{assignment_id:assignment.id});
      return {message:'Your assignment has been submitted for review.',submission_id:id,status:'submitted'};
    });
  } catch(error){for(const media of uploads)await mediaAdmin('DELETE',['media',String(media.id)],user,new URLSearchParams()).catch(()=>{});throw error;}
}

async function instructorSubmissions(body:Record<string,unknown>,user:SessionUser) {
  staffOnly(user);const assignment=await assignmentFromInput(body);const detail=await getAssignmentCurriculum(database(),Number(assignment.id));
  const values:(number|string)[]=[assignment.id];let where='s.assignment_id=?';
  if(body.status&&body.status!=='all'){where+=' AND s.status=?';values.push(body.status==='pending'?'submitted':enumValue(body.status,['submitted','accepted','rejected'],'submission status'));}
  if(body.search){where+=' AND (u.name LIKE ? OR u.email LIKE ?)';values.push('%'+String(body.search).slice(0,200)+'%','%'+String(body.search).slice(0,200)+'%');}
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT s.*,u.name,u.email FROM ir_assignment_submissions s JOIN ir_users u ON u.id=s.user_id WHERE ${where} ORDER BY s.submitted_at DESC,s.id DESC LIMIT 5000`,values);
  const page=pageData(rows,body,'/api/assignment-submissions');const items=await Promise.all(page.data.map(async row=>({id:Number(row.id),user:{id:Number(row.user_id),name:row.name,email:row.email,profile:''},assignment:{id:Number(assignment.id),title:assignment.title,points:String(assignment.points),chapter_name:detail.chapter.title},course:detail.course,status:row.status,comment:row.comment,feedback:row.feedback,points:row.points===null?'':String(row.points),rejection_reason:row.status==='rejected'?row.feedback:null,submitted_at:row.submitted_at,files:await submissionFiles(Number(row.id))})));
  return {...page,data:items,assignment:detail};
}

export async function handleAssignment(path:string,body:Record<string,unknown>,user:SessionUser):Promise<unknown> {
  if(path==='get-assignments')return learnerAssignments(body,user);
  if(path==='assignments/submit')return submitAssignment(body,user,false);
  if(path==='assignments/submission')return submitAssignment(body,user,true);
  staffOnly(user);
  if(path==='get-assignments-list') {
    const values:(number|string)[]=[];let where='1=1';if(body.slug){where+=' AND c.slug=?';values.push(String(body.slug));}if(body.id||body.course_id){where+=' AND c.id=?';values.push(idValue(body.course_id||body.id));}if(body.search){where+=' AND (a.title LIKE ? OR c.title LIKE ?)';values.push('%'+String(body.search).slice(0,200)+'%','%'+String(body.search).slice(0,200)+'%');}
    const [rows]=await database().execute<RowDataPacket[]>(`SELECT a.*,c.title course_name,ch.title chapter_name FROM ir_assignments a JOIN ir_courses c ON c.id=a.course_id JOIN ir_lessons l ON l.id=a.lesson_id JOIN ir_chapters ch ON ch.id=l.chapter_id WHERE ${where} ORDER BY a.id DESC LIMIT 5000`,values);
    return pageData(rows.map(row=>({...row,id:Number(row.id),assignment_name:row.title,assignment_slug:`assignment-${row.id}`,due_date:row.due_days?`${row.due_days} days after enrollment`:'',lecture_name:row.title,total_points:Number(row.points),can_skip:Boolean(row.can_skip),is_active:Boolean(row.is_active)})),body,'/api/get-assignments-list');
  }
  if(path==='assignment-submissions')return instructorSubmissions(body,user);
  if(path==='edit-assignment-submission')return transaction(async connection=>{
    const submission=await getRow('ir_assignment_submissions',idValue(body.submission_id),connection,true);const assignment=await getRow('ir_assignments',Number(submission.assignment_id),connection);
    const status=enumValue(body.status,['accepted','rejected'],'review status');const points=pointsValue(body.points,'Grade',0);if(points>Number(assignment.points))throw new ApiError(422,'The grade cannot exceed the assignment points.');
    const feedback=safeContent(body.feedback||'','Feedback',10000);
    await connection.execute('UPDATE ir_assignment_submissions SET status=?,points=?,feedback=?,reviewed_by=? WHERE id=?',[status,points,feedback,user.id,submission.id]);
    if(status==='accepted')await connection.execute('INSERT INTO ir_progress(user_id,lesson_id,completed,position_seconds) VALUES(?,?,1,0) ON DUPLICATE KEY UPDATE completed=1',[submission.user_id,assignment.lesson_id]);
    else {const [accepted]=await connection.execute<RowDataPacket[]>("SELECT id FROM ir_assignment_submissions WHERE assignment_id=? AND user_id=? AND status='accepted' AND id<>? LIMIT 1",[assignment.id,submission.user_id,submission.id]);if(!accepted.length)await connection.execute('UPDATE ir_progress SET completed=0 WHERE user_id=? AND lesson_id=?',[submission.user_id,assignment.lesson_id]);}
    await audit(connection,user,'assignment.grade','assignment_submission',submission.id,{status,points});await notify(connection,Number(submission.user_id),{title:'Assignment reviewed',message:`${assignment.title}: ${status==='accepted'?'accepted':'needs revision'}. Open your course to see the feedback.`,url:`/learn/${(await getRow('ir_courses',Number(assignment.course_id),connection)).slug}?lesson=${assignment.lesson_id}`});
    return {id:Number(submission.id),status,points,feedback};
  });
  if(path==='course-chapters/curriculum/assignment/update') {
    const assignment=await assignmentFromInput(body);let mediaId=assignment.media_id;
    if(body.assignment_media instanceof File){const media=await storeMediaFile(body.assignment_media,user,'course');mediaId=media.id;}
    return transaction(async connection=>{await getRow('ir_courses',Number(assignment.course_id),connection,true);const result=await upsertAssignmentForLesson(connection,Number(assignment.lesson_id),{...body,media_id:mediaId},user.id);await connection.execute('UPDATE ir_lessons SET title=?,is_published=? WHERE id=?',[result.title,result.is_active,assignment.lesson_id]);await audit(connection,user,'assignment.update','assignment',assignment.id);return result;});
  }
  throw new ApiError(404,'Assignment endpoint not found.');
}

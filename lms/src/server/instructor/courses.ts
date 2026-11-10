import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2/promise';
import { database } from '../db';
import { requireAdmin } from '../authorization';
import { getSessionUser, SessionUser } from '../auth';
import { ApiError } from '../errors';
import { success } from '../response';
import { assertSameOrigin } from '../request';
import { pageOptions, paginate } from '../catalogue';
import { audit, booleanValue, enumValue, getRow, idValue, insertRow, integerValue, optionalText, safeContent, safeHttps, SqlConnection, textValue, transaction, updateRow } from '../admin/core';
import { courseAdmin, ensureCoursePublishable } from '../admin/courses';
import { storeMediaFile } from '../admin/media';
import { readBody } from './body';
import { teachingCourse as ownedCourse, staffCourseScope, valueMoney } from './support';
import { buildSalesStatistics, DailySales } from './dashboard';
import { upsertAssignmentForLesson, upsertQuizForLesson } from './education-core';

type Fields = Record<string, unknown>;
function object(value: unknown): Fields { return typeof value === 'string' ? JSON.parse(value) : value && typeof value === 'object' ? value as Fields : {}; }
const list = (value: unknown): Fields[] => Array.isArray(value) ? value.map(object) : [];
const slug = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140) || 'practice';
async function metadata(table: 'ir_course_details'|'ir_lesson_details', id: number, connection: SqlConnection = database()) {
  const field = table === 'ir_course_details' ? 'course_id' : 'lesson_id';
  const [rows] = await connection.execute<RowDataPacket[]>(`SELECT metadata FROM ${table} WHERE ${field}=?`,[id]);
  return object(rows[0]?.metadata);
}
async function saveMetadata(table: 'ir_course_details'|'ir_lesson_details', id: number, value: Fields, connection: SqlConnection) {
  const field = table === 'ir_course_details' ? 'course_id' : 'lesson_id';
  await connection.execute(`INSERT INTO ${table}(${field},metadata) VALUES(?,?) ON DUPLICATE KEY UPDATE metadata=VALUES(metadata)`,[id,JSON.stringify(value)]);
}
function state(value: unknown, fallback = 'draft') { return value === undefined || value === '' ? fallback : enumValue(value, ['draft','publish','published','pending','archived'], 'course status') === 'archived' ? 'archived' : ['publish','published'].includes(String(value)) ? 'published' : 'draft'; }
function legacyStatus(value: unknown) { return value === 'published' ? 'publish' : value === 'archived' ? 'archived' : 'draft'; }
function duration(value: unknown) { const seconds = Number(value)||0; return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
function teachingScope(actor:SessionUser) {
  return actor.role==='superadmin'?staffCourseScope(actor):{sql:"(c.instructor_id=? OR EXISTS(SELECT 1 FROM ir_team_course_members team JOIN ir_team_invitations invitation ON invitation.id=team.invitation_id WHERE team.course_id=c.id AND invitation.invitee_user_id=? AND invitation.status='accepted' AND invitation.member_role='editor'))",values:[actor.id,actor.id]};
}
async function availableTags(actor:SessionUser) {
  const scope=teachingScope(actor);
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT d.metadata FROM ir_course_details d JOIN ir_courses c ON c.id=d.course_id WHERE ${scope.sql} ORDER BY c.id`,scope.values);
  const names=[...new Set(rows.flatMap(row=>list(object(row.metadata).tags).map(tag=>String(tag.name))))];
  return names.map((name,index)=>({id:index+1,name}));
}
async function saveCourse(body: Fields, actor: SessionUser, id?: number) {
  const existing = id ? await ownedCourse(actor,id) : undefined;
  const meta = id ? await metadata('ir_course_details',id) : {};
  if (body.thumbnail instanceof File && body.thumbnail.size) body.image = (await storeMediaFile(body.thumbnail,actor,'image',2*1024*1024)).url;
  if (body.intro_video instanceof File && body.intro_video.size) meta.preview_video = (await storeMediaFile(body.intro_video,actor,'course')).url;
  if (body.meta_image instanceof File && body.meta_image.size) meta.meta_image = (await storeMediaFile(body.meta_image,actor,'image',2*1024*1024)).url;
  const values: Fields = {};
  if (!existing || body.title !== undefined) values.title = textValue(body.title,'Course title',200);
  if (!existing) values.slug = `${slug(String(values.title))}-${randomBytes(3).toString('hex')}`;
  if (!existing || body.short_description !== undefined) values.short_description = textValue(body.short_description,'Summary',600);
  if (!existing || body.description !== undefined) values.description = safeContent(body.description ?? body.short_description,'Description');
  if (!existing || body.image !== undefined) values.image = safeHttps(body.image,'Thumbnail',true);
  for (const key of ['category_id','language_id']) if (!existing || body[key] !== undefined) values[key] = idValue(body[key],key);
  if (!existing) values.instructor_id = actor.id;
  if (!existing || body.level !== undefined) values.level = enumValue(body.level || 'beginner',['beginner','intermediate','advanced'],'level');
  if (!existing || body.price !== undefined || body.course_type !== undefined || body.discount_price !== undefined) {
    const free = body.course_type === 'free' || (!body.course_type && Number(body.price ?? existing?.price ?? 0) === 0);
    const original = free ? 0 : valueMoney(body.price ?? meta.list_price ?? existing?.price,'Course price',true);
    const discount = free || body.discount_price === '' || body.discount_price === null ? null : body.discount_price === undefined ? meta.discount_price ?? null : valueMoney(body.discount_price,'Discount price',true);
    if (discount !== null && Number(discount) > original) throw new ApiError(422,'Discount price cannot exceed the course price.');
    meta.list_price = original; meta.discount_price = discount;
    values.price = discount === null ? original : Number(discount);
  }
  if (!existing || body.status !== undefined || body.is_active !== undefined) values.status = body.is_active !== undefined && !booleanValue(body.is_active) ? 'draft' : state(body.status,existing?.status || 'draft');
  for (const key of ['meta_title','meta_description','meta_tags']) if (body[key] !== undefined) meta[key] = optionalText(body[key],key,2000);
  for (const key of ['sequential_access','certificate_enabled']) if (body[key] !== undefined) meta[key] = booleanValue(body[key]);
  if (body.certificate_fee !== undefined) meta.certificate_fee = valueMoney(body.certificate_fee,'Certificate amount',true);
  for (const [key, field] of [['learnings_data','learning'],['requirements_data','requirement']] as const) if (body[key] !== undefined) meta[key] = list(body[key]).map((entry,index)=>({id:index+1,[field]:textValue(entry[field] ?? entry.title,field,1000)}));
  if (body.course_tags !== undefined) {
    const available=await availableTags(actor);
    meta.tags=(Array.isArray(body.course_tags)?body.course_tags:[]).map((value,index)=>{
      const text=typeof value==='object'?String(object(value).name||''):String(value);
      const name=/^\d+$/.test(text)?available.find(tag=>tag.id===Number(text))?.name:String(text).replace(/^new__/,'');
      if(!name)throw new ApiError(422,'Choose an existing tag or enter a new tag.');
      return {id:index+1,name:textValue(name,'Tag',80)};
    });
  }
  const mayAssign = !existing || actor.role==='superadmin' || Number(existing.instructor_id)===actor.id;
  if (body.instructors !== undefined && mayAssign) {
    const ids = (Array.isArray(body.instructors)?body.instructors:[]).filter(Boolean).map(value=>idValue(typeof value==='object'?object(value).id:value));
    if (ids.length>50) throw new ApiError(422,'Select at most 50 co-instructors.');
    if (ids.length) { const [people]=await database().execute<RowDataPacket[]>(`SELECT id FROM ir_users WHERE is_active=1 AND role IN ('admin','superadmin') AND id IN (${ids.map(()=>'?').join(',')})`,ids);if(people.length!==new Set(ids).size)throw new ApiError(422,'Co-instructors must be active staff.'); }
    if(ids.length){const authorId=Number(existing?.instructor_id||actor.id);const [accepted]=await database().execute<RowDataPacket[]>(`SELECT invitee_user_id FROM ir_team_invitations WHERE inviter_id=? AND status='accepted' AND member_role='editor' AND invitee_user_id IN (${ids.map(()=>'?').join(',')})`,[authorId,...ids]);if(accepted.length!==new Set(ids).size)throw new ApiError(422,'Co-instructors must first accept an editor invitation from the course author.');}
    meta.instructors = ids;
  }
  return transaction(async connection=>{
    if(id)await getRow('ir_courses',id,connection,true);
    for (const key of ['category_id','language_id']) if(values[key]){const row=await getRow(key==='category_id'?'ir_categories':'ir_languages',Number(values[key]),connection);if(!row.is_active)throw new ApiError(422,'Choose an active category and course language.');}
    const courseId = id || await insertRow('ir_courses',values,connection);
    if(id&&Object.keys(values).length)await updateRow('ir_courses',id,values,connection);
    await saveMetadata('ir_course_details',courseId,meta,connection);
    if(body.instructors!==undefined&&mayAssign){
      const authorId=Number(existing?.instructor_id||actor.id);
      await connection.execute('DELETE m FROM ir_team_course_members m JOIN ir_team_invitations t ON t.id=m.invitation_id WHERE m.course_id=? AND t.inviter_id=?',[courseId,authorId]);
      for(const target of (meta.instructors||[]) as number[]){const [invites]=await connection.execute<RowDataPacket[]>("SELECT id FROM ir_team_invitations WHERE inviter_id=? AND invitee_user_id=? AND status='accepted' AND member_role='editor' FOR UPDATE",[authorId,target]);if(!invites[0])throw new ApiError(409,'A co-instructor invitation is no longer active.');await connection.execute('INSERT INTO ir_team_course_members(invitation_id,course_id) VALUES(?,?)',[invites[0].id,courseId]);}
    }
    await ensureCoursePublishable(courseId,connection);
    await audit(connection,actor,id?'course.update':'course.create','course',courseId,{source:'original-course-builder'});
    const row=await getRow('ir_courses',courseId,connection);
    return {...row,id:courseId,status:legacyStatus(row.status),thumbnail:row.image};
  });
}
async function resolveLesson(body:Fields,actor:SessionUser,connection:SqlConnection=database()) {
  const type=String(body.type||'lecture');body.id??=body.lecture_type_id??body.document_type_id??body.quiz_type_id??body.assignment_type_id;let row:RowDataPacket;
  if(type==='quiz'||type==='assignment') { const entity=await getRow(type==='quiz'?'ir_quizzes':'ir_assignments',idValue(body.id),connection);row=await getRow('ir_lessons',Number(entity.lesson_id),connection); }
  else row=await getRow('ir_lessons',idValue(body.id),connection);
  await ownedCourse(actor,Number(row.course_id));return row;
}
async function resourceRows(lessonId:number,connection:SqlConnection=database()) {
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT r.*,m.original_name,m.mime_type FROM ir_lesson_resources r LEFT JOIN ir_media m ON m.id=r.media_id WHERE lesson_id=? ORDER BY position,id',[lessonId]);
  return rows.map(row=>({...row,id:Number(row.id),media_id:row.media_id?Number(row.media_id):null,file:row.media_id?`/api/media/${row.media_id}`:null,url:row.url||null,order:Number(row.position),is_active:true,file_extension:row.original_name?.split('.').pop()||null}));
}
async function mapCurriculum(lesson:RowDataPacket,connection:SqlConnection=database()) {
  const type=lesson.type==='quiz'||lesson.type==='assignment'?lesson.type:lesson.type==='pdf'||lesson.type==='resource'?'document':'lecture';
  const extra=await metadata('ir_lesson_details',Number(lesson.id),connection);
  const media=lesson.media_id?await getRow('ir_media',Number(lesson.media_id),connection):null;
  let assessment:Fields={};if(type==='quiz'||type==='assignment'){const [rows]=await connection.execute<RowDataPacket[]>(`SELECT * FROM ${type==='quiz'?'ir_quizzes':'ir_assignments'} WHERE lesson_id=?`,[lesson.id]);assessment=rows[0]||{};}
  const id=Number(assessment.id || lesson.id),seconds=Number(lesson.duration_seconds);
  return {...extra,...assessment,id,lesson_id:Number(lesson.id),user_id:Number(lesson.instructor_id||0),course_chapter_id:Number(lesson.chapter_id),title:lesson.title,slug:`lesson-${lesson.id}`,type:lesson.media_id?'file':lesson.external_url?.includes('youtu')?'youtube_url':'url',media:lesson.media_id?`/api/media/${lesson.media_id}`:null,media_url:lesson.media_id?`/api/media/${lesson.media_id}`:'',file:lesson.media_id?`/api/media/${lesson.media_id}`:null,url:lesson.external_url,youtube_url:lesson.external_url,hours:Math.floor(seconds/3600),minutes:Math.floor(seconds/60)%60,seconds:seconds%60,duration:seconds,duration_seconds:seconds,file_extension:media?String(media.original_name).split('.').pop():null,description:lesson.content||assessment.description||'',chapter_order:Number(lesson.position),is_active:!!lesson.is_published,free_preview:!!lesson.is_preview,formatted_duration:duration(seconds),curriculum_type:type,resources:await resourceRows(Number(lesson.id),connection),allowed_file_types:typeof assessment.allowed_file_types==='string'?JSON.parse(assessment.allowed_file_types):assessment.allowed_file_types||[],time_limit:Number(assessment.time_limit_seconds||0),created_at:lesson.created_at,updated_at:lesson.updated_at};
}
async function preparedResources(body:Fields,actor:SessionUser) {
  if(body.resource_data===undefined)return body.resource_status!==undefined&&!booleanValue(body.resource_status)?[]:undefined;
  const output=[];
  for(const resource of list(body.resource_data)) {
    if(output.length>=100)throw new ApiError(422,'Use at most 100 resources per lesson.');
    const title=textValue(resource.resource_title??resource.title,'Resource title',200);
    const type=enumValue(resource.resource_type??resource.type,['url','file'],'resource type');
    const existingId=resource.id?Number(resource.id):null;
    if(type==='url')output.push({id:existingId,title,type,url:safeHttps(resource.resource_url??resource.url,'Resource URL'),media_id:null});
    else if((resource.resource_file??resource.file) instanceof File){const file=(resource.resource_file??resource.file) as File;const media=await storeMediaFile(file,actor,'course');output.push({id:existingId,title,type,url:null,media_id:media.id});}
    else if(existingId)output.push({id:existingId,title,type,url:null,media_id:null});
    else throw new ApiError(422,'Upload a file for each file resource.');
  }
  return output;
}
async function saveCurriculum(body:Fields,actor:SessionUser,existing?:RowDataPacket) {
  const chapter=await getRow('ir_chapters',existing?Number(existing.chapter_id):idValue(body.chapter_id));const course=await ownedCourse(actor,Number(chapter.course_id));
  const type=String(body.type|| (existing?.type==='quiz'||existing?.type==='assignment'?existing.type:existing?.type==='pdf'||existing?.type==='resource'?'document':'lecture'));
  enumValue(type,['lecture','document','quiz','assignment','resource'],'curriculum type');
  const prefix=type==='resource'?'document':type;
  const values:Fields={course_id:chapter.course_id,chapter_id:chapter.id,title:textValue(body[`${prefix}_title`]??body.title??existing?.title,'Lesson title',200),type:type==='lecture'?'video':type==='document'?'pdf':type,content:safeContent(body[`${prefix}_description`]??body.description??existing?.content??'','Lesson description'),media_id:existing?.media_id||null,external_url:existing?.external_url||null,is_preview:existing?.is_preview||false,is_published:body.is_active===undefined?existing?.is_published??true:booleanValue(body.is_active),duration_seconds:existing?.duration_seconds||0};
  if(type==='lecture') {
    values.duration_seconds=integerValue(body.lecture_hours,'Hours',Math.floor(Number(existing?.duration_seconds||0)/3600),168)*3600+integerValue(body.lecture_minutes,'Minutes',Math.floor(Number(existing?.duration_seconds||0)/60)%60,59)*60+integerValue(body.lecture_seconds,'Seconds',Number(existing?.duration_seconds||0)%60,59);
    if(body.lecture_free_preview!==undefined)values.is_preview=booleanValue(body.lecture_free_preview);
    if(body.lecture_type==='youtube_url'||body.lecture_youtube_url){values.external_url=safeHttps(body.lecture_youtube_url,'Video URL');values.media_id=null;}
  }
  if(type==='document'&&body.document_url){values.external_url=safeHttps(body.document_url,'Document URL');values.media_id=null;}
  const suppliedFile=body.lecture_file??body.document_file??body.assignment_media;
  if(suppliedFile instanceof File&&suppliedFile.size){const media=await storeMediaFile(suppliedFile,actor,'course');if(type==='lecture'&&!['video','audio'].includes(String(media.kind)))throw new ApiError(422,'Upload a video or audio lecture.');values.media_id=media.id;values.external_url=null;if(type==='lecture')values.type=media.kind;if(type==='document'&&media.mime_type!=='application/pdf')values.type='resource';}
  if(body.lecture_file_chunk_path) {
    const token=/^media:([1-9]\d*)$/.exec(String(body.lecture_file_chunk_path));
    if(!token)throw new ApiError(422,'Use the protected media uploader.');
    const media=await getRow('ir_media',idValue(token[1]));
    if(media.is_public||!['video','audio'].includes(media.kind)||(actor.role!=='superadmin'&&Number(media.uploaded_by)!==actor.id))throw new ApiError(403,'This upload is not available to your account.');
    values.media_id=media.id;values.type=media.kind;values.external_url=null;
  }
  if(type==='document'&&body.document_duration!==undefined)values.duration_seconds=integerValue(body.document_duration,'Document duration',0,604800);
  if(type==='quiz'||type==='assignment'){values.is_preview=false;values.external_url=null;}
  const autoPublishQuiz=type==='quiz'&&!existing&&course.status==='published'&&Boolean(values.is_published)&&(!Array.isArray(body.quiz_data)||!body.quiz_data.length);
  if(autoPublishQuiz)values.is_published=false;
  const resources=await preparedResources(body,actor);
  return transaction(async connection=>{
    await getRow('ir_courses',Number(chapter.course_id),connection,true);
    if(existing)await getRow('ir_lessons',Number(existing.id),connection,true);
    const [counts]=await connection.execute<RowDataPacket[]>('SELECT COALESCE(MAX(position),-1)+1 AS position FROM ir_lessons WHERE chapter_id=?',[chapter.id]);
    if(!existing)values.position=Number(counts[0].position);
    const lessonId=existing?Number(existing.id):await insertRow('ir_lessons',values,connection);
    if(existing)await updateRow('ir_lessons',lessonId,values,connection);
    await saveMetadata('ir_lesson_details',lessonId,{qa_required:body.qa_required===undefined?false:booleanValue(body.qa_required),...(autoPublishQuiz?{auto_publish_quiz:true}:{})},connection);
    if(type==='quiz') {
      const quiz=await upsertQuizForLesson(connection,lessonId,autoPublishQuiz?{...body,is_active:false}:body,actor.id);
      if(Array.isArray(body.quiz_data)&&body.quiz_data.length){const { replaceQuizQuestions }=await import('./education-quizzes');await replaceQuizQuestions(connection,Number(quiz.id),body.quiz_data,actor.id);}
    }
    if(type==='assignment')await upsertAssignmentForLesson(connection,lessonId,{...body,media_id:values.media_id},actor.id);
    if(resources!==undefined){const existingResources=await resourceRows(lessonId,connection);for(const resource of resources){if(resource.id){const old=existingResources.find(row=>row.id===resource.id);if(!old)throw new ApiError(422,'This resource does not belong to this lesson.');if(!resource.media_id&&resource.type==='file')resource.media_id=old.media_id;}}await connection.execute('DELETE FROM ir_lesson_resources WHERE lesson_id=?',[lessonId]);for(let i=0;i<resources.length;i++){const resource=resources[i];await insertRow('ir_lesson_resources',{lesson_id:lessonId,title:resource.title,type:resource.type,media_id:resource.media_id,url:resource.url,position:i},connection);}}
    await ensureCoursePublishable(Number(chapter.course_id),connection);
    await audit(connection,actor,existing?'lesson.update':'lesson.create','lesson',lessonId,{course_id:chapter.course_id,type});
    return mapCurriculum(await getRow('ir_lessons',lessonId,connection),connection);
  });
}
async function addedCourses(actor:SessionUser,params:URLSearchParams) {
  const scope=teachingScope(actor);const [rows]=await database().execute<RowDataPacket[]>(`SELECT c.*,cat.name AS category_name,u.name AS author_name,d.metadata,
    (SELECT COUNT(*) FROM ir_chapters WHERE course_id=c.id) total_chapter_count,
    (SELECT COUNT(*) FROM ir_lessons WHERE course_id=c.id) total_lesson_count,
    (SELECT COUNT(*) FROM ir_enrollments WHERE course_id=c.id AND status='active') total_enrolled_students,
    (SELECT COALESCE(AVG(rating),0) FROM ir_reviews WHERE course_id=c.id) average_rating,
    (SELECT COUNT(*) FROM ir_reviews WHERE course_id=c.id) rating_count,
    ((SELECT COALESCE(SUM(oi.amount),0) FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id WHERE oi.course_id=c.id AND o.status IN ('paid','refunded'))-(SELECT COALESCE(SUM(amount),0) FROM ir_refund_requests WHERE course_id=c.id AND status='refunded')) total_revenue FROM ir_courses c LEFT JOIN ir_categories cat ON cat.id=c.category_id LEFT JOIN ir_users u ON u.id=c.instructor_id LEFT JOIN ir_course_details d ON d.course_id=c.id WHERE ${scope.sql} ORDER BY c.id DESC`,scope.values);
  let filtered=rows;
  if(params.get('team_user_slug')){const match=/^learner-(\d+)$/.exec(params.get('team_user_slug')!);if(!match)throw new ApiError(422,'Choose a valid teaching team.');filtered=filtered.filter(row=>Number(row.instructor_id)===Number(match[1]));}
  if(['free','paid'].includes(params.get('course_type')||''))filtered=filtered.filter(row=>params.get('course_type')==='free'?Number(row.price)===0:Number(row.price)>0);
  if(params.get('approval_status')&&params.get('approval_status')!=='all')filtered=filtered.filter(row=>params.get('approval_status')==='approved'&&row.status==='published');
  if(params.get('search'))filtered=filtered.filter(row=>row.title.toLowerCase().includes(params.get('search')!.toLowerCase()));
  if(params.get('status')&&params.get('status')!=='all')filtered=filtered.filter(row=>legacyStatus(row.status)===params.get('status')||row.status===params.get('status'));
  const items=filtered.map(row=>{const meta=object(row.metadata);return {...row,id:Number(row.id),user_id:Number(row.instructor_id),revenue:Number(row.total_revenue),total_revenue:Number(row.total_revenue),thumbnail:row.image,status:legacyStatus(row.status),is_active:row.status==='published',approval_status:row.status==='published'?'approved':null,price:Number(meta.list_price??row.price),discount_price:Number(row.price),discounted_price:Number(row.price),course_type:Number(row.price)>0?'paid':'free',category:{id:Number(row.category_id),name:row.category_name},author:{id:Number(row.instructor_id),name:row.author_name,profile:''},rejected_reason:null,...meta};});
  const {page,perPage}=pageOptions(params);return {statistics:{total_courses:rows.length,publish:rows.filter(row=>row.status==='published').length,pending:0,rejected:0,draft:rows.filter(row=>row.status==='draft').length,approved:rows.filter(row=>row.status==='published').length,active:rows.filter(row=>row.status==='published').length},courses:paginate(items.slice((page-1)*perPage,page*perPage),items.length,page,perPage,'/api/get-added-courses')};
}
async function detail(actor:SessionUser,body:Fields) {
  const [found]=await database().execute<RowDataPacket[]>('SELECT id FROM ir_courses WHERE slug=? OR id=? LIMIT 1',[String(body.slug||''),Number(body.id||body.course_id)||0]);if(!found[0])throw new ApiError(404,'Course not found.');
  const course=await ownedCourse(actor,Number(found[0].id)),meta=await metadata('ir_course_details',Number(course.id));
  const [chapters]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_chapters WHERE course_id=? ORDER BY position,id',[course.id]);
  const [lessons]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_lessons WHERE course_id=? ORDER BY position,id',[course.id]);
  const [categories]=course.category_id?await database().execute<RowDataPacket[]>('SELECT id,name,slug FROM ir_categories WHERE id=?',[course.category_id]):[[]];
  const [languages]=course.language_id?await database().execute<RowDataPacket[]>('SELECT id,name FROM ir_languages WHERE id=?',[course.language_id]):[[]];
  const author=await getRow('ir_users',Number(course.instructor_id));
  const [sales]=await database().execute<RowDataPacket[]>("SELECT COUNT(*) count,COALESCE(SUM(i.amount),0) total FROM ir_order_items i JOIN ir_orders o ON o.id=i.order_id WHERE i.course_id=? AND o.status='paid'",[course.id]);
  const [learners]=await database().execute<RowDataPacket[]>("SELECT COUNT(*) total FROM ir_enrollments WHERE course_id=? AND status='active'",[course.id]);
  const [reviews]=await database().execute<RowDataPacket[]>('SELECT COUNT(*) total,COALESCE(AVG(rating),0) average FROM ir_reviews WHERE course_id=?',[course.id]);
  const [attempts]=await database().execute<RowDataPacket[]>("SELECT a.*,q.title quiz_title,u.name student_name FROM ir_quiz_attempts a JOIN ir_quizzes q ON q.id=a.quiz_id JOIN ir_users u ON u.id=a.user_id WHERE q.course_id=? AND a.status='completed' ORDER BY a.id DESC LIMIT 5000",[course.id]);
  const [posts]=await database().execute<RowDataPacket[]>('SELECT d.*,u.name user_name FROM ir_discussions d JOIN ir_users u ON u.id=d.user_id WHERE d.course_id=? ORDER BY d.id DESC LIMIT 5000',[course.id]);
  const [quizDetails]=await database().execute<RowDataPacket[]>('SELECT q.id,q.title,(SELECT COUNT(*) FROM ir_quiz_questions x WHERE x.quiz_id=q.id AND x.is_active=1) questions_count FROM ir_quizzes q WHERE q.course_id=?',[course.id]);
  const [dailySales]=await database().execute<RowDataPacket[]>("SELECT DATE(CONVERT_TZ(o.created_at,'+00:00','+05:30')) AS day,COUNT(*) sales,SUM(i.amount) revenue,SUM(GREATEST(i.amount-COALESCE(r.refunded,0),0)) profit FROM ir_order_items i JOIN ir_orders o ON o.id=i.order_id LEFT JOIN (SELECT order_id,course_id,SUM(amount) refunded FROM ir_refund_requests WHERE status='refunded' GROUP BY order_id,course_id) r ON r.order_id=o.id AND r.course_id=i.course_id WHERE i.course_id=? AND o.status IN ('paid','refunded') AND i.amount>0 GROUP BY day ORDER BY day",[course.id]);
  const chart=buildSalesStatistics(dailySales as unknown as DailySales[]);
  const instructorIds=Array.isArray(meta.instructors)?meta.instructors.map(Number).filter(id=>Number.isSafeInteger(id)&&id>0):[];
  const [coInstructors]=instructorIds.length?await database().execute<RowDataPacket[]>(`SELECT id,name FROM ir_users WHERE is_active=1 AND role IN ('admin','superadmin') AND id IN (${instructorIds.map(()=>'?').join(',')})`,instructorIds):[[]];
  const tags=await availableTags(actor);
  const mapped=await Promise.all(lessons.map(lesson=>mapCurriculum(lesson)));const seconds=lessons.reduce((sum,row)=>sum+Number(row.duration_seconds),0),total=lessons.length||1;
  const count=(type:string)=>lessons.filter(row=>row.type===type).length;
  return {course_details:{...course,...meta,id:Number(course.id),thumbnail:course.image,status:legacyStatus(course.status),approval_status:course.status==='published'?'approved':null,is_active:course.status==='published',price:Number(meta.list_price??course.price),discounted_price:Number(course.price),discount_percentage:Number(meta.list_price)>0?Math.round((1-Number(course.price)/Number(meta.list_price))*100):0,course_type:Number(course.price)>0?'paid':'free',duration:duration(seconds),sequential_access:!!meta.sequential_access,certificate_enabled:!!meta.certificate_enabled,certificate_fee:meta.certificate_fee??null,category:categories[0]||{id:0,name:'',slug:''},language:languages[0]||{id:0,name:''},author:{id:Number(author.id),name:author.name,email:author.email,profile:''},ratings:{count:Number(reviews[0].total),average:Number(reviews[0].average)},learnings:list(meta.learnings_data).map(entry=>({...entry,title:entry.learning})),requirements:list(meta.requirements_data),tags:list(meta.tags).map(tag=>({id:tags.find(item=>item.name===tag.name)?.id||Number(tag.id),name:tag.name})),co_instructors:coInstructors.map(row=>({...row,profile:''})),preview_video:meta.preview_video||'',chapters:chapters.map(chapter=>({...chapter,lectures:mapped.filter(row=>row.course_chapter_id===Number(chapter.id)&&row.curriculum_type==='lecture'),quizzes:mapped.filter(row=>row.course_chapter_id===Number(chapter.id)&&row.curriculum_type==='quiz'),assignments:mapped.filter(row=>row.course_chapter_id===Number(chapter.id)&&row.curriculum_type==='assignment'),resources:mapped.filter(row=>row.course_chapter_id===Number(chapter.id)&&row.curriculum_type==='document')}))},statistics:{analytics:{total_earnings:{amount:Number(sales[0].total),formatted:new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(sales[0].total)),label:'Total earnings'},total_enrolled_users:{count:Number(learners[0].total),label:'Enrolled learners'},total_reviews:{count:Number(reviews[0].total),label:'Reviews'},total_sales:{count:Number(sales[0].count),label:'Sales'}},content_statistics:{chapters:chapters.length,lectures:lessons.length-count('quiz')-count('assignment'),quizzes:count('quiz'),assignments:count('assignment'),total_duration:{seconds,formatted:duration(seconds)},content_breakdown:{lectures_percentage:100*(lessons.length-count('quiz')-count('assignment'))/total,quizzes_percentage:100*count('quiz')/total,assignments_percentage:100*count('assignment')/total}},sales_chart_data:chart},quiz_reports:{total_quizzes:count('quiz'),total_attempts:attempts.length,average_score:attempts.length?attempts.reduce((sum,row)=>sum+Number(row.score),0)/attempts.length:0,pass_rate:attempts.length?100*attempts.filter(row=>row.passed).length/attempts.length:0,quiz_details:quizDetails,student_attempts:attempts.map(({question_snapshot,...row})=>row),message:''},discussions:{total_discussions:posts.filter(row=>!row.parent_id).length,discussions:posts,summary:{total_posts:posts.filter(row=>!row.parent_id).length,total_replies:posts.filter(row=>row.parent_id).length,active_users:new Set(posts.map(row=>row.user_id)).size,latest_activity:posts[0]?.created_at||null},message:''},assignments:mapped.filter(row=>row.curriculum_type==='assignment'),assignment_details:[]};
}
const paths=new Set(['create-course','update-course','delete-course','update-course-status','get-added-courses','get-course-details','get-added-course-chapters','create-course-chapter','create-chapters','update-course-chapter','delete-course-chapter','get-tags','get-course-enrolled-students','create-curriculum','course-chapters/curriculum','course-chapters/curriculum/list','course-chapters/particular-curriculum/details','course-chapters/curriculum/destroy','course-chapters/curriculum/update-order','update-curriculum-order','course-chapters/curriculum/lecture/update','course-chapters/curriculum/resource/update','course-chapters/curriculum/quiz/update','course-chapters/curriculum/assignment/update']);
export async function handleCourses(request:Request,path:string):Promise<NextResponse|undefined> {
  if(!paths.has(path))return;
  if(path==='get-course-details'){const user=await getSessionUser(request);if(!user||!['admin','superadmin'].includes(user.role))return;}
  const actor=await requireAdmin(request),params=new URL(request.url).searchParams;
  if(request.method!=='GET')assertSameOrigin(request);
  const body=await readBody(request),method=request.method;
  if(path==='get-added-courses'&&method==='GET')return success(await addedCourses(actor,params));
  if(path==='get-course-details'&&method==='GET')return success(await detail(actor,body));
  if(path==='get-tags'&&method==='GET')return success((await availableTags(actor)).map(tag=>({...tag,tag:tag.name,slug:slug(tag.name),is_active:1,created_at:'',updated_at:'',deleted_at:null})));
  if(['create-course','update-course','update-course-status'].includes(path)&&['POST','PUT','PATCH'].includes(method)){const id=path==='create-course'?undefined:idValue(body.id??body.course_id);return success(await saveCourse(body,actor,id),'Course saved.');}
  if(path==='delete-course'&&method==='DELETE'){const course=body.id?await ownedCourse(actor,body.id):await detail(actor,body).then(value=>value.course_details);return success(await courseAdmin('DELETE',['courses',String(course.id)],{},actor,params),'Course deleted.');}
  if(path==='get-added-course-chapters'&&method==='GET'){await ownedCourse(actor,body.course_id);const [rows]=await database().execute<RowDataPacket[]>('SELECT ch.*,COALESCE(SUM(l.duration_seconds),0) total_duration FROM ir_chapters ch LEFT JOIN ir_lessons l ON l.chapter_id=ch.id WHERE ch.course_id=? GROUP BY ch.id ORDER BY ch.position,ch.id',[idValue(body.course_id)]);const {page,perPage}=pageOptions(params);return success(paginate(rows.slice((page-1)*perPage,page*perPage).map(row=>({...row,user_id:actor.id,slug:`chapter-${row.id}`,is_active:true,chapter_order:Number(row.position),deleted_at:null})),rows.length,page,perPage,`/api/${path}`));}
  if(['create-course-chapter','create-chapters','update-course-chapter','delete-course-chapter'].includes(path)){
    const previous=path.includes('update')||path.includes('delete')?await getRow('ir_chapters',body.id?idValue(body.id):idValue(String(body.slug).replace('chapter-',''))):undefined;
    const course=await ownedCourse(actor,previous?.course_id??body.course_id);
    if(path==='delete-course-chapter'&&method==='DELETE')return success(await courseAdmin('DELETE',['chapters',String(previous!.id)],{},actor,params));
    if(['POST','PUT','PATCH'].includes(method))return success(await transaction(async connection=>{await getRow('ir_courses',Number(course.id),connection,true);const values={title:textValue(body.title,'Chapter title',200),description:safeContent(body.description??previous?.description,'Chapter description')};let id=Number(previous?.id);if(id)await updateRow('ir_chapters',id,values,connection);else {const [rows]=await connection.execute<RowDataPacket[]>('SELECT COALESCE(MAX(position),-1)+1 position FROM ir_chapters WHERE course_id=?',[course.id]);id=await insertRow('ir_chapters',{...values,course_id:course.id,position:Number(rows[0].position)},connection);}await audit(connection,actor,previous?'chapter.update':'chapter.create','chapter',id);return {...await getRow('ir_chapters',id,connection),slug:`chapter-${id}`,is_active:true};}));
  }
  if(path==='course-chapters/curriculum/list'&&method==='GET'){const chapter=await getRow('ir_chapters',idValue(body.chapter_id));await ownedCourse(actor,Number(chapter.course_id));const [lessons]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_lessons WHERE chapter_id=? ORDER BY position,id',[chapter.id]);const rows=await Promise.all(lessons.map(async(lesson,index)=>{const item=await mapCurriculum(lesson);return {no:index+1,id:item.id,lesson_id:Number(lesson.id),title:item.title,type:item.curriculum_type,table_name:item.curriculum_type,duration:item.formatted_duration,status:!!lesson.is_published,all_details:item,resources:item.resources.length,particular_details_url:'',update_status_url:'',restore_url:'',operate:''};}));return NextResponse.json({error:false,message:'Curriculum fetched.',total:rows.length,rows,code:200},{headers:{'Cache-Control':'private, no-store'}});}
  if(path==='course-chapters/particular-curriculum/details'&&method==='GET')return success(await mapCurriculum(await resolveLesson(body,actor)));
  if(['create-curriculum','course-chapters/curriculum'].includes(path)&&method==='POST')return success(await saveCurriculum(body,actor),'Lesson saved.');
  if(['course-chapters/curriculum/lecture/update','course-chapters/curriculum/resource/update','course-chapters/curriculum/quiz/update','course-chapters/curriculum/assignment/update'].includes(path)&&['POST','PUT','PATCH'].includes(method)){const updated={...body,type:path.includes('/lecture/')?'lecture':path.includes('/quiz/')?'quiz':path.includes('/assignment/')?'assignment':'document'};return success(await saveCurriculum(updated,actor,await resolveLesson(updated,actor)),'Lesson saved.');}
  if(path==='course-chapters/curriculum/destroy'&&method==='DELETE'){const lesson=await resolveLesson(body,actor);return success(await courseAdmin('DELETE',['lessons',String(lesson.id)],{},actor,params));}
  if(['course-chapters/curriculum/update-order','update-curriculum-order'].includes(path)&&['POST','PUT'].includes(method)){const chapter=await getRow('ir_chapters',idValue(body.chapter_id));await ownedCourse(actor,chapter.course_id);const ids=Array.isArray(body.ids)?body.ids.map(id=>idValue(id)):[];return success(await courseAdmin('POST',['courses',String(chapter.course_id),'order'],{lessons:[{chapter_id:chapter.id,lesson_ids:ids}]},actor,params));}
  if(path==='get-course-enrolled-students'&&method==='GET'){const course=await ownedCourse(actor,body.id??body.course_id);const [rows]=await database().execute<RowDataPacket[]>(`SELECT u.id,u.name,u.email,e.created_at AS enrolled_at,(SELECT COUNT(*) FROM ir_progress p JOIN ir_lessons l ON l.id=p.lesson_id WHERE p.user_id=u.id AND l.course_id=e.course_id AND l.is_published=1 AND p.completed=1) completed,(SELECT COUNT(*) FROM ir_lessons WHERE course_id=e.course_id AND is_published=1) total FROM ir_enrollments e JOIN ir_users u ON u.id=e.user_id WHERE e.course_id=? AND e.status='active' ORDER BY e.id DESC`,[course.id]);const search=String(body.search||'').toLowerCase();const filtered=rows.filter(row=>!search||`${row.name} ${row.email}`.toLowerCase().includes(search));const {page,perPage}=pageOptions(params);return success(paginate(filtered.slice((page-1)*perPage,page*perPage).map(row=>({...row,profile:'',progress_percentage:Number(row.total)?Math.round(100*Number(row.completed)/Number(row.total)):0})),filtered.length,page,perPage,`/api/${path}`));}
  throw new ApiError(405,'This method is not supported for this course operation.');
}

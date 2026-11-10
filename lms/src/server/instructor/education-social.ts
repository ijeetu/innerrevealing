import { RowDataPacket } from 'mysql2/promise';
import { SessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { audit,transaction } from '../admin/core';
import { notify } from '../notifications';
import { accessCourse,courseFromInput,getRow,idValue,isStaff,pageData,staffOnly,textValue } from './education-core';

function reviewData(row:RowDataPacket,staff=false) {
  return {id:Number(row.id),rating:Number(row.rating),review:row.review,user:{id:Number(row.user_id),name:row.user_name,avatar:'',email:staff?row.user_email:''},created_at:row.created_at,timestamp:row.created_at,time_ago:'',can_edit:true};
}

async function instructorFromInput(body:Record<string,unknown>) {
  let id=body.instructor_id?Number(body.instructor_id):0;
  if(!id){const match=/^(?:learner|instructor|user)-(\d+)$/.exec(String(body.slug||''));if(match)id=Number(match[1]);}
  if(!id)throw new ApiError(422,'Choose an instructor.');
  return getRow('ir_users',idValue(id));
}

async function readReviews(path:string,body:Record<string,unknown>,user:SessionUser|null) {
  const instructorMode=path==='get-instructor-reviews';if(path==='get-reviews')staffOnly(user);
  const aggregate=path==='get-reviews'&&!body.id&&!body.course_id&&!body.slug&&!body.course_slug;
  const target=aggregate?null:instructorMode?await instructorFromInput(body):await courseFromInput(body);
  if(instructorMode&&!isStaff(user)) {
    const [available]=await database().execute<RowDataPacket[]>("SELECT id FROM ir_courses WHERE instructor_id=? AND status='published' LIMIT 1",[target!.id]);
    if(!target!.is_active||!available.length)throw new ApiError(404,'Instructor not found.');
  } else if(!aggregate&&!instructorMode&&target!.status!=='published'&&!isStaff(user))throw new ApiError(404,'Course not found.');
  const field=instructorMode?'instructor_id':'course_id';
  const scope=aggregate?(user!.role==='superadmin'?'1=1':'(c.instructor_id=? OR r.instructor_id=?)'):`r.${field}=?`;
  const values=aggregate?(user!.role==='superadmin'?[]:[user!.id,user!.id]):[target!.id];
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT r.*,u.name user_name,u.email user_email FROM ir_reviews r JOIN ir_users u ON u.id=r.user_id AND u.is_active=1 LEFT JOIN ir_courses c ON c.id=r.course_id WHERE ${scope} ORDER BY r.created_at DESC,r.id DESC LIMIT 10000`,values);
  const counts={'5_stars':0,'4_stars':0,'3_stars':0,'2_stars':0,'1_star':0};
  for(const row of rows){const key=Number(row.rating)===1?'1_star':`${row.rating}_stars` as keyof typeof counts;counts[key]++;}
  const percentage=Object.fromEntries(Object.entries(counts).map(([key,count])=>[key,rows.length?Math.round(count/rows.length*100):0]));
  return {...(aggregate?{course:null}:instructorMode?{instructor:{id:Number(target!.id),name:target!.name,slug:`learner-${target!.id}`,profile:''}}:{course:{id:Number(target!.id),title:target!.title,slug:target!.slug}}),statistics:{total_reviews:rows.length,average_rating:rows.length?Math.round(rows.reduce((sum,row)=>sum+Number(row.rating),0)/rows.length*100)/100:0,rating_breakdown:counts,percentage_breakdown:percentage},my_review:!aggregate&&user?rows.filter(row=>Number(row.user_id)===user.id).map(row=>reviewData(row,isStaff(user)))[0]||null:null,reviews:pageData(rows.map(row=>reviewData(row,isStaff(user))),body,`/api/${path}`)};
}

async function saveReview(body:Record<string,unknown>,user:SessionUser) {
  const courseId=body.course_id?idValue(body.course_id):null;const instructorId=body.instructor_id?idValue(body.instructor_id):null;
  if(Boolean(courseId)===Boolean(instructorId))throw new ApiError(422,'Choose one course or instructor to review.');
  const rating=Number(body.rating);if(!Number.isInteger(rating)||rating<1||rating>5)throw new ApiError(422,'Choose a whole-number rating from 1 to 5.');
  const review=textValue(body.review,'Review',5000);
  return transaction(async connection=>{
    if(courseId){const course=await accessCourse(user,courseId,false,connection);if(Number(course.instructor_id)===user.id)throw new ApiError(403,'You cannot review your own course.');}
    else {
      if(instructorId===user.id)throw new ApiError(403,'You cannot review yourself.');
      const [access]=await connection.execute<RowDataPacket[]>("SELECT e.id FROM ir_enrollments e JOIN ir_courses c ON c.id=e.course_id WHERE e.user_id=? AND e.status='active' AND c.instructor_id=? AND c.status='published' LIMIT 1",[user.id,instructorId]);
      if(!access.length)throw new ApiError(403,'Enroll in a course from this instructor before leaving a review.');
    }
    await connection.execute('INSERT INTO ir_reviews(user_id,course_id,instructor_id,rating,review) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating),review=VALUES(review)',[user.id,courseId,instructorId,rating,review]);
    const [rows]=await connection.execute<RowDataPacket[]>(`SELECT * FROM ir_reviews WHERE user_id=? AND ${courseId?'course_id':'instructor_id'}=?`,[user.id,courseId||instructorId]);
    await audit(connection,user,'review.save','review',rows[0].id,{rating,course_id:courseId,instructor_id:instructorId});return rows[0];
  });
}

function discussionData(row:RowDataPacket,staff:boolean) {
  const user={id:Number(row.user_id),name:row.user_name,slug:`learner-${row.user_id}`,email:staff?row.user_email:'',mobile:null,country_code:null,email_verified_at:null,profile:'',is_active:1,wallet_balance:'0',created_at:row.created_at,updated_at:row.updated_at,deleted_at:null};
  return {...row,id:Number(row.id),course_id:Number(row.course_id),user_id:Number(row.user_id),parent_id:row.parent_id?Number(row.parent_id):null,user,author:{id:user.id,name:user.name,avatar:'',email:user.email},timestamp:row.created_at,time_ago:'',replies:[] as unknown[],reply_count:0};
}

async function readDiscussions(path:string,body:Record<string,unknown>,user:SessionUser) {
  if(path==='get-discussion')staffOnly(user);
  const course=await courseFromInput(body);await accessCourse(user,Number(course.id));
  const values:(number|string)[]=[course.id];let search='';if(body.search){search=' AND (d.message LIKE ? OR u.name LIKE ?)';values.push('%'+String(body.search).slice(0,200)+'%','%'+String(body.search).slice(0,200)+'%');}
  const [parents]=await database().execute<RowDataPacket[]>(`SELECT d.*,u.name user_name,u.email user_email FROM ir_discussions d JOIN ir_users u ON u.id=d.user_id AND u.is_active=1 WHERE d.course_id=? AND d.parent_id IS NULL${search} ORDER BY d.created_at DESC,d.id DESC LIMIT 10000`,values);
  const page=pageData(parents,body,`/api/${path}`);const ids=page.data.map(row=>Number(row.id));let replies:RowDataPacket[]=[];
  if(ids.length)[replies]=await database().execute<RowDataPacket[]>(`SELECT d.*,u.name user_name,u.email user_email FROM ir_discussions d JOIN ir_users u ON u.id=d.user_id AND u.is_active=1 WHERE d.parent_id IN (${ids.map(()=>'?').join(',')}) ORDER BY d.id`,ids);
  const data=page.data.map(row=>{const item=discussionData(row,isStaff(user));item.replies=replies.filter(reply=>Number(reply.parent_id)===Number(row.id)).map(reply=>discussionData(reply,isStaff(user)));item.reply_count=item.replies.length;return item;});
  const discussions={...page,data};return path==='get-discussion'?{course:{id:Number(course.id),title:course.title,slug:course.slug},statistics:{total_discussions:page.total,search_term:body.search||null},discussions}:discussions;
}

async function postDiscussion(path:string,body:Record<string,unknown>,user:SessionUser) {
  const replyMode=path==='reply-discussion';if(replyMode)staffOnly(user);
  const parentId=body.discussion_id||body.parent_id? idValue(body.discussion_id||body.parent_id):null;
  const parent=parentId?await getRow('ir_discussions',parentId):null;
  const courseId=replyMode?Number(parent?.course_id):idValue(body.course_id);
  if(parent&&Number(parent.course_id)!==courseId)throw new ApiError(422,'This discussion belongs to a different course.');
  const course=await accessCourse(user,courseId);const message=textValue(body.message,'Message',10000);
  return transaction(async connection=>{
    await accessCourse(user,courseId,true,connection);
    const rootId=parent?Number(parent.parent_id||parent.id):null;
    const [insert]=await connection.execute<import('mysql2/promise').ResultSetHeader>('INSERT INTO ir_discussions(course_id,user_id,parent_id,message) VALUES(?,?,?,?)',[courseId,user.id,rootId,message]);
    const [rows]=await connection.execute<RowDataPacket[]>('SELECT d.*,u.name user_name,u.email user_email FROM ir_discussions d JOIN ir_users u ON u.id=d.user_id WHERE d.id=?',[insert.insertId]);
    await audit(connection,user,rootId?'discussion.reply':'discussion.create','discussion',insert.insertId,{course_id:courseId});
    const recipient=parent?Number(parent.user_id):Number(course.instructor_id);if(recipient&&recipient!==user.id)await notify(connection,recipient,{title:rootId?'New course discussion reply':'New course question',message:`${user.name} posted in ${course.title}.`,url:isStaff(user)?`/learn/${course.slug}`:`/instructor/my-course/${course.slug}?tab=discussion`});
    const result=discussionData(rows[0],isStaff(user));return replyMode?{reply:result}:result;
  });
}

export async function handleSocial(path:string,body:Record<string,unknown>,user:SessionUser|null,method:string):Promise<unknown> {
  if(['get-reviews','get-course-reviews','get-instructor-reviews'].includes(path))return readReviews(path,body,user);
  if(!user)throw new ApiError(401,'Sign in to continue.');
  if(path==='rating/add')return saveReview(body,user);
  if(path==='rating/delete')return transaction(async connection=>{const review=await getRow('ir_reviews',idValue(body.rating_id||body.id),connection,true);if(Number(review.user_id)!==user.id&&!isStaff(user))throw new ApiError(404,'Review not found.');await connection.execute('DELETE FROM ir_reviews WHERE id=?',[review.id]);await audit(connection,user,'review.delete','review',review.id);return {deleted:true};});
  if((path==='discussion/course'&&method==='GET')||path==='get-discussion')return readDiscussions(path,body,user);
  if(path==='discussion/course'||path==='reply-discussion')return postDiscussion(path,body,user);
  throw new ApiError(404,'Review or discussion endpoint not found.');
}

import { PoolConnection,RowDataPacket } from 'mysql2/promise';
import { SessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { getRow,idValue,integerValue,optionalText,safeContent,textValue } from '../admin/core';
import { pageOptions,paginate } from '../catalogue';

export function jsonArray<T=unknown>(value:unknown):T[] {
  const parsed=typeof value==='string'?JSON.parse(value):value;
  return Array.isArray(parsed)?parsed as T[]:[];
}

export function isStaff(user:SessionUser|null):boolean {return Boolean(user&&['admin','superadmin'].includes(user.role));}
export function staffOnly(user:SessionUser|null):asserts user is SessionUser {if(!isStaff(user))throw new ApiError(user?403:401,'Staff access is required.');}

export async function accessCourse(user:SessionUser|null,courseId:number,staffAllowed=true,connection:PoolConnection|ReturnType<typeof database>=database()) {
  const course=await getRow('ir_courses',courseId,connection);
  if(staffAllowed&&isStaff(user))return course;
  if(course.status!=='published')throw new ApiError(404,'This course is not available.');
  if(!user)throw new ApiError(401,'Sign in to access this course.');
  const [rows]=await connection.execute<RowDataPacket[]>("SELECT id,created_at FROM ir_enrollments WHERE user_id=? AND course_id=? AND status='active'",[user.id,courseId]);
  if(!rows[0])throw new ApiError(403,'Active enrollment is required.');
  return {...course,enrolled_at:rows[0].created_at};
}

export async function courseFromInput(body:Record<string,unknown>) {
  if(body.course_id||body.id)return getRow('ir_courses',idValue(body.course_id||body.id));
  const slug=textValue(body.course_slug||body.slug,'Course slug',220);
  const [rows]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_courses WHERE slug=?',[slug]);
  if(!rows[0])throw new ApiError(404,'Course not found.');return rows[0];
}

export function pageData<T>(items:T[],body:Record<string,unknown>,path:string) {
  const params=new URLSearchParams();
  for(const key of ['page','per_page'])if(body[key]!==undefined)params.set(key,String(body[key]));
  const {page,perPage}=pageOptions(params);
  return paginate(items.slice((page-1)*perPage,page*perPage),items.length,page,perPage,path);
}

export function pointsValue(value:unknown,label='Points',fallback=100):number {
  const result=value===undefined||value===''?fallback:Number(value);
  if(!Number.isFinite(result)||result<0||result>1000000||Math.abs(result*100-Math.round(result*100))>0.00001)throw new ApiError(422,`${label} must be a nonnegative number with at most two decimal places.`);
  return result;
}

export async function upsertQuizForLesson(connection:PoolConnection,lessonId:number,body:Record<string,unknown>,actorId:number) {
  const lesson=await getRow('ir_lessons',lessonId,connection);
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_quizzes WHERE lesson_id=? FOR UPDATE',[lessonId]);const current=rows[0];
  const total=pointsValue(body.quiz_total_points??body.total_points,'Total points',Number(current?.total_points||100));
  if(total<=0)throw new ApiError(422,'Quiz total points must be greater than zero.');
  const passing=pointsValue(body.quiz_passing_score??body.passing_score,'Passing points',Number(current?.passing_score??Math.min(total,50)));
  if(passing>total)throw new ApiError(422,'Passing points cannot exceed the total points.');
  const title=textValue(body.quiz_title??body.title??current?.title??lesson.title,'Quiz title',200);
  const description=safeContent(body.quiz_description??body.description??current?.description??'','Quiz description',50000);
  const time=integerValue(body.quiz_time_limit??body.time_limit_seconds??current?.time_limit_seconds,'Time limit',0,604800);
  const active=body.is_active===undefined?Boolean(current?.is_published??lesson.is_published):![false,0,'0','false'].includes(body.is_active as boolean|number|string);
  const skip=body.quiz_can_skip===undefined?Boolean(current?.can_skip):[true,1,'1','true'].includes(body.quiz_can_skip as boolean|number|string);
  await connection.execute(`INSERT INTO ir_quizzes(lesson_id,course_id,title,description,total_points,passing_score,time_limit_seconds,max_attempts,can_skip,is_published) VALUES(?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),total_points=VALUES(total_points),passing_score=VALUES(passing_score),time_limit_seconds=VALUES(time_limit_seconds),max_attempts=VALUES(max_attempts),can_skip=VALUES(can_skip),is_published=VALUES(is_published)`,[lessonId,lesson.course_id,title,description,total,passing,time,integerValue(body.max_attempts??current?.max_attempts,'Maximum attempts',0,1000),skip,active]);
  const [result]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_quizzes WHERE lesson_id=?',[lessonId]);
  return result[0];
}

export async function upsertAssignmentForLesson(connection:PoolConnection,lessonId:number,body:Record<string,unknown>,actorId:number) {
  const lesson=await getRow('ir_lessons',lessonId,connection);
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_assignments WHERE lesson_id=? FOR UPDATE',[lessonId]);const current=rows[0];
  let types=body.assignment_allowed_file_types??body.allowed_file_types??current?.allowed_file_types;
  types=jsonArray(typeof types==='string'&&types.startsWith('[')?types:Array.isArray(types)?types:[]);
  const mapping:Record<string,string>={'1':'audio','2':'video','3':'image','4':'document'};
  const allowed=Array.from(new Set((types as unknown[]).map(value=>mapping[String(value)]||String(value).toLowerCase())));
  if(allowed.some(value=>!['audio','video','image','document'].includes(value)))throw new ApiError(422,'Choose supported assignment file types.');
  const title=textValue(body.assignment_title??body.title??current?.title??lesson.title,'Assignment title',200);
  const description=safeContent(body.assignment_description??body.description??current?.description??'','Assignment description',50000);
  const instructions=safeContent(body.assignment_instructions??body.instructions??current?.instructions??'','Instructions',50000);
  const mediaId=body.media_id!==undefined?(body.media_id?idValue(body.media_id):null):current?.media_id||null;
  if(mediaId)await getRow('ir_media',Number(mediaId),connection);
  const active=body.is_active===undefined?Boolean(current?.is_active??lesson.is_published):![false,0,'0','false'].includes(body.is_active as boolean|number|string);
  const skip=body.assignment_can_skip===undefined?Boolean(current?.can_skip):[true,1,'1','true'].includes(body.assignment_can_skip as boolean|number|string);
  await connection.execute(`INSERT INTO ir_assignments(lesson_id,course_id,title,description,instructions,due_days,points,max_file_size,allowed_file_types,media_id,can_skip,is_active) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),instructions=VALUES(instructions),due_days=VALUES(due_days),points=VALUES(points),max_file_size=VALUES(max_file_size),allowed_file_types=VALUES(allowed_file_types),media_id=VALUES(media_id),can_skip=VALUES(can_skip),is_active=VALUES(is_active)`,[lessonId,lesson.course_id,title,description,instructions,integerValue(body.assignment_due_days??body.due_days??current?.due_days,'Due days',0,36500),pointsValue(body.assignment_points??body.points,'Points',Number(current?.points??100)),integerValue(body.max_file_size??current?.max_file_size,'Maximum file size',10,50)||10,JSON.stringify(allowed.length?allowed:['image','audio','video','document']),mediaId,skip,active]);
  const [result]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_assignments WHERE lesson_id=?',[lessonId]);
  return result[0];
}

export function isoTime(value:unknown):string {return value?String(value):'';}
export {getRow,idValue,integerValue,optionalText,safeContent,textValue};

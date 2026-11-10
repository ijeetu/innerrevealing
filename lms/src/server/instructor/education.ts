import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2/promise';
import { getSessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { assertSameOrigin } from '../request';
import { rateLimit } from '../rate-limit';
import { failure,success } from '../response';
import { assertLessonSequence } from '../lesson-access';
import { audit,transaction } from '../admin/core';
import { accessCourse,getRow,idValue } from './education-core';
import { readBody } from './body';
import { getQuizCurriculum,handleQuiz } from './education-quizzes';
import { handleAssignment,studentAssignment } from './education-assignments';
import { handleSocial } from './education-social';

export {upsertQuizForLesson,upsertAssignmentForLesson} from './education-core';
export {replaceQuizQuestions,getQuizCurriculum} from './education-quizzes';
export {getAssignmentCurriculum} from './education-assignments';

const METHODS:Record<string,string[]>={
  'get-assignments-list':['GET'],'assignment-submissions':['GET'],'get-assignments':['GET'],
  'assignments/submit':['POST'],'assignments/submission':['POST'],'edit-assignment-submission':['PUT','POST'],
  'get-quiz-reports':['GET'],'get-quiz-report-details':['GET'],'get-quiz-result-details':['GET'],
  'quiz/start':['POST'],'quiz/answer':['POST'],'quiz/finish':['POST'],'quiz/summary':['GET'],
  'course-chapters/quiz/questions/list':['GET'],
  'course-chapters/curriculum/quiz/get-question':['GET'],
  'course-chapters/curriculum/quiz/add-question':['POST'],
  'course-chapters/curriculum/quiz/update':['POST','PUT','PATCH'],
  'course-chapters/curriculum/quiz/update-question':['POST','PUT','PATCH'],
  'course-chapters/curriculum/quiz/delete-question':['DELETE'],
  'course-chapters/curriculum/assignment/update':['POST','PUT','PATCH'],
  'get-reviews':['GET'],'get-course-reviews':['GET'],'get-instructor-reviews':['GET'],
  'rating/add':['POST'],'rating/delete':['DELETE'],
  'discussion/course':['GET','POST'],'get-discussion':['GET'],'reply-discussion':['POST'],
  'education/skip':['POST'],
};

export async function handleEducation(request:Request,path:string):Promise<NextResponse|undefined> {
  const lessonMatch=/^education\/lesson\/(\d+)$/.exec(path);
  if(!METHODS[path]&&!lessonMatch)return undefined;
  try {
    if(!(lessonMatch?['GET']:METHODS[path]).includes(request.method))throw new ApiError(405,'This method is not supported.');
    const user=await getSessionUser(request);
    const publicRead=['get-course-reviews','get-instructor-reviews'].includes(path);
    if(!user&&!publicRead)throw new ApiError(401,'Sign in to continue.');
    if(request.method!=='GET'){assertSameOrigin(request);await rateLimit('education-write',String(user!.id),500,900);}
    const body=await readBody(request);
    if(lessonMatch) {
      const lesson=await getRow('ir_lessons',idValue(lessonMatch[1]));await accessCourse(user,Number(lesson.course_id));await assertLessonSequence(user,Number(lesson.id));
      if(!lesson.is_published&&!['admin','superadmin'].includes(user!.role))throw new ApiError(404,'Lesson not found.');
      if(lesson.type==='quiz'){const [rows]=await database().execute<RowDataPacket[]>('SELECT id FROM ir_quizzes WHERE lesson_id=? AND is_published=1',[lesson.id]);if(!rows[0])throw new ApiError(404,'Quiz not found.');return success({type:'quiz',quiz:await getQuizCurriculum(database(),Number(rows[0].id))});}
      if(lesson.type==='assignment'){const [rows]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_assignments WHERE lesson_id=? AND is_active=1',[lesson.id]);if(!rows[0])throw new ApiError(404,'Assignment not found.');return success({type:'assignment',assignment:await studentAssignment(rows[0],user!)});}
      throw new ApiError(422,'This lesson is not an assessment.');
    }
    if(path==='education/skip') {
      const lesson=await getRow('ir_lessons',idValue(body.lesson_id));await accessCourse(user,Number(lesson.course_id),false);await assertLessonSequence(user,Number(lesson.id));
      if(!['quiz','assignment'].includes(lesson.type))throw new ApiError(422,'This lesson cannot be skipped.');
      const [rows]=await database().execute<RowDataPacket[]>(`SELECT can_skip FROM ${lesson.type==='quiz'?'ir_quizzes':'ir_assignments'} WHERE lesson_id=?`,[lesson.id]);
      if(!rows[0]?.can_skip)throw new ApiError(403,'The instructor has not enabled skipping for this assessment.');
      return success(await transaction(async connection=>{await connection.execute('INSERT INTO ir_progress(user_id,lesson_id,completed,position_seconds) VALUES(?,?,1,0) ON DUPLICATE KEY UPDATE completed=1',[user!.id,lesson.id]);await audit(connection,user!,'lesson.skip','lesson',lesson.id);return {lesson_id:Number(lesson.id),completed:true};}));
    }
    if(path.includes('assignment'))return success(await handleAssignment(path,body,user!),'Assignment data saved.');
    if(path.includes('quiz'))return success(await handleQuiz(path,body,user!,request.method),'Quiz data saved.');
    return success(await handleSocial(path,body,user,request.method),request.method==='GET'?'Data fetched successfully.':'Your changes have been saved.');
  } catch(error){return failure(error);}
}

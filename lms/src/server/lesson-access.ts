import { Pool,PoolConnection,RowDataPacket } from 'mysql2/promise';
import type { SessionUser } from './auth';
import { database } from './db';
import { ApiError } from './errors';

export async function sequentialEnabled(courseId:number,connection:Pool|PoolConnection=database()):Promise<boolean> {
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT metadata FROM ir_course_details WHERE course_id=?',[courseId]);
  const value=typeof rows[0]?.metadata==='string'?JSON.parse(rows[0].metadata):rows[0]?.metadata;
  return [true,1,'1','true'].includes(value?.sequential_access);
}

export async function assertLessonSequence(user:SessionUser|null,lessonId:number,connection:Pool|PoolConnection=database()):Promise<void> {
  if(user&&['admin','superadmin'].includes(user.role))return;
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT l.*,ch.position chapter_position FROM ir_lessons l JOIN ir_chapters ch ON ch.id=l.chapter_id WHERE l.id=?',[lessonId]);
  const lesson=rows[0];if(!lesson)throw new ApiError(404,'Lesson not found.');
  if(lesson.is_preview||!await sequentialEnabled(Number(lesson.course_id),connection))return;
  if(!user)throw new ApiError(401,'Sign in to continue.');
  const [prior]=await connection.execute<RowDataPacket[]>(`SELECT p.id FROM ir_lessons p JOIN ir_chapters ch ON ch.id=p.chapter_id LEFT JOIN ir_progress done ON done.lesson_id=p.id AND done.user_id=? AND done.completed=1
    WHERE p.course_id=? AND p.is_published=1 AND (ch.position,ch.id,p.position,p.id)<(?,?,?,?) AND done.lesson_id IS NULL LIMIT 1`,[user.id,lesson.course_id,lesson.chapter_position,lesson.chapter_id,lesson.position,lesson.id]);
  if(prior.length)throw new ApiError(403,'Complete the earlier lessons in this course before opening this lesson.');
}

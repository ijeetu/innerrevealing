import { RowDataPacket } from 'mysql2/promise';
import { database } from './db';
import { getSessionUser } from './auth';
import { ApiError } from './errors';
import { safeContent } from './admin/core';
import { getCourseCurriculum, getPublishedCourseBySlug } from './catalogue';
import type { CourseOverviewData, LearningCourse, LessonData, LibraryItem } from '@/types/learning';
import { assertLessonSequence,sequentialEnabled } from './lesson-access';

export function positiveId(value: unknown): number {
  const text = String(value ?? '');
  if (!/^\d{1,15}$/.test(text)) throw new ApiError(422, 'Invalid item identifier.');
  const id = Number(text);
  if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(422, 'Invalid item identifier.');
  return id;
}

export async function requireLearner(request: Request) {
  const user = await getSessionUser(request);
  if (!user) throw new ApiError(401, 'Please sign in to continue.');
  return user;
}

export async function hasEnrollment(userId: number, courseId: number): Promise<boolean> {
  const [rows] = await database().execute<RowDataPacket[]>("SELECT id FROM ir_enrollments WHERE user_id = ? AND course_id = ? AND status = 'active' LIMIT 1", [userId, courseId]);
  return rows.length > 0;
}

export async function courseOverview(request: Request, slug: string): Promise<CourseOverviewData> {
  const course = await getPublishedCourseBySlug(slug);
  if (!course) throw new ApiError(404, 'This course is not available.');
  const user = await getSessionUser(request);
  const chapters = await getCourseCurriculum(course.id);
  const enrolled = user ? await hasEnrollment(user.id, course.id) : false;
  let saved = false;
  let completed: number[] = [];
  if (user) {
    const [wishlist] = await database().execute<RowDataPacket[]>('SELECT course_id FROM ir_wishlist WHERE user_id = ? AND course_id = ? LIMIT 1', [user.id, course.id]);
    saved = wishlist.length > 0;
    if (enrolled) {
      const [progress] = await database().execute<RowDataPacket[]>('SELECT p.lesson_id FROM ir_progress p JOIN ir_lessons l ON l.id = p.lesson_id WHERE p.user_id = ? AND l.course_id = ? AND l.is_published = 1 AND p.completed = 1', [user.id, course.id]);
      completed = progress.map(row => Number(row.lesson_id));
    }
  }
  return { course, chapters, enrolled, saved, can_manage: !!user && ['admin', 'superadmin'].includes(user.role), completed_lesson_ids: completed,sequential_access:await sequentialEnabled(course.id) };
}

export async function getLesson(request: Request, lessonId: number): Promise<LessonData> {
  const [rows] = await database().execute<RowDataPacket[]>(
    `SELECT l.* FROM ir_lessons l JOIN ir_courses c ON c.id = l.course_id
     JOIN ir_chapters ch ON ch.id = l.chapter_id AND ch.course_id = c.id
     WHERE l.id = ? AND l.is_published = 1 AND c.status = 'published' LIMIT 1`, [lessonId],
  );
  const lesson = rows[0];
  if (!lesson) throw new ApiError(404, 'This lesson is not available.');
  const user = await getSessionUser(request);
  const enrolled = user ? await hasEnrollment(user.id, Number(lesson.course_id)) : false;
  const canManage = !!user && ['admin', 'superadmin'].includes(user.role);
  if (!lesson.is_preview && !enrolled && !canManage) throw new ApiError(user ? 403 : 401, 'Enrol in this course to access this lesson.');
  await assertLessonSequence(user,lessonId);
  let completed = false, position = 0;
  if (user && enrolled) {
    const [progress] = await database().execute<RowDataPacket[]>('SELECT completed, position_seconds FROM ir_progress WHERE user_id = ? AND lesson_id = ?', [user.id, lessonId]);
    completed = !!progress[0]?.completed;
    position = Number(progress[0]?.position_seconds || 0);
  }
  const [resources]=await database().execute<RowDataPacket[]>('SELECT id,title,type,media_id,url FROM ir_lesson_resources WHERE lesson_id=? ORDER BY position,id',[lessonId]);
  let assessmentId:number|undefined;
  if(['quiz','assignment'].includes(lesson.type)) {
    const [assessments]=await database().execute<RowDataPacket[]>(`SELECT id FROM ${lesson.type==='quiz'?'ir_quizzes':'ir_assignments'} WHERE lesson_id=?`,[lessonId]);assessmentId=assessments[0]?Number(assessments[0].id):undefined;
  }
  return {
    id: Number(lesson.id), course_id: Number(lesson.course_id), chapter_id: Number(lesson.chapter_id),
    title: lesson.title, type: lesson.type, duration_seconds: Number(lesson.duration_seconds),
    is_preview: !!lesson.is_preview, position: Number(lesson.position), content: lesson.content ? safeContent(lesson.content, 'Lesson content') : null,
    source_url: lesson.media_id ? `/api/media/${Number(lesson.media_id)}` : lesson.external_url || null,
    completed, position_seconds: position, enrolled,assessment_id:assessmentId,resources:resources.map(row=>({id:Number(row.id),title:row.title,type:row.type,source_url:row.media_id?`/api/media/${row.media_id}`:row.url})),
  };
}

export async function saveProgress(request: Request, lessonId: number, body: Record<string, unknown>) {
  const user = await requireLearner(request);
  const lesson = await getLesson(request, lessonId);
  if (!lesson.enrolled) throw new ApiError(403, 'Enrol in this course before saving progress.');
  if(['quiz','assignment'].includes(lesson.type))throw new ApiError(403,'Complete the quiz or have your assignment reviewed to finish this lesson.');
  if (body.completed !== undefined && typeof body.completed !== 'boolean') throw new ApiError(422, 'Invalid completion status.');
  const position = body.position_seconds === undefined ? lesson.position_seconds : Number(body.position_seconds);
  if (!Number.isSafeInteger(position) || position < 0 || position > 604800) throw new ApiError(422, 'Invalid playback position.');
  const completionProvided = body.completed !== undefined;
  const completed = completionProvided ? body.completed === true : false;
  await database().execute(
    'INSERT INTO ir_progress (user_id, lesson_id, completed, position_seconds) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE completed = IF(?, VALUES(completed), completed), position_seconds = VALUES(position_seconds), updated_at = UTC_TIMESTAMP()',
    [user.id, lessonId, completed ? 1 : 0, position, completionProvided ? 1 : 0],
  );
  const [stored] = await database().execute<RowDataPacket[]>('SELECT completed,position_seconds FROM ir_progress WHERE user_id=? AND lesson_id=?', [user.id, lessonId]);
  return { lesson_id: lessonId, completed: !!stored[0].completed, position_seconds: Number(stored[0].position_seconds) };
}

function summary(row: RowDataPacket): LearningCourse {
  return { id: Number(row.id), slug: row.slug, title: row.title, short_description: row.short_description, image: row.image, price: Number(row.price), category_name: row.category_name || '', author_name: row.author_name || '' };
}

export async function getLibrary(request: Request): Promise<LibraryItem[]> {
  const user = await requireLearner(request);
  const [rows] = await database().execute<RowDataPacket[]>(
    `SELECT c.id,c.slug,c.title,c.short_description,c.image,c.price,cat.name category_name,u.name author_name,e.created_at enrolled_at,
      (SELECT COUNT(*) FROM ir_lessons l WHERE l.course_id = c.id AND l.is_published = 1) total_lessons,
      (SELECT COUNT(*) FROM ir_progress p JOIN ir_lessons l ON l.id = p.lesson_id WHERE p.user_id = e.user_id AND l.course_id = c.id AND l.is_published = 1 AND p.completed = 1) completed_lessons
     FROM ir_enrollments e JOIN ir_courses c ON c.id = e.course_id
     LEFT JOIN ir_categories cat ON cat.id = c.category_id LEFT JOIN ir_users u ON u.id = c.instructor_id
     WHERE e.user_id = ? AND e.status = 'active' AND c.status = 'published' ORDER BY e.created_at DESC LIMIT 200`, [user.id],
  );
  return rows.map(row => { const total = Number(row.total_lessons), completed = Number(row.completed_lessons); return { course: summary(row), enrolled_at: row.enrolled_at, total_lessons: total, completed_lessons: completed, progress_percent: total ? Math.round(completed / total * 100) : 0 }; });
}

export async function getWishlist(request: Request): Promise<LearningCourse[]> {
  const user = await requireLearner(request);
  const [rows] = await database().execute<RowDataPacket[]>(
    `SELECT c.id,c.slug,c.title,c.short_description,c.image,c.price,cat.name category_name,u.name author_name FROM ir_wishlist w
     JOIN ir_courses c ON c.id = w.course_id LEFT JOIN ir_categories cat ON cat.id = c.category_id LEFT JOIN ir_users u ON u.id = c.instructor_id
     WHERE w.user_id = ? AND c.status = 'published' ORDER BY w.created_at DESC LIMIT 200`, [user.id],
  );
  return rows.map(summary);
}

export async function updateWishlist(request: Request, courseId: number, saved: boolean) {
  const user = await requireLearner(request);
  if (saved) {
    const [course] = await database().execute<RowDataPacket[]>("SELECT id FROM ir_courses WHERE id = ? AND status = 'published'", [courseId]);
    if (!course.length) throw new ApiError(404, 'This course is not available.');
    await database().execute('INSERT IGNORE INTO ir_wishlist (user_id, course_id) VALUES (?, ?)', [user.id, courseId]);
  } else await database().execute('DELETE FROM ir_wishlist WHERE user_id = ? AND course_id = ?', [user.id, courseId]);
  return { course_id: courseId, saved };
}

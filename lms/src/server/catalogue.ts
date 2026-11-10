import { RowDataPacket } from 'mysql2/promise';
import type { Course as CourseDetails } from '@/utils/api/user/getCourse';
import type { WebSettings } from '@/utils/api/general/getSettings';
import en from '../utils/locale/en.json';
import { database } from './db';
import { ApiError } from './errors';
import { safeContent } from './admin/core';
import type { LearningChapter, LessonSummary } from '@/types/learning';

interface CourseRow extends RowDataPacket {
  id: number; title: string; slug: string; short_description: string; description: string | null;
  image: string; category_id: number; category_name: string; level: string; price: string;
  author_id: number; author_name: string; language_name: string; updated_at: string;
}

const COURSE_FROM = `FROM ir_courses c
  JOIN ir_users u ON u.id = c.instructor_id AND u.is_active = 1
  LEFT JOIN ir_categories cat ON cat.id = c.category_id
  LEFT JOIN ir_languages lang ON lang.id = c.language_id
  LEFT JOIN ir_course_details details ON details.course_id=c.id`;
const COURSE_SELECT = `SELECT c.*, cat.name AS category_name, u.id AS author_id,
  u.name AS author_name, lang.name AS language_name, details.metadata AS course_metadata,
  (SELECT COUNT(*) FROM ir_reviews r WHERE r.course_id=c.id) rating_count,
  (SELECT AVG(r.rating) FROM ir_reviews r WHERE r.course_id=c.id) rating_average,
  (SELECT COUNT(*) FROM ir_enrollments e WHERE e.course_id=c.id AND e.status='active') enrollment_count ${COURSE_FROM}`;

function courseData(row: CourseRow): CourseDetails {
  const price = Number(row.price);
  const meta = (typeof row.course_metadata==='string'?JSON.parse(row.course_metadata):row.course_metadata)||{};
  const original = Number(meta.list_price??price);
  return {
    id: Number(row.id), slug: row.slug, title: row.title, short_description: row.short_description,
    description: row.description ? safeContent(row.description, 'Course description') : null, image: row.image, category_id: Number(row.category_id || 0),
    category_name: row.category_name || '', level: row.level, course_type: price > 0 ? 'paid' : 'free',
    sequential_access: Boolean(meta.sequential_access), certificate_enabled: Boolean(meta.certificate_enabled), certificate_fee: meta.certificate_fee??null,
    ratings: Number(row.rating_count||0), average_rating: Number(row.rating_average||0), author_name: row.author_name, price, discount_price: price,
    total_tax_percentage: 0, tax_type: 'exclusive', original_price: original, course_discount: original-price,
    subtotal: price, promo_discount: 0, taxable_amount: price, tax_percentage: 0, tax_amount: 0,
    total: price, discount_percentage: original>0?Math.round((1-price/original)*100):0, is_purchased: false, is_wishlist: false,
    enroll_students: Number(row.enrollment_count||0), last_updated: row.updated_at, meta_title: meta.meta_title || row.title,
    meta_description: meta.meta_description || row.short_description, meta_image: meta.meta_image || row.image, learnings: (meta.learnings_data||[]).map((entry: Record<string,unknown>)=>({id:Number(entry.id),title:String(entry.learning)})), requirements: meta.requirements_data||[],
    reviews: [], tags: meta.tags||[], language: row.language_name || '',
    instructor: {
      id: Number(row.author_id), name: row.author_name, slug: `learner-${row.author_id}`, email: '',
      avatar: null, about_me: null, qualification: null, skills: null, preview_video: null,
      social_media: null, reviews: null, instructor_type: 'individual', team_name: null, team_members: [],
    },
    chapters: [], chapter_count: 0, lecture_count: 0, total_curriculum_count: 0,
    completed_curriculum_count: 0, progress_percentage: 0, total_duration: 0,
    total_duration_formatted: '', preview_videos: [],
    // The legacy frontend type predates courses without a current curriculum.
    current_curriculum: null as unknown as CourseDetails['current_curriculum'],
  };
}

export async function getPublishedCourseBySlug(slug: string): Promise<CourseDetails | null> {
  if (!slug || slug.length > 220) return null;
  const [rows] = await database().execute<CourseRow[]>(`${COURSE_SELECT} WHERE c.status = 'published' AND c.slug = ? LIMIT 1`, [slug]);
  return rows[0] ? attachPublicCurriculum(courseData(rows[0])) : null;
}

export async function getPublishedCourseById(id: number): Promise<CourseDetails | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const [rows] = await database().execute<CourseRow[]>(`${COURSE_SELECT} WHERE c.status = 'published' AND c.id = ? LIMIT 1`, [id]);
  return rows[0] ? attachPublicCurriculum(courseData(rows[0])) : null;
}

export function pageOptions(params: URLSearchParams): { page: number; perPage: number } {
  const parse = (key: string, fallback: number, maximum: number) => {
    const value = params.get(key);
    if (!value) return fallback;
    if (!/^\d+$/.test(value)) throw new ApiError(422, `Invalid ${key}.`);
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 1 || number > maximum) throw new ApiError(422, `Invalid ${key}.`);
    return number;
  };
  return { page: parse('page', 1, 10000), perPage: parse('per_page', 12, 50) };
}

export function paginate<T>(data: T[], total: number, page: number, perPage: number, path: string) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const url = (number: number) => `${path}?page=${number}&per_page=${perPage}`;
  return {
    current_page: page, data, first_page_url: url(1), from: data.length ? (page - 1) * perPage + 1 : 0,
    last_page: lastPage, last_page_url: url(lastPage), links: [], next_page_url: page < lastPage ? url(page + 1) : null,
    path, per_page: perPage, prev_page_url: page > 1 ? url(page - 1) : null,
    to: data.length ? (page - 1) * perPage + data.length : 0, total,
  };
}

export async function getPublishedCourses(params: URLSearchParams, userId?: number) {
  const { page, perPage } = pageOptions(params);
  const conditions = ["c.status = 'published'"];
  const values: (string | number)[] = [];
  const search = params.get('search')?.trim();
  if (search) {
    if (search.length > 200) throw new ApiError(422, 'Search must be 200 characters or fewer.');
    const pattern = `%${search.replace(/[=%_]/g, '=$&')}%`;
    conditions.push("(c.title LIKE ? ESCAPE '=' OR c.short_description LIKE ? ESCAPE '=' OR cat.name LIKE ? ESCAPE '=')");
    values.push(pattern, pattern, pattern);
  }
  if (params.get('slug')) { conditions.push('c.slug = ?'); values.push(params.get('slug')!); }
  if (params.get('id')) { conditions.push('c.id = ?'); values.push(params.get('id')!); }
  if (params.get('category_slug')) { conditions.push('cat.slug = ?'); values.push(params.get('category_slug')!); }
  if (params.get('category_id')) { conditions.push('c.category_id = ?'); values.push(params.get('category_id')!); }
  const level = params.get('level')?.split(',').filter(value => ['beginner', 'intermediate', 'advanced'].includes(value));
  if (level?.length) { conditions.push(`c.level IN (${level.map(() => '?').join(',')})`); values.push(...level); }
  const languages = params.get('language_id')?.split(',').filter(value => /^\d{1,8}$/.test(value)).slice(0, 10);
  if (languages?.length) { conditions.push(`c.language_id IN (${languages.map(() => '?').join(',')})`); values.push(...languages); }
  if (params.get('course_type') === 'free') conditions.push('c.price = 0');
  if (params.get('course_type') === 'paid') conditions.push('c.price > 0');
  const where = `WHERE ${conditions.join(' AND ')}`;
  const order = (params.get('sort_by') || params.get('post_filter')) === 'oldest' ? 'c.created_at ASC, c.id ASC' : 'c.created_at DESC, c.id DESC';
  const [count] = await database().execute<RowDataPacket[]>(`SELECT COUNT(*) AS total ${COURSE_FROM} ${where}`, values);
  const [rows] = await database().execute<CourseRow[]>(`${COURSE_SELECT} ${where} ORDER BY ${order} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, values);
  const courses = rows.map(row => ({ ...courseData(row), author_id: Number(row.author_id), author_slug: `learner-${row.author_id}`, is_wishlisted: false, is_enrolled: false }));
  if (userId && courses.length) {
    const ids = courses.map(course => course.id);
    const placeholders = ids.map(() => '?').join(',');
    const [saved] = await database().execute<RowDataPacket[]>(`SELECT course_id FROM ir_wishlist WHERE user_id = ? AND course_id IN (${placeholders})`, [userId, ...ids]);
    const [enrolled] = await database().execute<RowDataPacket[]>(`SELECT course_id FROM ir_enrollments WHERE user_id = ? AND status = 'active' AND course_id IN (${placeholders})`, [userId, ...ids]);
    const savedIds = new Set(saved.map(row => Number(row.course_id))), enrolledIds = new Set(enrolled.map(row => Number(row.course_id)));
    for (const course of courses) { course.is_wishlisted = savedIds.has(course.id); course.is_enrolled = enrolledIds.has(course.id); }
  }
  return paginate(courses, Number(count[0].total), page, perPage, '/api/get-courses');
}

export async function getPublicSettings(): Promise<WebSettings> {
  const [rows] = await database().execute<RowDataPacket[]>("SELECT setting_value FROM ir_settings WHERE setting_key = 'web' LIMIT 1");
  if (!rows[0]) throw new ApiError(503, 'Site settings have not been configured.');
  const value = rows[0].setting_value;
  const settings = (typeof value === 'string' ? JSON.parse(value) : value) as WebSettings;
  return { ...settings, website_url: process.env.SITE_URL || settings.website_url };
}

export async function getSystemLanguages(code?: string) {
  const [rows] = await database().execute<RowDataPacket[]>(
    `SELECT id, name, code, is_default FROM ir_languages WHERE is_active = 1${code ? ' AND code = ?' : ''} ORDER BY is_default DESC, id`,
    code ? [code] : [],
  );
  return { languages: rows.map(row => ({ id: Number(row.id), name: String(row.name), code: String(row.code), is_rtl: false, is_default: Boolean(row.is_default), image: '', translations_web: row.code === 'en' ? en : {} })) };
}

export async function getCourseLanguages() {
  const [rows] = await database().execute<RowDataPacket[]>('SELECT id, name, code FROM ir_languages WHERE is_active = 1 ORDER BY id');
  return rows.map(row => ({ id: Number(row.id), name: row.name, slug: row.code, is_active: 1, created_at: '', updated_at: '', deleted_at: null }));
}

export async function getCategories(params: URLSearchParams) {
  const { page, perPage } = pageOptions(params);
  const [rows] = await database().execute<RowDataPacket[]>(
    `SELECT cat.*, (SELECT COUNT(*) FROM ir_courses c WHERE c.category_id = cat.id AND c.status = 'published') AS courses_count
     FROM ir_categories cat WHERE cat.is_active = 1 ORDER BY cat.id`,
  );
  const filtered = rows.filter(row => (!params.get('slug') || row.slug === params.get('slug')) && (!params.get('id') || Number(row.id) === Number(params.get('id'))));
  const result = filtered.slice((page - 1) * perPage, page * perPage).map(row => ({
    id: Number(row.id), name: row.name, slug: row.slug, image: row.image, description: row.description,
    status: true, parent_category_id: null, subcategories_count: 0, parent_category_count: 0,
    courses_count: Number(row.courses_count), has_subcategory: false, has_parent_category: false, subcategories: [],
  }));
  return paginate(result, filtered.length, page, perPage, '/api/categories');
}

export async function publishedCourseCount(): Promise<number> {
  const [rows] = await database().execute<RowDataPacket[]>("SELECT COUNT(*) AS total FROM ir_courses WHERE status = 'published'");
  return Number(rows[0].total);
}


// Public curriculum includes lesson metadata only. Content and private source URLs
// are returned exclusively by the access-checked learning and media endpoints.
export async function getCourseCurriculum(courseId: number): Promise<LearningChapter[]> {
  const [chapters] = await database().execute<RowDataPacket[]>('SELECT id,title,position FROM ir_chapters WHERE course_id = ? ORDER BY position,id', [courseId]);
  const [lessons] = await database().execute<RowDataPacket[]>(
    'SELECT id,course_id,chapter_id,title,type,duration_seconds,position,is_preview FROM ir_lessons WHERE course_id = ? AND is_published = 1 ORDER BY position,id', [courseId],
  );
  return chapters.map(chapter => ({
    id: Number(chapter.id), title: chapter.title, position: Number(chapter.position),
    lessons: lessons.filter(lesson => Number(lesson.chapter_id) === Number(chapter.id)).map(lesson => ({
      id: Number(lesson.id), course_id: Number(lesson.course_id), chapter_id: Number(lesson.chapter_id),
      title: lesson.title, type: lesson.type as LessonSummary['type'], duration_seconds: Number(lesson.duration_seconds),
      position: Number(lesson.position), is_preview: Boolean(lesson.is_preview),
    })),
  }));
}

async function attachPublicCurriculum(course: CourseDetails): Promise<CourseDetails> {
  const chapters = await getCourseCurriculum(course.id);
  const lessons = chapters.flatMap(chapter => chapter.lessons);
  course.chapter_count = chapters.length;
  course.lecture_count = lessons.filter(lesson => ['video', 'audio'].includes(lesson.type)).length;
  course.total_curriculum_count = lessons.length;
  course.total_duration = lessons.reduce((sum, lesson) => sum + lesson.duration_seconds, 0);
  course.total_duration_formatted = course.total_duration ? `${Math.ceil(course.total_duration / 60)} min` : '';
  course.chapters = chapters.map(chapter => ({
    id: chapter.id, course_id: course.id, title: chapter.title, slug: String(chapter.id), description: '', is_active: true,
    chapter_order: chapter.position, lecture_count: chapter.lessons.length, lectures_count: chapter.lessons.length,
    duration: chapter.lessons.reduce((sum, lesson) => sum + lesson.duration_seconds, 0), duration_formatted: '',
    total_content: chapter.lessons.length, quizzes_count: chapter.lessons.filter(lesson=>lesson.type==='quiz').length, assignments_count: chapter.lessons.filter(lesson=>lesson.type==='assignment').length,
    documents_count: chapter.lessons.filter(lesson => ['pdf', 'text', 'resource'].includes(lesson.type)).length,
    curriculum: chapter.lessons.map(lesson => ({
      id: lesson.id, type: lesson.type==='quiz'?'quiz' as const:lesson.type==='assignment'?'assignment' as const:['pdf', 'text', 'resource'].includes(lesson.type) ? 'document' as const : 'lecture' as const,
      title: lesson.title, slug: String(lesson.id), description: null, is_active: true, chapter_order: lesson.position,
      is_completed: false, created_at: '', updated_at: '', free_preview: lesson.is_preview ? 1 : 0,
    })), created_at: '', updated_at: '', locked: !chapter.lessons.some(lesson => lesson.is_preview),
  }));
  return course;
}

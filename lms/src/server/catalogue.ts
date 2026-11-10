import { RowDataPacket } from 'mysql2/promise';
import type { Course as CourseDetails } from '@/utils/api/user/getCourse';
import type { WebSettings } from '@/utils/api/general/getSettings';
import en from '../utils/locale/en.json';
import { database } from './db';
import { ApiError } from './errors';

interface CourseRow extends RowDataPacket {
  id: number; title: string; slug: string; short_description: string; description: string | null;
  image: string; category_id: number; category_name: string; level: string; price: string;
  author_id: number; author_name: string; language_name: string; updated_at: string;
}

const COURSE_FROM = `FROM ir_courses c
  JOIN ir_users u ON u.id = c.instructor_id AND u.is_active = 1
  LEFT JOIN ir_categories cat ON cat.id = c.category_id
  LEFT JOIN ir_languages lang ON lang.id = c.language_id`;
const COURSE_SELECT = `SELECT c.*, cat.name AS category_name, u.id AS author_id,
  u.name AS author_name, lang.name AS language_name ${COURSE_FROM}`;

function courseData(row: CourseRow): CourseDetails {
  const price = Number(row.price);
  return {
    id: Number(row.id), slug: row.slug, title: row.title, short_description: row.short_description,
    description: row.description, image: row.image, category_id: Number(row.category_id || 0),
    category_name: row.category_name || '', level: row.level, course_type: price > 0 ? 'paid' : 'free',
    sequential_access: false, certificate_enabled: false, certificate_fee: null,
    ratings: 0, average_rating: 0, author_name: row.author_name, price, discount_price: price,
    total_tax_percentage: 0, tax_type: 'exclusive', original_price: price, course_discount: 0,
    subtotal: price, promo_discount: 0, taxable_amount: price, tax_percentage: 0, tax_amount: 0,
    total: price, discount_percentage: 0, is_purchased: false, is_wishlist: false,
    enroll_students: 0, last_updated: row.updated_at, meta_title: row.title,
    meta_description: row.short_description, meta_image: row.image, learnings: [], requirements: [],
    reviews: [], tags: [], language: row.language_name || '',
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
  return rows[0] ? courseData(rows[0]) : null;
}

export async function getPublishedCourseById(id: number): Promise<CourseDetails | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const [rows] = await database().execute<CourseRow[]>(`${COURSE_SELECT} WHERE c.status = 'published' AND c.id = ? LIMIT 1`, [id]);
  return rows[0] ? courseData(rows[0]) : null;
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

export async function getPublishedCourses(params: URLSearchParams) {
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
  const order = params.get('sort_by') === 'oldest' ? 'c.created_at ASC, c.id ASC' : 'c.created_at DESC, c.id DESC';
  const [count] = await database().execute<RowDataPacket[]>(`SELECT COUNT(*) AS total ${COURSE_FROM} ${where}`, values);
  const [rows] = await database().execute<CourseRow[]>(`${COURSE_SELECT} ${where} ORDER BY ${order} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, values);
  const courses = rows.map(row => ({ ...courseData(row), author_id: Number(row.author_id), author_slug: `learner-${row.author_id}`, is_wishlisted: false, is_enrolled: false }));
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

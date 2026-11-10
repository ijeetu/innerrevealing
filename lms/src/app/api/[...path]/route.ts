import { database } from '@/server/db';
import { handleCourses } from '@/server/instructor/courses';
import { handleDashboard } from '@/server/instructor/dashboard';
import { handleEducation } from '@/server/instructor/education';
import { handleOperations } from '@/server/instructor/operations';
import { getSessionUser } from '@/server/auth';
import { ApiError } from '@/server/errors';
import { assertSameOrigin } from '@/server/request';
import { failure, success } from '@/server/response';
import {
  getCategories, getCourseLanguages, getPublicSettings, getPublishedCourseById, getPublishedCourseBySlug,
  getPublishedCourses, getSystemLanguages, pageOptions, paginate, publishedCourseCount,
} from '@/server/catalogue';
import { RowDataPacket } from 'mysql2/promise';
import { getLibrary, getWishlist } from '@/server/learning';
import { safeContent } from '@/server/admin/core';
import { getNotifications, markRead } from '@/server/notifications';
import { positiveId } from '@/server/learning';
import { readJson } from '@/server/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path: string[] }> };

async function authenticated(request: Request) {
  const user = await getSessionUser(request);
  if (!user) throw new ApiError(401, 'Please sign in to continue.');
  return user;
}

export async function GET(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join('/');
    for (const handler of [handleCourses, handleDashboard, handleEducation, handleOperations]) { const handled = await handler(request, path); if (handled) return handled; }
    const params = new URL(request.url).searchParams;
    if (path === 'web-settings') return success(await getPublicSettings());
    if (path === 'system-languages') return success(await getSystemLanguages(params.get('code') || undefined));
    if (path === 'get-course-languages') return success(await getCourseLanguages());
    if (['categories', 'get-categories', 'categories-tree'].includes(path)) return success(await getCategories(params));
    if (path === 'get-courses') return success(await getPublishedCourses(params, (await getSessionUser(request))?.id));
    if (['get-course', 'get-course-details'].includes(path)) {
      const course = params.get('slug') ? await getPublishedCourseBySlug(params.get('slug')!) : await getPublishedCourseById(Number(params.get('id')));
      if (!course) throw new ApiError(404, 'This practice is not available.');
      const user = await getSessionUser(request);
      if (user) {
        const [membership] = await database().execute<RowDataPacket[]>("SELECT id FROM ir_enrollments WHERE user_id=? AND course_id=? AND status='active'", [user.id, course.id]);
        course.is_purchased = membership.length > 0;
        const [wishlist] = await database().execute<RowDataPacket[]>('SELECT course_id FROM ir_wishlist WHERE user_id=? AND course_id=?', [user.id, course.id]);
        course.is_wishlist = wishlist.length > 0;
      }
      return success(course);
    }
    if (path === 'get-user-details') return success(await authenticated(request));
    if (path === 'get-counts') {
      const [instructors] = await database().execute<RowDataPacket[]>("SELECT COUNT(DISTINCT instructor_id) AS total FROM ir_courses WHERE status = 'published'");
      const [enrolled] = await database().execute<RowDataPacket[]>("SELECT COUNT(*) AS total FROM ir_enrollments e JOIN ir_courses c ON c.id=e.course_id WHERE e.status='active' AND c.status='published'");
      const [positive] = await database().execute<RowDataPacket[]>("SELECT COUNT(*) total FROM ir_reviews r JOIN ir_courses c ON c.id=r.course_id WHERE c.status='published' AND r.rating>=4");
      return success({ course_count: await publishedCourseCount(), instructor_count: Number(instructors[0].total), student_enroll_count: Number(enrolled[0].total), positive_feedback_count: Number(positive[0].total) });
    }
    if (path === 'get-search-suggestions') {
      const query = params.get('query') || '';
      const courses = await getPublishedCourses(new URLSearchParams({ search: query, per_page: '5' }));
      return success({
        query, recent_searches: [], total_recent: 0, other_suggestions: [], total_other: 0,
        top_courses: courses.data.map(course => ({ type: 'course', text: course.title, slug: course.slug, icon: '', author_name: course.author_name, course_image: course.image, course_id: course.id })),
        total_courses: courses.total,
      });
    }
    if (['get-feature-sections', 'get-sliders', 'seo-settings', 'get-seo-settings', 'get-custom-form-fields', 'get-resources'].includes(path)) return success([]);
    if (path === 'pages') {
      const [rows] = await database().execute<RowDataPacket[]>("SELECT id,slug,title,content FROM ir_pages WHERE status='published' ORDER BY id");
      return success(rows.filter(row => !params.get('type') || row.slug === params.get('type')).map(row => ({ ...row, page_type: row.slug, page_content: row.content, meta_title: row.title })));
    }
    if (path === 'faqs') {
      const { page, perPage } = pageOptions(params);
      const [rows] = await database().execute<RowDataPacket[]>('SELECT id,question,answer,created_at,updated_at FROM ir_faqs WHERE is_published=1 ORDER BY position,id');
      return success(paginate(rows.slice((page-1)*perPage,page*perPage).map(row => ({ ...row, answer: safeContent(row.answer, 'FAQ answer', 50000) })), rows.length, page, perPage, '/api/faqs'));
    }
    if (path === 'get-instructors') {
      const { page, perPage } = pageOptions(params);
      const [people] = await database().execute<RowDataPacket[]>("SELECT u.id,u.name,COUNT(c.id) courses_count FROM ir_users u JOIN ir_courses c ON c.instructor_id=u.id AND c.status='published' WHERE u.is_active=1 GROUP BY u.id,u.name ORDER BY u.name");
      return success(paginate(people.slice((page-1)*perPage,page*perPage).map(row=>({...row,slug:`learner-${row.id}`,profile:'',instructor_type:'individual'})), people.length, page, perPage, '/api/get-instructors'));
    }
    if (path === 'my-learning' || path === 'wishlist') {
      const { page, perPage } = pageOptions(params);
      const rows = path === 'my-learning' ? (await getLibrary(request)).map(item => ({ ...item.course, progress_percentage: item.progress_percent, completed_curriculum_count: item.completed_lessons, total_curriculum_count: item.total_lessons, is_enrolled: true })) : await getWishlist(request);
      return success(paginate(rows.slice((page-1)*perPage,page*perPage), rows.length, page, perPage, `/api/${path}`));
    }
    if (path === 'notifications') return success(await getNotifications((await authenticated(request)).id, params));
    if (path.startsWith('instructor/') || path.startsWith('finance/')) throw new ApiError(403, 'Instructor and payment administration is not enabled.');
    throw new ApiError(503, 'This feature is not available yet. Please contact Inner Revealing for assistance.');
  } catch (error) { return failure(error); }
}

async function unsupportedMutation(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const path = (await context.params).path.join('/');
    for (const handler of [handleCourses, handleDashboard, handleEducation, handleOperations]) { const handled = await handler(request, path); if (handled) return handled; }
    if (request.method === 'POST' && ['notifications/mark-read', 'notifications/mark-all-read'].includes(path)) {
      const user = await authenticated(request);
      const body = await readJson(request);
      if (path === 'notifications/mark-all-read') return success(await markRead(user.id), 'Your updates have been marked as read.');
      const supplied = body.notification_id ?? body.id;
      const ids = Array.isArray(supplied) ? supplied : [supplied];
      if (!ids.length || ids.length > 100) throw new ApiError(422, 'Choose between 1 and 100 updates.');
      const validated = ids.map(positiveId);
      let updated = 0;
      for (const id of validated) updated += (await markRead(user.id, id)).updated;
      return success({ updated });
    }
    if (path.startsWith('instructor/') || ['create-course', 'update-course', 'delete-course', 'update-course-status'].includes(path)) throw new ApiError(403, 'Course administration is not enabled for learner accounts.');
    throw new ApiError(503, 'This feature is not available yet. No changes were made.');
  } catch (error) { return failure(error); }
}

export const POST = unsupportedMutation;
export const PUT = unsupportedMutation;
export const PATCH = unsupportedMutation;
export const DELETE = unsupportedMutation;

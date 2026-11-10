import { database } from '@/server/db';
import { getSessionUser } from '@/server/auth';
import { ApiError } from '@/server/errors';
import { assertSameOrigin } from '@/server/request';
import { failure, success } from '@/server/response';
import {
  getCategories, getCourseLanguages, getPublicSettings, getPublishedCourseById, getPublishedCourseBySlug,
  getPublishedCourses, getSystemLanguages, pageOptions, paginate, publishedCourseCount,
} from '@/server/catalogue';
import { RowDataPacket } from 'mysql2/promise';

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
    const params = new URL(request.url).searchParams;
    if (path === 'web-settings') return success(await getPublicSettings());
    if (path === 'system-languages') return success(await getSystemLanguages(params.get('code') || undefined));
    if (path === 'get-course-languages') return success(await getCourseLanguages());
    if (['categories', 'get-categories', 'categories-tree'].includes(path)) return success(await getCategories(params));
    if (path === 'get-courses') return success(await getPublishedCourses(params));
    if (['get-course', 'get-course-details'].includes(path)) {
      const course = params.get('slug') ? await getPublishedCourseBySlug(params.get('slug')!) : await getPublishedCourseById(Number(params.get('id')));
      if (!course) throw new ApiError(404, 'This practice is not available.');
      return success(course);
    }
    if (path === 'get-user-details') return success(await authenticated(request));
    if (path === 'get-counts') {
      const [instructors] = await database().execute<RowDataPacket[]>("SELECT COUNT(DISTINCT instructor_id) AS total FROM ir_courses WHERE status = 'published'");
      return success({ course_count: await publishedCourseCount(), instructor_count: Number(instructors[0].total), student_enroll_count: 0, positive_feedback_count: 0 });
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
    if (path === 'pages') throw new ApiError(404, 'This page has not been published yet. Please contact Inner Revealing for details.');
    if (path === 'faqs') {
      const { page, perPage } = pageOptions(params);
      return success(paginate([], 0, page, perPage, '/api/faqs'));
    }
    if (path === 'get-instructors') {
      const { page, perPage } = pageOptions(params);
      return success(paginate([], 0, page, perPage, '/api/get-instructors'));
    }
    if (['my-learning', 'wishlist', 'notifications', 'orders', 'refund/my-refunds'].includes(path)) {
      await authenticated(request);
      const { page, perPage } = pageOptions(params);
      return success({ ...paginate([], 0, page, perPage, `/api/${path}`), unread_count: 0 });
    }
    if (path.startsWith('instructor/') || path.startsWith('finance/')) throw new ApiError(403, 'Instructor and payment administration is not enabled.');
    throw new ApiError(503, 'This feature is not available yet. Please contact Inner Revealing for assistance.');
  } catch (error) { return failure(error); }
}

async function unsupportedMutation(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const path = (await context.params).path.join('/');
    if (path.startsWith('instructor/') || ['create-course', 'update-course', 'delete-course', 'update-course-status'].includes(path)) throw new ApiError(403, 'Course administration is not enabled for learner accounts.');
    throw new ApiError(503, 'This feature is not available yet. No changes were made.');
  } catch (error) { return failure(error); }
}

export const POST = unsupportedMutation;
export const PUT = unsupportedMutation;
export const PATCH = unsupportedMutation;
export const DELETE = unsupportedMutation;

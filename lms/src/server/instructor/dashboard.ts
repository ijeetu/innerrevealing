import type { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import type { SessionUser } from '../auth';
import { requireAdmin } from '../authorization';
import { database } from '../db';
import { ApiError } from '../errors';
import { pageOptions, paginate } from '../catalogue';
import { success } from '../response';
import { staffCourseScope } from './support';

const INDIA_OFFSET = 330 * 60 * 1000;
const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
const REFUNDS_BY_ITEM = `SELECT order_id,course_id,SUM(amount) AS refunded
  FROM ir_refund_requests WHERE status='refunded' GROUP BY order_id,course_id`;
const SALES_FROM = `FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id
  JOIN ir_courses c ON c.id=oi.course_id
  LEFT JOIN (${REFUNDS_BY_ITEM}) refunds ON refunds.order_id=oi.order_id AND refunds.course_id=oi.course_id`;

function calendar(now = new Date()) {
  const local = new Date(now.getTime() + INDIA_OFFSET);
  const year = local.getUTCFullYear(), month = local.getUTCMonth(), day = local.getUTCDate();
  const today = Date.UTC(year, month, day);
  const yearStart = Date.UTC(year, 0, 1), monthStart = Date.UTC(year, month, 1);
  const weekStart = today - ((local.getUTCDay() + 6) % 7) * 86400000;
  const key = (value: number) => new Date(value).toISOString().slice(0, 10);
  const sqlStart = (value: number) => new Date(value - INDIA_OFFSET).toISOString().slice(0, 19).replace('T', ' ');
  return { year, month, day, today, yearStart, monthStart, weekStart, key, sqlStart };
}

export interface DailySales { day: string; sales: number | string; revenue: number | string; profit: number | string; }
interface ChartPoint { name: string; sales: number; revenue: number; profit: number; }
export function buildSalesStatistics(rows: DailySales[], now = new Date()) {
  const period = calendar(now);
  const sum = (items: DailySales[], name: string): ChartPoint => ({
    name, sales: items.reduce((total, row) => total + Number(row.sales), 0),
    revenue: roundMoney(items.reduce((total, row) => total + Number(row.revenue), 0)),
    profit: roundMoney(items.reduce((total, row) => total + Number(row.profit), 0)),
  });
  const todayKey = period.key(period.today);
  const recorded = rows.filter(row => row.day <= todayKey);
  const thisYear = recorded.filter(row => row.day.startsWith(String(period.year) + '-'));
  const monthPrefix = period.key(period.monthStart).slice(0, 7);
  const thisMonth = recorded.filter(row => row.day.startsWith(monthPrefix + '-'));
  const thisWeek = recorded.filter(row => row.day >= period.key(period.weekStart));
  return {
    yearly: thisYear.length ? Array.from({ length: period.month + 1 }, (_, month) => {
      const prefix = `${period.year}-${String(month + 1).padStart(2, '0')}-`;
      return sum(thisYear.filter(row => row.day.startsWith(prefix)), new Date(Date.UTC(period.year, month, 1)).toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' }));
    }) : [],
    monthly: thisMonth.length ? Array.from({ length: period.day }, (_, index) => sum(thisMonth.filter(row => row.day === `${monthPrefix}-${String(index + 1).padStart(2, '0')}`), String(index + 1))) : [],
    weekly: thisWeek.length ? Array.from({ length: Math.floor((period.today - period.weekStart) / 86400000) + 1 }, (_, index) => {
      const date = period.weekStart + index * 86400000;
      return sum(thisWeek.filter(row => row.day === period.key(date)), new Date(date).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }));
    }) : [],
  };
}

async function instructorDashboard(user: SessionUser) {
  const scope = staffCourseScope(user);
  const periods = calendar();
  const chartStart = periods.sqlStart(Math.min(periods.yearStart, periods.weekStart));
  const reviewScope = user.role === 'superadmin' ? { sql: '1=1', values: [] as number[] } : {
    sql: '(c.instructor_id=? OR (r.course_id IS NULL AND r.instructor_id=?))', values: [user.id, user.id],
  };
  const [coursesResult, learnersResult, salesResult, reviewsResult, chartResult] = await Promise.all([
    database().execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM ir_courses c WHERE ${scope.sql}`, scope.values),
    database().execute<RowDataPacket[]>(`SELECT COUNT(DISTINCT e.user_id) AS total FROM ir_enrollments e JOIN ir_courses c ON c.id=e.course_id WHERE e.status='active' AND ${scope.sql}`, scope.values),
    database().execute<RowDataPacket[]>(`SELECT COUNT(CASE WHEN oi.amount>0 THEN 1 END) AS sold,
      COALESCE(SUM(oi.amount),0) AS revenue,COALESCE(SUM(COALESCE(refunds.refunded,0)),0) AS refunded
      ${SALES_FROM} WHERE o.status IN ('paid','refunded') AND ${scope.sql}`, scope.values),
    database().execute<RowDataPacket[]>(`SELECT COUNT(*) AS total,COALESCE(SUM(r.rating>=4),0) AS positive
      FROM ir_reviews r LEFT JOIN ir_courses c ON c.id=r.course_id WHERE ${reviewScope.sql}`, reviewScope.values),
    database().execute<RowDataPacket[]>(`SELECT DATE(CONVERT_TZ(COALESCE(o.reviewed_at,o.created_at),'+00:00','+05:30')) AS day,
      COUNT(*) AS sales,SUM(oi.amount) AS revenue,SUM(GREATEST(oi.amount-COALESCE(refunds.refunded,0),0)) AS profit
      ${SALES_FROM} WHERE o.status IN ('paid','refunded') AND oi.amount>0 AND COALESCE(o.reviewed_at,o.created_at)>=? AND ${scope.sql}
      GROUP BY day ORDER BY day`, [chartStart, ...scope.values]),
  ]);
  const courses = coursesResult[0][0], learners = learnersResult[0][0], sales = salesResult[0][0], reviews = reviewsResult[0][0];
  const completed = [Boolean(user.name?.trim()), Boolean(user.email?.trim())].filter(Boolean).length;
  const stat = (value: string | number, label: string) => ({ value, label, icon: '' });
  const positive = Number(reviews.total) ? `${Math.round(Number(reviews.positive) / Number(reviews.total) * 100)}%` : '—';
  return {
    profile_completion: { percentage: completed * 50, completed_fields: completed, total_fields: 2,
      missing_fields: [...(!user.name?.trim() ? ['name'] : []), ...(!user.email?.trim() ? ['email'] : [])],
      is_complete: completed === 2, completion_status: completed === 2 ? 'complete' : 'incomplete' },
    overview_stats: {
      total_courses: stat(Number(courses.total), 'Total Courses'),
      enrolled_students: stat(Number(learners.total), 'Enrolled Students'),
      courses_sold: stat(Number(sales.sold), 'Courses Sold'),
      total_earnings: stat(roundMoney(Math.max(0, Number(sales.revenue) - Number(sales.refunded))), 'Total Earnings'),
      positive_feedback: stat(positive, 'Positive Feedback'),
    },
    sales_statistics: buildSalesStatistics(chartResult[0] as unknown as DailySales[]),
  };
}

async function mostSellingCourses(user: SessionUser, params: URLSearchParams) {
  const filter = params.get('filter') || 'yearly';
  if (!['yearly','monthly','weekly','price_high_to_low','price_low_to_high'].includes(filter)) throw new ApiError(422, 'Choose a supported sales filter.');
  const { page, perPage } = pageOptions(params), scope = staffCourseScope(user), periods = calendar();
  const start = filter === 'yearly' ? periods.yearStart : filter === 'monthly' ? periods.monthStart : filter === 'weekly' ? periods.weekStart : null;
  const timeClause = start === null ? '' : ' AND COALESCE(o.reviewed_at,o.created_at)>=?';
  const timeValues = start === null ? [] : [periods.sqlStart(start)];
  const values: (number | string)[] = [...timeValues, ...timeValues, ...scope.values];
  let where = `WHERE ${scope.sql} AND sales.total_sales>0`;
  const search = params.get('search')?.trim();
  if (search) {
    if (search.length > 200) throw new ApiError(422, 'Search must be 200 characters or fewer.');
    where += " AND c.title LIKE ? ESCAPE '='";
    values.push(`%${search.replace(/[=%_]/g, '=$&')}%`);
  }
  const from = `FROM ir_courses c LEFT JOIN ir_categories cat ON cat.id=c.category_id
    JOIN (SELECT oi.course_id,COUNT(*) AS total_sales,SUM(oi.amount) AS total_revenue
      FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id
      WHERE o.status IN ('paid','refunded') AND oi.amount>0${timeClause} GROUP BY oi.course_id) sales ON sales.course_id=c.id
    LEFT JOIN (SELECT r.course_id,SUM(r.amount) AS refunded FROM ir_refund_requests r JOIN ir_orders o ON o.id=r.order_id
      WHERE r.status='refunded'${timeClause} GROUP BY r.course_id) refunds ON refunds.course_id=c.id
    LEFT JOIN (SELECT course_id,AVG(rating) AS average_rating,COUNT(*) AS rating_count FROM ir_reviews WHERE course_id IS NOT NULL GROUP BY course_id) ratings ON ratings.course_id=c.id
    ${where}`;
  const order = filter === 'price_high_to_low' ? 'c.price DESC,c.id DESC' : filter === 'price_low_to_high' ? 'c.price ASC,c.id DESC' : 'sales.total_sales DESC,sales.total_revenue DESC,c.id DESC';
  const [summaryResult, coursesResult] = await Promise.all([
    database().execute<RowDataPacket[]>(`SELECT COUNT(*) AS total_courses,COALESCE(SUM(sales.total_sales),0) AS total_sales,
      COALESCE(SUM(sales.total_revenue),0) AS total_revenue,
      COALESCE(SUM(GREATEST(sales.total_revenue-COALESCE(refunds.refunded,0),0)),0) AS total_profit ${from}`, values),
    database().execute<RowDataPacket[]>(`SELECT c.*,cat.name AS category_name,sales.total_sales,sales.total_revenue,
      GREATEST(sales.total_revenue-COALESCE(refunds.refunded,0),0) AS profit,
      COALESCE(ratings.average_rating,0) AS average_rating,COALESCE(ratings.rating_count,0) AS rating_count
      ${from} ORDER BY ${order} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, values),
  ]);
  const summary = summaryResult[0][0];
  const courses = coursesResult[0].map(row => ({
    id: Number(row.id), title: row.title, slug: row.slug, thumbnail: row.image,
    category: { id: Number(row.category_id || 0), name: row.category_name || 'Uncategorised' },
    price: String(Number(row.price)), discount_price: null, total_sales: Number(row.total_sales),
    total_revenue: roundMoney(Number(row.total_revenue)), profit: roundMoney(Number(row.profit)),
    average_rating: roundMoney(Number(row.average_rating)), rating_count: Number(row.rating_count),
    status: row.status === 'published' ? 'publish' : row.status, is_active: row.status === 'published', created_at: row.created_at,
    time_based_sales: { sales_count: Number(row.total_sales), revenue: roundMoney(Number(row.total_revenue)), profit: roundMoney(Number(row.profit)) },
  }));
  return { ...paginate(courses, Number(summary.total_courses), page, perPage, '/api/get-most-selling-courses'), filter_applied: filter,
    summary: { total_courses: Number(summary.total_courses), total_sales: Number(summary.total_sales),
      total_revenue: roundMoney(Number(summary.total_revenue)), total_profit: roundMoney(Number(summary.total_profit)) } };
}

export async function handleDashboard(request: Request, path: string): Promise<NextResponse | undefined> {
  if (!['get-instructor-dashboard','get-most-selling-courses'].includes(path)) return undefined;
  if (request.method !== 'GET') throw new ApiError(405, 'Use GET to view dashboard statistics.');
  const user = await requireAdmin(request);
  return success(path === 'get-instructor-dashboard' ? await instructorDashboard(user) : await mostSellingCourses(user, new URL(request.url).searchParams));
}

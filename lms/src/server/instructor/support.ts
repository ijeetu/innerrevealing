import { RowDataPacket } from 'mysql2/promise';
import type { SessionUser } from '../auth';
import { ApiError } from '../errors';
import { readJson } from '../request';
import { database } from '../db';
import { idValue } from '../admin/core';

export async function operationBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') || '';
  if (type.startsWith('application/json')) return readJson(request);
  if (type.startsWith('multipart/form-data') || type.startsWith('application/x-www-form-urlencoded')) {
    const length = Number(request.headers.get('content-length'));
    if (!length || !Number.isFinite(length)) throw new ApiError(411, 'A known form size is required.');
    if (length > 6 * 1024 * 1024) throw new ApiError(413, 'Attachments must be 5 MB or smaller.');
    const data = await request.formData(), result: Record<string, unknown> = Object.create(null);
    for (const [name, value] of data.entries()) {
      if (name === 'course_ids[]' || /^course_ids\[\d*\]$/.test(name)) (result.course_ids ||= [] as unknown[]) as unknown[];
      if (name === 'course_ids[]' || /^course_ids\[\d*\]$/.test(name)) { (result.course_ids as unknown[]).push(value); continue; }
      const nested = /^payment_details\[(\w+)\]$/.exec(name);
      if (nested) { const details = (result.payment_details ||= {}) as Record<string, unknown>; details[nested[1]] = value; }
      else result[name] = value;
    }
    return result;
  }
  if (!request.body) return {};
  throw new ApiError(415, 'Use JSON or a form submission.');
}
export function valueMoney(value: unknown, label = 'Amount', allowZero = false): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < (allowZero ? 0 : 0.01) || amount > 99999999.99 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) throw new ApiError(422, `${label} must be a valid amount with at most two decimals.`);
  return Math.round(amount * 100) / 100;
}
export function staffCourseScope(user: SessionUser, alias = 'c') { return user.role === 'superadmin' ? { sql: '1=1', values: [] as number[] } : { sql: `${alias}.instructor_id=?`, values: [user.id] }; }
export async function ownedCourse(user: SessionUser, value: unknown) {
  const id = idValue(value), scope = staffCourseScope(user);
  const [rows] = await database().execute<RowDataPacket[]>(`SELECT c.* FROM ir_courses c WHERE c.id=? AND ${scope.sql}`, [id, ...scope.values]);
  if (!rows[0]) throw new ApiError(404, 'This course was not found in your teaching account.');
  return rows[0];
}
export const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export async function teachingCourse(user: SessionUser, value: unknown) {
  if (!['admin','superadmin'].includes(user.role)) throw new ApiError(403,'Teaching staff access is required.');
  const id=idValue(value);
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT c.* FROM ir_courses c WHERE c.id=? AND (?='superadmin' OR c.instructor_id=? OR EXISTS(SELECT 1 FROM ir_team_course_members m JOIN ir_team_invitations t ON t.id=m.invitation_id WHERE m.course_id=c.id AND t.invitee_user_id=? AND t.status='accepted' AND t.member_role='editor'))`,[id,user.role,user.id,user.id]);
  if(!rows[0])throw new ApiError(404,'This course is not available to your teaching account.');
  return rows[0];
}

import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { UserDetails } from '@/utils/api/user/getUserDetails';
import { database } from './db';
import { ApiError } from './errors';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from './passwords';
import { assertSameOrigin, clientAddress, normalizeEmail, readJson, validateName, validatePassword } from './request';
import { rateLimit } from './rate-limit';
import { failure, success } from './response';
import { removeUserData } from './user-lifecycle';

export const SESSION_COOKIE = 'ir_session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;

export type UserRole = 'student' | 'admin' | 'superadmin';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export type SessionUser = UserDetails & { role: UserRole; token: 'web-session' };

function dateString(value: string): string {
  return new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`).toISOString();
}

export function publicUser(row: UserRow): SessionUser {
  const isStaff = row.role === 'admin' || row.role === 'superadmin';
  const created = dateString(row.created_at), updated = dateString(row.updated_at);
  return {
    id: Number(row.id), name: row.name, slug: `learner-${row.id}`, email: row.email,
    mobile: null, country_calling_code: null, country_code: null, country_name: '', type: 'email',
    email_verified_at: null, profile: '', is_active: Number(row.is_active), wallet_balance: null,
    total_balance: null, created_at: dateString(row.created_at), updated_at: dateString(row.updated_at),
    deleted_at: null, is_instructor: isStaff, instructor_process_status: isStaff ? 'approved' : 'pending',
    instructor_details: isStaff ? {
      id: Number(row.id), user_id: Number(row.id), type: 'individual', status: 'approved', reason: null,
      created_at: created, updated_at: updated, deleted_at: null, individual_commision_rate: '0', team_commision_rate: '0',
      personal_details: { id: Number(row.id), instructor_id: Number(row.id), qualification: '', years_of_experience: 0, skills: '',
        bank_account_number: null, bank_name: null, bank_account_holder_name: null, bank_ifsc_code: null,
        team_name: null, team_logo: null, team_logo_extension: null, about_me: null, id_proof: '', id_proof_extension: null,
        preview_video: '', preview_video_extension: null, created_at: created, updated_at: updated, deleted_at: null },
      social_medias: [], other_details: [],
    } : null,
    roles: [], role: row.role, token: 'web-session',
  };
}

function rawSession(request: Request): string | null {
  const item = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${SESSION_COOKIE}=`));
  const value = item?.slice(SESSION_COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

function sessionHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function sessionRow(request: Request): Promise<UserRow | null> {
  const token = rawSession(request);
  if (!token) return null;
  const [rows] = await database().execute<UserRow[]>(
    `SELECT u.* FROM ir_sessions s JOIN ir_users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.is_active = 1 LIMIT 1`,
    [sessionHash(token)],
  );
  return rows[0] || null;
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const row = await sessionRow(request);
  return row ? publicUser(row) : null;
}

async function requireSession(request: Request): Promise<UserRow> {
  const user = await sessionRow(request);
  if (!user) throw new ApiError(401, 'Please sign in to continue.');
  return user;
}

async function insertSession(connection: Pool | PoolConnection, userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await connection.execute('INSERT INTO ir_sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))', [sessionHash(token), userId, SESSION_SECONDS]);
  return token;
}

function withSession(response: NextResponse, token: string | null): NextResponse {
  response.cookies.set(SESSION_COOKIE, token || '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    maxAge: token ? SESSION_SECONDS : 0,
  });
  return response;
}

async function cleanupExpired(): Promise<void> {
  await database().execute('DELETE FROM ir_sessions WHERE expires_at < UTC_TIMESTAMP() LIMIT 500');
  await database().execute('DELETE FROM ir_rate_limits WHERE expires_at < UTC_TIMESTAMP() LIMIT 500');
}

async function register(request: Request, body: Record<string, unknown>): Promise<NextResponse> {
  const name = validateName(body.name);
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);
  if (body.confirm_password !== undefined && body.confirm_password !== password) throw new ApiError(422, 'Passwords do not match.');
  await rateLimit('register-ip', clientAddress(request), 5, 3600);
  const passwordHash = await hashPassword(password);
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [insert] = await connection.execute<ResultSetHeader>('INSERT INTO ir_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, 'student']);
    const token = await insertSession(connection, insert.insertId);
    const [rows] = await connection.execute<UserRow[]>('SELECT * FROM ir_users WHERE id = ?', [insert.insertId]);
    await connection.commit();
    await cleanupExpired().catch(() => console.warn('Expired session cleanup deferred.'));
    return withSession(success({ user: publicUser(rows[0]), token: 'web-session' }, 'Your account has been created.', 201), token);
  } catch (error) {
    await connection.rollback();
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new ApiError(409, 'An account with this email already exists. Please sign in.');
    throw error;
  } finally {
    connection.release();
  }
}

async function login(request: Request, body: Record<string, unknown>): Promise<NextResponse> {
  const email = normalizeEmail(body.email);
  if (typeof body.password !== 'string' || body.password.length > 128 || !body.password) throw new ApiError(401, 'Email or password is incorrect.');
  await rateLimit('login-email', email, 10, 900);
  const [rows] = await database().execute<UserRow[]>('SELECT * FROM ir_users WHERE email = ? LIMIT 1', [email]);
  const row = rows[0];
  const valid = await verifyPassword(body.password, row?.password_hash || DUMMY_PASSWORD_HASH);
  if (!row || !valid || !row.is_active) throw new ApiError(401, 'Email or password is incorrect.');
  const token = await insertSession(database(), Number(row.id));
  const previous = rawSession(request);
  if (previous) await database().execute('DELETE FROM ir_sessions WHERE token_hash = ?', [sessionHash(previous)]);
  await cleanupExpired().catch(() => console.warn('Expired session cleanup deferred.'));
  return withSession(success({ user: publicUser(row), token: 'web-session' }, 'You are signed in.'), token);
}

async function logout(request: Request): Promise<NextResponse> {
  const token = rawSession(request);
  if (token) await database().execute('DELETE FROM ir_sessions WHERE token_hash = ?', [sessionHash(token)]);
  return withSession(success(null, 'You are signed out.'), null);
}

async function updatePassword(request: Request, body: Record<string, unknown>): Promise<NextResponse> {
  const current = await requireSession(request);
  const password = validatePassword(body.password);
  if (body.confirm_password !== password) throw new ApiError(422, 'Passwords do not match.');
  if (typeof body.current_password !== 'string' || body.current_password.length > 128) throw new ApiError(422, 'Enter your current password.');
  await rateLimit('password-user', String(current.id), 10, 900);
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<UserRow[]>('SELECT * FROM ir_users WHERE id = ? FOR UPDATE', [current.id]);
    if (!rows[0] || !(await verifyPassword(body.current_password, rows[0].password_hash))) throw new ApiError(401, 'Current password is incorrect.');
    await connection.execute('UPDATE ir_users SET password_hash = ? WHERE id = ?', [await hashPassword(password), current.id]);
    await connection.execute('DELETE FROM ir_sessions WHERE user_id = ?', [current.id]);
    await connection.commit();
    return withSession(success(null, 'Password updated. Please sign in again.'), null);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

async function deleteAccount(request: Request, body: Record<string, unknown>): Promise<NextResponse> {
  const current = await requireSession(request);
  if (typeof body.password !== 'string' || body.password.length > 128) throw new ApiError(422, 'Enter your password to delete your account.');
  await rateLimit('delete-user', String(current.id), 5, 900);
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<UserRow[]>('SELECT * FROM ir_users WHERE id = ? FOR UPDATE', [current.id]);
    if (!rows[0] || !(await verifyPassword(body.password, rows[0].password_hash))) throw new ApiError(401, 'Password is incorrect.');
    if (rows[0].role !== 'student') throw new ApiError(403, 'Contact the site administrator to delete this account.');
    await removeUserData(connection, Number(current.id));
    await connection.commit();
    return withSession(success(null, 'Account deleted.'), null);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

async function updateProfile(request: Request, body: Record<string, unknown>): Promise<NextResponse> {
  const current = await requireSession(request);
  const name = validateName(body.name);
  if (body.email !== undefined && normalizeEmail(body.email) !== current.email) throw new ApiError(422, 'Email changes require verification and are not available yet.');
  await database().execute('UPDATE ir_users SET name = ? WHERE id = ?', [name, current.id]);
  const [rows] = await database().execute<UserRow[]>('SELECT * FROM ir_users WHERE id = ?', [current.id]);
  return success({ user: publicUser(rows[0]), token: 'web-session' }, 'Profile updated.');
}

export async function handleAuth(request: Request, action: string): Promise<NextResponse> {
  try {
    if (request.method === 'GET' && action === 'session') {
      const user = await getSessionUser(request);
      if (!user) throw new ApiError(401, 'Please sign in to continue.');
      return success({ user, token: 'web-session' });
    }
    assertSameOrigin(request);
    if (request.method === 'POST' && action === 'logout') return await logout(request);
    if (!['POST', 'DELETE'].includes(request.method)) throw new ApiError(405, 'This method is not supported.');
    await rateLimit('auth-ip', clientAddress(request), 60, 900);
    const body = await readJson(request);
    if (request.method === 'POST') {
      if (action === 'register') return await register(request, body);
      if (action === 'login') return await login(request, body);
      if (action === 'password') return await updatePassword(request, body);
      if (action === 'profile') return await updateProfile(request, body);
      if (action === 'reset-password') throw new ApiError(503, 'Password recovery is not available yet. Please contact innerrevealing@gmail.com.');
    }
    if (request.method === 'DELETE' && action === 'account') return await deleteAccount(request, body);
    throw new ApiError(404, 'This authentication endpoint does not exist.');
  } catch (error) { return failure(error); }
}

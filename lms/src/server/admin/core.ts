import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import sanitizeHtml from 'sanitize-html';
import { SessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';

export type SqlConnection = Pool | PoolConnection;
export type AdminActor = SessionUser;

function sqlValues(values: unknown[]): (string|number|boolean|Date|Buffer|null)[] {
  return values.map(value => {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date || Buffer.isBuffer(value)) return value;
    throw new Error('Unsupported internal SQL parameter.');
  });
}

export function idValue(value: unknown, label = 'id'): number {
  const result = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(result) || result < 1) throw new ApiError(422, `Invalid ${label}.`);
  return result;
}

export function textValue(value: unknown, label: string, maximum: number, required = true): string {
  if (typeof value !== 'string' || value.length > maximum || (required && !value.trim()) || /\u0000/.test(value)) throw new ApiError(422, `${label} must be ${required ? 'between 1 and' : 'at most'} ${maximum} characters.`);
  return value.trim();
}

export function optionalText(value: unknown, label: string, maximum: number): string {
  return value === undefined || value === null ? '' : textValue(value, label, maximum, false);
}

export function integerValue(value: unknown, label: string, fallback = 0, maximum = 1000000): number {
  if (value === undefined || value === null || value === '') return fallback;
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0 || result > maximum) throw new ApiError(422, `Invalid ${label}.`);
  return result;
}

export function booleanValue(value: unknown, fallback = false): boolean {
  if (value === undefined) return fallback;
  if ([true, 1, '1', 'true'].includes(value as string | number | boolean)) return true;
  if ([false, 0, '0', 'false'].includes(value as string | number | boolean)) return false;
  throw new ApiError(422, 'Use a true or false value.');
}

export function enumValue<T extends string>(value: unknown, options: readonly T[], label: string): T {
  if (typeof value !== 'string' || !options.includes(value as T)) throw new ApiError(422, `Invalid ${label}.`);
  return value as T;
}

export function slugValue(value: unknown): string {
  const slug = textValue(value, 'Slug', 150).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(422, 'Use lowercase letters, numbers and hyphens for the slug.');
  return slug;
}

export function safeHttps(value: unknown, label = 'URL', allowMedia = false): string {
  const text = optionalText(value, label, 2000);
  if (!text) return '';
  if (allowMedia && (/^\/api\/media\/[1-9]\d*$/.test(text) || text === '/inner-revealing-logo.png')) return text;
  try {
    const url = new URL(text);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('https required');
    return url.toString();
  } catch { throw new ApiError(422, `${label} must be a valid HTTPS URL.`); }
}

export function safeContent(value: unknown, label = 'Content', maximum = 500000): string {
  const text = optionalText(value, label, maximum);
  return sanitizeHtml(text, {
    allowedTags: ['p','br','strong','b','em','i','u','s','h2','h3','h4','ul','ol','li','blockquote','a','code','pre','hr'],
    allowedAttributes: { a: ['href','title'] },
    allowedSchemes: ['https','mailto'], allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
  });
}

export async function audit(connection: SqlConnection, actor: AdminActor | number | null, action: string, entityType: string, entityId: string | number | null, details: Record<string, unknown> = {}): Promise<void> {
  await connection.execute('INSERT INTO ir_audit_log (actor_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)', [typeof actor === 'object' ? actor?.id || null : actor, action, entityType, entityId === null ? null : String(entityId), JSON.stringify(details)]);
}

export async function transaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await database().getConnection();
  try { await connection.beginTransaction(); const result = await work(connection); await connection.commit(); return result; }
  catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function getRow(table: string, id: number, connection: SqlConnection = database(), lock = false): Promise<RowDataPacket> {
  const [rows] = await connection.execute<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?${lock ? ' FOR UPDATE' : ''}`, [id]);
  if (!rows[0]) throw new ApiError(404, 'The requested record was not found.');
  return rows[0];
}

export async function updateRow(table: string, id: number, values: Record<string, unknown>, connection: SqlConnection = database()): Promise<void> {
  const fields = Object.keys(values);
  if (!fields.length) throw new ApiError(422, 'No supported fields were provided.');
  await connection.execute(`UPDATE ${table} SET ${fields.map(field => `${field} = ?`).join(',')} WHERE id = ?`, sqlValues([...Object.values(values), id]));
}

export async function insertRow(table: string, values: Record<string, unknown>, connection: SqlConnection = database()): Promise<number> {
  const fields = Object.keys(values);
  const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, sqlValues(Object.values(values)));
  return result.insertId;
}

export async function adminList(from: string, select: string, params: URLSearchParams, where = '', values: (string | number)[] = [], order = 'id DESC') {
  const page = Math.max(1, Math.min(100000, Number(params.get('page')) || 1));
  const perPage = Math.max(1, Math.min(100, Number(params.get('per_page')) || 30));
  if (!Number.isInteger(page) || !Number.isInteger(perPage)) throw new ApiError(422, 'Invalid pagination.');
  const [counts] = await database().execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM ${from} ${where}`, values);
  const [items] = await database().execute<RowDataPacket[]>(`SELECT ${select} FROM ${from} ${where} ORDER BY ${order} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, values);
  const total = Number(counts[0].total);
  return { items, total, page, per_page: perPage, total_pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function searchClause(params: URLSearchParams, columns: string[]): { where: string; values: string[] } {
  const search = (params.get('search') || '').trim();
  if (!search) return { where: '', values: [] };
  if (search.length > 200) throw new ApiError(422, 'Search is too long.');
  const pattern = `%${search.replace(/[=%_]/g, '=$&')}%`;
  return { where: `WHERE (${columns.map(column => `${column} LIKE ? ESCAPE '='`).join(' OR ')})`, values: columns.map(() => pattern) };
}

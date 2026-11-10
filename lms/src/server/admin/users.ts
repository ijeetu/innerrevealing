import { randomBytes } from 'node:crypto';
import { RowDataPacket } from 'mysql2/promise';
import { UserRole } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { hashPassword } from '../passwords';
import { normalizeEmail, validateName, validatePassword } from '../request';
import { createPasswordResetLink } from '../reset';
import { sendMail } from '../mail';
import { removeUserData } from '../user-lifecycle';
import { AdminActor, adminList, audit, booleanValue, enumValue, getRow, idValue, insertRow, searchClause, transaction, updateRow } from './core';
import { assertUserManagement } from './roles';

const SAFE_USER = 'id,name,email,role,is_active,created_at,updated_at';
const ROLES = ['student','admin','superadmin'] as const;

function safeUser(row: RowDataPacket) {
  return { id: Number(row.id), name: row.name, email: row.email, role: row.role, is_active: Boolean(row.is_active), created_at: row.created_at, updated_at: row.updated_at };
}

async function createUser(body: Record<string, unknown>, actor: AdminActor) {
  const name = validateName(body.name);
  const email = normalizeEmail(body.email);
  const role = enumValue(body.role || 'student', ROLES, 'role');
  assertUserManagement(actor.role, 'student', role, false, booleanValue(body.is_active, true), 0);
  const suppliedPassword = body.password !== undefined && body.password !== '';
  const password = suppliedPassword ? validatePassword(body.password) : randomBytes(48).toString('base64url');
  const id = await transaction(async connection => {
    const userId = await insertRow('ir_users', { name,email,password_hash: await hashPassword(password),role,is_active: booleanValue(body.is_active, true) }, connection);
    await audit(connection, actor, 'user.create', 'user', userId, { role, is_active: booleanValue(body.is_active, true), reset_link: !suppliedPassword });
    return userId;
  });
  return { user: safeUser(await getRow('ir_users', id)), reset_link: suppliedPassword ? null : await createPasswordResetLink(id, actor.id) };
}

async function manageUser(id: number, body: Record<string, unknown>, actor: AdminActor, deleting = false) {
  return transaction(async connection => {
    // Serialize changes to the active super-administrator set before checking it.
    const [superadmins] = await connection.execute<RowDataPacket[]>("SELECT id,is_active FROM ir_users WHERE role = 'superadmin' ORDER BY id FOR UPDATE");
    const target = await getRow('ir_users', id, connection, true);
    const actorNow = await getRow('ir_users', actor.id, connection);
    if (!actorNow.is_active || !['admin','superadmin'].includes(actorNow.role)) throw new ApiError(403, 'Administrator access has changed. Please sign in again.');
    const nextRole: UserRole = deleting ? 'student' : body.role === undefined ? target.role : enumValue(body.role, ROLES, 'role');
    const nextActive = deleting ? false : body.is_active === undefined ? Boolean(target.is_active) : booleanValue(body.is_active);
    assertUserManagement(actorNow.role, target.role, nextRole, Boolean(target.is_active), nextActive, superadmins.filter(row => row.is_active).length);
    if (id === actor.id && (deleting || !nextActive)) throw new ApiError(409, 'Use another administrator account before deactivating or deleting your own access.');
    if (deleting) {
      const result = await removeUserData(connection, id);
      await audit(connection, actor, 'user.delete', 'user', id, { anonymized: result.anonymized });
      return result;
    }
    if (body.password !== undefined || body.password_hash !== undefined) throw new ApiError(422, 'Use a password reset link to change another user’s password.');
    const values: Record<string, unknown> = {};
    if (body.name !== undefined) values.name = validateName(body.name);
    if (body.email !== undefined) values.email = normalizeEmail(body.email);
    if (body.role !== undefined) values.role = nextRole;
    if (body.is_active !== undefined) values.is_active = nextActive;
    await updateRow('ir_users', id, values, connection);
    if (nextRole !== target.role || nextActive !== Boolean(target.is_active) || (values.email !== undefined && values.email !== target.email)) {
      await connection.execute('DELETE FROM ir_sessions WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM ir_reset_tokens WHERE user_id = ?', [id]);
    }
    await audit(connection, actor, 'user.update', 'user', id, { fields: Object.keys(values), role: nextRole, is_active: nextActive });
    return safeUser(await getRow('ir_users', id, connection));
  });
}

export async function userAdmin(method: string, parts: string[], body: Record<string, unknown>, actor: AdminActor, params: URLSearchParams): Promise<unknown> {
  const id = parts[1] ? idValue(parts[1]) : null;
  if (!id && method === 'GET') {
    const search = searchClause(params, ['name','email']);
    let where = search.where;
    const values: (string|number)[] = [...search.values];
    if (params.get('role')) { where += `${where ? ' AND' : 'WHERE'} role = ?`; values.push(enumValue(params.get('role'), ROLES, 'role')); }
    if (params.has('is_active')) { where += `${where ? ' AND' : 'WHERE'} is_active = ?`; values.push(booleanValue(params.get('is_active')) ? 1 : 0); }
    const result = await adminList('ir_users', SAFE_USER, params, where, values, 'created_at DESC,id DESC');
    return { ...result, items: result.items.map(safeUser) };
  }
  if (!id && method === 'POST') return createUser(body, actor);
  if (id && parts[2] === 'reset-link' && method === 'POST') {
    const target = await getRow('ir_users', id);
    assertUserManagement(actor.role, target.role, target.role, Boolean(target.is_active), Boolean(target.is_active), 2);
    if (!target.is_active) throw new ApiError(422, 'Activate the account before generating a password reset link.');
    const link = await createPasswordResetLink(id, actor.id);
    const emailSent = body.send_email === true ? await sendMail({ to:target.email,subject:'Reset your Inner Revealing password',text:`Hello ${target.name},\n\nAn administrator has prepared a password reset link for your Inner Revealing account:\n\n${link.url}\n\nThis link expires at ${link.expiresAt}. If you did not request this, contact Inner Revealing.` }) : false;
    return { ...link,email_sent:emailSent };
  }
  if (id && parts.length === 2 && method === 'GET') return safeUser(await getRow('ir_users', id));
  if (id && parts.length === 2 && ['PATCH','PUT'].includes(method)) return manageUser(id, body, actor);
  if (id && parts.length === 2 && method === 'DELETE') return manageUser(id, body, actor, true);
  throw new ApiError(404, 'This user administration endpoint does not exist.');
}

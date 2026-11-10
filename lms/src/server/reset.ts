import { createHash, randomBytes } from 'node:crypto';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { database } from './db';
import { ApiError } from './errors';
import { hashPassword } from './passwords';
import { normalizeEmail, validatePassword, clientAddress } from './request';
import { rateLimit } from './rate-limit';
import { integrationSecrets } from './integrations';
import { sendMail } from './mail';

async function issueReset(connection: PoolConnection, userId: number) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await connection.execute('DELETE FROM ir_reset_tokens WHERE user_id=?', [userId]);
  await connection.execute('INSERT INTO ir_reset_tokens(token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE))', [createHash('sha256').update(token).digest('hex'), userId]);
  return { url: `${process.env.SITE_URL || 'https://ir.vishwalabs.com'}/reset-password?token=${token}`, expiresAt };
}
export async function createPasswordResetLink(userId: number, actorId: number) {
  if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isSafeInteger(actorId) || actorId < 1) throw new ApiError(422, 'Invalid account.');
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    // The same user-row locks protect role/email changes and reset issuance.
    // Lock both participants in a stable order before checking authority.
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT id,role,is_active FROM ir_users WHERE id IN (?,?) ORDER BY id FOR UPDATE', [actorId,userId]);
    const actor = rows.find(row => Number(row.id) === actorId);
    const user = rows.find(row => Number(row.id) === userId);
    if (!user?.is_active) throw new ApiError(404, 'Account not found.');
    if (!actor?.is_active || !['admin','superadmin'].includes(actor.role) || actor.role === 'admin' && user.role === 'superadmin') throw new ApiError(403, 'You cannot reset this account.');
    const result = await issueReset(connection,userId);
    await connection.execute('INSERT INTO ir_audit_log(actor_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)', [actorId, 'user.reset_link', 'user', String(userId), JSON.stringify({ expiresAt: result.expiresAt })]);
    await connection.commit();
    return result;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
export async function requestPasswordReset(request: Request, body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  await rateLimit('reset-ip', clientAddress(request), 10, 3600);
  await rateLimit('reset-email', email, 3, 3600);
  if (!(await integrationSecrets()).smtp_enabled) throw new ApiError(503, 'For account recovery, contact innerrevealing@gmail.com. The centre can issue a secure reset link.');
  const connection = await database().getConnection();
  let delivery: { email: string; url: string } | null = null;
  try {
    await connection.beginTransaction();
    const [users] = await connection.execute<RowDataPacket[]>('SELECT id,email,is_active FROM ir_users WHERE email=? FOR UPDATE',[email]);
    const user = users[0];
    if (user?.is_active && String(user.email).toLowerCase() === email) {
      const reset = await issueReset(connection,Number(user.id));
      delivery = { email: user.email, url: reset.url };
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  // SMTP runs after the user lock is released. A subsequent email/role change
  // deletes the issued token, so delivery to an old address cannot grant access.
  if (delivery) {
    const sent = await sendMail({ to: delivery.email, subject: 'Reset your Inner Revealing password', text: `You requested a password reset for Inner Revealing.\n\nOpen this link within 30 minutes:\n${delivery.url}\n\nIf you did not request this, you can ignore this email.` });
    if (!sent) throw new ApiError(503,'Password recovery email is unavailable. Please contact innerrevealing@gmail.com.');
  }
  return { message: 'If an active account exists for that email, a password reset link has been sent.' };
}
export async function completePasswordReset(body: Record<string, unknown>) {
  if (typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token)) throw new ApiError(422, 'This reset link is invalid or has expired.');
  const password = validatePassword(body.password);
  if (body.confirm_password !== password) throw new ApiError(422, 'Passwords do not match.');
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT t.user_id FROM ir_reset_tokens t JOIN ir_users u ON u.id=t.user_id AND u.is_active=1 WHERE t.token_hash=? AND t.expires_at>UTC_TIMESTAMP() FOR UPDATE', [createHash('sha256').update(body.token).digest('hex')]);
    if (!rows[0]) throw new ApiError(422, 'This reset link is invalid or has expired.');
    await connection.execute('UPDATE ir_users SET password_hash=? WHERE id=?', [await hashPassword(password), rows[0].user_id]);
    await connection.execute('DELETE FROM ir_sessions WHERE user_id=?', [rows[0].user_id]);
    await connection.execute('DELETE FROM ir_reset_tokens WHERE user_id=?', [rows[0].user_id]);
    await connection.execute('INSERT INTO ir_audit_log(actor_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)', [rows[0].user_id, 'auth.password_reset', 'user', String(rows[0].user_id), '{}']);
    await connection.commit();
    return { message: 'Password updated. Sign in with your new password.' };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

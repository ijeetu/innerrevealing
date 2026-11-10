import { randomBytes } from 'node:crypto';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { hashPassword } from './passwords';

export async function removeUserData(connection: PoolConnection, userId: number): Promise<{ deleted: true; anonymized: boolean }> {
  const [references] = await connection.execute<RowDataPacket[]>('SELECT (SELECT COUNT(*) FROM ir_orders WHERE user_id = ?) + (SELECT COUNT(*) FROM ir_courses WHERE instructor_id = ?) AS total', [userId,userId]);
  if (!Number(references[0].total)) {
    await connection.execute('DELETE FROM ir_users WHERE id = ?', [userId]);
    return { deleted: true, anonymized: false };
  }
  const suffix = randomBytes(12).toString('hex');
  await connection.execute('UPDATE ir_users SET name = ?, email = ?, password_hash = ?, is_active = 0, role = ? WHERE id = ?', ['Deleted account', `deleted-${userId}-${suffix}@example.invalid`, await hashPassword(randomBytes(48).toString('base64url')), 'student', userId]);
  for (const table of ['ir_sessions','ir_reset_tokens','ir_cart','ir_wishlist','ir_progress','ir_notifications']) await connection.execute(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
  await connection.execute("UPDATE ir_enrollments SET status = 'revoked' WHERE user_id = ?", [userId]);
  return { deleted: true, anonymized: true };
}

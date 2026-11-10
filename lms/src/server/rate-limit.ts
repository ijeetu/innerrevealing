import { createHash } from 'node:crypto';
import { RowDataPacket } from 'mysql2/promise';
import { database } from './db';
import { ApiError } from './errors';

// Persistent fixed-window limits work across processes and server restarts.
export async function rateLimit(scope: string, identifier: string, maximum: number, seconds: number): Promise<void> {
  const key = createHash('sha256').update(`${scope}:${identifier}`).digest('hex');
  await database().execute(
    `INSERT INTO ir_rate_limits (key_hash, attempts, expires_at) VALUES (?, 1, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))
     ON DUPLICATE KEY UPDATE attempts = IF(expires_at <= UTC_TIMESTAMP(), 1, attempts + 1),
       expires_at = IF(expires_at <= UTC_TIMESTAMP(), DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND), expires_at)`,
    [key, seconds, seconds],
  );
  const [rows] = await database().execute<RowDataPacket[]>('SELECT attempts FROM ir_rate_limits WHERE key_hash = ?', [key]);
  if (Number(rows[0]?.attempts) > maximum) throw new ApiError(429, 'Too many attempts. Please try again later.');
}

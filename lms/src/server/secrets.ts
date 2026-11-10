import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { ApiError } from './errors';

function key(): Buffer {
  const value = process.env.APP_ENCRYPTION_KEY || '';
  const bytes = /^[a-f0-9]{64}$/i.test(value) ? Buffer.from(value, 'hex') : Buffer.from(value, 'base64');
  if (bytes.length !== 32) throw new ApiError(503, 'Secure integration storage is not configured.');
  return bytes;
}
export function encryptSecret(value: string): string {
  if (!value) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.');
}
export function decryptSecret(value: string): string {
  if (!value) return '';
  const [version, iv, tag, ciphertext] = value.split('.');
  if (version !== 'v1' || !iv || !tag || !ciphertext) throw new ApiError(503, 'An integration credential must be saved again.');
  try {
    const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
  } catch { throw new ApiError(503, 'An integration credential could not be loaded.'); }
}

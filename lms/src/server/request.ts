import { ApiError } from './errors';

export function assertSameOrigin(request: Request): void {
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new ApiError(403, 'This request must come from this website.');
  const expected = new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_WEB_URL || request.url).origin;
  const origin = request.headers.get('origin');
  let supplied: string | null = origin;
  if (!supplied) {
    try { supplied = new URL(request.headers.get('referer') || '').origin; } catch { supplied = null; }
  }
  if (supplied !== expected) throw new ApiError(403, 'This request must come from this website.');
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ApiError(415, 'Send an application/json request.');
  if (Number(request.headers.get('content-length') || 0) > 16384) throw new ApiError(413, 'Request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'Send a valid JSON object.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16384) {
        await reader.cancel();
        throw new ApiError(413, 'Request is too large.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object required');
    return value as Record<string, unknown>;
  } catch {
    throw new ApiError(400, 'Send a valid JSON object.');
  }
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') throw new ApiError(422, 'Enter a valid email address.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(422, 'Enter a valid email address.');
  return email;
}

export function validateName(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 100 || /[\u0000-\u001f\u007f]/.test(value)) throw new ApiError(422, 'Enter a name between 1 and 100 characters.');
  return value.trim();
}

export function validatePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) throw new ApiError(422, 'Use a password between 10 and 128 characters.');
  return value;
}

export function clientAddress(request: Request): string {
  // Nginx overwrites X-Real-IP and the Next process binds only to loopback.
  return (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || 'unknown').slice(0, 100);
}

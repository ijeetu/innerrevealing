import { database } from '@/server/db';
import { ApiError } from '@/server/errors';
import { assertSameOrigin, readJson, normalizeEmail, validateName, clientAddress } from '@/server/request';
import { rateLimit } from '@/server/rate-limit';
import { success, failure } from '@/server/response';
import { ResultSetHeader } from 'mysql2/promise';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request); await rateLimit('contact-ip', clientAddress(request), 5, 3600);
    const body = await readJson(request);
    const name = validateName(body.name), email = normalizeEmail(body.email);
    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2000) throw new ApiError(422, 'Enter a message of up to 2000 characters.');
    const subject = typeof body.subject === 'string' ? body.subject.trim() : 'Website enquiry';
    if (subject.length > 200 || /[\r\n\u0000]/.test(subject)) throw new ApiError(422, 'Enter a valid subject.');
    const [result] = await database().execute<ResultSetHeader>('INSERT INTO ir_contacts(name,email,subject,message) VALUES (?,?,?,?)', [name, email, subject, body.message.trim()]);
    return success({ contact_id: result.insertId }, 'Your enquiry has been received by Inner Revealing.', 201);
  } catch (error) { return failure(error); }
}

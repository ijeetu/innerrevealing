import { assertSameOrigin, readJson, clientAddress } from '@/server/request';
import { completePasswordReset } from '@/server/reset';
import { rateLimit } from '@/server/rate-limit';
import { failure, success } from '@/server/response';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request); await rateLimit('reset-complete-ip', clientAddress(request), 20, 900);
    const result = await completePasswordReset(await readJson(request));
    const response = success(null, result.message);
    response.cookies.set('ir_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch (error) { return failure(error); }
}

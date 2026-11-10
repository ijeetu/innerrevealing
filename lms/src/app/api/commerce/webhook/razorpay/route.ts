import { receiveRazorpayWebhook } from '@/server/commerce';
import { ApiError } from '@/server/errors';
import { success, failure } from '@/server/response';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 65536) throw new ApiError(413, 'Webhook is too large.');
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 65536) throw new ApiError(413, 'Webhook is too large.');
    return success(await receiveRazorpayWebhook(raw, request.headers.get('x-razorpay-signature')));
  } catch (error) { return failure(error); }
}

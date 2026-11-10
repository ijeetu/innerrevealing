import { getSessionUser } from '@/server/auth';
import { ApiError } from '@/server/errors';
import { assertSameOrigin, readJson, clientAddress } from '@/server/request';
import { rateLimit } from '@/server/rate-limit';
import { success, failure } from '@/server/response';
import { publicPaymentConfig } from '@/server/integrations';
import { cart, addCart, removeCart, createOrder, orderDetail, listOrders, submitManualPayment, verifyOnlinePayment } from '@/server/commerce';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  try {
    const path = (await context.params).path;
    if (request.method === 'GET' && path.join('/') === 'config') return success(await publicPaymentConfig());
    const user = await getSessionUser(request);
    if (!user) throw new ApiError(401, 'Sign in to continue.');
    if (request.method === 'GET') {
      if (path.join('/') === 'cart') return success(await cart(user.id));
      if (path.join('/') === 'orders') return success({ orders: await listOrders(user.id) });
      if (path.length === 2 && path[0] === 'orders') return success({ order: await orderDetail(Number(path[1]), user.id), config: await publicPaymentConfig() });
    }
    assertSameOrigin(request);
    await rateLimit('commerce-user', String(user.id), 100, 900);
    const body = await readJson(request);
    if (path.join('/') === 'cart' && request.method === 'POST') return success(await addCart(user.id, body.course_id));
    if (path.join('/') === 'cart' && request.method === 'DELETE') return success(await removeCart(user.id, body.course_id));
    if (path.join('/') === 'orders' && request.method === 'POST') return success(await createOrder(user.id, body));
    if (request.method === 'POST' && path.length === 3 && path[0] === 'orders') {
      if (path[2] === 'manual') return success({ order: await submitManualPayment(Number(path[1]), user.id, body) }, 'Reference submitted. Course access starts after the centre verifies payment.');
      if (path[2] === 'verify') return success({ order: await verifyOnlinePayment(Number(path[1]), user.id, body) }, 'Payment verified. Your courses are ready.');
    }
    throw new ApiError(404, 'This checkout endpoint does not exist.');
  } catch (error) { return failure(error); }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;

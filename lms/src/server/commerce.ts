import { randomBytes } from 'node:crypto';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { database } from './db';
import { ApiError } from './errors';
import { integrationSecrets, publicPaymentConfig } from './integrations';
import { notify } from './notifications';
import { validSignature } from './payment-signatures';
export { validSignature } from './payment-signatures';

interface OrderRow extends RowDataPacket { id: number; user_id: number; order_number: string; amount: string; currency: string; status: string; payment_method: string; razorpay_order_id: string | null; razorpay_payment_id: string | null; payment_reference: string | null; }
const positive = (value: unknown) => { const id = Number(value); if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(422, 'Invalid record.'); return id; };
function idsFrom(value: unknown): number[] {
  if (!Array.isArray(value) || !value.length || value.length > 20) throw new ApiError(422, 'Choose between 1 and 20 courses.');
  return [...new Set(value.map(positive))].sort((a, b) => a - b);
}
async function staff(actorId: number) {
  const [rows] = await database().execute<RowDataPacket[]>('SELECT role FROM ir_users WHERE id=? AND is_active=1', [actorId]);
  if (!rows[0] || !['admin', 'superadmin'].includes(rows[0].role)) throw new ApiError(403, 'Administrator access is required.');
}
async function audit(connection: PoolConnection, actorId: number | null, action: string, orderId: number, details: object = {}) {
  await connection.execute('INSERT INTO ir_audit_log(actor_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)', [actorId, action, 'order', String(orderId), JSON.stringify(details)]);
}
export async function cart(userId: number) {
  const [rows] = await database().execute<RowDataPacket[]>(`SELECT c.id,c.slug,c.title,c.image,c.price FROM ir_cart cart JOIN ir_courses c ON c.id=cart.course_id JOIN ir_users author ON author.id=c.instructor_id AND author.is_active=1
    WHERE cart.user_id=? AND c.status='published' AND NOT EXISTS(SELECT 1 FROM ir_enrollments e WHERE e.user_id=? AND e.course_id=c.id ) ORDER BY cart.created_at DESC`, [userId, userId]);
  const items = rows.map(row => ({ ...row, id: Number(row.id), price: Number(row.price) }));
  return { items, total: Math.round(items.reduce((sum, item) => sum + item.price, 0) * 100) / 100, currency: 'INR' };
}
export async function addCart(userId: number, courseId: unknown) {
  const id = positive(courseId);
  const [rows] = await database().execute<RowDataPacket[]>("SELECT c.id FROM ir_courses c JOIN ir_users u ON u.id=c.instructor_id AND u.is_active=1 WHERE c.id=? AND c.status='published'", [id]);
  if (!rows[0]) throw new ApiError(404, 'This course is not available.');
  const [enrolled] = await database().execute<RowDataPacket[]>('SELECT id,status FROM ir_enrollments WHERE user_id=? AND course_id=?', [userId, id]);
  if (enrolled[0]?.status === 'revoked') throw new ApiError(403, 'Access to this course was revoked. Contact the centre to restore it.');
  if (enrolled[0]) throw new ApiError(409, 'You already have access to this course.');
  const current = await cart(userId);
  if (current.items.length >= 20 && !current.items.some(item => item.id === id)) throw new ApiError(422, 'Your cart can hold up to 20 courses.');
  await database().execute('INSERT IGNORE INTO ir_cart(user_id,course_id) VALUES (?,?)', [userId, id]);
  return cart(userId);
}
export async function removeCart(userId: number, courseId: unknown) {
  await database().execute('DELETE FROM ir_cart WHERE user_id=? AND course_id=?', [userId, positive(courseId)]);
  return cart(userId);
}
export async function orderDetail(orderId: number, userId?: number) {
  const [rows] = await database().execute<OrderRow[]>(`SELECT o.*,u.name AS user_name,u.email AS user_email FROM ir_orders o JOIN ir_users u ON u.id=o.user_id WHERE o.id=?${userId !== undefined ? ' AND o.user_id=?' : ''}`, userId !== undefined ? [positive(orderId), userId] : [positive(orderId)]);
  if (!rows[0]) throw new ApiError(404, 'Order not found.');
  const [items] = await database().execute<RowDataPacket[]>('SELECT oi.course_id,oi.title_snapshot AS title,oi.amount,c.slug,c.image FROM ir_order_items oi JOIN ir_courses c ON c.id=oi.course_id WHERE oi.order_id=? ORDER BY oi.course_id', [orderId]);
  return { ...rows[0], id: Number(rows[0].id), amount: Number(rows[0].amount), items: items.map(item => ({ ...item, course_id: Number(item.course_id), amount: Number(item.amount) })) };
}
export async function listOrders(userId: number) {
  const [rows] = await database().execute<RowDataPacket[]>('SELECT id FROM ir_orders WHERE user_id=? ORDER BY id DESC LIMIT 100', [userId]);
  return Promise.all(rows.map(row => orderDetail(Number(row.id), userId)));
}
async function grantPaid(connection: PoolConnection, order: OrderRow, source: string, actorId: number | null) {
  const [items] = await connection.execute<RowDataPacket[]>('SELECT course_id FROM ir_order_items WHERE order_id=?', [order.id]);
  if (!items.length) throw new ApiError(409, 'This order has no courses.');
  let accessNeedsReview = false;
  for (const item of items) {
    const [existing] = await connection.execute<RowDataPacket[]>('SELECT status FROM ir_enrollments WHERE user_id=? AND course_id=? FOR UPDATE', [order.user_id, item.course_id]);
    if (existing[0]?.status === 'revoked' && actorId === null) { accessNeedsReview = true; continue; }
    await connection.execute(`INSERT INTO ir_enrollments(user_id,course_id,status,source,order_id,granted_by) VALUES (?,?,'active',?,?,?) ON DUPLICATE KEY UPDATE status='active',source=VALUES(source),order_id=VALUES(order_id),granted_by=VALUES(granted_by)`, [order.user_id, item.course_id, source, order.id, actorId]);
    await connection.execute('DELETE FROM ir_cart WHERE user_id=? AND course_id=?', [order.user_id, item.course_id]);
  }
  await connection.execute("UPDATE ir_orders SET status='paid',reviewed_by=?,reviewed_at=UTC_TIMESTAMP() WHERE id=?", [actorId, order.id]);
  await audit(connection, actorId, 'order.paid', order.id, { source });
  await notify(connection, order.user_id, accessNeedsReview ? { title: 'Payment received; access needs review', message: 'Your payment is recorded. Contact the centre to review previously revoked course access.', url: '/contact-us' } : { title: 'Your practice is ready', message: 'Your enrolment is confirmed. Open My Learning to begin.', url: '/my-learnings' });
}
async function gateway(path: string, method = 'GET', body?: object) {
  const settings = await integrationSecrets();
  if (!settings.razorpay_enabled || !settings.razorpay_key_id || !settings.razorpay_key_secret) throw new ApiError(503, 'Choose manual payment or contact the centre to pay.');
  try {
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, { method, cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { Authorization: `Basic ${Buffer.from(`${settings.razorpay_key_id}:${settings.razorpay_key_secret}`).toString('base64')}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const value = await response.json();
    if (!response.ok) throw new Error('Gateway request rejected');
    return value as Record<string, unknown>;
  } catch { throw new ApiError(503, 'The payment provider could not complete the request. Please try again shortly.'); }
}
async function checkout(orderId: number, userId: number) {
  const settings = await integrationSecrets();
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<OrderRow[]>('SELECT * FROM ir_orders WHERE id=? AND user_id=? FOR UPDATE', [orderId, userId]);
    const order = rows[0];
    if (!order || order.payment_method !== 'razorpay' || order.status !== 'pending') { await connection.commit(); return undefined; }
    let providerId = order.razorpay_order_id;
    if (!providerId) {
      const result = await gateway('orders', 'POST', { amount: Math.round(Number(order.amount) * 100), currency: order.currency, receipt: order.order_number });
      if (typeof result.id !== 'string') throw new ApiError(503, 'The payment order could not be created.');
      providerId = result.id;
      await connection.execute('UPDATE ir_orders SET razorpay_order_id=? WHERE id=?', [providerId, order.id]);
    }
    await connection.commit();
    return { key_id: settings.razorpay_key_id, order_id: providerId, amount: Math.round(Number(order.amount) * 100), currency: order.currency };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
export async function createOrder(userId: number, body: Record<string, unknown>) {
  const config = await publicPaymentConfig();
  const ids = idsFrom(body.course_ids === undefined ? (await cart(userId)).items.map(item => item.id) : body.course_ids);
  const method = body.payment_method;
  if (!['free', 'manual', 'razorpay'].includes(String(method))) throw new ApiError(422, 'Choose a payment method.');
  const connection = await database().getConnection();
  let orderId = 0;
  try {
    await connection.beginTransaction();
    await connection.execute('SELECT id FROM ir_users WHERE id=? FOR UPDATE', [userId]);
    const placeholders = ids.map(() => '?').join(',');
    const [courses] = await connection.execute<RowDataPacket[]>(`SELECT c.id,c.title,c.price FROM ir_courses c JOIN ir_users u ON u.id=c.instructor_id AND u.is_active=1 WHERE c.id IN (${placeholders}) AND c.status='published' ORDER BY c.id FOR UPDATE`, ids);
    if (courses.length !== ids.length) throw new ApiError(404, 'One or more courses are no longer available.');
    const [owned] = await connection.execute<RowDataPacket[]>(`SELECT id,status FROM ir_enrollments WHERE user_id=? AND course_id IN (${placeholders}) FOR UPDATE`, [userId, ...ids]);
    if (owned.some(row => row.status === 'revoked')) throw new ApiError(403, 'Access to a course in this order was revoked. Contact the centre to restore it.');
    if (owned.length) throw new ApiError(409, 'You already have access to a course in this order. Remove it and try again.');
    const amount = Math.round(courses.reduce((sum, course) => sum + Number(course.price), 0) * 100) / 100;
    if (!Number.isFinite(amount) || amount < 0 || amount > 10000000) throw new ApiError(422, 'This order amount is not supported. Contact the centre.');
    const effectiveMethod = amount === 0 ? 'free' : String(method);
    if (amount > 0 && (effectiveMethod === 'free' || !config.methods.includes(effectiveMethod))) throw new ApiError(422, 'Choose an available payment method.');
    const [pending] = await connection.execute<RowDataPacket[]>(`SELECT o.id, GROUP_CONCAT(oi.course_id ORDER BY oi.course_id) AS course_ids FROM ir_orders o JOIN ir_order_items oi ON oi.order_id=o.id WHERE o.user_id=? AND o.payment_method=? AND o.amount=? AND o.status IN ('pending','awaiting_review') GROUP BY o.id ORDER BY o.id DESC LIMIT 20`, [userId, effectiveMethod, amount]);
    const previous = pending.find(order => order.course_ids === ids.join(','));
    if (previous) orderId = Number(previous.id);
    else {
      const number = `IR-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${randomBytes(5).toString('hex').toUpperCase()}`;
      const [result] = await connection.execute<ResultSetHeader>('INSERT INTO ir_orders(user_id,order_number,amount,currency,payment_method) VALUES (?,?,?,?,?)', [userId, number, amount, 'INR', effectiveMethod]);
      orderId = result.insertId;
      for (const course of courses) await connection.execute('INSERT INTO ir_order_items(order_id,course_id,title_snapshot,amount) VALUES (?,?,?,?)', [orderId, course.id, course.title, course.price]);
      if (amount === 0) await grantPaid(connection, { id: orderId, user_id: userId } as OrderRow, 'free', null);
      await audit(connection, userId, 'order.create', orderId, { payment_method: effectiveMethod, amount });
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  const providerCheckout = method === 'razorpay' ? await checkout(orderId, userId) : undefined;
  return { order: await orderDetail(orderId, userId), ...(providerCheckout ? { checkout: providerCheckout } : {}) };
}
export async function submitManualPayment(orderId: number, userId: number, body: Record<string, unknown>) {
  if (typeof body.reference !== 'string' || body.reference.trim().length < 3 || body.reference.trim().length > 200 || /[\r\n\u0000]/.test(body.reference)) throw new ApiError(422, 'Enter a valid payment reference.');
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  if (notes.length > 2000) throw new ApiError(422, 'Payment notes are too long.');
  const [result] = await database().execute<ResultSetHeader>("UPDATE ir_orders SET status='awaiting_review',payment_reference=?,notes=? WHERE id=? AND user_id=? AND payment_method='manual' AND status IN ('pending','awaiting_review','rejected')", [body.reference.trim(), notes, positive(orderId), userId]);
  if (!result.affectedRows) throw new ApiError(409, 'This order cannot accept a manual payment reference.');
  await notify(database(), userId, { title: 'Payment reference received', message: 'The centre will review your payment reference before activating course access.', url: `/payment-status?order_id=${orderId}` });
  return orderDetail(orderId, userId);
}
export async function approveOrder(orderId: number, actorId: number) {
  await staff(actorId);
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<OrderRow[]>('SELECT * FROM ir_orders WHERE id=? FOR UPDATE', [positive(orderId)]);
    const order = rows[0];
    if (!order) throw new ApiError(404, 'Order not found.');
    if (order.status === 'paid') { await connection.commit(); return orderDetail(orderId); }
    if (order.payment_method !== 'manual' || order.status !== 'awaiting_review' || !order.payment_reference) throw new ApiError(409, 'Only a submitted manual payment can be approved.');
    await grantPaid(connection, order, 'manual', actorId);
    await connection.commit();
    return orderDetail(orderId);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
export async function rejectOrder(orderId: number, actorId: number, reason = '') {
  await staff(actorId);
  if (reason.length > 2000) throw new ApiError(422, 'Rejection notes are too long.');
  const [result] = await database().execute<ResultSetHeader>("UPDATE ir_orders SET status='rejected',notes=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP() WHERE id=? AND payment_method='manual' AND status IN ('pending','awaiting_review')", [reason, actorId, positive(orderId)]);
  if (!result.affectedRows) throw new ApiError(409, 'This order cannot be rejected.');
  await database().execute('INSERT INTO ir_audit_log(actor_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)', [actorId, 'order.reject', 'order', String(orderId), '{}']);
  const order = await orderDetail(orderId);
  await notify(database(), Number(order.user_id), { title: 'Payment reference needs attention', message: reason || 'Please check your payment reference and contact the centre.', url: `/payment-status?order_id=${orderId}` });
  return order;
}

async function settleProviderPayment(orderId: number, payment: Record<string, unknown>) {
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<OrderRow[]>('SELECT * FROM ir_orders WHERE id=? FOR UPDATE', [orderId]);
    const order = rows[0];
    if (!order || order.payment_method !== 'razorpay' || payment.order_id !== order.razorpay_order_id || Number(payment.amount) !== Math.round(Number(order.amount) * 100) || payment.currency !== order.currency || payment.status !== 'captured' || typeof payment.id !== 'string') throw new ApiError(422, 'Payment has not been captured for this order.');
    if (order.status === 'paid') {
      if (order.razorpay_payment_id !== payment.id) throw new ApiError(409, 'This order has already been paid.');
    } else {
      if (order.status !== 'pending') throw new ApiError(409, 'This order cannot receive a payment.');
      await connection.execute('UPDATE ir_orders SET razorpay_payment_id=? WHERE id=?', [payment.id, orderId]);
      await grantPaid(connection, order, 'razorpay', null);
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  return orderDetail(orderId);
}
export async function verifyOnlinePayment(orderId: number, userId: number, body: Record<string, unknown>) {
  const order = await orderDetail(orderId, userId);
  const settings = await integrationSecrets();
  if (!settings.razorpay_enabled || body.razorpay_order_id !== order.razorpay_order_id || typeof body.razorpay_payment_id !== 'string' || !/^pay_[a-zA-Z0-9]+$/.test(body.razorpay_payment_id) || !validSignature(`${order.razorpay_order_id}|${body.razorpay_payment_id}`, body.razorpay_signature, settings.razorpay_key_secret)) throw new ApiError(422, 'The payment signature could not be verified.');
  let payment = await gateway(`payments/${encodeURIComponent(body.razorpay_payment_id)}`);
  if (payment.order_id !== order.razorpay_order_id || Number(payment.amount) !== Math.round(order.amount * 100) || payment.currency !== order.currency) throw new ApiError(422, 'Payment details do not match this order.');
  if (payment.status === 'authorized') payment = await gateway(`payments/${encodeURIComponent(body.razorpay_payment_id)}/capture`, 'POST', { amount: Math.round(order.amount * 100), currency: order.currency });
  return settleProviderPayment(orderId, payment);
}
export async function receiveRazorpayWebhook(raw: string, signature: string | null) {
  const settings = await integrationSecrets();
  if (!settings.razorpay_enabled || !validSignature(raw, signature, settings.razorpay_webhook_secret)) throw new ApiError(401, 'Invalid webhook signature.');
  let body: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
  try { body = JSON.parse(raw); } catch { throw new ApiError(400, 'Invalid webhook body.'); }
  if (!['payment.captured', 'order.paid'].includes(body.event || '')) return { received: true };
  const payment = body.payload?.payment?.entity;
  if (!payment || typeof payment.order_id !== 'string') throw new ApiError(422, 'Payment event is missing its order.');
  const [orders] = await database().execute<RowDataPacket[]>('SELECT id FROM ir_orders WHERE razorpay_order_id=?', [payment.order_id]);
  if (orders[0]) await settleProviderPayment(Number(orders[0].id), payment);
  return { received: true };
}

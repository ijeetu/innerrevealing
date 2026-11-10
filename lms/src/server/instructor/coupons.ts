import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { database } from '../db';
import { ApiError } from '../errors';
import { SessionUser } from '../auth';
import { audit, booleanValue, idValue, integerValue, optionalText, transaction } from '../admin/core';
import { paginate, pageOptions } from '../catalogue';
import { valueMoney, staffCourseScope } from './support';

export interface CouponQuote { coupon_id: number; code: string; subtotal: number; discount_amount: number; total: number; items: { id: number; amount: number; discount: number }[] }
export async function quoteCoupon(connection: PoolConnection, userId: number, code: string, items: { id: number; price: number }[], existingOrderId?: number): Promise<CouponQuote> {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,40}$/.test(normalized)) throw new ApiError(422, 'Enter a valid coupon code.');
  const [coupons] = await connection.execute<RowDataPacket[]>('SELECT *, UTC_TIMESTAMP() BETWEEN starts_at AND ends_at AS in_period FROM ir_coupons WHERE code=? FOR UPDATE', [normalized]);
  const coupon = coupons[0];
  if (!coupon || !coupon.is_active || coupon.deleted_at || !coupon.in_period) throw new ApiError(422, 'This coupon is not currently available.');
  const [scope] = await connection.execute<RowDataPacket[]>('SELECT course_id FROM ir_coupon_courses WHERE coupon_id=? FOR UPDATE', [coupon.id]);
  const allowed = new Set(scope.map(row => Number(row.course_id)));
  const prices = items.map(item => ({ id: item.id, cents: Math.round(Number(item.price) * 100) }));
  const subtotal = prices.reduce((sum,item) => sum + item.cents, 0), eligible = prices.filter(item => allowed.has(item.id));
  const eligibleTotal = eligible.reduce((sum,item) => sum + item.cents, 0);
  if (!eligibleTotal || subtotal < Math.round(Number(coupon.minimum_order_amount) * 100)) throw new ApiError(422, 'This order does not meet the coupon conditions.');
  const [used] = await connection.execute<RowDataPacket[]>("SELECT order_id,user_id FROM ir_coupon_redemptions WHERE coupon_id=? AND status IN ('reserved','redeemed') AND order_id<>? FOR UPDATE", [coupon.id,existingOrderId || 0]);
  const usage=[{total:used.length,personal:used.filter(row=>Number(row.user_id)===userId).length}];
  if ((coupon.total_usage_limit && Number(usage[0].total) >= Number(coupon.total_usage_limit)) || (coupon.per_user_limit && Number(usage[0].personal) >= Number(coupon.per_user_limit))) throw new ApiError(422, 'The usage limit for this coupon has been reached.');
  let discount = coupon.discount_type === 'percentage' ? Math.round(eligibleTotal * Number(coupon.discount) / 100) : Math.round(Number(coupon.discount) * 100);
  if (Number(coupon.maximum_discount) > 0) discount = Math.min(discount, Math.round(Number(coupon.maximum_discount) * 100));
  discount = Math.min(discount, eligibleTotal);
  if (discount < 1) throw new ApiError(422, 'This coupon does not reduce the current order.');
  const allocated = new Map(eligible.map(item => [item.id, Math.floor(discount * item.cents / eligibleTotal)]));
  let remainder = discount - [...allocated.values()].reduce((sum,value) => sum + value, 0);
  for (const item of eligible) if (remainder > 0 && allocated.get(item.id)! < item.cents) { allocated.set(item.id, allocated.get(item.id)! + 1); remainder--; }
  return { coupon_id:Number(coupon.id),code:coupon.code,subtotal:subtotal/100,discount_amount:discount/100,total:(subtotal-discount)/100,items:prices.map(item=>({id:item.id,discount:(allocated.get(item.id)||0)/100,amount:(item.cents-(allocated.get(item.id)||0))/100})) };
}
export async function reserveCoupon(connection: PoolConnection, orderId: number, userId: number, quote: CouponQuote) {
  await connection.execute("INSERT INTO ir_coupon_redemptions(order_id,coupon_id,user_id,discount_amount,status) VALUES(?,?,?,?,'reserved') ON DUPLICATE KEY UPDATE coupon_id=VALUES(coupon_id),discount_amount=VALUES(discount_amount),status=IF(status='redeemed','redeemed','reserved')",[orderId,quote.coupon_id,userId,quote.discount_amount]);
}
export async function redeemCoupon(connection: PoolConnection, orderId: number) { await connection.execute("UPDATE ir_coupon_redemptions SET status='redeemed' WHERE order_id=? AND status='reserved'",[orderId]); }
export async function releaseCoupon(connection: PoolConnection, orderId: number) { await connection.execute("UPDATE ir_coupon_redemptions SET status='released' WHERE order_id=? AND status='reserved'",[orderId]); }
function dateValue(value: unknown, end: boolean): string {
  const text = String(value || '');
  const utcText=/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(text)?text.replace(' ','T')+'Z':text;
  const local = /^\d{4}-\d\d-\d\d$/.test(text) ? `${text}T${end?'23:59:59':'00:00:00'}+05:30` : /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?$/.test(text) ? `${text}+05:30` : utcText;
  const date = new Date(local);
  if (!Number.isFinite(date.getTime())) throw new ApiError(422,'Enter valid start and end dates.');
  return date.toISOString().slice(0,19).replace('T',' ');
}
async function couponRows(actor: SessionUser, params: URLSearchParams) {
  const where = actor.role === 'superadmin' ? 'deleted_at IS NULL' : 'deleted_at IS NULL AND created_by=?';
  const values: (number|string)[] = actor.role === 'superadmin' ? [] : [actor.id];
  const id = params.get('id');
  const [rows] = await database().execute<RowDataPacket[]>(`SELECT * FROM ir_coupons WHERE ${where}${id?' AND id=?':''} ORDER BY id DESC`,id?[...values,idValue(id)]:values);
  return Promise.all(rows.map(async row=>{
    const [courses] = await database().execute<RowDataPacket[]>('SELECT c.id,c.title,c.slug,c.price FROM ir_coupon_courses s JOIN ir_courses c ON c.id=s.course_id WHERE s.coupon_id=?',[row.id]);
    const [usage] = await database().execute<RowDataPacket[]>("SELECT COUNT(*) total FROM ir_coupon_redemptions WHERE coupon_id=? AND status IN ('reserved','redeemed')",[row.id]);
    return {...row,id:Number(row.id),user_id:Number(row.created_by),promo_code:row.code,start_date:new Date(String(row.starts_at).replace(' ','T')+'Z').toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),end_date:new Date(String(row.ends_at).replace(' ','T')+'Z').toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),discount:Number(row.discount),minimum_order_amount:Number(row.minimum_order_amount),total_usage_per_user_limit:Number(row.per_user_limit),repeat_usage:Number(row.per_user_limit)!==1,no_of_repeat_usage:Number(row.per_user_limit),max_discount_amount:Number(row.maximum_discount||0),status:!!row.is_active,courses_count:courses.length,remaining_count:row.total_usage_limit?Math.max(0,Number(row.total_usage_limit)-Number(usage[0].total)):0,courses:courses.map(c=>({...c,display_price:Number(c.price),display_discount_price:Number(c.price),total_tax_percentage:0,tax_amount:0,taxes:[],pivot:{promo_code_id:row.id,course_id:c.id}}))};
  }));
}
export async function couponOperation(actor: SessionUser, method: string, path: string, params: URLSearchParams, body: Record<string,unknown>) {
  if (path==='get-courses-for-coupon') { const scope=staffCourseScope(actor); const [rows]=await database().execute<RowDataPacket[]>(`SELECT c.id,c.title AS name FROM ir_courses c WHERE ${scope.sql} AND c.status<>'archived' ORDER BY c.title`,scope.values);return rows; }
  if (method==='GET') { const rows=await couponRows(actor,params); if(params.get('id')) {if(!rows[0])throw new ApiError(404,'Coupon not found.');return rows[0];} const {page,perPage}=pageOptions(params);return paginate(rows.slice((page-1)*perPage,page*perPage),rows.length,page,perPage,'/api/promo-codes'); }
  return transaction(async connection=>{
    const id=body.id||params.get('id');
    const [previous]=id?await connection.execute<RowDataPacket[]>('SELECT * FROM ir_coupons WHERE id=? FOR UPDATE',[idValue(id)]):[[]];
    const existing=previous[0];
    if(id&&(!existing||(actor.role!=='superadmin'&&Number(existing.created_by)!==actor.id)))throw new ApiError(404,'Coupon not found.');
    if(method==='DELETE'){await connection.execute('UPDATE ir_coupons SET deleted_at=UTC_TIMESTAMP(),is_active=0 WHERE id=?',[existing.id]);await audit(connection,actor,'coupon.delete','coupon',existing.id);return {deleted:true};}
    const code=String(body.promo_code??body.code??existing?.code??'').trim().toUpperCase();
    if(!/^[A-Z0-9_-]{2,40}$/.test(code))throw new ApiError(422,'Coupon codes need 2–40 letters, numbers, hyphens or underscores.');
    const type=String(body.discount_type??existing?.discount_type??'percentage');if(!['percentage','amount'].includes(type))throw new ApiError(422,'Choose a discount type.');
    const discount=valueMoney(body.discount??existing?.discount,'Discount');if(type==='percentage'&&discount>100)throw new ApiError(422,'Percentage discounts cannot exceed 100.');
    const start=dateValue(body.start_date??existing?.starts_at,false),end=dateValue(body.end_date??existing?.ends_at,true);
    if(start>=end)throw new ApiError(422,'End date must follow start date.');
    const ids=body.course_ids===undefined&&existing?null:Array.isArray(body.course_ids)?[...new Set(body.course_ids.map(value=>idValue(value)))]:[];
    if(ids&&!ids.length)throw new ApiError(422,'Select at least one course.');if(ids&&ids.length>200)throw new ApiError(422,'A coupon may cover up to 200 courses.');
    if(ids){const scope=staffCourseScope(actor);const [courses]=await connection.execute<RowDataPacket[]>(`SELECT c.id FROM ir_courses c WHERE c.id IN (${ids.map(()=>'?').join(',')}) AND ${scope.sql}`,[...ids,...scope.values]);if(courses.length!==ids.length)throw new ApiError(403,'Choose courses managed by your teaching account.');}
    const values=[code,optionalText(body.message??existing?.message,'Message',500),start,end,type,discount,body.max_discount_amount!==undefined?(Number(body.max_discount_amount)===0?null:valueMoney(body.max_discount_amount,'Maximum discount')):existing?.maximum_discount||null,valueMoney(body.minimum_order_amount??existing?.minimum_order_amount??0,'Minimum amount',true),integerValue(body.total_usage_limit??existing?.total_usage_limit,'Usage limit',0,1000000),integerValue(body.total_usage_per_user_limit??existing?.per_user_limit,'Per-user limit',0,1000000),body.status===undefined?existing?.is_active??true:booleanValue(body.status)];
    let couponId=existing?.id;
    if(couponId)await connection.execute('UPDATE ir_coupons SET code=?,message=?,starts_at=?,ends_at=?,discount_type=?,discount=?,maximum_discount=?,minimum_order_amount=?,total_usage_limit=?,per_user_limit=?,is_active=? WHERE id=?',[...values,couponId]);
    else {const [result]=await connection.execute<ResultSetHeader>('INSERT INTO ir_coupons(code,message,starts_at,ends_at,discount_type,discount,maximum_discount,minimum_order_amount,total_usage_limit,per_user_limit,is_active,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[...values,actor.id]);couponId=result.insertId;}
    if(ids){await connection.execute('DELETE FROM ir_coupon_courses WHERE coupon_id=?',[couponId]);for(const courseId of ids)await connection.execute('INSERT INTO ir_coupon_courses(coupon_id,course_id) VALUES(?,?)',[couponId,courseId]);}
    await audit(connection,actor,existing?'coupon.update':'coupon.create','coupon',couponId,{code});return {id:Number(couponId)};
  });
}

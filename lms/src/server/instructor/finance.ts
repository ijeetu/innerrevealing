import { RowDataPacket,ResultSetHeader } from 'mysql2/promise';
import { database } from '../db';
import { SessionUser } from '../auth';
import { ApiError } from '../errors';
import { audit,idValue,optionalText,textValue,transaction } from '../admin/core';
import { pageOptions,paginate } from '../catalogue';
import { integrationSecrets } from '../integrations';
import { notify } from '../notifications';
import { staffCourseScope,valueMoney,formatMoney,ownedCourse } from './support';

export async function financeSummary(user:SessionUser,courseId?:number) {
  const scope=staffCourseScope(user),extra=courseId?' AND c.id=?':'',values=[...scope.values,...(courseId?[courseId]:[])];
  const [sales]=await database().execute<RowDataPacket[]>(`SELECT oi.course_id,oi.amount,o.created_at FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id JOIN ir_courses c ON c.id=oi.course_id WHERE o.status IN ('paid','refunded') AND ${scope.sql}${extra} ORDER BY o.created_at ASC` ,values);
  const [refunds]=await database().execute<RowDataPacket[]>(`SELECT r.amount,r.processed_at FROM ir_refund_requests r JOIN ir_courses c ON c.id=r.course_id WHERE r.status='refunded' AND ${scope.sql}${extra}`,values);
  const [holds]=await database().execute<RowDataPacket[]>(`SELECT COALESCE(SUM(r.amount),0) total FROM ir_refund_requests r JOIN ir_courses c ON c.id=r.course_id WHERE r.status IN ('pending','approved','processing') AND ${scope.sql}${extra}`,values);
  const [withdrawals]=await database().execute<RowDataPacket[]>(user.role==='superadmin'?"SELECT * FROM ir_withdrawals ORDER BY id DESC":"SELECT * FROM ir_withdrawals WHERE user_id=? ORDER BY id DESC",user.role==='superadmin'?[]:[user.id]);
  const revenue=sales.reduce((sum,row)=>sum+Number(row.amount),0),refunded=refunds.reduce((sum,row)=>sum+Number(row.amount),0),net=Math.max(0,revenue-refunded),onHold=Number(holds[0].total);
  const paid=withdrawals.filter(row=>row.status==='paid').reduce((sum,row)=>sum+Number(row.amount),0),reserved=withdrawals.filter(row=>['pending','approved'].includes(row.status)).reduce((sum,row)=>sum+Number(row.amount),0);
  const [budget]=await database().execute<RowDataPacket[]>(`SELECT
    (SELECT COALESCE(SUM(oi.amount),0) FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id WHERE o.status IN ('paid','refunded')) gross,
    (SELECT COALESCE(SUM(amount),0) FROM ir_refund_requests WHERE status IN ('pending','approved','processing','refunded')) refunds,
    (SELECT COALESCE(SUM(amount),0) FROM ir_withdrawals WHERE status IN ('pending','approved','paid')) withdrawals`);
  const globalAvailable=Math.max(0,Number(budget[0].gross)-Number(budget[0].refunds)-Number(budget[0].withdrawals));
  const available=Math.max(0,Math.round(Math.min(net-onHold-paid-reserved,globalAvailable)*100)/100);
  const yearly=new Map<string,{revenue:number;earning:number}>(),monthly=new Map<string,{revenue:number;earning:number}>(),weekly=new Map<string,{revenue:number;earning:number}>();
  const add=(timestamp:string,revenue:number,earning:number)=>{const iso=String(timestamp).replace(' ','T').slice(0,10);for(const [map,key] of [[yearly,iso.slice(0,4)],[monthly,iso.slice(0,7)],[weekly,iso]] as const){const point=map.get(key)||{revenue:0,earning:0};point.revenue+=revenue;point.earning+=earning;map.set(key,point);}};
  for(const row of sales)add(row.created_at,Number(row.amount),Number(row.amount));
  for(const row of refunds)if(row.processed_at)add(row.processed_at,0,-Number(row.amount));
  const chart=(map:Map<string,{revenue:number;earning:number}>)=>[...map].sort(([a],[b])=>a.localeCompare(b)).map(([name,value])=>({name,revenue:Math.round(value.revenue*100)/100,commission:0,earning:Math.round(value.earning*100)/100}));
  const revenue_chart={yearly:chart(yearly),monthly:chart(monthly),weekly:chart(weekly).slice(-7)},earnings_chart={yearly:chart(yearly),monthly:chart(monthly),weekly:chart(weekly).slice(-7)};
  const card=(value:number,metric:'revenue'|'earning'|'commission'='earning')=>({value:value.toFixed(2),formatted_value:formatMoney(value),chartData:chart(monthly).map(item=>({name:item.name,earning:item[metric]}))});
  return {summary_cards:{total_revenue:card(revenue,'revenue'),total_commission:card(0,'commission'),total_earning:card(net),amount_on_hold:card(onHold)},action_cards:{available_to_withdraw:{...card(available),button_text:'Request withdrawal',button_action:'/instructor/earnings/withdraw-details'},total_withdrawal:{...card(paid),button_text:'View history',button_action:'/instructor/earnings#withdrawal-history'}},charts:{revenue_chart,earnings_chart},recent_withdrawals:withdrawals.slice(0,5).map(row=>({id:row.id,amount:String(row.amount),status:row.status,status_label:row.status,requested_at:row.created_at,processed_at:row.processed_at||''})),filters:{year:String(new Date().getUTCFullYear()),available_years:[...yearly.keys()].map(Number)},available,withdrawals};
}
export async function courseRevenue(user:SessionUser,params:URLSearchParams) {
  const scope=staffCourseScope(user);let where=scope.sql;const values:(number|string)[]=[...scope.values];
  if(params.get('search')){where+=' AND c.title LIKE ?';values.push('%'+params.get('search')+'%');}if(params.get('category_id')){where+=' AND c.category_id=?';values.push(idValue(params.get('category_id')));}
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT c.*,cat.name category_name,cat.slug category_slug,
    (SELECT COUNT(*) FROM ir_enrollments e WHERE e.course_id=c.id AND e.status='active') enrolled_students,
    (SELECT COUNT(*) FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id WHERE oi.course_id=c.id AND o.status IN ('paid','refunded')) purchase_count,
    (SELECT COALESCE(SUM(oi.amount),0) FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id WHERE oi.course_id=c.id AND o.status IN ('paid','refunded')) gross,
    (SELECT COALESCE(SUM(r.amount),0) FROM ir_refund_requests r WHERE r.course_id=c.id AND r.status='refunded') refunded,
    (SELECT COALESCE(SUM(oi.amount),0) FROM ir_order_items oi JOIN ir_orders o ON o.id=oi.order_id WHERE oi.course_id=c.id AND o.status IN ('pending','awaiting_review')) pending
    FROM ir_courses c LEFT JOIN ir_categories cat ON cat.id=c.category_id WHERE ${where} ORDER BY c.id DESC`,values);
  return rows.map((row,index)=>({row_number:index+1,course_id:Number(row.id),id:Number(row.id),slug:row.slug,title:row.title,thumbnail:row.image,image:row.image,price:Number(row.price),discount_price:null,average_rating:0,ratings:0,short_description:row.short_description,category:{id:row.category_id,name:row.category_name||'',slug:row.category_slug||''},enrolled_students:Number(row.enrolled_students),purchase_count:Number(row.purchase_count),pending_amount:Number(row.pending),formatted_pending_amount:formatMoney(Number(row.pending)),total_revenue:Number(row.gross)-Number(row.refunded),revenue:Number(row.gross)-Number(row.refunded),formatted_total_revenue:formatMoney(Number(row.gross)-Number(row.refunded)),paid_amount:Number(row.gross)-Number(row.refunded),formatted_paid_amount:formatMoney(Number(row.gross)-Number(row.refunded))}));
}
export async function withdrawalOperation(user:SessionUser,method:string,path:string,params:URLSearchParams,body:Record<string,unknown>) {
  if(method==='GET'){
    const summary=await financeSummary(user),{page,perPage}=pageOptions(params);
    const rows=summary.withdrawals.map(row=>({id:Number(row.id),amount:String(row.amount),formatted_amount:formatMoney(Number(row.amount)),status:row.status,status_label:row.status,requested_at:row.created_at,processed_at:row.processed_at||'',notes:row.notes,payment_method:row.payment_method,bank_details:typeof row.bank_details==='string'?JSON.parse(row.bank_details):row.bank_details,manual_reference:row.manual_reference}));
    return {withdrawals:rows.slice((page-1)*perPage,page*perPage),available_to_withdraw:summary.action_cards.available_to_withdraw,total_withdrawal:summary.action_cards.total_withdrawal,pagination:{current_page:page,per_page:perPage,total:rows.length,last_page:Math.max(1,Math.ceil(rows.length/perPage)),from:rows.length?(page-1)*perPage+1:0,to:Math.min(page*perPage,rows.length),has_more_pages:page*perPage<rows.length}};
  }
  const parts=path.split('/');
  if(parts[0]==='withdrawal-history'&&parts[1]){
    if(user.role!=='superadmin')throw new ApiError(403,'Only the centre owner can record withdrawal processing.');
    const id=idValue(parts[1]),status=String(body.status||'');if(!['approved','rejected','paid'].includes(status))throw new ApiError(422,'Choose approved, rejected or paid.');
    const reference=status==='paid'?textValue(body.reference,'Bank payment reference',200):'';
    return transaction(async connection=>{const [actor]=await connection.execute<RowDataPacket[]>('SELECT role,is_active FROM ir_users WHERE id=? FOR UPDATE',[user.id]);if(actor[0]?.role!=='superadmin'||!actor[0]?.is_active)throw new ApiError(403,'Owner access is required.');const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_withdrawals WHERE id=? FOR UPDATE',[id]);const row=rows[0];if(!row)throw new ApiError(404,'Withdrawal not found.');if(row.status==='paid')return {id,status:'paid'};if(status==='paid'&&body.confirm!==true)throw new ApiError(422,'Confirm the real bank transfer before recording it.');await connection.execute('UPDATE ir_withdrawals SET status=?,manual_reference=?,processed_by=?,processed_at=UTC_TIMESTAMP(),notes=? WHERE id=?',[status,reference||null,user.id,optionalText(body.notes??row.notes,'Notes',2000),id]);await audit(connection,user,'withdrawal.'+status,'withdrawal',id,{reference:reference||undefined});await notify(connection,Number(row.user_id),{title:'Withdrawal '+status,message:'Your withdrawal request has been updated by the centre.',url:'/instructor/earnings#withdrawal-history'});return {id,status};});
  }
  const amount=valueMoney(body.amount);const bank=body.payment_details as Record<string,unknown>;
  if(!bank||typeof bank!=='object')throw new ApiError(422,'Enter your bank payment details.');
  const details={account_holder_name:textValue(bank.account_holder_name,'Account holder',120),account_number:textValue(bank.account_number,'Account number',50),bank_name:textValue(bank.bank_name,'Bank name',120),ifsc_code:textValue(bank.ifsc_code,'IFSC',30)};
  return transaction(async connection=>{await connection.execute("SELECT id FROM ir_users WHERE role='superadmin' AND is_active=1 ORDER BY id FOR UPDATE");await connection.execute('SELECT id FROM ir_users WHERE id=? FOR UPDATE',[user.id]);const summary=await financeSummary(user);if(amount>summary.available)throw new ApiError(422,'The requested amount exceeds available earnings.');const [insert]=await connection.execute<ResultSetHeader>('INSERT INTO ir_withdrawals(user_id,amount,payment_method,bank_details,notes) VALUES(?,?,?,?,?)',[user.id,amount,'bank_transfer',JSON.stringify(details),optionalText(body.notes,'Notes',2000)]);await audit(connection,user,'withdrawal.request','withdrawal',insert.insertId,{amount});return {withdrawal_request:{id:insert.insertId,amount,payment_method:'bank_transfer',payment_details:details,status:'pending',created_at:new Date().toISOString()}};});
}
export async function refundRows(user:SessionUser,params:URLSearchParams,staff:boolean) {
  const scope=staffCourseScope(user);const values:(string|number)[]=staff?[...scope.values]:[user.id];let where=staff?scope.sql:'r.user_id=?';
  if(params.get('status')){where+=' AND r.status=?';values.push(params.get('status')!);}if(params.get('course_id')){where+=' AND r.course_id=?';values.push(idValue(params.get('course_id')));}
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT r.*,c.title,c.slug,c.image,c.short_description,c.instructor_id,c.price,u.name,u.email,o.order_number,o.payment_method,o.amount order_amount,o.created_at purchase_date,
   (SELECT COUNT(*) FROM ir_lessons l WHERE l.course_id=c.id AND l.is_published=1) lessons,
   (SELECT COUNT(*) FROM ir_progress p JOIN ir_lessons l ON l.id=p.lesson_id WHERE p.user_id=r.user_id AND l.course_id=c.id AND l.is_published=1 AND p.completed=1) completed,
   (SELECT COUNT(DISTINCT l.chapter_id) FROM ir_lessons l WHERE l.course_id=c.id AND l.is_published=1) chapters,
   (SELECT COUNT(*) FROM ir_chapters ch WHERE ch.course_id=c.id AND EXISTS(SELECT 1 FROM ir_lessons l WHERE l.chapter_id=ch.id AND l.is_published=1) AND NOT EXISTS(SELECT 1 FROM ir_lessons l WHERE l.chapter_id=ch.id AND l.is_published=1 AND NOT EXISTS(SELECT 1 FROM ir_progress p WHERE p.user_id=r.user_id AND p.lesson_id=l.id AND p.completed=1))) completed_chapters
   FROM ir_refund_requests r JOIN ir_courses c ON c.id=r.course_id JOIN ir_users u ON u.id=r.user_id JOIN ir_orders o ON o.id=r.order_id WHERE ${where} ORDER BY r.id DESC`,values);
  return rows.map(row=>({...row,id:Number(row.id),refund_amount:String(row.amount),user_media:row.evidence_name?`/api/refund-media/${row.id}`:null,user_media_url:row.evidence_name?`/api/refund-media/${row.id}`:null,course:{id:Number(row.course_id),title:row.title,slug:row.slug,thumbnail:row.image,short_description:row.short_description,price:String(row.price)},student:{id:Number(row.user_id),name:row.name,email:row.email,profile:null,enrollment_date:row.purchase_date,course_progress:{percentage:Number(row.lessons)?Math.round(Number(row.completed)/Number(row.lessons)*100):0,completed_chapters:Number(row.completed_chapters),total_chapters:Number(row.chapters)}},instructor_response:{status:row.responded_at?'responded':'pending',recommendation:row.status==='rejected'?'reject':row.responded_at?'approve':null,comment:row.staff_comment,media:null,responded_at:row.responded_at,deadline:null},purchase_date:row.purchase_date,request_date:row.created_at,transaction:{id:Number(row.order_id),user_id:Number(row.user_id),order_id:Number(row.order_id),transaction_id:row.order_number,amount:String(row.amount),payment_method:row.payment_method,status:row.status,created_at:row.purchase_date,order:{id:Number(row.order_id),order_number:row.order_number,status:row.status,final_price:String(row.order_amount)}}}));
}
export async function createRefund(user:SessionUser,body:Record<string,unknown>,evidence?:{name:string;mime:string}) {
  const courseId=idValue(body.course_id),reason=textValue(body.reason,'Refund reason',5000);
  return transaction(async connection=>{
    const [purchases]=await connection.execute<RowDataPacket[]>(`SELECT o.id,oi.amount FROM ir_orders o JOIN ir_order_items oi ON oi.order_id=o.id WHERE o.user_id=? AND oi.course_id=? AND o.status='paid' AND oi.amount>0${body.order_id?' AND o.id=?':''} ORDER BY o.id DESC LIMIT 1 FOR UPDATE`,body.order_id?[user.id,courseId,idValue(body.order_id)]:[user.id,courseId]);
    if(!purchases[0])throw new ApiError(404,'No refundable paid purchase was found for this course.');
    const [settings]=await connection.execute<RowDataPacket[]>("SELECT setting_value FROM ir_settings WHERE setting_key='web'");const raw=settings[0]?.setting_value;const config=typeof raw==='string'?JSON.parse(raw):raw;
    if(String(config?.refund_enabled)!=='1')throw new ApiError(422,'Refund requests are not enabled. Contact the centre for assistance.');
    const days=Number(config.refund_period_days||0);if(days>0){const [valid]=await connection.execute<RowDataPacket[]>('SELECT id FROM ir_orders WHERE id=? AND created_at>=DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? DAY)',[purchases[0].id,days]);if(!valid.length)throw new ApiError(422,'The refund request period has ended.');}
    const [existing]=await connection.execute<RowDataPacket[]>('SELECT id,status FROM ir_refund_requests WHERE order_id=? AND course_id=? FOR UPDATE',[purchases[0].id,courseId]);if(existing.length)throw new ApiError(409,'A refund request already exists for this purchase.');
    const [insert]=await connection.execute<ResultSetHeader>('INSERT INTO ir_refund_requests(order_id,course_id,user_id,amount,reason,evidence_name,evidence_mime) VALUES(?,?,?,?,?,?,?)',[purchases[0].id,courseId,user.id,purchases[0].amount,reason,evidence?.name||null,evidence?.mime||null]);await audit(connection,user,'refund.request','refund',insert.insertId,{course_id:courseId});return {id:insert.insertId,status:'pending'};
  });
}
export async function respondRefund(user:SessionUser,id:number,body:Record<string,unknown>) {
  const rows=await refundRows(user,new URLSearchParams(),true),row=rows.find(item=>item.id===id);if(!row)throw new ApiError(404,'Refund request not found.');
  const recommendation=String(body.recommendation||'');if(!['approve','reject'].includes(recommendation))throw new ApiError(422,'Choose approve or reject.');
  return transaction(async connection=>{const [locked]=await connection.execute<RowDataPacket[]>('SELECT status FROM ir_refund_requests WHERE id=? FOR UPDATE',[id]);if(!['pending','approved','rejected'].includes(locked[0].status))throw new ApiError(409,'This refund is already being processed.');await connection.execute('UPDATE ir_refund_requests SET status=?,staff_comment=?,responded_by=?,responded_at=UTC_TIMESTAMP() WHERE id=?',[recommendation==='approve'?'approved':'rejected',optionalText(body.comment,'Comment',5000),user.id,id]);await audit(connection,user,'refund.'+recommendation,'refund',id);return {id,status:recommendation==='approve'?'approved':'rejected'};});
}
export async function completeRefund(user:SessionUser,id:number,body:Record<string,unknown>) {
  if(user.role!=='superadmin')throw new ApiError(403,'Only the centre owner can execute or record refunds.');
  if(body.confirm!==true)throw new ApiError(422,'Explicitly confirm this refund action.');
  const method=String(body.method||'manual');if(!['manual','razorpay'].includes(method))throw new ApiError(422,'Choose a refund method.');
  const reference=method==='manual'?textValue(body.reference,'Actual refund transfer reference',200):null;
  const providerSettings=method==='razorpay'?await integrationSecrets():null;
  if(method==='razorpay'&&(!providerSettings?.razorpay_enabled||!providerSettings?.razorpay_key_secret))throw new ApiError(503,'Razorpay refunds are not configured.');
  const row=await transaction(async connection=>{
    const [actor]=await connection.execute<RowDataPacket[]>('SELECT role,is_active FROM ir_users WHERE id=? FOR UPDATE',[user.id]);if(actor[0]?.role!=='superadmin'||!actor[0]?.is_active)throw new ApiError(403,'Owner access is required.');
    const [rows]=await connection.execute<RowDataPacket[]>('SELECT r.*,o.payment_method,o.razorpay_payment_id,o.status order_status FROM ir_refund_requests r JOIN ir_orders o ON o.id=r.order_id WHERE r.id=? FOR UPDATE',[id]);const row=rows[0];if(!row)throw new ApiError(404,'Refund request not found.');if(row.status==='refunded')return row;
    if(!['approved','processing'].includes(row.status))throw new ApiError(409,'Approve the refund request first.');if(row.status==='processing'&&row.refund_method!==method)throw new ApiError(409,'Reconcile the current refund attempt before changing its method.');
    if(method==='razorpay'&&(row.payment_method!=='razorpay'||!row.razorpay_payment_id))throw new ApiError(422,'This purchase was not paid through Razorpay.');
    await connection.execute("UPDATE ir_refund_requests SET status='processing',refund_method=?,processed_by=? WHERE id=?",[method,user.id,id]);return row;
  });
  if(row.status==='refunded')return {id,status:'refunded'};
  let providerId:string|null=null;
  if(method==='razorpay'){
    const settings=providerSettings!;
    const resource=row.provider_refund_id?`refunds/${encodeURIComponent(row.provider_refund_id)}`:`payments/${encodeURIComponent(row.razorpay_payment_id)}/refund`;
    let value:Record<string,unknown>;
    try {
      // https://razorpay.com/docs/api/refunds/normal-refunds-idempotent/
      const response=await fetch(`https://api.razorpay.com/v1/${resource}`,{method:row.provider_refund_id?'GET':'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Basic ${Buffer.from(`${settings.razorpay_key_id}:${settings.razorpay_key_secret}`).toString('base64')}`,'Content-Type':'application/json','X-Refund-Idempotency':`ir-course-refund-${id}`},...(!row.provider_refund_id?{body:JSON.stringify({amount:Math.round(Number(row.amount)*100),speed:'normal',receipt:`ir-refund-${id}`})}:{})});
      value=await response.json();if(!response.ok)throw new Error('Gateway did not confirm refund');
    }catch{throw new ApiError(503,'Refund status is not confirmed. Retry this same request to reconcile it; do not send another transfer.');}
    if(typeof value.id!=='string'||value.payment_id!==row.razorpay_payment_id||Number(value.amount)!==Math.round(Number(row.amount)*100))throw new ApiError(503,'The payment provider returned an unexpected refund response.');
    providerId=value.id;await database().execute('UPDATE ir_refund_requests SET provider_refund_id=? WHERE id=?',[providerId,id]);
    if(value.status!=='processed'){if(value.status==='failed')await database().execute("UPDATE ir_refund_requests SET status='approved',refund_method=NULL WHERE id=?",[id]);return {id,status:value.status==='failed'?'approved':'processing',provider_status:value.status};}
  }
  return transaction(async connection=>{
    const [locked]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_refund_requests WHERE id=? FOR UPDATE',[id]);if(locked[0].status==='refunded')return {id,status:'refunded'};
    await connection.execute("UPDATE ir_refund_requests SET status='refunded',manual_reference=?,provider_refund_id=COALESCE(?,provider_refund_id),processed_by=?,processed_at=UTC_TIMESTAMP() WHERE id=?",[reference,providerId,user.id,id]);
    await connection.execute("UPDATE ir_enrollments SET status='revoked' WHERE user_id=? AND course_id=?",[row.user_id,row.course_id]);
    const [totals]=await connection.execute<RowDataPacket[]>('SELECT o.amount,(SELECT COALESCE(SUM(r.amount),0) FROM ir_refund_requests r WHERE r.order_id=o.id AND r.status=\'refunded\') refunded FROM ir_orders o WHERE o.id=? FOR UPDATE',[row.order_id]);
    if(Number(totals[0].refunded)>=Number(totals[0].amount))await connection.execute("UPDATE ir_orders SET status='refunded' WHERE id=?",[row.order_id]);
    await audit(connection,user,'refund.refunded','refund',id,{method,reference,provider_id:providerId});await notify(connection,Number(row.user_id),{title:'Your refund has been processed',message:'The centre has recorded your refund. Course access has ended.',url:'/transaction-history'});return {id,status:'refunded'};
  });
}

import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2/promise';
import { getSessionUser } from '../auth';
import { requireAdmin,requireUser } from '../authorization';
import { database } from '../db';
import { ApiError } from '../errors';
import { assertSameOrigin } from '../request';
import { success,failure } from '../response';
import { pageOptions,paginate } from '../catalogue';
import { idValue,transaction } from '../admin/core';
import { rateLimit } from '../rate-limit';
import { cart } from '../commerce';
import { couponOperation,quoteCoupon } from './coupons';
import { financeSummary,courseRevenue,withdrawalOperation,refundRows,createRefund,respondRefund,completeRefund } from './finance';
import { teamOperation } from './teams';
import { operationBody,ownedCourse } from './support';
import { saveEvidence,removeEvidence,serveEvidence } from './evidence';

const couponPaths=['promo-codes','add-promo-code','promo-code','edit-promo-code','get-courses-for-coupon'];
const teamPaths=['team-members','add-team-member','remove-team-member','invitors','accept-team-invitation'];
export async function handleOperations(request:Request,pathString:string):Promise<NextResponse|Response|undefined>{
  const path=pathString.replace(/^\/+/,''),params=new URL(request.url).searchParams,method=request.method;
  const known=couponPaths.includes(path)||teamPaths.includes(path)||/^(?:team-members\/\d+\/courses|refund-requests(?:\/\d+\/(?:respond|complete))?|refund-media\/\d+|withdrawal-history(?:\/\d+\/respond)?|finance\/withdrawal-request|earnings|course-analysis|get-course-revenue|refund\/request|refund\/my-refunds|promo-code\/list|cart\/apply-promo|cart\/remove-promo|promo-code\/apply-promo-code)$/.test(path);
  if(!known)return undefined;
  try{
    if(method==='GET'&&path==='promo-code/list'){
      const [codes]=await database().execute<RowDataPacket[]>("SELECT c.id,c.code promo_code,c.message,c.discount,c.discount_type,c.maximum_discount max_discount_amount,c.minimum_order_amount,c.starts_at start_date,c.ends_at end_date,u.name creator_name FROM ir_coupons c JOIN ir_users u ON u.id=c.created_by WHERE c.is_active=1 AND c.deleted_at IS NULL AND UTC_TIMESTAMP() BETWEEN c.starts_at AND c.ends_at" );
      let applicable=codes;if(params.get('course_id')){const [scope]=await database().execute<RowDataPacket[]>('SELECT coupon_id FROM ir_coupon_courses WHERE course_id=?',[idValue(params.get('course_id'))]);const ids=new Set(scope.map(row=>Number(row.coupon_id)));applicable=codes.filter(row=>ids.has(Number(row.id)));}
      const [course]=params.get('course_id')?await database().execute<RowDataPacket[]>("SELECT id,title,price FROM ir_courses WHERE id=? AND status='published'",[idValue(params.get('course_id'))]):[[]];
      return success({course:course[0]||null,promo_codes:applicable,total_codes:applicable.length});
    }
    const user=await requireUser(request);
    if(path.startsWith('refund-media/')&&!['GET','HEAD'].includes(method))throw new ApiError(405,'Use GET for attachments.');
    if(path.startsWith('refund-media/'))return serveEvidence(request,user,idValue(path.split('/')[1]));
    let body:Record<string,unknown>={};if(!['GET','HEAD'].includes(method)){assertSameOrigin(request);await rateLimit('staff-operation',String(user.id),120,900);body=await operationBody(request);}
    if(path==='refund/request'&&method==='POST'){
      const evidence=await saveEvidence(body.user_media);try{return success(await createRefund(user,body,evidence),'Refund request received.');}catch(error){if(evidence)await removeEvidence(evidence.name);throw error;}
    }
    if(path==='refund/my-refunds'&&method==='GET'){const rows=await refundRows(user,params,false),{page,perPage}=pageOptions(params);return success(paginate(rows.slice((page-1)*perPage,page*perPage),rows.length,page,perPage,'/api/refund/my-refunds'));}
    if(['cart/apply-promo','cart/remove-promo','promo-code/apply-promo-code'].includes(path)&&method==='POST'){
      if(path==='cart/remove-promo'){await database().execute('DELETE FROM ir_cart_coupon WHERE user_id=?',[user.id]);const current=await cart(user.id);return success({...current,courses:current.items.map(item=>({...item,thumbnail:item.image,display_price:item.price,display_discount_price:item.price,original_price:item.price,final_price:item.price,promo_discount:0,tax_amount:0,total_tax_percentage:0,is_wishlisted:false,promo_code:null})),total_display_price:current.subtotal,subtotal_price:current.subtotal,promo_discount:0,discount:0,total_price:current.total,promo_discounts:[]});}
      const current=await cart(user.id);const code=String(body.promo_code||body.coupon_code||'');
      const quote=await transaction(connection=>quoteCoupon(connection,user.id,code,current.items.map(item=>({id:item.id,price:item.price}))));
      await database().execute('INSERT INTO ir_cart_coupon(user_id,coupon_id) VALUES(?,?) ON DUPLICATE KEY UPDATE coupon_id=VALUES(coupon_id)',[user.id,quote.coupon_id]);
      return success({...current,total:quote.total,subtotal:quote.subtotal,discount_amount:quote.discount_amount,coupon_code:quote.code,courses:current.items.map(item=>({...item,thumbnail:item.image,display_price:item.price,display_discount_price:quote.items.find(value=>value.id===item.id)?.amount??item.price,original_price:item.price,promo_discount:quote.items.find(value=>value.id===item.id)?.discount||0,final_price:quote.items.find(value=>value.id===item.id)?.amount??item.price,tax_amount:0,total_tax_percentage:0,is_wishlisted:false,promo_code:{id:quote.coupon_id,code:quote.code,message:'',discount_amount:quote.discount_amount}})),total_display_price:quote.subtotal,subtotal_price:quote.subtotal,promo_discount:quote.discount_amount,discount:quote.discount_amount,total_price:quote.total,promo_discounts:quote.items.filter(item=>item.discount>0).map(item=>({course_id:item.id,course_title:current.items.find(course=>course.id===item.id)?.title||'',promo_code:quote.code,discount_amount:item.discount}))});
    }
    const staff=await requireAdmin(request);
    if(couponPaths.includes(path))return success(await couponOperation(staff,method,path,params,body),'Coupon operation completed.');
    if(teamPaths.includes(path)||path.startsWith('team-members/'))return success(await teamOperation(staff,method,path,params,body),'Teaching team updated.');
    if(path==='earnings'&&method==='GET')return success(await financeSummary(staff));
    if(path==='course-analysis'&&method==='GET'){
      const scope=params.get('course_id')?await ownedCourse(staff,params.get('course_id')):null;const [rows]=scope?[[scope]]:await database().execute<RowDataPacket[]>('SELECT id FROM ir_courses WHERE slug=?',[params.get('course_slug')||'']);if(!rows[0])throw new ApiError(404,'Course not found.');const course=await ownedCourse(staff,rows[0].id),summary=await financeSummary(staff,Number(course.id));return success({course_info:{...course,thumbnail:course.image,average_rating:0,total_ratings_count:0,discount_price:null},summary_cards:summary.summary_cards,revenue_chart:summary.charts.revenue_chart,earnings_chart:summary.charts.earnings_chart});
    }
    if(path==='get-course-revenue'&&method==='GET'){
      const rows=await courseRevenue(staff,params),{page,perPage}=pageOptions(params);const total=rows.reduce((sum,row)=>sum+row.total_revenue,0),pending=rows.reduce((sum,row)=>sum+row.pending_amount,0);const [categories]=await database().execute<RowDataPacket[]>('SELECT id,name,slug FROM ir_categories WHERE is_active=1');return NextResponse.json({error:false,message:'Revenue fetched.',code:200,data:paginate(rows.slice((page-1)*perPage,page*perPage),rows.length,page,perPage,'/api/get-course-revenue'),summary:{total_courses:rows.length,total_purchases:rows.reduce((sum,row)=>sum+row.purchase_count,0),total_revenue:total,formatted_total_revenue:String(total.toFixed(2)),total_paid:total,formatted_total_paid:String(total.toFixed(2)),total_pending_clearance:pending,formatted_total_pending_clearance:String(pending.toFixed(2))},categories,filters:{search:params.get('search')||'',category_id:params.get('category_id')?Number(params.get('category_id')):null}},{headers:{'Cache-Control':'private,no-store'}});
    }
    if(path==='withdrawal-history'||path.startsWith('withdrawal-history/')||path==='finance/withdrawal-request')return success(await withdrawalOperation(staff,method,path,params,body),'Withdrawal operation recorded.');
    if(path==='refund-requests'&&method==='GET'){const rows=await refundRows(staff,params,true),{page,perPage}=pageOptions(params);return success(paginate(rows.slice((page-1)*perPage,page*perPage),rows.length,page,perPage,'/api/refund-requests'));}
    const match=/^refund-requests\/(\d+)\/(respond|complete)$/.exec(path);if(match&&method==='POST')return success(await(match[2]==='complete'?completeRefund(staff,idValue(match[1]),body):respondRefund(staff,idValue(match[1]),body)),match[2]==='respond'?'Recommendation recorded. A refund is completed only after the owner confirms the transfer.':'Refund status updated.');
    throw new ApiError(405,'This staff operation does not support that method.');
  }catch(error){return failure(error);}
}

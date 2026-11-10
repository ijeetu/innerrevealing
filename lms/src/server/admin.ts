import { RowDataPacket } from 'mysql2/promise';
import { requireAdmin } from './authorization';
import { database } from './db';
import { ApiError } from './errors';
import { assertSameOrigin, readJson } from './request';
import { failure, success } from './response';
import { approveOrder, orderDetail, rejectOrder } from './commerce';
import { getIntegrationSettings, saveIntegrationSettings, testIntegration } from './integrations';
import { AdminActor, adminList, enumValue, idValue, optionalText, searchClause } from './admin/core';
import { contentAdmin, dashboard, settingsAdmin } from './admin/content';
import { courseAdmin } from './admin/courses';
import { mediaAdmin, uploadMedia } from './admin/media';
import { userAdmin } from './admin/users';

async function orderAdmin(method:string,parts:string[],body:Record<string,unknown>,actor:AdminActor,params:URLSearchParams):Promise<unknown> {
  const id=parts[1]?idValue(parts[1]):null;
  if(method==='GET'&&!id) {
    const search=searchClause(params,['o.order_number','u.name','u.email','o.payment_reference']);
    let where=search.where;const values:(string|number)[]=[...search.values];
    if(params.get('status')){where+=`${where?' AND':'WHERE'} o.status=?`;values.push(enumValue(params.get('status'),['pending','awaiting_review','paid','rejected','cancelled','refunded'],'order status'));}
    return adminList('ir_orders o JOIN ir_users u ON u.id=o.user_id',`o.*,u.name AS user_name,u.email AS user_email,(SELECT GROUP_CONCAT(i.title_snapshot SEPARATOR ', ') FROM ir_order_items i WHERE i.order_id=o.id) AS course_title`,params,where,values,'o.created_at DESC,o.id DESC');
  }
  if(method==='GET'&&id)return orderDetail(id);
  if(method==='POST'&&id&&parts[2]==='approve')return approveOrder(id,actor.id);
  if(method==='POST'&&id&&parts[2]==='reject')return rejectOrder(id,actor.id,optionalText(body.reason,'Rejection reason',1000));
  throw new ApiError(404,'This order administration endpoint does not exist.');
}

export async function handleAdmin(request:Request,parts:string[]) {
  try {
    const actor=await requireAdmin(request);
    const method=request.method;
    if(method!=='GET')assertSameOrigin(request);
    const params=new URL(request.url).searchParams;
    const area=parts[0]||'dashboard';
    if(area==='system-status'&&method==='GET') {
      if(actor.role!=='superadmin')throw new ApiError(403,'Super administrator access is required.');
      const [rows]=await database().execute<RowDataPacket[]>('SELECT DATABASE() AS database_name');
      return success({database_name:rows[0].database_name});
    }
    if(area==='media'&&method==='POST'&&parts.length===1)return success(await uploadMedia(request,actor),'Media uploaded.',201);
    const body=method==='GET'||method==='DELETE'?{}:await readJson(request,1024*1024);
    if(area==='dashboard'&&method==='GET')return success(await dashboard());
    if(['courses','chapters','lessons'].includes(area))return success(await courseAdmin(method,parts,body,actor,params),method==='GET'?'Data fetched successfully.':'Practice saved.');
    if(area==='users')return success(await userAdmin(method,parts,body,actor,params),method==='GET'?'Data fetched successfully.':'User access updated.');
    if(area==='orders')return success(await orderAdmin(method,parts,body,actor,params),method==='GET'?'Data fetched successfully.':'Order review saved.');
    if(area==='settings')return success(await settingsAdmin(method,body,actor),method==='GET'?'Data fetched successfully.':'Site settings saved.');
    if(area==='media')return success(await mediaAdmin(method,parts,actor,params));
    if(area==='integrations') {
      if(actor.role!=='superadmin')throw new ApiError(403,'Only a super administrator can manage integrations.');
      if(method==='GET'&&parts.length===1)return success(await getIntegrationSettings());
      if(['PUT','PATCH'].includes(method)&&parts.length===1)return success(await saveIntegrationSettings(body,actor.id),'Integration settings saved.');
      if(method==='POST'&&parts[1]==='test')return success(await testIntegration(enumValue(body.service,['smtp','razorpay'],'integration service'),actor.id));
      throw new ApiError(405,'This integration operation is not supported.');
    }
    return success(await contentAdmin(method,parts,body,actor,params),method==='GET'?'Data fetched successfully.':'Changes saved.');
  } catch(error) {
    const code=(error as {code?:string})?.code;
    if(code==='ER_DUP_ENTRY')return failure(new ApiError(409,'A record with this email or slug already exists.'));
    if(code==='ER_ROW_IS_REFERENCED_2'||code==='ER_NO_REFERENCED_ROW_2')return failure(new ApiError(409,'This record is linked to other data. Review those records before changing it.'));
    return failure(error);
  }
}

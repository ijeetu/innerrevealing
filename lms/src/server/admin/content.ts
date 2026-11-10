import { RowDataPacket } from 'mysql2/promise';
import { database } from '../db';
import { ApiError } from '../errors';
import { getPublicSettings } from '../catalogue';
import { normalizeEmail } from '../request';
import { notify } from '../notifications';
import {
  AdminActor, adminList, audit, booleanValue, enumValue, getRow, idValue, insertRow, integerValue,
  optionalText, safeContent, safeHttps, searchClause, slugValue, textValue, transaction, updateRow,
} from './core';

export async function dashboard() {
  const [rows] = await database().execute<RowDataPacket[]>(`SELECT
    (SELECT COUNT(*) FROM ir_courses) AS courses,
    (SELECT COUNT(*) FROM ir_courses WHERE status='published') AS published_courses,
    (SELECT COUNT(*) FROM ir_users WHERE role='student' AND is_active=1) AS learners,
    (SELECT COUNT(*) FROM ir_enrollments WHERE status='active') AS active_enrollments,
    (SELECT COUNT(*) FROM ir_orders WHERE status IN ('pending','awaiting_review')) AS pending_orders,
    (SELECT COUNT(*) FROM ir_contacts WHERE status='new') AS unread_contacts`);
  const counts = Object.fromEntries(Object.entries(rows[0]).map(([key,value]) => [key,Number(value)]));
  const [orders] = await database().execute<RowDataPacket[]>(`SELECT o.*,u.name AS user_name,u.email AS user_email,
    (SELECT GROUP_CONCAT(i.title_snapshot SEPARATOR ', ') FROM ir_order_items i WHERE i.order_id=o.id) AS course_title
    FROM ir_orders o JOIN ir_users u ON u.id=o.user_id ORDER BY o.created_at DESC,o.id DESC LIMIT 8`);
  return { counts, recent_orders: orders };
}

export async function settingsAdmin(method: string, body: Record<string, unknown>, actor: AdminActor) {
  if (method === 'GET') return getPublicSettings();
  if (!['PATCH','PUT'].includes(method)) throw new ApiError(405, 'This method is not supported.');
  const values: Record<string, unknown> = {};
  for (const [key,value] of Object.entries(body)) {
    if (['app_name','web_name','contact_address','footer_description','announcement_bar','instructor_response_hours','currency_symbol'].includes(key)) values[key] = textValue(value,key,key === 'footer_description' ? 2000 : 1000,false);
    else if (key === 'contact_email') values[key] = normalizeEmail(value);
    else if (key === 'contact_phone') {
      const phone = textValue(value,'Phone',30);
      if (!/^\+?[\d ()-]{7,30}$/.test(phone)) throw new ApiError(422,'Enter a valid phone number.');
      values[key] = phone;
    } else if (['system_color','system_light_colour','hover_color'].includes(key)) {
      if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) throw new ApiError(422,'Use a six-digit hexadecimal color.');
      values[key] = value;
    } else if (['website_url','horizontal_logo','vertical_logo','favicon','placeholder_image'].includes(key)) {
      values[key] = safeHttps(value,key,key !== 'website_url');
      const mediaPath = String(values[key]);
      if (mediaPath.startsWith('/api/media/')) {
        const media = await getRow('ir_media',idValue(mediaPath.split('/').pop()));
        if (!media.is_public || media.kind !== 'image') throw new ApiError(422,'Choose a public uploaded image.');
      }
    } else if (key === 'website_copyright') values[key] = safeContent(value,'Copyright',5000);
    else if (key === 'maintaince_mode') values[key] = booleanValue(value) ? '1' : '0';
    else if (key === 'refund_enabled' || key === 'refund_period_days') {
      if(actor.role!=='superadmin')throw new ApiError(403,'Only the centre owner can change refund policy.');
      values[key]=key==='refund_enabled'?(booleanValue(value)?'1':'0'):String(integerValue(value,'Refund period',0,3650));
    }
    else if (key === 'currency_code') {
      if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(value)) throw new ApiError(422,'Use a three-letter currency code.');
      values[key] = value;
    } else if (key === 'social_media') {
      if (!Array.isArray(value) || value.length > 8) throw new ApiError(422,'Provide at most eight social links.');
      values[key] = value.map((social,index) => {
        if (!social || typeof social !== 'object') throw new ApiError(422,'Invalid social link.');
        return { id:index+1,name:textValue(social.name,'Social name',40),icon:'',url:safeHttps(social.url,'Social link') };
      });
    }
  }
  if (!Object.keys(values).length) throw new ApiError(422,'No supported settings were provided.');
  return transaction(async connection => {
    const [rows] = await connection.execute<RowDataPacket[]>("SELECT setting_value FROM ir_settings WHERE setting_key='web' FOR UPDATE");
    const current = typeof rows[0]?.setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0]?.setting_value || {};
    const next = { ...current,...values };
    await connection.execute("INSERT INTO ir_settings(setting_key,setting_value) VALUES('web',?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",[JSON.stringify(next)]);
    await audit(connection,actor,'settings.update','settings','web',{ fields:Object.keys(values) });
    return next;
  });
}

async function categoryAdmin(method: string,id: number|null,body: Record<string,unknown>,actor: AdminActor,params: URLSearchParams) {
  if (method === 'GET' && !id) return adminList('ir_categories','*',params,'',[],'id ASC');
  if (method === 'GET' && id) return getRow('ir_categories',id);
  if (!id || !['PATCH','PUT'].includes(method)) throw new ApiError(405,'Edit the three existing practice areas.');
  return transaction(async connection => {
    const category = await getRow('ir_categories',id,connection,true);
    const values: Record<string,unknown> = {};
    if (body.name !== undefined) values.name = textValue(body.name,'Category name',100);
    if (body.slug !== undefined) { const slug = slugValue(body.slug);if(slug.length>120)throw new ApiError(422,'Category slug is too long.');values.slug=slug; }
    if (body.description !== undefined) values.description=optionalText(body.description,'Description',5000);
    if (body.image !== undefined) values.image=safeHttps(body.image,'Category image',true);
    if (body.is_active !== undefined) values.is_active=booleanValue(body.is_active);
    if (values.is_active === false && category.is_active) {
      const [courses] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) AS total FROM ir_courses WHERE category_id=? AND status='published'",[id]);
      if(Number(courses[0].total))throw new ApiError(409,'Move published practices to another category before disabling this area.');
    }
    await updateRow('ir_categories',id,values,connection);
    await audit(connection,actor,'category.update','category',id,{ fields:Object.keys(values) });
    return getRow('ir_categories',id,connection);
  });
}

function pageValues(body: Record<string,unknown>,create: boolean) {
  const values:Record<string,unknown>={};
  if(create||body.title!==undefined)values.title=textValue(body.title,'Page title',200);
  if(create||body.slug!==undefined)values.slug=slugValue(body.slug);
  if(create||body.content!==undefined)values.content=safeContent(body.content,'Page content');
  if(create||body.status!==undefined)values.status=enumValue(body.status||'draft',['draft','published'],'page status');
  return values;
}

function faqValues(body: Record<string,unknown>,create: boolean) {
  const values:Record<string,unknown>={};
  if(create||body.question!==undefined)values.question=textValue(body.question,'Question',300);
  if(create||body.answer!==undefined)values.answer=safeContent(body.answer,'Answer',50000);
  if(create||body.position!==undefined)values.position=integerValue(body.position,'Position');
  if(create||body.is_published!==undefined)values.is_published=booleanValue(body.is_published);
  return values;
}

async function contentCrud(kind:'pages'|'faqs',method:string,id:number|null,body:Record<string,unknown>,actor:AdminActor,params:URLSearchParams) {
  const table=kind==='pages'?'ir_pages':'ir_faqs';
  if(method==='GET'&&!id) {
    const search=searchClause(params,kind==='pages'?['title','slug']:['question','answer']);
    let where=search.where;
    const values:(string|number)[]=[...search.values];
    if(params.get('status')) {
      where+=`${where?' AND':'WHERE'} ${kind==='pages'?'status':'is_published'}=?`;
      values.push(kind==='pages'?enumValue(params.get('status'),['draft','published'],'status'):(params.get('status')==='published'?1:0));
    }
    return adminList(table,'*',params,where,values,kind==='pages'?'updated_at DESC,id DESC':'position ASC,id ASC');
  }
  if(method==='GET'&&id)return getRow(table,id);
  if((method==='POST'&&!id)||(['PATCH','PUT'].includes(method)&&id))return transaction(async connection=>{
    const existing=id?await getRow(table,id,connection,true):null;
    const values=kind==='pages'?pageValues(body,!id):faqValues(body,!id);
    const final={...existing,...values};
    if((final.status==='published'||final.is_published)&&!(String(kind==='pages'?final.content:final.answer).replace(/<[^>]*>/g,'').trim()))throw new ApiError(422,'Add content before publishing.');
    const recordId=id||await insertRow(table,values,connection);
    if(id)await updateRow(table,id,values,connection);
    await audit(connection,actor,`${kind}.${id?'update':'create'}`,kind,recordId,{ fields:Object.keys(values) });
    return getRow(table,recordId,connection);
  });
  if(method==='DELETE'&&id)return transaction(async connection=>{
    await getRow(table,id,connection,true);
    await connection.execute(`DELETE FROM ${table} WHERE id=?`,[id]);
    await audit(connection,actor,`${kind}.delete`,kind,id);
    return {deleted:true};
  });
  throw new ApiError(405,'This method is not supported.');
}

async function enrollmentAdmin(method:string,id:number|null,body:Record<string,unknown>,actor:AdminActor,params:URLSearchParams) {
  if(method==='GET'&&!id) {
    const search=searchClause(params,['u.name','u.email','c.title']);
    let where=search.where;
    const values:(string|number)[]=[...search.values];
    if(params.get('status')) {where+=`${where?' AND':'WHERE'} e.status=?`;values.push(enumValue(params.get('status'),['active','revoked'],'enrollment status'));}
    return adminList('ir_enrollments e JOIN ir_users u ON u.id=e.user_id JOIN ir_courses c ON c.id=e.course_id','e.*,u.name AS user_name,u.email AS user_email,c.title AS course_title,c.slug AS course_slug',params,where,values,'e.created_at DESC,e.id DESC');
  }
  if(method==='POST'&&!id)return transaction(async connection=>{
    const userId=idValue(body.user_id,'user');const courseId=idValue(body.course_id,'course');
    const user=await getRow('ir_users',userId,connection);const course=await getRow('ir_courses',courseId,connection);
    if(!user.is_active)throw new ApiError(422,'Activate the learner before granting access.');
    if(course.status!=='published')throw new ApiError(422,'Publish the practice before granting learner access.');
    const [existing]=await connection.execute<RowDataPacket[]>('SELECT status FROM ir_enrollments WHERE user_id=? AND course_id=?',[userId,courseId]);
    await connection.execute("INSERT INTO ir_enrollments(user_id,course_id,status,source,granted_by) VALUES(?,?,'active','admin',?) ON DUPLICATE KEY UPDATE status='active',source='admin',granted_by=VALUES(granted_by)",[userId,courseId,actor.id]);
    const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_enrollments WHERE user_id=? AND course_id=?',[userId,courseId]);
    await audit(connection,actor,'enrollment.grant','enrollment',rows[0].id,{user_id:userId,course_id:courseId});
    if(existing[0]?.status!=='active')await notify(connection,userId,{title:'Practice access granted',message:`You now have access to ${course.title}.`,url:`/learn/${course.slug}`});
    return rows[0];
  });
  if(id&&['PATCH','PUT','DELETE'].includes(method))return transaction(async connection=>{
    const existing=await getRow('ir_enrollments',id,connection,true);
    const status=method==='DELETE'?'revoked':enumValue(body.status,['active','revoked'],'enrollment status');
    await connection.execute('UPDATE ir_enrollments SET status=?,granted_by=? WHERE id=?',[status,actor.id,id]);
    await audit(connection,actor,status==='active'?'enrollment.grant':'enrollment.revoke','enrollment',id);
    if(existing.status!==status) {
      const course=await getRow('ir_courses',Number(existing.course_id),connection);
      await notify(connection,Number(existing.user_id),{title:status==='active'?'Practice access granted':'Practice access updated',message:status==='active'?`You now have access to ${course.title}.`:`Your access to ${course.title} has been revoked. Contact the centre if you have questions.`,url:status==='active'?`/learn/${course.slug}`:'/contact-us'});
    }
    return getRow('ir_enrollments',id,connection);
  });
  throw new ApiError(405,'This method is not supported.');
}

export async function contentAdmin(method:string,parts:string[],body:Record<string,unknown>,actor:AdminActor,params:URLSearchParams):Promise<unknown> {
  const id=parts[1]?idValue(parts[1]):null;
  if(parts[0]==='categories')return categoryAdmin(method,id,body,actor,params);
  if(parts[0]==='pages'||parts[0]==='faqs')return contentCrud(parts[0],method,id,body,actor,params);
  if(parts[0]==='enrollments')return enrollmentAdmin(method,id,body,actor,params);
  if(parts[0]==='languages'&&method==='GET')return adminList('ir_languages','id,name,code,is_default,is_active',params,'',[],'id ASC');
  if(parts[0]==='contacts') {
    if(method==='GET'&&!id) {
      const search=searchClause(params,['name','email','subject','message']);
      let where=search.where;const values:(string|number)[]=[...search.values];
      if(params.get('status')){where+=`${where?' AND':'WHERE'} status=?`;values.push(enumValue(params.get('status'),['new','read','replied','archived'],'message status'));}
      return adminList('ir_contacts','*',params,where,values,'created_at DESC,id DESC');
    }
    if(method==='GET'&&id)return getRow('ir_contacts',id);
    if(['PATCH','PUT'].includes(method)&&id)return transaction(async connection=>{
      await getRow('ir_contacts',id,connection,true);
      const status=enumValue(body.status,['new','read','replied','archived'],'message status');
      await connection.execute('UPDATE ir_contacts SET status=? WHERE id=?',[status,id]);
      await audit(connection,actor,'contact.status','contact',id,{status});
      return getRow('ir_contacts',id,connection);
    });
    if(method==='DELETE'&&id)return transaction(async connection=>{
      await getRow('ir_contacts',id,connection,true);
      await connection.execute('DELETE FROM ir_contacts WHERE id=?',[id]);
      await audit(connection,actor,'contact.delete','contact',id);
      return {deleted:true};
    });
  }
  if(parts[0]==='audit'&&method==='GET') {
    const search=searchClause(params,['u.name','a.action','a.entity_type','a.entity_id']);
    return adminList('ir_audit_log a LEFT JOIN ir_users u ON u.id=a.actor_id','a.*,u.name AS actor_name',params,search.where,search.values,'a.created_at DESC,a.id DESC');
  }
  throw new ApiError(404,'This administration endpoint does not exist.');
}

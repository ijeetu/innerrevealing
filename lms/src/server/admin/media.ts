import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir,stat,unlink,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { RowDataPacket } from 'mysql2/promise';
import { getSessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { failure } from '../response';
import { AdminActor,adminList,audit,getRow,idValue,insertRow,transaction } from './core';
import { detectMedia,parseByteRange } from './media-types';

function uploadDirectory():string {
  return path.resolve(process.env.UPLOAD_DIR||'/home/innerrevealing/uploads');
}

function storagePath(name:string):string {
  if(!/^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(name))throw new ApiError(404,'The media file was not found.');
  const directory=uploadDirectory();const filename=path.resolve(directory,name);
  if(!filename.startsWith(directory+path.sep))throw new ApiError(404,'The media file was not found.');
  return filename;
}

function publicMetadata(row:RowDataPacket) {
  return {id:Number(row.id),original_name:row.original_name,mime_type:row.mime_type,byte_size:Number(row.byte_size),size_bytes:Number(row.byte_size),kind:row.kind,is_public:Boolean(row.is_public),uploaded_by:row.uploaded_by,created_at:row.created_at,url:`/api/media/${row.id}`};
}

export async function uploadMedia(request:Request,actor:AdminActor) {
  const maximum=Math.min(512,Math.max(1,Number(process.env.UPLOAD_MAX_MB)||50))*1024*1024;
  const length=Number(request.headers.get('content-length'));
  if(!length||!Number.isFinite(length))throw new ApiError(411,'A known upload size is required.');
  if(length>maximum+1024*1024)throw new ApiError(413,`Uploads must be ${Math.floor(maximum/1024/1024)} MB or smaller.`);
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))throw new ApiError(415,'Use a multipart file upload.');
  const form=await request.formData();const file=form.get('file');
  if(!file||typeof file==='string'||typeof file.arrayBuffer!=='function')throw new ApiError(422,'Choose a file to upload.');
  if(!file.size||file.size>maximum)throw new ApiError(413,`Uploads must be nonempty and ${Math.floor(maximum/1024/1024)} MB or smaller.`);
  const data=Buffer.from(await file.arrayBuffer());const format=detectMedia(data,file.type);
  const purpose=form.get('purpose')||'course';
  if(!['image','course'].includes(String(purpose)))throw new ApiError(422,'Choose image or course as the upload purpose.');
  if(purpose==='image'&&format.kind!=='image')throw new ApiError(422,'A public image upload must be an image file.');
  const name=randomUUID()+'.'+format.extension;
  const original=String(file.name||'upload').replace(/[\u0000-\u001f\u007f\\/]/g,'_').slice(0,255);
  await mkdir(uploadDirectory(),{recursive:true,mode:0o700});
  const filename=storagePath(name);
  await writeFile(filename,data,{flag:'wx',mode:0o600});
  try {
    return await transaction(async connection=>{
      const id=await insertRow('ir_media',{storage_name:name,original_name:original,mime_type:format.mime,byte_size:data.length,kind:format.kind,is_public:purpose==='image',uploaded_by:actor.id},connection);
      await audit(connection,actor,'media.upload','media',id,{kind:format.kind,byte_size:data.length,is_public:purpose==='image'});
      return publicMetadata(await getRow('ir_media',id,connection));
    });
  } catch(error) {await unlink(filename).catch(()=>{});throw error;}
}

export async function mediaAdmin(method:string,parts:string[],actor:AdminActor,params:URLSearchParams):Promise<unknown> {
  const id=parts[1]?idValue(parts[1]):null;
  if(method==='GET'&&!id) {
    const list=await adminList('ir_media','*',params,'',[],'created_at DESC,id DESC');
    return {...list,items:list.items.map(publicMetadata)};
  }
  if(method==='GET'&&id)return publicMetadata(await getRow('ir_media',id));
  if(method==='DELETE'&&id) {
    let filename='';
    const result=await transaction(async connection=>{
      const media=await getRow('ir_media',id,connection,true);filename=storagePath(media.storage_name);
      const url=`/api/media/${id}`;
      const [refs]=await connection.execute<RowDataPacket[]>('SELECT (SELECT COUNT(*) FROM ir_lessons WHERE media_id=?) + (SELECT COUNT(*) FROM ir_courses WHERE image=?) + (SELECT COUNT(*) FROM ir_categories WHERE image=?) + (SELECT COUNT(*) FROM ir_settings WHERE setting_key=\'web\' AND JSON_SEARCH(setting_value,\'one\',?) IS NOT NULL) AS total',[id,url,url,url]);
      if(Number(refs[0].total))throw new ApiError(409,'Remove this file from lessons and site content before deleting it.');
      await connection.execute('DELETE FROM ir_media WHERE id=?',[id]);
      await audit(connection,actor,'media.delete','media',id);
      return {deleted:true};
    });
    await unlink(filename).catch(()=>{});
    return result;
  }
  throw new ApiError(405,'This media operation is not supported.');
}

export async function serveMedia(request:Request,id:number):Promise<Response> {
  try {
    const media=await getRow('ir_media',id);
    if(!media.is_public) {
      const user=await getSessionUser(request);
      let allowed=user?.role==='admin'||user?.role==='superadmin';
      if(!allowed) {
        const [previews]=await database().execute<RowDataPacket[]>(`SELECT l.id FROM ir_lessons l JOIN ir_courses c ON c.id=l.course_id WHERE l.media_id=? AND l.is_published=1 AND l.is_preview=1 AND c.status='published' LIMIT 1`,[id]);
        allowed=Boolean(previews.length);
      }
      if(!allowed&&user) {
        const [access]=await database().execute<RowDataPacket[]>(`SELECT e.id FROM ir_enrollments e JOIN ir_courses c ON c.id=e.course_id JOIN ir_lessons l ON l.course_id=c.id WHERE l.media_id=? AND l.is_published=1 AND c.status='published' AND e.user_id=? AND e.status='active' LIMIT 1`,[id,user.id]);
        allowed=Boolean(access.length);
      }
      if(!allowed)throw new ApiError(user?403:401,'Enroll in this practice to access its media.');
    }
    const filename=storagePath(media.storage_name);
    const info=await stat(filename).catch(()=>{throw new ApiError(404,'The media file was not found.');});
    if(!info.isFile())throw new ApiError(404,'The media file was not found.');
    const headers=new Headers({
      'Content-Type':media.mime_type,'X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes',
      'Cache-Control':media.is_public?'public, max-age=86400':'private, no-store',
      'Content-Security-Policy':"frame-ancestors 'self'",
      'Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(media.original_name).replace(/['()*]/g,character=>'%'+character.charCodeAt(0).toString(16))}`,
    });
    let range;
    try {range=parseByteRange(request.headers.get('range'),info.size);}
    catch(error) {
      if(error instanceof ApiError&&error.status===416)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${info.size}`,'Cache-Control':'no-store'}});
      throw error;
    }
    const start=range?.start||0;const end=range?.end??info.size-1;
    headers.set('Content-Length',String(end-start+1));
    if(range)headers.set('Content-Range',`bytes ${start}-${end}/${info.size}`);
    if(request.method==='HEAD')return new Response(null,{status:range?206:200,headers});
    const stream=Readable.toWeb(createReadStream(filename,{start,end}));
    return new Response(stream as ReadableStream<Uint8Array>,{status:range?206:200,headers});
  } catch(error) {return failure(error);}
}

import { randomUUID } from 'node:crypto';
import { mkdir,readFile,writeFile,unlink } from 'node:fs/promises';
import path from 'node:path';
import { RowDataPacket } from 'mysql2/promise';
import { database } from '../db';
import { SessionUser } from '../auth';
import { ApiError } from '../errors';
import { detectMedia,parseByteRange } from '../admin/media-types';
import { ownedCourse } from './support';
const directory=()=>path.resolve(process.env.UPLOAD_DIR||'/home/innerrevealing/uploads','refund-evidence');
function filename(name:string){if(!/^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(name))throw new ApiError(404,'Attachment not found.');return path.join(directory(),name);}
export async function saveEvidence(value:unknown):Promise<{name:string;mime:string}|undefined>{
  if(!value||typeof value==='string')return undefined;
  const file=value as File;if(typeof file.arrayBuffer!=='function'||!file.size)return undefined;if(file.size>5*1024*1024)throw new ApiError(413,'Refund attachments must be 5 MB or smaller.');
  const bytes=Buffer.from(await file.arrayBuffer()),format=detectMedia(bytes,file.type),name=randomUUID()+'.'+format.extension;
  await mkdir(directory(),{recursive:true,mode:0o700});await writeFile(filename(name),bytes,{mode:0o600,flag:'wx'});return {name,mime:format.mime};
}
export async function removeEvidence(name:string){await unlink(filename(name)).catch(()=>{});}
export async function serveEvidence(request:Request,user:SessionUser,id:number):Promise<Response>{
  const [rows]=await database().execute<RowDataPacket[]>('SELECT user_id,course_id,evidence_name,evidence_mime FROM ir_refund_requests WHERE id=?',[id]);const row=rows[0];if(!row?.evidence_name)throw new ApiError(404,'Attachment not found.');
  if(Number(row.user_id)!==user.id){if(!['admin','superadmin'].includes(user.role))throw new ApiError(403,'This attachment is private.');await ownedCourse(user,row.course_id);}
  const bytes=await readFile(filename(row.evidence_name)),range=parseByteRange(request.headers.get('range'),bytes.length),start=range?.start||0,end=range?.end??bytes.length-1;
  return new Response(request.method==='HEAD'?null:new Uint8Array(bytes.subarray(start,end+1)),{status:range?206:200,headers:{'Content-Type':row.evidence_mime,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes',...(range?{'Content-Range':`bytes ${start}-${end}/${bytes.length}`}:{ }),'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"frame-ancestors 'self'"}});
}

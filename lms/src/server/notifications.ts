import { Pool,PoolConnection,ResultSetHeader,RowDataPacket } from 'mysql2/promise';
import { database } from './db';
import { ApiError } from './errors';
import { pageOptions,paginate } from './catalogue';

export async function notify(connection:Pool|PoolConnection,userId:number,input:{title:string;message:string;url?:string}) {
  if(!input.title.trim()||input.title.length>200||input.message.length>10000)throw new Error('Invalid internal notification.');
  const url=input.url||null;
  if(url&&(url.length>500||/[\r\n]/.test(url)||(!(url.startsWith('/')&&!url.startsWith('//'))&&!/^https:\/\//.test(url))))throw new Error('Invalid internal notification URL.');
  await connection.execute('INSERT INTO ir_notifications(user_id,title,message,url) VALUES(?,?,?,?)',[userId,input.title,input.message,url]);
}

export async function getNotifications(userId:number,params:URLSearchParams) {
  const {page,perPage}=pageOptions(params);
  const [counts]=await database().execute<RowDataPacket[]>('SELECT COUNT(*) AS total,COALESCE(SUM(is_read=0),0) AS unread_count FROM ir_notifications WHERE user_id=?',[userId]);
  const [rows]=await database().execute<RowDataPacket[]>(`SELECT * FROM ir_notifications WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT ${perPage} OFFSET ${(page-1)*perPage}`,[userId]);
  const items=rows.map(row=>({
    id:String(row.id),type:'personal',title:row.title,message:row.message,notification_type:'url',type_id:null,
    type_link:row.url,slug:null,image:null,date_sent:row.created_at,date_sent_formatted:row.created_at,
    time_ago:'',is_read:Boolean(row.is_read),read_at:null,invitation_status:null,instructor_details:null,team_members:null,
  }));
  return {...paginate(items,Number(counts[0].total),page,perPage,'/api/notifications'),unread_count:Number(counts[0].unread_count)};
}

export async function markRead(userId:number,id?:number) {
  if(id!==undefined&&(!Number.isSafeInteger(id)||id<1))throw new ApiError(422,'Invalid notification.');
  const [result]=await database().execute<ResultSetHeader>(`UPDATE ir_notifications SET is_read=1 WHERE user_id=? AND is_read=0${id===undefined?'':' AND id=?'}`,id===undefined?[userId]:[userId,id]);
  return {updated:result.affectedRows};
}

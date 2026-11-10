import { randomBytes } from 'node:crypto';
import { RowDataPacket,ResultSetHeader } from 'mysql2/promise';
import { database } from '../db';
import { SessionUser } from '../auth';
import { ApiError } from '../errors';
import { normalizeEmail } from '../request';
import { audit,idValue,transaction } from '../admin/core';
import { paginate,pageOptions } from '../catalogue';
import { notify } from '../notifications';
import { ownedCourse } from './support';

export async function teamOperation(user:SessionUser,method:string,path:string,params:URLSearchParams,body:Record<string,unknown>) {
  if(path==='invitors') {
    const [rows]=await database().execute<RowDataPacket[]>("SELECT t.*,u.name,u.email,u.created_at instructor_created FROM ir_team_invitations t JOIN ir_users u ON u.id=t.inviter_id WHERE t.invitee_user_id=? AND t.status IN ('pending','accepted') AND u.is_active=1 ORDER BY t.id DESC",[user.id]);
    return rows.map(row=>({...row,id:Number(row.id),user_id:user.id,instructor_id:Number(row.inviter_id),instructor:{id:Number(row.inviter_id),name:row.name,email:row.email,slug:`learner-${row.inviter_id}`,profile:'',is_active:1,created_at:row.instructor_created,instructor_status:'approved',instructor_type:'team'}}));
  }
  if(path==='accept-team-invitation') {
    if(!['accept','reject'].includes(String(body.action)))throw new ApiError(422,'Choose accept or reject.');
    return transaction(async connection=>{const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_team_invitations WHERE invitation_token=? AND invitee_user_id=? FOR UPDATE',[String(body.invitation_token||''),user.id]);const row=rows[0];if(!row||row.status==='removed')throw new ApiError(404,'This invitation is not available.');const [staff]=await connection.execute<RowDataPacket[]>('SELECT role,is_active,email FROM ir_users WHERE id=? FOR UPDATE',[user.id]);if(!staff[0]?.is_active||!['admin','superadmin'].includes(staff[0].role)||staff[0].email!==row.invitee_email)throw new ApiError(403,'Only the invited active staff account can accept this invitation.');const status=body.action==='accept'?'accepted':'rejected';await connection.execute('UPDATE ir_team_invitations SET status=? WHERE id=?',[status,row.id]);await audit(connection,user,'team.'+status,'team_invitation',row.id);await notify(connection,Number(row.inviter_id),{title:'Teaching invitation '+status,message:`${user.name} has ${status} your teaching invitation.`,url:'/instructor/team-member'});return {id:Number(row.id),status};});
  }
  if(method==='GET') {
    const [rows]=await database().execute<RowDataPacket[]>(`SELECT t.*,u.name,u.email,u.created_at user_created,u.is_active FROM ir_team_invitations t JOIN ir_users u ON u.id=t.invitee_user_id WHERE t.inviter_id=? AND t.status<>'removed'${params.get('search')?' AND (u.name LIKE ? OR u.email LIKE ?)':''} ORDER BY t.id DESC`,params.get('search')?[user.id,'%'+params.get('search')+'%','%'+params.get('search')+'%']:[user.id]);
    const items=await Promise.all(rows.map(async row=>{const [courses]=await database().execute<RowDataPacket[]>('SELECT c.* FROM ir_team_course_members m JOIN ir_courses c ON c.id=m.course_id WHERE m.invitation_id=?',[row.id]);return {id:Number(row.id),instructor_id:user.id,user_id:Number(row.invitee_user_id),status:row.status,member_role:row.member_role,created_at:row.created_at,updated_at:row.updated_at,deleted_at:null,user:{id:Number(row.invitee_user_id),name:row.name,email:row.email,slug:`learner-${row.invitee_user_id}`,profile:'',is_active:!!row.is_active,created_at:row.user_created,instructor_status:'approved'},courses:courses.map(c=>({...c,id:Number(c.id),thumbnail:c.image,discount_price:null,is_active:c.status==='published',user_id:Number(c.instructor_id)})),total_courses:courses.length};}));
    const {page,perPage}=pageOptions(params);return paginate(items.slice((page-1)*perPage,page*perPage),items.length,page,perPage,'/api/team-members');
  }
  if(path.startsWith('team-members/')&&path.endsWith('/courses')) {
    const id=idValue(path.split('/')[1]);const ids=Array.isArray(body.course_ids)?[...new Set(body.course_ids.map(value=>idValue(value)))]:[];if(ids.length>200)throw new ApiError(422,'Assign at most 200 courses.');
    for(const courseId of ids)await ownedCourse(user,courseId);
    return transaction(async connection=>{const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_team_invitations WHERE id=? AND inviter_id=? FOR UPDATE',[id,user.id]);if(!rows[0]||rows[0].status!=='accepted')throw new ApiError(404,'Choose an accepted team member.');if(body.member_role!==undefined){if(!['assistant','editor'].includes(String(body.member_role)))throw new ApiError(422,'Choose assistant or editor access.');await connection.execute('UPDATE ir_team_invitations SET member_role=? WHERE id=?',[String(body.member_role),id]);}await connection.execute('DELETE FROM ir_team_course_members WHERE invitation_id=?',[id]);for(const courseId of ids)await connection.execute('INSERT INTO ir_team_course_members(invitation_id,course_id) VALUES(?,?)',[id,courseId]);await audit(connection,user,'team.assign','team_invitation',id,{course_ids:ids});return {id,course_ids:ids};});
  }
  const email=normalizeEmail(body.member_email);
  if(method==='DELETE') {
    const target=idValue(params.get('user_id')||body.user_id);const [result]=await database().execute<ResultSetHeader>("UPDATE ir_team_invitations SET status='removed' WHERE inviter_id=? AND invitee_user_id=?",[user.id,target]);if(!result.affectedRows)throw new ApiError(404,'Team member not found.');await database().execute('DELETE m FROM ir_team_course_members m JOIN ir_team_invitations t ON t.id=m.invitation_id WHERE t.inviter_id=? AND t.invitee_user_id=?',[user.id,target]);return {removed:true};
  }
  return transaction(async connection=>{
    const [targets]=await connection.execute<RowDataPacket[]>('SELECT id,role,is_active FROM ir_users WHERE email=? FOR UPDATE',[email]);const target=targets[0];if(!target||!target.is_active||!['admin','superadmin'].includes(target.role))throw new ApiError(422,'Invite an active staff account. The owner can create or promote staff in user management.');if(Number(target.id)===user.id)throw new ApiError(422,'Choose another staff member.');
    const [existing]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_team_invitations WHERE inviter_id=? AND invitee_email=? FOR UPDATE',[user.id,email]);if(existing[0]&&['pending','accepted'].includes(existing[0].status))throw new ApiError(409,'This staff member has already been invited.');
    const token=randomBytes(32).toString('hex');let id=existing[0]?.id;
    if(id)await connection.execute("UPDATE ir_team_invitations SET status='pending',invitation_token=?,invitee_user_id=? WHERE id=?",[token,target.id,id]);else{const [result]=await connection.execute<ResultSetHeader>('INSERT INTO ir_team_invitations(inviter_id,invitee_email,invitation_token,invitee_user_id) VALUES(?,?,?,?)',[user.id,email,token,target.id]);id=result.insertId;}
    await audit(connection,user,'team.invite','team_invitation',id,{invitee_id:target.id});await notify(connection,Number(target.id),{title:'Teaching team invitation',message:`${user.name} invited you to collaborate on teaching courses.`,url:'/instructor/team-member'});return {id:Number(id),status:'pending'};
  });
}

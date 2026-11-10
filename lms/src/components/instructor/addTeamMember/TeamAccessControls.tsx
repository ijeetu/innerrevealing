"use client";
import {useEffect,useState} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import {webRequest} from '@/utils/webApi';
import toast from 'react-hot-toast';
import type {TeamMemberDataType} from '@/utils/api/instructor/team-member/getTeamMembers';
interface Invitation{id:number;status:string;invitation_token:string;instructor:{name:string}}
export function IncomingTeamInvitations(){
 const [rows,setRows]=useState<Invitation[]>([]),[busy,setBusy]=useState(false);
 const load=()=>webRequest<Invitation[]>('/api/invitors').then(value=>setRows(value.filter(row=>row.status==='pending')));
 useEffect(()=>{void load().catch(()=>{});},[]);
 const answer=async(row:Invitation,action:string)=>{setBusy(true);try{await webRequest('/api/accept-team-invitation',{method:'POST',body:{action,invitation_token:row.invitation_token}});await load();toast.success('Invitation updated.');}catch(error){toast.error(error instanceof Error?error.message:'Could not update invitation.');}finally{setBusy(false);}};
 return rows.length?<div className="mb-6 bg-white rounded-2xl p-5 border borderColor space-y-4"><h2 className="font-semibold">Teaching invitations received</h2>{rows.map(row=><div key={row.id} className="flex items-center justify-between gap-4 flex-wrap"><p>{row.instructor.name} invited you to teach together.</p><div className="flex gap-3"><button disabled={busy} onClick={()=>answer(row,'accept')} className="commonBtn">Accept</button><button disabled={busy} onClick={()=>answer(row,'reject')} className="text-sm underline">Decline</button></div></div>)}</div>:null;
}
export function TeamCourseAccess({member,onSaved}:{member:TeamMemberDataType;onSaved:()=>void}){
 const [open,setOpen]=useState(false),[courses,setCourses]=useState<{id:number;name:string}[]>([]),[selected,setSelected]=useState<number[]>(member.courses.map(course=>course.id)),[role,setRole]=useState((member as TeamMemberDataType&{member_role?:string}).member_role||'editor'),[busy,setBusy]=useState(false);
 useEffect(()=>{if(open)void webRequest<{id:number;name:string}[]>('/api/get-courses-for-coupon').then(setCourses).catch(error=>toast.error(error.message));},[open]);
 const save=async()=>{setBusy(true);try{await webRequest(`/api/team-members/${member.id}/courses`,{method:'POST',body:{course_ids:selected,member_role:role}});toast.success('Course access updated.');setOpen(false);onSaved();}catch(error){toast.error(error instanceof Error?error.message:'Could not assign courses.');}finally{setBusy(false);}};
 return member.status==='accepted'?<Dialog open={open} onOpenChange={setOpen}><DialogTrigger className="text-sm primaryColor underline mr-3">Assign courses</DialogTrigger><DialogContent className="max-h-[80vh] overflow-auto"><DialogHeader><DialogTitle>Course access for {member.user.name}</DialogTitle></DialogHeader><label className="space-y-2 text-sm">Teaching access<select className="block border borderColor rounded p-2 w-full" value={role} onChange={event=>setRole(event.target.value)}><option value="editor">Editor · edit assigned courses</option><option value="assistant">Assistant · team membership only</option></select></label><div className="space-y-3">{courses.map(course=><label key={course.id} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={selected.includes(course.id)} onChange={event=>setSelected(values=>event.target.checked?[...values,course.id]:values.filter(id=>id!==course.id))}/>{course.name}</label>)}</div><button onClick={save} disabled={busy} className="commonBtn">{busy?'Saving…':'Save assignments'}</button></DialogContent></Dialog>:null;
}

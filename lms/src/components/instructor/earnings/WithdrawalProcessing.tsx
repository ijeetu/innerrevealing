"use client";
import {useState} from 'react';
import {useSelector} from 'react-redux';
import {userDataSelector} from '@/redux/reducers/userSlice';
import type {WithdrawalItem} from '@/utils/api/instructor/earnings/getWithdrawalHistory';
import {webRequest} from '@/utils/webApi';
import toast from 'react-hot-toast';
export default function WithdrawalProcessing({rows,onUpdated}:{rows:WithdrawalItem[];onUpdated:()=>void}){
 const user=useSelector(userDataSelector) as {role?:string},[selected,setSelected]=useState<number|null>(null),[reference,setReference]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false);
 if(user.role!=='superadmin')return null;
 const update=async(row:WithdrawalItem,status:string)=>{setBusy(true);try{await webRequest(`/api/withdrawal-history/${row.id}/respond`,{method:'POST',body:{status,reference,confirm:confirmed}});toast.success('Withdrawal record updated.');setSelected(null);setReference('');setConfirmed(false);onUpdated();}catch(error){toast.error(error instanceof Error?error.message:'Could not update withdrawal.');}finally{setBusy(false);}};
 return <div className="p-4 border-t borderColor space-y-3">{rows.filter(row=>['pending','approved'].includes(row.status)).map(row=><div key={row.id} className="rounded-lg border borderColor p-4 space-y-3"><div className="flex justify-between gap-3"><span>Withdrawal #{row.id} · {row.formatted_amount}</span><button onClick={()=>setSelected(selected===row.id?null:row.id)} className="primaryColor text-sm underline">Process request</button></div>{selected===row.id&&<><p className="text-sm text-gray-600">{row.bank_details.account_holder_name} · {row.bank_details.bank_name} · {row.bank_details.account_number}</p><input className="border borderColor rounded p-2 w-full text-sm" placeholder="Actual bank transfer reference" value={reference} onChange={event=>setReference(event.target.value)} maxLength={200}/><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/>I confirm this bank transfer has already been completed.</label><div className="flex flex-wrap gap-3"><button className="commonBtn" disabled={busy||!confirmed||!reference.trim()} onClick={()=>update(row,'paid')}>Record paid transfer</button><button disabled={busy} onClick={()=>update(row,'approved')} className="primaryColor text-sm">Approve request</button><button disabled={busy} onClick={()=>update(row,'rejected')} className="text-red-600 text-sm">Reject</button></div></>}</div>)}</div>;
}

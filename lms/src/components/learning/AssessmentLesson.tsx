'use client';
import { useEffect,useRef,useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { webRequest } from '@/utils/webApi';
import type { LessonData } from '@/types/learning';
import type { CurriculumItem } from '@/utils/api/user/getCourse';
import QuizPlay from '@/components/pagesComponent/lesson-overview/sections/courseTyes/quizPlay/QuizPlay';
import RichTextContent from '@/components/commonComp/RichText';
import { isCurriculumItemCompletedSelector,setIsCurriculumItemCompleted,setSelectedCurriculumItem } from '@/redux/reducers/helpersReducer';

interface Submission {id:number;status:string;status_label:string;comment:string|null;feedback:string|null;grade:number|null;submitted_at:string;can_edit:boolean;files:{id:number;url:string;file_name:string}[]}
interface Assignment {id:number;title:string;description:string;instructions:string;points:string;max_file_size:number;allowed_file_types:string[];media_url:string;can_skip:boolean;submissions:Submission[]}
interface Quiz {id:number;lesson_id:number;title:string;description:string;passing_score:number;total_points:number;time_limit:number;can_skip:boolean;questions:CurriculumItem['questions']}
interface AssessmentData {type:'quiz'|'assignment';quiz?:Quiz;assignment?:Assignment}

export default function AssessmentLesson({lesson,onCompleted,onNext}:{lesson:LessonData;onCompleted:()=>void;onNext:()=>void}) {
  const dispatch=useDispatch();const completion=useSelector(isCurriculumItemCompletedSelector);
  const [data,setData]=useState<AssessmentData|null>(null);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const [comment,setComment]=useState('');const [files,setFiles]=useState<File[]>([]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const reported=useRef(false);const callbacks=useRef({onCompleted,onNext});callbacks.current={onCompleted,onNext};
  const load=async()=>{
    const result=await webRequest<AssessmentData>(`/api/education/lesson/${lesson.id}`);setData(result);
    if(result.assignment){const latest=result.assignment.submissions[0];setComment(latest?.comment||'');if(latest?.status==='accepted'&&!reported.current){reported.current=true;callbacks.current.onCompleted();}}
    return result;
  };
  useEffect(()=>{
    let alive=true;reported.current=false;setData(null);setError('');setLoading(true);setMessage('');setFiles([]);
    dispatch(setIsCurriculumItemCompleted({completed:false,isNextItem:false,itemId:null}));
    webRequest<AssessmentData>(`/api/education/lesson/${lesson.id}`).then(result=>{
      if(!alive)return;setData(result);
      if(result.quiz)dispatch(setSelectedCurriculumItem({...result.quiz,type:'quiz',is_active:true,is_completed:lesson.completed,chapter_id:lesson.chapter_id,created_at:'',updated_at:''} as unknown as CurriculumItem));
      if(result.assignment){const latest=result.assignment.submissions[0];setComment(latest?.comment||'');if(latest?.status==='accepted'){reported.current=true;callbacks.current.onCompleted();}}
    }).catch(error=>{if(alive)setError(error.message);}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[lesson.id,dispatch]);
  useEffect(()=>{
    if(data?.type!=='quiz')return;
    if(completion.completed&&!reported.current){reported.current=true;callbacks.current.onCompleted();}
    if(completion.isNextItem){dispatch(setIsCurriculumItemCompleted({isNextItem:false}));callbacks.current.onNext();}
  },[completion.completed,completion.isNextItem,data?.type,dispatch]);
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();if(!data?.assignment)return;setBusy(true);setError('');setMessage('');
    try {
      const current=data.assignment.submissions[0];const editing=Boolean(current?.can_edit);
      const form=new FormData();form.set(editing?'id':'assignment_id',String(editing?current.id:data.assignment.id));form.set('comment',comment);for(const file of files)form.append('files[]',file);
      const response=await fetch(`/api/assignments/${editing?'submission':'submit'}`,{method:'POST',credentials:'same-origin',headers:{Accept:'application/json'},body:form});const result=await response.json();
      if(!response.ok||result.error)throw new Error(result.message||'Your assignment could not be submitted.');
      setFiles([]);setMessage('Your assignment is submitted. The instructor will review it.');await load();
    }catch(error){setError(error instanceof Error?error.message:'The assignment could not be submitted.');}finally{setBusy(false);}
  };
  const skip=async()=>{setBusy(true);setError('');try{await webRequest('/api/education/skip',{method:'POST',body:{lesson_id:lesson.id}});reported.current=true;onCompleted();setMessage('This assessment has been skipped as allowed by the instructor.');}catch(error){setError(error instanceof Error?error.message:'This assessment cannot be skipped.');}finally{setBusy(false);}};
  if(loading)return <p role='status'>Opening assessment…</p>;
  if(error&&!data)return <p role='alert' className='text-red-700'>{error}</p>;
  if(data?.quiz)return <div>{!lesson.enrolled?<p>Enrol in this course to take the quiz.</p>:<QuizPlay key={lesson.id}/>}</div>;
  const assignment=data?.assignment;if(!assignment)return <p>This assessment has not been configured yet.</p>;
  const latest=assignment.submissions[0];const accepted=latest?.status==='accepted';
  return <div className='space-y-6'>
    <div className='flex flex-wrap justify-between gap-3'><span className='primaryLightBg primaryColor rounded-full px-4 py-2 text-sm'>{assignment.points} points</span><button type='button' className='primaryColor underline text-sm' onClick={()=>{setBusy(true);load().catch(error=>setError(error.message)).finally(()=>setBusy(false));}} disabled={busy}>Refresh feedback</button></div>
    {assignment.description&&<RichTextContent content={assignment.description}/>}
    {assignment.instructions&&<div className='rounded-2xl sectionBg p-5'><h3 className='font-semibold mb-3'>Instructions</h3><RichTextContent content={assignment.instructions}/></div>}
    {assignment.media_url&&<a className='primaryColor underline' href={assignment.media_url} target='_blank' rel='noopener noreferrer'>Open assignment attachment</a>}
    {error&&<p role='alert' className='text-red-700'>{error}</p>}{message&&<p role='status' className='primaryColor'>{message}</p>}
    {lesson.enrolled&&!accepted&&<form onSubmit={submit} className='space-y-4 border borderColor rounded-2xl p-5'>
      <h3 className='font-semibold'>{latest?.can_edit?'Update your submission':'Submit your assignment'}</h3>
      <label className='block space-y-2'><span>Comment or written response</span><textarea value={comment} onChange={event=>setComment(event.target.value)} maxLength={10000} rows={5} className='block w-full rounded-xl border borderColor p-3'/></label>
      <label className='block space-y-2'><span>Files · up to {assignment.max_file_size} MB each</span><input type='file' multiple onChange={event=>setFiles(Array.from(event.target.files||[]))} className='block w-full'/></label>
      <p className='text-sm text-gray-500'>Allowed categories: {assignment.allowed_file_types.join(', ')}. Up to five files. PDF, Office documents, text, supported images/audio/video and archives are checked by the server.</p>
      {files.length>0&&<ul className='text-sm'>{files.map((file,index)=><li key={`${file.name}-${index}`}>{file.name}</li>)}</ul>}
      <div className='flex flex-wrap gap-3'><button className='commonBtn disabled:opacity-50' disabled={busy}>{busy?'Submitting…':'Submit for review'}</button>{assignment.can_skip&&<button type='button' className='rounded-full border borderColor px-5 py-3' disabled={busy} onClick={skip}>Skip assignment</button>}</div>
    </form>}
    {!lesson.enrolled&&<p>Enrol in this course to submit an assignment.</p>}
    {assignment.submissions.length>0&&<section className='space-y-4'><h3 className='font-semibold'>Your submissions</h3>{assignment.submissions.map(submission=><article key={submission.id} className='border borderColor rounded-2xl p-5 space-y-3'><div className='flex flex-wrap justify-between gap-3'><strong>{submission.status_label}</strong><span>{submission.grade===null?'Awaiting review':`${submission.grade} / ${assignment.points} points`}</span></div>{submission.comment&&<p className='whitespace-pre-wrap'>{submission.comment}</p>}{submission.feedback&&<div><h4 className='font-medium'>Instructor feedback</h4><RichTextContent content={submission.feedback}/></div>}{submission.files.map(file=><a key={file.id} href={file.url} target='_blank' rel='noopener noreferrer' className='block primaryColor underline'>{file.file_name}</a>)}<p className='text-xs text-gray-500'>{submission.submitted_at}</p></article>)}</section>}
  </div>;
}

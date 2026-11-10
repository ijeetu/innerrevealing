"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import Layout from '@/components/layout/Layout';
import RichTextContent from '@/components/commonComp/RichText';
import { webRequest } from '@/utils/webApi';
import type { CourseOverviewData, LessonData } from '@/types/learning';

function embedUrl(source: string): string | null {
  try {
    const url = new URL(source);
    if (['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop();
      if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* Uploaded sources are relative URLs. */ }
  return null;
}

export default function CoursePlayer({ slug }: { slug: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const loggedIn = useSelector(isLoginSelector);
  const [overview, setOverview] = useState<CourseOverviewData | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastSaved = useRef(0);
  const playbackPosition = useRef(0);
  const selected = Number(params.get('lesson')) || 0;
  useEffect(() => {
    const controller = new AbortController();
    webRequest<CourseOverviewData>(`/api/learning/course/${encodeURIComponent(slug)}`, { signal: controller.signal }).then(data => {
      setOverview(data);
      if (!selected) {
        const lessons = data.chapters.flatMap(chapter => chapter.lessons);
        const next = lessons.find(item => !data.completed_lesson_ids.includes(item.id) && (data.enrolled || data.can_manage || item.is_preview)) || lessons.find(item => data.enrolled || data.can_manage || item.is_preview);
        if (next) router.replace(`/learn/${slug}?lesson=${next.id}`);
        else { setLoading(false); setError('Enrol in this course to begin learning.'); }
      }
    }).catch(error => { if (!controller.signal.aborted) { setError(error.message); setLoading(false); } });
    return () => controller.abort();
  }, [slug, loggedIn, selected, router]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    setLesson(null); setError(''); setLoading(true); lastSaved.current = 0;
    webRequest<LessonData>(`/api/learning/lesson/${selected}`, { signal: controller.signal }).then(data => {
      if (overview && data.course_id !== overview.course.id) throw new Error('Choose a lesson from this course.');
      setLesson(data); playbackPosition.current = data.position_seconds;
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selected, overview?.course.id]);
  const recordPosition = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    if (!lesson?.enrolled) return;
    playbackPosition.current = Math.floor(event.currentTarget.currentTime);
    if (Date.now() - lastSaved.current < 15000) return;
    lastSaved.current = Date.now();
    void webRequest(`/api/learning/progress/${lesson.id}`, { method: 'POST', body: { position_seconds: playbackPosition.current } }).catch(() => {});
  };
  const markComplete = async () => {
    if (!lesson?.enrolled) return;
    setBusy(true); setError('');
    try {
      await webRequest(`/api/learning/progress/${lesson.id}`, { method: 'POST', body: { completed: !lesson.completed, position_seconds: playbackPosition.current } });
      setLesson({ ...lesson, completed: !lesson.completed });
      setOverview(previous => previous ? { ...previous, completed_lesson_ids: lesson.completed ? previous.completed_lesson_ids.filter(id => id !== lesson.id) : [...new Set([...previous.completed_lesson_ids, lesson.id])] } : previous);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save your progress.'); }
    finally { setBusy(false); }
  };
  const allLessons = overview?.chapters.flatMap(chapter => chapter.lessons) || [];
  const next = allLessons[allLessons.findIndex(item => item.id === lesson?.id) + 1];
  const embedded = lesson?.source_url ? embedUrl(lesson.source_url) : null;
  return <Layout><main className="container py-8 md:py-12 space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><Link className="primaryColor" href={`/course-details/${slug}`}>← Course overview</Link><Link className="primaryColor" href="/my-learnings">My learning</Link></div>
    <h1 className="text-2xl md:text-3xl font-semibold">{overview?.course.title || 'Your learning space'}</h1>
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <section className="bg-white border borderColor rounded-3xl p-5 md:p-8 space-y-6 min-w-0">
        {loading && <p role="status">Opening lesson…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {lesson && <><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl md:text-2xl font-semibold">{lesson.title}</h2>{!lesson.enrolled && <span className="primaryLightBg px-3 py-1 rounded-full text-xs">Preview</span>}</div>
          {lesson.type === 'text' && <article className="whitespace-pre-wrap leading-8"><RichTextContent content={lesson.content || 'This lesson has no text content.'} /></article>}
          {lesson.type === 'video' && (embedded ? <iframe className="aspect-video w-full rounded-xl bg-black" src={embedded} title={lesson.title} allow="fullscreen; picture-in-picture" allowFullScreen /> : lesson.source_url ? <video key={lesson.id} controls playsInline controlsList="nodownload" className="aspect-video w-full rounded-xl bg-black" src={lesson.source_url} onTimeUpdate={recordPosition} onLoadedMetadata={event => { event.currentTarget.currentTime = lesson.position_seconds; }} /> : <p>The video has not been added yet.</p>)}
          {lesson.type === 'audio' && (lesson.source_url ? <audio key={lesson.id} controls className="w-full" src={lesson.source_url} onTimeUpdate={recordPosition} onLoadedMetadata={event => { event.currentTarget.currentTime = lesson.position_seconds; }} /> : <p>The audio has not been added yet.</p>)}
          {lesson.type === 'pdf' && (lesson.source_url ? <div className="space-y-3"><iframe src={lesson.source_url} title={lesson.title} className="w-full h-[70vh] border rounded-xl" /><a className="primaryColor underline" href={lesson.source_url} target="_blank" rel="noopener noreferrer">Open document in a new tab</a></div> : <p>The document has not been added yet.</p>)}
          <div className="flex flex-wrap gap-3 pt-3">{lesson.enrolled && <button className="commonBtn disabled:opacity-50" disabled={busy} onClick={markComplete}>{busy ? 'Saving…' : lesson.completed ? 'Completed ✓ · Mark incomplete' : 'Mark lesson complete'}</button>}{next && (overview?.enrolled || overview?.can_manage || next.is_preview) && <Link className="rounded-full border borderColor px-6 py-3" href={`/learn/${slug}?lesson=${next.id}`}>Next lesson →</Link>}</div>
          {!lesson.enrolled && <Link className="commonBtn inline-flex" href={`/course-details/${slug}`}>Join the full course</Link>}
        </>}
      </section>
      <aside className="border borderColor rounded-3xl bg-white p-5 space-y-5">
        {overview?.enrolled && <p className="text-sm primaryColor">{overview.completed_lesson_ids.length} of {allLessons.length} lessons complete</p>}
        {overview?.chapters.map(chapter => <div key={chapter.id} className="space-y-3"><h3 className="font-semibold">{chapter.title}</h3><ul className="space-y-2">{chapter.lessons.map(item => <li key={item.id}>{overview.enrolled || overview.can_manage || item.is_preview ? <Link className={`block rounded-xl p-3 text-sm ${selected === item.id ? 'primaryLightBg primaryColor font-semibold' : 'hover:bg-gray-50'}`} href={`/learn/${slug}?lesson=${item.id}`}>{overview.completed_lesson_ids.includes(item.id) ? '✓ ' : ''}{item.title}<span className="block text-xs text-gray-500 capitalize mt-1">{item.type}{item.is_preview ? ' · Preview' : ''}</span></Link> : <span className="block p-3 text-sm text-gray-500">{item.title} · Locked</span>}</li>)}</ul></div>)}
      </aside>
    </div>
  </main></Layout>;
}

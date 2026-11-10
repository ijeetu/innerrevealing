"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import { setIsLoginModalOpen } from '@/redux/reducers/helpersReducer';
import Layout from '@/components/layout/Layout';
import RichTextContent from '@/components/commonComp/RichText';
import { webRequest } from '@/utils/webApi';
import type { CourseOverviewData, LearningCourse } from '@/types/learning';

const priceLabel = (price: number) => price ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price) : 'Free';

export default function CourseOverview({ course }: { course: LearningCourse }) {
  const [data, setData] = useState<CourseOverviewData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const loggedIn = useSelector(isLoginSelector);
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    webRequest<CourseOverviewData>(`/api/learning/course/${encodeURIComponent(course.slug)}`, { signal: controller.signal }).then(setData).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [course.slug, loggedIn]);
  const begin = async () => {
    if (!loggedIn) { dispatch(setIsLoginModalOpen(true)); return; }
    setBusy(true); setError('');
    try {
      if (data?.enrolled || data?.can_manage) { router.push(`/learn/${course.slug}`); return; }
      if (course.price === 0) {
        await webRequest('/api/commerce/orders', { method: 'POST', body: { course_ids: [course.id], payment_method: 'free' } });
        router.push(`/learn/${course.slug}`);
      } else {
        await webRequest('/api/commerce/cart', { method: 'POST', body: { course_id: course.id } });
        router.push('/cart');
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not join this course.'); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!loggedIn) { dispatch(setIsLoginModalOpen(true)); return; }
    setBusy(true); setError('');
    try {
      const result = await webRequest<{ saved: boolean }>(`/api/learning/wishlist/${course.id}`, { method: 'POST', body: { saved: !data?.saved } });
      setData(previous => previous ? { ...previous, saved: result.saved } : previous);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save this course.'); }
    finally { setBusy(false); }
  };
  return <Layout><main className="container py-10 md:py-16 space-y-10">
    <nav className="text-sm text-gray-500"><Link href="/courses">All practices</Link> / {course.title}</nav>
    <section className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-14">
      <div className="space-y-5"><p className="primaryColor text-sm uppercase tracking-widest">{course.category_name || 'Inner Revealing'}</p><h1 className="text-3xl md:text-5xl font-semibold leading-tight">{course.title}</h1><p className="text-lg text-gray-600 leading-relaxed">{course.short_description}</p>
        {course.author_name && <p className="text-sm text-gray-500">With {course.author_name}{course.language ? ` · ${course.language}` : ''}</p>}
        {course.description && <div className="whitespace-pre-wrap leading-8 text-gray-700"><RichTextContent content={course.description} /></div>}
      </div>
      <aside className="border borderColor rounded-3xl bg-white p-6 space-y-5 self-start">
        {course.image && <img src={course.image} alt={course.title} className="w-full aspect-video rounded-2xl object-cover" />}
        <p className="text-3xl font-semibold">{priceLabel(course.price)}</p>
        <button onClick={begin} disabled={busy || !data} className="commonBtn w-full disabled:opacity-50">{busy ? 'Please wait…' : data?.enrolled || data?.can_manage ? 'Continue learning' : course.price === 0 ? 'Join this course' : 'Add to cart'}</button>
        <button onClick={save} disabled={busy || !data} className="w-full py-3 rounded-full border borderColor">{data?.saved ? 'Saved to wishlist' : 'Save for later'}</button>
        {data?.enrolled && <p className="text-sm primaryColor">You are enrolled in this course.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </aside>
    </section>
    <section className="max-w-4xl space-y-5"><h2 className="text-2xl font-semibold">Your course journey</h2>
      {!data && !error && <p role="status">Loading lessons…</p>}
      {data?.chapters.map(chapter => <div key={chapter.id} className="rounded-2xl border borderColor bg-white overflow-hidden"><h3 className="font-semibold px-6 py-4 primaryLightBg">{chapter.title}</h3><ul className="divide-y">{chapter.lessons.map(lesson => <li key={lesson.id} className="px-6 py-4 flex items-center justify-between gap-4"><div><span className="block font-medium">{lesson.title}</span><span className="text-xs text-gray-500 capitalize">{lesson.type}{lesson.duration_seconds ? ` · ${Math.ceil(lesson.duration_seconds / 60)} min` : ''}{lesson.is_preview ? ' · Free preview' : ''}</span></div>{data.enrolled || data.can_manage || lesson.is_preview ? <Link className="primaryColor font-medium whitespace-nowrap" href={`/learn/${course.slug}?lesson=${lesson.id}`}>{data.completed_lesson_ids.includes(lesson.id) ? 'Review ✓' : lesson.is_preview && !data.enrolled ? 'Preview' : 'Open lesson'}</Link> : <span className="text-sm text-gray-500">Enrol to access</span>}</li>)}</ul></div>)}
      {data && data.chapters.flatMap(chapter => chapter.lessons).length === 0 && <p className="text-gray-500">Lessons for this course have not been published yet.</p>}
    </section>
  </main></Layout>;
}

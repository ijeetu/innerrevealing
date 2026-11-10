"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import AccountPanel from '@/components/profile/AccountPanel';
import { webRequest } from '@/utils/webApi';
import type { LearningCourse, LibraryItem } from '@/types/learning';

export function CourseTile({ course, children }: { course: LearningCourse; children: React.ReactNode }) {
  return <article className="border borderColor rounded-2xl overflow-hidden bg-white flex flex-col">
    {course.image && <img src={course.image} alt="" className="aspect-video w-full object-cover" />}
    <div className="p-5 space-y-4 flex-1 flex flex-col"><div className="space-y-2 flex-1"><p className="text-xs primaryColor uppercase tracking-wider">{course.category_name || 'Inner Revealing'}</p><h2 className="text-xl font-semibold"><Link href={`/course-details/${course.slug}`}>{course.title}</Link></h2><p className="text-sm text-gray-600 leading-6">{course.short_description}</p></div>{children}</div>
  </article>;
}

export default function LearnerLibrary({ wishlist = false }: { wishlist?: boolean }) {
  const loggedIn = useSelector(isLoginSelector);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [saved, setSaved] = useState<LearningCourse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  useEffect(() => {
    if (!loggedIn) return;
    const controller = new AbortController();
    setLoading(true); setError('');
    (wishlist ? webRequest<LearningCourse[]>('/api/learning/wishlist', { signal: controller.signal }).then(setSaved) : webRequest<LibraryItem[]>('/api/learning/library', { signal: controller.signal }).then(setLibrary)).catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [loggedIn, wishlist]);
  const remove = async (id: number) => {
    setBusy(id); setError('');
    try { await webRequest(`/api/learning/wishlist/${id}`, { method: 'POST', body: { saved: false } }); setSaved(items => items.filter(item => item.id !== id)); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update your wishlist.'); }
    finally { setBusy(null); }
  };
  const empty = wishlist ? !saved.length : !library.length;
  return <AccountPanel title={wishlist ? 'Your saved practices' : 'My learning'} description={wishlist ? 'Keep the practices you would like to return to in one place.' : 'Continue your courses and follow your progress at your own pace.'}>
    {error && <p role="alert" className="text-red-700 mb-5">{error}</p>}
    {loading ? <p role="status">Loading your {wishlist ? 'wishlist' : 'courses'}…</p> : empty ? <div className="py-12 text-center space-y-4"><h2 className="text-xl font-semibold">{wishlist ? 'Your wishlist is empty' : 'Your learning journey starts here'}</h2><p className="text-gray-500">{wishlist ? 'Save a practice that interests you, then come back when you are ready.' : 'Join a course to see its lessons and your progress here.'}</p><Link href="/courses" className="commonBtn inline-flex">Explore practices</Link></div> : <div className="grid md:grid-cols-2 gap-5">
      {wishlist ? saved.map(course => <CourseTile key={course.id} course={course}><div className="flex gap-3 flex-wrap"><Link href={`/course-details/${course.slug}`} className="commonBtn">View course</Link><button disabled={busy === course.id} onClick={() => remove(course.id)} className="text-sm text-gray-600 underline">{busy === course.id ? 'Removing…' : 'Remove'}</button></div></CourseTile>) : library.map(item => <CourseTile key={item.course.id} course={item.course}><div className="space-y-2"><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full primaryBg" style={{ width: `${item.progress_percent}%` }} /></div><p className="text-xs text-gray-500">{item.completed_lessons} of {item.total_lessons} lessons complete · {item.progress_percent}%</p></div><Link href={`/learn/${item.course.slug}`} className="commonBtn text-center">{item.progress_percent === 100 ? 'Review course' : 'Continue learning'}</Link></CourseTile>)}
    </div>}
  </AccountPanel>;
}

import { Suspense } from 'react';
import CoursePlayer from '@/components/learning/CoursePlayer';
export const dynamic = 'force-dynamic';
export default async function LearnPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  return <Suspense fallback={<p className="container py-16">Opening your learning space…</p>}><CoursePlayer slug={courseSlug} /></Suspense>;
}

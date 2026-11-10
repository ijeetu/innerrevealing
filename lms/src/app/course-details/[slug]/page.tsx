import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseDetailsPage from "@/components/pagesComponent/courseDetails/CourseDetailsPage";
import { getPublishedCourseBySlug } from "@/server/catalogue";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const fetchCourse = cache(getPublishedCourseBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) return { title: "Course not found · Inner Revealing", robots: { index: false, follow: false } };
  const title = course.meta_title || `${course.title} · Inner Revealing`;
  const description = course.meta_description || course.short_description;
  return {
    title,
    description,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_WEB_URL || 'https://ir.vishwalabs.com'}/course-details/${encodeURIComponent(slug)}` },
    openGraph: { title, description, type: "website", siteName: "Inner Revealing", images: course.image ? [course.image] : [] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) notFound();
  return <CourseDetailsPage slug={slug} courseData={course} />;
}

import CourseDetailsPage from '@/components/pagesComponent/courseDetails/CourseDetailsPage'
import React from 'react'
import { Metadata } from "next";
import { getAuthTokenFromAnySource } from '@/utils/auth';
import { Course, getCourse } from '@/utils/api/user/getCourse';
import { SchemaJsonLdType } from '@/types';
import JsonLd from '@/components/Schema/JsonLd';
import LessonOverview from '@/components/pagesComponent/lesson-overview/LessonOverview';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Function to fetch course data from the API with authentication
async function fetchCourseData(slug: string) {
    try {
        // Get authentication token
        const authToken = await getAuthTokenFromAnySource();

        // Use the simplified getCourse API utility
        const response = await getCourse({ slug, authToken: authToken || undefined });
        if (response) {
            // Check if API returned an error (error: true in response)
            if (!response.error) {
                if (response.data) {
                    return response;
                } else {
                    console.log('No course data found in response');
                    return null;
                }
            } else {
                console.log("API error:", response.message);
                return null;
            }
        } else {
            console.log("response is null in fetchCourseData", response);
            return null;
        }
    } catch (error) {
        console.error("Error fetching course data:", error);
        return null;
    }
}
// Generate metadata for the course deatils page
export async function generateMetadata(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const slug = params.slug;
    const lang = searchParams?.lang?.toLowerCase() || "en";
    const courseData = await fetchCourseData(slug);
    if (!courseData || courseData.error) {
        return {
            title: process.env.NEXT_PUBLIC_TITEL,
            description: process.env.NEXT_PUBLIC_DESCRIPTION,
            keywords: process.env.NEXT_PUBLIC_KEYWORDS,
        };
    }
    const course = courseData.data;
    return {
        title: course?.meta_title || process.env.NEXT_PUBLIC_TITEL,
        description: course?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
        keywords: course?.tags?.map((tag) => tag.tag).join(',') || process.env.NEXT_PUBLIC_KEYWORDS,
        openGraph: {
            title: course?.meta_title || process.env.NEXT_PUBLIC_TITEL,
            description: course?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: course?.image || process.env.NEXT_PUBLIC_IMAGE,
            type: "website",
            siteName: "WRTeam",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: course?.meta_title || process.env.NEXT_PUBLIC_TITEL,
            description: course?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: course?.image || process.env.NEXT_PUBLIC_IMAGE,
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_WEB_URL!}/course-details/${slug}?lang=${lang}`,
        },
    }
}
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    // Get authentication token for the API call
    const authToken = await getAuthTokenFromAnySource();

    // Fetch course data with authentication token
    const courseData = await getCourse({ slug, authToken: authToken || undefined });
    const isPurchased = courseData?.data?.is_purchased;
    return (
        <div>
            {courseData?.data && <JsonLd data={courseData?.data as unknown as SchemaJsonLdType} />}
            {
                isPurchased && authToken ?
                    <LessonOverview courseData={courseData?.data as Course} />
                    :
                    <CourseDetailsPage slug={slug} />
            }
        </div>
    )
}
export default Page
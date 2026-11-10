'use client'
import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { MdKeyboardArrowRight } from 'react-icons/md'
import CourseContent from '../courses/CourseContent'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation';

// Loading component for Suspense fallback
const CourseContentLoading = () => {
    return (
        <div className="container">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-[300px] bg-gray-200 animate-pulse rounded-md"></div>
                ))}
            </div>
        </div>
    )
}

const CourseSearch = () => {

    const params = useParams();
    const { t } = useTranslation();
    // Function to decode URL-encoded slug and convert plus signs to spaces
    const decodeSearchQuery = (encodedQuery: string): string => {
        try {
            const decoded = decodeURIComponent(encodedQuery)
            return decoded.replace(/\+/g, ' ')
        } catch {
            return encodedQuery
        }
    }

    const search = decodeSearchQuery(params.slug as string);

    return (
        <Layout>
            <div className='commonGap lg:space-y-0 pb-0 lg:pb-12'>
                <div className='sectionBg py-8 md:pt-12 md:pb-12 lg:pb-48'>
                    <div className="container space-y-4">
                        <div className='bg-white rounded-full py-2 px-4 w-max flexCenter gap-1'>
                            <Link href={'/'} className='primaryColor' title={t("home")}>{t("home")}</Link>
                            <span><MdKeyboardArrowRight size={22} /></span>
                            <span>{t("course_search")}</span>
                        </div>
                        <h1 className='font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]'>
                            {t("results_for")} <span className='primaryColor'>"{search}"</span>
                        </h1>
                    </div>
                </div>

                <Suspense fallback={<CourseContentLoading />}>
                    <CourseContent searchPage={true} search={search} />
                </Suspense>
                <div className='container grid grid-cols-12 gap-6 mb-12 lg:-mt-32'>
                </div>

            </div>
        </Layout>
    )
}

export default CourseSearch

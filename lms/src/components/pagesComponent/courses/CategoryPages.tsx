'use client'
import React, { useEffect, useState, Suspense } from 'react'
import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import CourseContent from './CourseContent'
import { useTranslation } from '@/hooks/useTranslation';
const CategorySwiper = dynamic(() => import('@/components/commonComp/CategorySwiper'), { ssr: false })

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

interface CategoryPagesProps {
    mainCatePage?: boolean
    subCatePage?: boolean
    nestedCatePage?: boolean
}


const CategoryPages: React.FC<CategoryPagesProps> = ({ mainCatePage, subCatePage, nestedCatePage }) => {

    const params = useParams();
    const mainCate = params.mainCate as string;
    const subCate = params.subCate as string;
    const nestedCate = params.nestedCate as string;
    const { t } = useTranslation();
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return (
        isClient && (
            <Layout>
                <div className='commonGap'>
                    <div>
                        <div className='sectionBg py-8 md:py-12'>
                            <div className="container space-y-4">
                                <div className='bg-white rounded-3xl w-fit py-2 px-4 flex-wrap flex justify-start items-center gap-1'>
                                    <Link href={'/'} className='primaryColor' title={t("home")}>{t("home")}</Link>
                                    <span><MdKeyboardArrowRight size={22} /></span>
                                    <Link href={'/courses'} title={t("courses")} className='capitalize'>{t("courses")}</Link>
                                    <span><MdKeyboardArrowRight size={22} /></span>
                                    <Link href={`/courses/${mainCate}`} title={mainCate} className='capitalize'>{mainCate}</Link>
                                    {
                                        subCate && (
                                            <>
                                                <span><MdKeyboardArrowRight size={22} /></span>
                                                <Link href={`/courses/${mainCate}/${subCate}`} title={subCate} className='capitalize'>{subCate}</Link>
                                            </>
                                        )
                                    }
                                    {
                                        nestedCate && (
                                            <>
                                                <span><MdKeyboardArrowRight size={22} /></span>
                                                <Link href={`/courses/${mainCate}/${subCate}/${nestedCate}`} title={nestedCate} className='capitalize'>{nestedCate}</Link>
                                            </>
                                        )
                                    }

                                </div>
                                <div className='flexColCenter items-start gap-2'>
                                    <h1 className='font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]'>{t("unlock_learning_pathways_by_categories")}</h1>
                                    <p className='sectionPara lg:w-[52%]'>{t("courses_description")}</p>
                                </div>
                            </div>
                        </div>
                        <CategorySwiper cateSlug={mainCatePage ? mainCate : subCatePage ? subCate : nestedCatePage ? nestedCate : ''} nestedCatePage={nestedCatePage} />
                    </div>
                    <Suspense fallback={<CourseContentLoading />}>
                        <CourseContent cateSlug={mainCatePage ? mainCate : subCatePage ? subCate : nestedCatePage ? nestedCate : ''} />
                    </Suspense>
                </div>
            </Layout>
        )
    )
}

export default CategoryPages
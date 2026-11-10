"use client"
import { CategoryDataType } from '@/types'
import Link from 'next/link'
import React from 'react'
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import CustomImageTag from '../commonComp/customImage/CustomImageTag'
import { useTranslation } from "@/hooks/useTranslation";
import { useSelector } from 'react-redux';
import { isRTLSelector } from '@/redux/reducers/languageSlice';
import { useRouter } from 'next/navigation';

interface dataProps {
    data: CategoryDataType
}

const CategoryCard: React.FC<dataProps> = ({ data }) => {

    const router = useRouter();

    const { t } = useTranslation();
    const isRTL = useSelector(isRTLSelector);

    function formatCountRounded(value: number) {
        if (value < 10) return value.toString();

        const rounded = Math.floor(value / 10) * 10;

        return `${rounded}+`;
    }

    const handleCategoryClick = () => {
        router.push(`/courses/${data?.slug}`);
    }




    return (
        <div className='flex sm:flex-col gap-4 rounded-[16px] border borderColor p-4 group transition-all duration-300 hover:bg-white hover:shadow-[0px_14px_36px_3px_#ADB3B852] cursor-pointer'
            key={data?.id}
            onClick={() => handleCategoryClick()}
        >
            <CustomImageTag src={data?.image} alt='category-img' className='w-[64px] md:w-[72px] h-[64px] md:h-[72px] shrink-0 rounded-[8px]' />
            <div className='flex flex-col gap-2 w-full'>
                <span className='text-lg md:text-xl font-semibold line-clamp-1'>{data?.name}</span>
                {
                    data?.courses_count > 0 ?
                        <>
                            {/* Mobile view shows count and link without hover for quick access */}
                            <div className='flex flex-wrap items-center justify-between md:hidden'>
                                <span className='secondaryColor'>{data?.courses_count}</span>
                                <div title='View Courses' className='primaryColor flex items-center gap-1'>
                                    <span>{t("view_courses")}</span>
                                    {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                                </div>
                            </div>
                            {/* Desktop view keeps hover animation for count and link reveal */}
                            <div className='relative h-[20px] overflow-hidden hidden md:flex md:flex-col'>
                                <span className='secondaryColor group-hover:mt-12 transition-all duration-500'>
                                    {`${formatCountRounded(data?.courses_count)} ${t("courses")}`}
                                </span>
                                <div className='-mb-12 group-hover:-mt-[72px] transition-all duration-500 flex items-center'>
                                    <div title='View Courses' className='primaryColor flex items-center gap-1 group-hover:'>
                                        <span>{t("view_courses")}</span>
                                        <span className='block w-[2px] overflow-hidden group-hover:w-[200px] group-hover:overflow-visible transition-all duration-300'>
                                            {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                        : <>

                            <div className='flex flex-wrap items-center justify-between md:hidden'>
                                <span className='secondaryColor'>{t('no_courses_yet')}</span>
                                <div title='View Courses' className='primaryColor flex items-center gap-1'>
                                    <span>{t("view_courses")}</span>
                                    {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                                </div>
                            </div>
                            <div className='relative h-[20px] overflow-hidden hidden md:flex md:flex-col'>
                                <span className='secondaryColor group-hover:mt-12 transition-all duration-500'>
                                    {t('no_courses_yet')}
                                </span>
                                <div className='-mb-12 group-hover:-mt-[72px] transition-all duration-500 flex items-center'>
                                    <div title='View Courses' className='primaryColor flex items-center gap-1 group-hover:'>
                                        <span>{t("view_courses")}</span>
                                        <span className='block w-[2px] overflow-hidden group-hover:w-[200px] group-hover:overflow-visible transition-all duration-300'>
                                            {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>

                }
            </div>

        </div>
    )
}

export default CategoryCard
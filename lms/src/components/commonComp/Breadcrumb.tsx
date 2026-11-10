'use client';
import { useTranslation } from '@/hooks/useTranslation';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import Link from 'next/link'
import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { useSelector } from 'react-redux';

interface BreadcrumbProps {
    title: string;
    firstElement: string;
    secondElement?: string;
}

const Breadcrumb = ({ title, firstElement, secondElement }: BreadcrumbProps) => {
    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector)
    return (
        <div className='sectionBg py-8 md:py-12'>
            <div className="container space-y-4">
                <h1 className='font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]'>{title}</h1>
                <div className='bg-white rounded-full py-2 px-4 w-max flexCenter gap-1'>
                    <Link href={`/?lang=${currentLanguageCode}`} className="primaryColor" title={t("home")}>
                        {t("home")}
                    </Link>
                    <span><MdKeyboardArrowRight size={22} className="rtl:rotate-180" /></span>
                    <span>{firstElement}</span>
                    {secondElement && (
                        <>
                            <span><MdKeyboardArrowRight size={22} className="rtl:rotate-180" /></span>
                            <span>{secondElement}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Breadcrumb
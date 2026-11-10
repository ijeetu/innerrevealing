'use client'
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link'
import React from 'react'
import { BiHomeAlt } from "react-icons/bi";

const DashboardBreadcrumb = ({ firstElement, title, secondElement, thirdElement, fourthElement, fifthElement, teamDashboard, firstElementLink, userSlug }: { firstElement?: string, title: string, secondElement?: string, thirdElement?: string, fourthElement?: string, fifthElement?: string, teamDashboard?: boolean, firstElementLink?: string, userSlug?: string }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-4 py-4 mb-6">
            <div className="flex  flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
                <div className="text-gray-600 flex items-center gap-2 md:flex-nowrap flex-wrap">
                    {firstElement && (
                        <Link href={teamDashboard ? `/my-teams/${userSlug}/course` : "/instructor/dashboard"} className="hover:underline flex items-center gap-2">
                            <BiHomeAlt size={20} />
                            {teamDashboard ? t("my_courses") : t("dashboard")}
                        </Link>
                    )}
                    {firstElementLink && (
                        <>
                            <span>•</span>
                            <Link href={firstElementLink} className="hover:underline flex items-center gap-2">
                                {firstElement}
                            </Link>
                        </>
                    )}
                    {firstElement && !firstElementLink && (
                        <>
                            <span>•</span>
                            <span>{firstElement}</span>
                        </>
                    )}
                    {secondElement && (
                        <>
                            <span>•</span>
                            <span>{secondElement}</span>
                        </>
                    )}
                    {thirdElement && (
                        <>
                            <span>•</span>
                            <span>{thirdElement}</span>
                        </>
                    )}
                    {fourthElement && (
                        <>
                            <span>•</span>
                            <span>{fourthElement}</span>
                        </>
                    )}
                    {fifthElement && (
                        <>
                            <span>•</span>
                            <span>{fifthElement}</span>
                        </>
                    )}


                </div>
            </div>
        </div>
    )
}

export default DashboardBreadcrumb

'use client'
import AssignmentSubmissionView from '@/components/instructor/assignments/AssignmentSubmissionView'
import DashboardBreadcrumb from '@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams } from 'next/navigation';
import React from 'react'

const Page = () => {

    const { t } = useTranslation();
    const { slug } = useParams<{ slug: string }>();

    return (
        <div className="w-full">
            <DashboardBreadcrumb title={t("assignment_view_title")} firstElement={t("assignments")} firstElementLink="/instructor/assignments" secondElement={t("assignment_view_title")} />
            <AssignmentSubmissionView assignmentSlug={slug} />
        </div>
    )
}

export default Page

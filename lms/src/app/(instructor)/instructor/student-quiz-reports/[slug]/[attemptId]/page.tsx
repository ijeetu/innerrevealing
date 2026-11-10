"use client";
import DashboardBreadcrumb from '@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb';
import ViewResult from '@/components/instructor/quiz/ViewResult';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams } from 'next/navigation';
import React from 'react'

const Page = () => {

    const { t } = useTranslation();
    const { attemptId } = useParams() as { attemptId: string };

    return (
        <div>
            <DashboardBreadcrumb title={t("student_quiz_reports")} firstElement={t("student_quiz_reports")} secondElement={t("quiz_attempts")} thirdElement={t("quiz_result")} />
            <ViewResult
                attemptId={Number(attemptId)}
                isCousePage={false}
            />
        </div>
    )
}

export default Page

"use client";
import DashboardBreadcrumb from '@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb';
import QuizAttemptDetails from '@/components/instructor/quiz/QuizAttemptDetails';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams } from 'next/navigation';
import React from 'react'

const Page = () => {

    const { t } = useTranslation();
    const { slug, quizSlug } = useParams() as { slug: string, quizSlug: string };

    return (
        <div>
            <DashboardBreadcrumb title={t("student_quiz_reports")} firstElement={t("student_quiz_reports")} firstElementLink={`/my-teams/${slug}/student-quiz-reports`} secondElement={t("quiz_attempts")} />
            <QuizAttemptDetails
                quizSlug={quizSlug}
                teamSlug={slug}
            />
        </div>
    )
}

export default Page

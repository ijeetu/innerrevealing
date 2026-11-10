'use client'
import CurriculumTab from '@/components/instructor/addCourse/Tabs/CurriculumTab'
import DashboardBreadcrumb from '@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb'
import { CourseTabProvider } from '@/contexts/CourseTabContext'
import { useTranslation } from '@/hooks/useTranslation'
import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  return (
    <div>
      <DashboardBreadcrumb title={t("edit_course")} firstElement={t("my_courses")} firstElementLink={`/my-teams/${slug}/course`} secondElement={t("edit_course")} />
      <CourseTabProvider>
        <div>
          <CurriculumTab teamSlug={slug} />
        </div>
      </CourseTabProvider>
    </div >
  )
}

export default Page

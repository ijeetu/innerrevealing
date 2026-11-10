"use client";
import React, { useState } from 'react'
import OverviewTabContent from './OverviewTabContent';
import ResourcesTabContent from './ResourcesTabContent';
import DiscussionTabContent from './DiscussionTabContent';
import AssignmentTabContent from './assignment/AssignmentTabContent';
import ReviewSection from './review/ReviewSection';
import CertificateTabContent from './CertificateTabContent';
import { Course } from '@/utils/api/user/getCourse';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
interface Tab {
    title: string;
    key: string;
}

interface TabSectProps {
    courseData: Course;
}

const TabSect: React.FC<TabSectProps> = ({ courseData }) => {

    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<string>(tab || 'overview');

    const tabs: Tab[] = [
        {
            key: 'overview',
            title: t("overview"),
        },
        {
            key: 'resources',
            title: t("resources"),
        },
        {
            key: 'discussion',
            title: t("discussion"),
        },
        {
            key: 'assignment',
            title: t("assignment"),
        },
        {
            key: 'reviews',
            title: t("reviews"),
        },
        {
            key: 'certificate',
            title: t("certificate"),
        },
    ]

    return (
        <div className=''>
            <div className='flex items-center gap-6 border-b borderColor px-4 md:px-8 overflow-x-auto pb-2 md:pb-0'>
                {tabs.map((tab, index) => (
                    <div key={index} className={`cursor-pointer ${activeTab === tab.key ? 'font-semibold primaryColor border-b-2 borderPrimary' : ''}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.title}
                    </div>
                ))}
            </div>
            <div className=''>
                {activeTab === 'overview' && <OverviewTabContent courseData={courseData} />}
                {activeTab === 'resources' && <ResourcesTabContent courseData={courseData} />}
                {activeTab === 'discussion' && <DiscussionTabContent courseId={courseData.id} />}
                {activeTab === 'assignment' && <AssignmentTabContent courseId={courseData.id} isSequentialAccess={courseData?.sequential_access} />}
                {activeTab === 'reviews' && <ReviewSection courseData={courseData} />}
                {activeTab === 'certificate' && <CertificateTabContent courseData={courseData} />}
            </div>
        </div>
    )
}

export default TabSect

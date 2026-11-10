"use client";
import React, { useEffect, useState } from 'react'
import AllResources from './ResourceTabContentTabs/AllResources'
import CurrentLectureResource from './ResourceTabContentTabs/CurrentLectureResource'
import { Course } from '@/utils/api/user/getCourse';
import { useSelector } from 'react-redux';
import { getResources, ResourcesData } from '@/utils/api/user/getResources';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import ResourceSkeleton from '@/components/skeletons/lesson-overview/ResourceSkeleton';
import { selectedCurriculumItemSelector } from '@/redux/reducers/helpersReducer';
import { useTranslation } from '@/hooks/useTranslation';

type Tab = {
    title: string;
    key: string;
}

interface ResourcesTabContentProps {
    courseData: Course;
}

const ResourcesTabContent: React.FC<ResourcesTabContentProps> = ({ courseData }) => {

    const { t } = useTranslation();
    const slug = courseData.slug;

    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
    const selectedCurriculumItemId = selectedCurriculumItem?.id;

    // Manage separete states for all resources and current lecture resources
    const [allResources, setAllResources] = useState<ResourcesData['all_resources'] | undefined>(undefined);
    const [currentLectureResources, setCurrentLectureResources] = useState<ResourcesData['current_lecture_resources'] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<string>('all_resources');

    const tabs: Tab[] = [
        {
            key: "all_resources",
            title: t("all_resources"),
        },
        {
            key: 'current_lecture',
            title: t("current_lecture_resources"),
        },
    ]



    const fetchResources = async () => {
        setIsLoading(true);

        try {
            const response = await getResources({ slug, lecture_id: selectedCurriculumItemId as number });
            if (response && !response.error && response.data) {
                setAllResources(response.data.all_resources ?? undefined);
                setCurrentLectureResources(response.data.current_lecture_resources ?? undefined);
            } else {
                toast.error(response?.message || "Failed to fetch resources");
                setCurrentLectureResources(undefined);
            }
        } catch (error) {
            extractErrorMessage(error);
            setCurrentLectureResources(undefined);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!slug) return;
        fetchResources();
    }, [slug, selectedCurriculumItemId]);


    return (
        <div>
            <div className='px-4 md:px-8 py-2 md:py-4 border-b borderColor'>
                <h2 className='text-xl font-semibold'>{t("resources")}</h2>
            </div>
            <div className='flex items-center gap-6 border-b borderColor px-4 md:px-8 py-2 md:py-4 overflow-x-auto pb-2'>
                {tabs.map((tab, index) => (
                    <div key={index} className={`text-sm md:text-base cursor-pointer ${activeTab === tab.key ? 'font-semibold primaryColor border-b-2 borderPrimary' : ''}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.title}
                    </div>
                ))}
            </div>

            <div className='px-4 md:px-8 py-2 md:py-4'>
                {isLoading ? <ResourceSkeleton /> : activeTab === 'all_resources' && <AllResources allResources={allResources} />}
                {isLoading ? <ResourceSkeleton /> : activeTab === 'current_lecture' && <CurrentLectureResource currentLectureResources={currentLectureResources} />}
            </div>
        </div>
    )
}

export default ResourcesTabContent

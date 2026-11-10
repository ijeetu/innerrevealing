'use client'
import React, { useState } from 'react';
import CourseSection from '@/components/pagesComponent/courseDetails/sections/CourseSection';
import { IoClose } from 'react-icons/io5';
import { Chapter, Course, CurriculumItem } from '@/utils/api/user/getCourse';
import { useSelector } from 'react-redux';
import { previouslyCompletedCurriculumsIdsSelector, isCurriculumItemCompletedSelector } from '@/redux/reducers/helpersReducer';
import { useTranslation } from "@/hooks/useTranslation";

interface CourseContentProps {
  courseData: Course;
  isSequentialAccess?: boolean;
  handleCourseCurriculumOpen?: () => void;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseData, isSequentialAccess, handleCourseCurriculumOpen }) => {

  const { t } = useTranslation();
  const chapters = courseData.chapters;
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const previouslyCompletedCurriculumsIds = useSelector(previouslyCompletedCurriculumsIdsSelector);
  const isCurriculumItemCompleted = useSelector(isCurriculumItemCompletedSelector);


  const toggleExpandAll = (): void => {
    setExpandAll(!expandAll);
    handleCourseCurriculumOpen?.();
  };

  // Function to check if a specific chapter is completed
  const checkIsChapterCompleted = (chapter: Chapter) => {
    return (chapter.curriculum as CurriculumItem[]).every(item => {
      return previouslyCompletedCurriculumsIds?.includes(item.id) ||
        item.is_completed ||
        item.id === isCurriculumItemCompleted?.itemId;
    });
  };

  // Pre-calculate completion status for all chapters to avoid O(N^2) in render loop
  const chaptersCompletionStatus = chapters.map(chapter => checkIsChapterCompleted(chapter as Chapter));

  return (
    <div className="flex flex-col lg:flex-row w-full rounded-lg overflow-hidden  p-4 md:px-8 lg:px-0">
      {/* Course Curriculum Section */}
      <div className="w-full space-y-4 md:space-y-0 ">
        <div className="py-4 md:py-8 border-b borderColor">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-lg md:text-xl font-bold">{t('course_curriculum')}</h2>
            <button
              onClick={toggleExpandAll}
              className="cursor-pointer bg-[#F8F8F9] flexCenter rounded-[8px] w-[32px] h-[32px] border borderColor p-1 hidden lg:flex"
            >
              <IoClose size={24} color="#A2A2A5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 md:pt-4 xl:ltr:pl-4 xl:rtl:pr-4 rounded-2xl ">
          {chapters.map((chapter, index) => {
            // A chapter is accessible if it's the first one OR all previous chapters are completed
            const isPreviousChapterCompleted = index === 0 || chaptersCompletionStatus.slice(0, index).every(status => status);
            if (chapter.curriculum.length === 0) {
              return null;
            }

            return (
              <CourseSection
                key={chapter.id}
                chapter={chapter as Chapter}
                chapterIndex={index}
                isExpandAll={expandAll}
                isFirstSection={chapters[0].id === chapter.id}
                lessonOverviewPage={true}
                isSequentialAccess={isSequentialAccess}
                isPreviousChapterCompleted={isPreviousChapterCompleted}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseContent; 
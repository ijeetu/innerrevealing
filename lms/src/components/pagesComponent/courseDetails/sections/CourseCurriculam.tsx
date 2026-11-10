'use client'
import React, { useState } from 'react';
import CourseSection from './CourseSection';
import { FiClock, FiBook } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import { Course } from '@/utils/api/user/getCourse';
import { useTranslation } from '@/hooks/useTranslation';


// Props interface for the component
interface CourseCurriculamProps {
  courseData: Course;
}

const CourseCurriculam: React.FC<CourseCurriculamProps> = ({ courseData }) => {

  const chapters = courseData.chapters;
  const { t } = useTranslation();
  const [expandAll, setExpandAll] = useState<boolean>(false);

  const toggleExpandAll = (): void => {
    setExpandAll(!expandAll);
  };


  return (
    <div className="flex flex-col lg:flex-row w-full rounded-lg overflow-hidden lg:mt-12">
      {/* Course Curriculum Section */}
      <div className="w-full">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold">{t("course_curriculum")}</h2>
            {chapters?.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="primaryColor font-medium flex items-center cursor-pointer max-575:hidden"
              >
                <FaPlus className="ltr:mr-1 rtl:ml-1 -mt-1 " size={14} />
                <span>{expandAll ? t("collapse_all") : t("expand_all")}</span>
              </button>
            )}
          </div>

          {courseData ? (
            <div className="flex items-center text-sm text-gray-600 mt-2 gap-2 md:gap-4 flex-wrap">
              <div className="flex items-center">
                <FiBook className="ltr:mr-1 rtl:ml-1" />
                <span>{courseData.chapter_count} {courseData.chapter_count <= 1 ? t("chapter") : t("chapters")}</span>
              </div>
              <div className="flex items-center">
                <FiBook className="ltr:mr-1 rtl:ml-1" />
                <span>{courseData.lecture_count} {courseData.lecture_count <= 1 ? t("lecture") : t("lectures")}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="ltr:mr-1 rtl:ml-1" />
                <span>{courseData.total_duration_formatted}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 mt-2">
              {t("no_curriculum_information_available_for_this_course")}
            </div>
          )}
        </div>


        <div className="space-y-4 sectionBg max-479:p-2 p-4 rounded-2xl">
          {chapters?.length > 0 ? (
            chapters.map((section, index) => {
              if (section.curriculum.length === 0) {
                <div key={section.id}>
                  <CourseSection
                    chapter={section}
                    chapterIndex={index}
                    isExpandAll={expandAll}
                    isFirstSection={index === 0}
                  />
                </div>
              }
              return (
                <div key={section.id}>
                  <CourseSection
                    chapter={section}
                    chapterIndex={index}
                    isExpandAll={expandAll}
                    isFirstSection={index === 0}
                  />
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t("no_chapters_available_for_this_course_yet")}</p>
              <p className="text-sm mt-1">{t("check_back_later_for_updates")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCurriculam; 
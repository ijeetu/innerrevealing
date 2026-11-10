"use client";
import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseDetail } from "@/utils/api/instructor/course/getCourseDetails";
import CourseSection from "@/components/pagesComponent/courseDetails/sections/CourseSection";
import { useTranslation } from "@/hooks/useTranslation";
import withBalanceCheck from "@/components/hoc/withBalanceCheck";

interface CourseDetailsProps {
  course: CourseDetail;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course }) => {

  const { t } = useTranslation();
  const courseDetails = course?.course_details;
  const chapters = courseDetails?.chapters;

  const [expandAll, setExpandAll] = useState<boolean>(false);

  const toggleExpandAll = (): void => {
    setExpandAll(!expandAll);
  };

  return (
    <div className="space-y-6">
      {/* Course Description Section */}
      <div className="space-y-4 p-4 sm:p-6 border-b border-gray-200">
        <p className="text-gray-800">
          {courseDetails?.short_description}
        </p>
      </div>
      {/* What You'll Learn Section */}
      {
        courseDetails?.learnings && courseDetails?.learnings?.length > 0 &&
        <div className="mt-0 !pt-0 space-y-4 p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("what_you_ll_learn")}
          </h2>
          <div className="grid gap-3">
            {
              courseDetails?.learnings?.map((learning, index) => {
                return (
                  <div className="flex items-start gap-2" key={index}>
                    <Check className="h-5 w-5 primaryColor mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">{learning.title}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
      }

      {
        courseDetails?.requirements && courseDetails?.requirements?.length > 0 &&
        <div className="mt-0 !pt-0 space-y-4 p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t("requirements")}</h2>
          <div className="grid gap-3">
            {courseDetails?.requirements?.map((requirement, index) => {
              return (
                <div className="flex items-start gap-2" key={index}>
                  <Check className="h-5 w-5 primaryColor mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800">
                    {requirement.requirement}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      }

      {/* Course Content Section */}
      <Card className="mx-3 sm:m-6">
        <div className="">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("course_content")}
            </h2>
            <Button
              onClick={toggleExpandAll}
              className="rounded-md h-auto font-medium text-sm primaryBg text-white"
            >
              <span>{expandAll ? t("collapse_all") : t("expand_all")}</span>
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {chapters?.length > 0 ? (
              chapters?.map((chapter, index) => {
                if (chapter.curriculum.length === 0) {
                  return null;
                }
                return (
                  <div key={index}>
                    <CourseSection
                      chapter={chapter}
                      isExpandAll={expandAll}
                      isFirstSection={index === 0}
                      instructorPage={true}
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
      </Card>
    </div>
  );
};

export default withBalanceCheck(CourseDetails);

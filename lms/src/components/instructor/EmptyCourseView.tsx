"use client";
import React from "react";
import { LucidePlusCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import emptyCourseImg from "@/assets/images/instructorPanel/dashboard/NoCourses.svg";
import { useTranslation } from "@/hooks/useTranslation";
import ThemeSvg from "../commonComp/customImage/ThemeSvg";

const EmptyCourseView = () => {
  const { t } = useTranslation();
  return (
    <Card className="bg-white">
      <CardContent className="p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
        {/* Placeholder for illustration */}
        <div className="w-48 h-36 sm:w-56 sm:h-42 md:w-64 md:h-48 lg:w-[600px] lg:h-[400px] rounded-md flex items-center justify-center mb-4 sm:mb-6">
          <ThemeSvg
            src={emptyCourseImg}
            alt="empty-course-img"
            className="w-full h-full object-contain"
            colorMap={{
              "#5A5BB5": "var(--primary-color)",
              "#04294C": "var(--hover-color)",
              "#EEF2FA": "var(--primary-light-color)",
            }}
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {t("your_first_course_awaits")}
        </h2>
        <p className="text-gray-600 max-w-xs sm:max-w-sm md:max-w-md">
          {t("you_havent_created_any_courses_yet")}
        </p>
        <button className="!commonBtn">
          <Link href="/instructor/my-course/add-course" className="flex items-center">
            <LucidePlusCircle className="mr-2 h-5 w-5" /> {t("add_course")}
          </Link>
        </button>
      </CardContent>
    </Card>
  );
};

export default EmptyCourseView;

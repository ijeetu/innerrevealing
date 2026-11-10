"use client";
import React from "react";
import StatsCard from "./StatsCard";
import { OverviewStats } from "@/utils/api/instructor/dashboad/getInstructorDashboard";
import { useTranslation } from "@/hooks/useTranslation";
import icon1 from "@/assets/images/instructorPanel/dashboard/totalCoursesIcon.svg";
import icon2 from "@/assets/images/instructorPanel/dashboard/enrollStudentIcon.svg";
import icon3 from "@/assets/images/instructorPanel/dashboard/soldIcon.svg";
import icon4 from "@/assets/images/instructorPanel/dashboard/earningsIcon.svg";
import icon5 from "@/assets/images/instructorPanel/dashboard/ratingIcon.svg";

const StatsOverview: React.FC<{ data: OverviewStats }> = ({ data }) => {

  const { t } = useTranslation();
  // Data for the stats cards - this would typically come from props or a state management solution
  const statsData = [
    {
      title: t("total_courses"),
      value: data?.total_courses.value,
      icon: icon1,
    },
    {
      title: t("enrolled_students"),
      value: data?.enrolled_students.value,
      icon: icon2,
    },
    {
      title: t("courses_sold"),
      value: data?.courses_sold.value,
      icon: icon3,
    },
    {
      title: t("total_earnings"),
      value: data?.total_earnings.value,
      icon: icon4,
    },
    {
      title: t("positive_feedback"),
      value: data?.positive_feedback.value,
      icon: icon5,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="primaryBg p-3 sm:p-6 rounded-lg">
        <h2 className="text-white text-lg font-semibold mb-6">
          {t("dashboard_overview")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {statsData?.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

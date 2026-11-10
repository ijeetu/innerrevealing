"use client";
import React from "react";
import CoursesTable from "@/components/instructor/dashboard/CoursesTable";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import { useTranslation } from "@/hooks/useTranslation";

const MyCourses = () => {

  const { t } = useTranslation();

  return (
    <div className="space-y-6 ">
      <DashboardBreadcrumb title={t("my_courses")} firstElement={t("my_courses")} />
      <CoursesTable myCoursesPage={true} />
    </div>
  );
};

export default MyCourses;

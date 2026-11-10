"use client";
import React from "react";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import CoursesTable from "@/components/instructor/dashboard/CoursesTable";
import { useTranslation } from "@/hooks/useTranslation";

const TeamAllCourses: React.FC<{ teamSlug: string }> = ({ teamSlug }) => {

  const { t } = useTranslation();

  return (
    <>
      <DashboardBreadcrumb title={t("courses")} firstElement={t("courses")} />
      <CoursesTable teamSlug={teamSlug} />
    </>
  );
};

export default TeamAllCourses;

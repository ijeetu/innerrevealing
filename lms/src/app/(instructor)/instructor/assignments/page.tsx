"use client";
import React from "react";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import AssignmentList from "@/components/instructor/assignments/AssignmentList";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("assignments")} firstElement={t("assignments")}  />
      <AssignmentList />
    </div>
  );
}

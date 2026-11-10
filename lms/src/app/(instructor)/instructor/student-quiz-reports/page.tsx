"use client";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import QuizReport from "@/components/instructor/quiz/QuizReport";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";

export default function Page() {

  const { t } = useTranslation();

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("student_quiz_reports")} firstElement={t("student_quiz_reports")} />
      <QuizReport />
    </div>
  );
}

"use client";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import QuizReport from "@/components/instructor/quiz/QuizReport";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {

  const { t } = useTranslation();
  const { slug } = useParams() as { slug: string };

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("quiz_reports")} firstElement={t("student_quiz_reports")}  />
      <QuizReport teamSlug={slug} />
    </div>
  );
}

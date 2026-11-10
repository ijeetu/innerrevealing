"use client";
import React from "react";
import { useParams } from "next/navigation";
import AssignmentList from "@/components/instructor/assignments/AssignmentList";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {

  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("assignments")} firstElement={t("assignments")} />
      <AssignmentList teamSlug={slug} />
    </div>
  );
}

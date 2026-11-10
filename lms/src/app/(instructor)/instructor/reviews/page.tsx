"use client";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import Reviews from "@/components/instructor/reviews/Reviews";
import { useTranslation } from "@/hooks/useTranslation";

export default function InstructorReviews() {

  const { t } = useTranslation();

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("reviews")} firstElement={t("reviews")} />
      <Reviews />
    </div>
  );
}

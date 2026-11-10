"use client";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import Reviews from "@/components/instructor/reviews/Reviews";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";

export default function MyTeamReviews() {

  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("reviews")} firstElement={t("reviews")} />
      <Reviews teamSlug={slug} />
    </div>
  );
}

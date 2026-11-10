"use client";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import Notifications from "@/components/instructor/notification/Notifications";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";

export default function NotificationsPage() {

  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("notifications")} firstElement={t("notifications")} />
      <Notifications teamSlug={slug} />
    </div>
  );
}

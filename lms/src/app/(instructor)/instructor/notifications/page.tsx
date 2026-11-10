"use client";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import Notifications from "@/components/instructor/notification/Notifications";
import { useTranslation } from "@/hooks/useTranslation";

export default function NotificationsPage() {

  const { t } = useTranslation();

  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("notifications")} firstElement={t("notifications")} />
      <Notifications />
    </div>
  );
}

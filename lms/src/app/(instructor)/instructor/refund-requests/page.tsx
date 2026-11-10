"use client"
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import RefundRequestsTable from "@/components/instructor/refundRequest/RefundRequestsTable";
import { useTranslation } from "@/hooks/useTranslation";

export default function RefundRequests() {
    const { t } = useTranslation();
    return (
        <div className="space-y-4 md:space-y-6">
            <DashboardBreadcrumb title={t("refund_requests")} firstElement={t("earnings")} firstElementLink="/instructor/earnings" secondElement={t("refund_requests")} />
            <RefundRequestsTable />
        </div>

    );
}
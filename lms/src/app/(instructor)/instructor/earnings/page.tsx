"use client";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import CoursesTable from "@/components/instructor/dashboard/CoursesTable";
import { getEarnings, EarningsData, ActionCardType } from "@/utils/api/instructor/earnings/getEarnings";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import SummaryCards from "@/components/instructor/earnings/SummaryCards";
import RevenueChart from "@/components/instructor/earnings/RevenueChart";
import WithdrawlsCards from "@/components/instructor/earnings/WithdrawlsCards";
import EarningsChart from "@/components/instructor/earnings/EarningsChart";
import MostSellingCourses from "@/components/instructor/dashboard/MostSellingCourses";
import EarningsSkeleton from "../../../../components/skeletons/instrutor/earnings/EarningsSkeleton";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { setInstructorWithdrawal } from "@/redux/reducers/helpersReducer";
import { useTranslation } from "@/hooks/useTranslation";
import CourseRevenueTable from "@/components/instructor/dashboard/CourseRevenueTable";

export default function EarningsPage() {

  const { t } = useTranslation();
  const dispatch = useDispatch();

  // State for earnings data
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch earnings data function
  const fetchEarningsData = async () => {
    setIsLoading(true);

    try {
      // Fetch earnings data
      const response = await getEarnings();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setEarningsData(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch earnings data");
          setEarningsData(null);
        }
      } else {
        console.log("response is null in component", response);
        setEarningsData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setEarningsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch earnings data on component mount
  useEffect(() => {
    fetchEarningsData();
  }, []);

  useEffect(() => {
    if (earningsData?.action_cards) {
      dispatch(setInstructorWithdrawal({
        totalwithdrawal: earningsData.action_cards.total_withdrawal.value,
        availableToWithdrawal: earningsData.action_cards.available_to_withdraw.value,
      }));
    }
  }, [earningsData]);


  return (
    <div className="space-y-4 md:space-y-6">
      <DashboardBreadcrumb title={t("earnings")} firstElement={t("earnings")} firstElementLink="/instructor/earnings" secondElement={t("overview")} />
      {
        isLoading ?
          <>
            <EarningsSkeleton />
          </>
          :
          earningsData ?
            <div className="space-y-4 md:space-y-6">

              {/* Summary Cards */}
              <SummaryCards summaryCards={earningsData.summary_cards} />

              {/* Revenue Chart and Withdraw Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                <RevenueChart revenueData={earningsData.charts.revenue_chart} />
                <WithdrawlsCards withdrawlsData={earningsData?.action_cards as ActionCardType} />
              </div>

              {/* Yearly Earnings Chart */}
              <EarningsChart earningsData={earningsData?.charts.earnings_chart} />

              {/* Top Selling Courses */}
              <MostSellingCourses isEarningPage={true} />

              {/* Revenue Revenue Table */}
              <CourseRevenueTable />

              {/* All Courses */}
              <CoursesTable earningsPage={true} />

            </div>
            :
            !isLoading &&
            <DataNotFound />
      }
    </div>

  );
}

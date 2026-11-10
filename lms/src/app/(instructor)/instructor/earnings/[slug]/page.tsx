"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BiSolidStar } from "react-icons/bi";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useParams, useSearchParams } from "next/navigation";
import { getCourseAnalysis, CourseAnalysisData } from "@/utils/api/instructor/earnings/getCourseAnalysis";
import toast from "react-hot-toast";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import SummaryCards from "@/components/instructor/earnings/SummaryCards";
import RevenueChart from "@/components/instructor/earnings/RevenueChart";
import EarningsChart from "@/components/instructor/earnings/EarningsChart";
import EarningsSkeleton from "@/components/skeletons/instrutor/earnings/EarningsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { useTranslation } from "@/hooks/useTranslation";
import SingleCourseRevenueTable from "@/components/instructor/dashboard/SingleCourseRevenueTable";

export default function CourseAnalyticsDetails() {

  // Get course slug from URL params
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  // Check if user came from CourseRevenueTable
  const isFromRevenueTable = searchParams.get('from') === 'revenue-table';

  // Local state for course analysis data
  const [courseAnalysisData, setCourseAnalysisData] = useState<CourseAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Fetch course analysis function
  const fetchCourseAnalysis = async () => {
    if (!slug) {
      console.log("Missing required parameters: slug");
      return;
    }

    setIsLoading(true);

    try {

      // Call the course analysis API
      const response = await getCourseAnalysis({
        course_slug: slug,
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setCourseAnalysisData(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch course analysis");
          setCourseAnalysisData(null);
        }
      } else {
        console.log("response is null in component", response);
        setCourseAnalysisData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setCourseAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch course analysis data on component mount
  useEffect(() => {
    if (!isFromRevenueTable) {
      fetchCourseAnalysis();
    }
  }, [slug]);

  return (
    <div className="w-full py-4">
      <DashboardBreadcrumb title={t("earnings")} firstElement={t("earnings")} firstElementLink="/instructor/earnings" secondElement={isFromRevenueTable ? t("course_revenue") : t("course_analytics")} />

      <Link href="/instructor/earnings" className="mb-6 inline-block">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 text-white" />
        </div>
      </Link>

      {/* Display either Revenue Table or Course Analysis */}
      {isFromRevenueTable ? (
        // Single course revenue table
        <SingleCourseRevenueTable />
      ) : isLoading ? (
        <div className="space-y-4 md:space-y-6">
          <Skeleton className="w-full h-[200px] rounded-[8px] overflow-hidden bg-gray-400" />
          <EarningsSkeleton />
        </div>
      ) : courseAnalysisData ? (
        <>
          {/* Course Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6 flex flex-wrap items-center gap-6">
              <div className="relative w-[135px] h-[136px] rounded-[8px] overflow-hidden">
                <CustomImageTag
                  src={courseAnalysisData?.course_info?.thumbnail || ""}
                  alt={courseAnalysisData?.course_info?.title || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center text-sm">
                    <span className="text-yellow-500 mr-1">
                      <BiSolidStar />
                    </span>{" "}
                    {courseAnalysisData?.course_info?.average_rating || 0} ({courseAnalysisData?.course_info?.total_ratings_count || 0})
                  </span>
                </div>
                <h2 className="text-xl font-bold">
                  {courseAnalysisData?.course_info?.title || "Loading..."}
                </h2>
                <p className="text-sm text-gray-600">
                  {courseAnalysisData?.course_info?.short_description || "Loading course description..."}
                </p>
                <p className="text-lg font-bold mt-1">
                  {courseAnalysisData?.course_info?.discount_price && courseAnalysisData?.course_info?.discount_price > 0
                    ? `${getCurrencySymbol()}${courseAnalysisData?.course_info?.discount_price.toFixed(2)}`
                    : courseAnalysisData?.course_info?.price && courseAnalysisData?.course_info?.price > 0
                      ? `${getCurrencySymbol()}${courseAnalysisData?.course_info?.price.toFixed(2)}`
                      : "Free"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          {courseAnalysisData && (
            <div className="grid grid-cols-1 gap-6 mb-6">
              <SummaryCards summaryCards={courseAnalysisData?.summary_cards} />
              <RevenueChart revenueData={courseAnalysisData?.revenue_chart} />
              <EarningsChart earningsData={courseAnalysisData?.earnings_chart} />
            </div>
          )}
        </>
      ) : (
        <DataNotFound />
      )}

    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatsOverview from "@/components/instructor/dashboard/StatsOverview";
import SalesStatisticsChart from "@/components/instructor/dashboard/SalesStatisticsChart";
import MostSellingCourses from "@/components/instructor/dashboard/MostSellingCourses";
import CoursesTable from "@/components/instructor/dashboard/CoursesTable";
import ProfileCompletionCard from "@/components/instructor/ProfileCompletionCard";
import EmptyCourseView from "@/components/instructor/EmptyCourseView";
import { getInstructorDashboard, GetInstructorDashboardParams, InstructorDashboardData, OverviewStats, ProfileCompletion } from "@/utils/api/instructor/dashboad/getInstructorDashboard";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesChartData } from "@/utils/api/instructor/course/getCourseDetails";

export default function InstructorDashboard() {
  // Local state for dashboard data
  const [dashboardData, setDashboardData] = useState<InstructorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dashboard data function
  const fetchInstructorDashboard = async (params?: {
    id?: number;
    page?: number;
    per_page?: number;
  }) => {
    setIsLoading(true);

    try {
      // Build API parameters
      const apiParams: GetInstructorDashboardParams = {
        id: params?.id,
        page: params?.page,
        per_page: params?.per_page,
      };

      // Fetch dashboard data
      const response = await getInstructorDashboard(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setDashboardData(response.data);
          }
        } else {
          console.log("API error:", response.message);
          if (response.message !== "Your instructor account has been suspended. Please contact support.") {
            toast.error(response.message || "Failed to fetch dashboard data");
            setDashboardData(null);
          }
        }
      } else {
        console.log("response is null in component", response);
        setDashboardData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchInstructorDashboard();
  }, []);

  const profileCompletion = dashboardData?.profile_completion;
  const chartData = dashboardData?.sales_statistics;
  const totalCouses = dashboardData?.overview_stats && dashboardData?.overview_stats?.total_courses.value;


  return (
    <div className="space-y-6">
      {
        profileCompletion?.percentage && profileCompletion?.percentage < 100 &&
        <ProfileCompletionCard profileCompletion={profileCompletion as ProfileCompletion} />
      }

      {
        isLoading ? <>
          <div className="space-y-6">
            <Skeleton className="w-full h-80 bg-gray-400" />

            <div className="grid grid-cols-1 between-1200-1399:!grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="between-1200-1399:!col-span-12 xl:col-span-2">
                <Skeleton className="w-full h-80 bg-gray-400" />
              </div>
              <div className="between-1200-1399:!col-span-12">
                <Skeleton className="w-full h-80 bg-gray-400" />
              </div>
            </div>
            <div>
              <Skeleton className="w-full h-80 bg-gray-400" />
            </div>
          </div>
        </>
          :
          Number(totalCouses) > 0 ?
            <div className="space-y-6">
              <StatsOverview data={dashboardData?.overview_stats as OverviewStats} />

              {/* Sales Statistics and Most Selling Courses in a 2-column layout */}
              <div className="grid grid-cols-1 between-1200-1399:!grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="between-1200-1399:!col-span-12 xl:col-span-2">
                  <SalesStatisticsChart data={chartData as SalesChartData} />
                </div>
                <div className="between-1200-1399:!col-span-12" >
                  <MostSellingCourses />
                </div>
              </div>
              <CoursesTable />
            </div>
            :
            !isLoading &&
            <EmptyCourseView />
      }
    </div>
  );
}

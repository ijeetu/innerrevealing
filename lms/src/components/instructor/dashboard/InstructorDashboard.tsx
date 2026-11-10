"use client";
import { useCallback, useEffect, useState } from 'react';
import StatsOverview from './StatsOverview';
import SalesStatisticsChart from './SalesStatisticsChart';
import MostSellingCourses from './MostSellingCourses';
import CoursesTable from './CoursesTable';
import ProfileCompletionCard from '@/components/instructor/ProfileCompletionCard';
import { getInstructorDashboard, type GetInstructorDashboardParams, type InstructorDashboardData } from '@/utils/api/instructor/dashboad/getInstructorDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorDashboard() {
  const [dashboardData, setDashboardData] = useState<InstructorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInstructorDashboard = useCallback(async (params?: GetInstructorDashboardParams, background = false) => {
    if (!background) setIsLoading(true);
    setError('');
    try {
      const response = await getInstructorDashboard(params);
      if (!response || response.error || !response.data) throw new Error(response?.message || 'Could not load your dashboard. Please try again.');
      setDashboardData(response.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not load your dashboard.');
    } finally {
      if (!background) setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchInstructorDashboard(); }, [fetchInstructorDashboard]);
  const profileCompletion = dashboardData?.profile_completion;

  return <div className="space-y-6">
    {error && <div className="ir-instructor-error" role="alert"><p>{error}</p><button type="button" className="commonBtn" onClick={() => void fetchInstructorDashboard()}>Try again</button></div>}
    {isLoading ? <div className="space-y-6">
      <Skeleton className="w-full h-80 bg-gray-200" />
      <div className="grid grid-cols-1 between-1200-1399:!grid-cols-1 xl:grid-cols-3 gap-6"><div className="between-1200-1399:!col-span-12 xl:col-span-2"><Skeleton className="w-full h-80 bg-gray-200" /></div><div className="between-1200-1399:!col-span-12"><Skeleton className="w-full h-80 bg-gray-200" /></div></div>
      <Skeleton className="w-full h-80 bg-gray-200" />
    </div> : dashboardData && <>
      {profileCompletion && profileCompletion.percentage < 100 && <ProfileCompletionCard profileCompletion={profileCompletion} />}
      <StatsOverview data={dashboardData.overview_stats} />
      <div className="grid grid-cols-1 between-1200-1399:!grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="between-1200-1399:!col-span-12 xl:col-span-2"><SalesStatisticsChart data={dashboardData.sales_statistics} /></div>
        <div className="between-1200-1399:!col-span-12"><MostSellingCourses /></div>
      </div>
      <CoursesTable onCourseChange={() => void fetchInstructorDashboard(undefined, true)} />
    </>}
  </div>;
}

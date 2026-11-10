import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

interface RevenueChartSkeletonProps {
    isRevenueChart?: boolean;
}

const RevenueChartSkeleton: React.FC<RevenueChartSkeletonProps> = ({isRevenueChart}) => {
    return (
        <Skeleton className={`md:col-span-2 w-full ${isRevenueChart? 'h-full':'h-[400px]'} bg-gray-400`} />
    )
}

export default RevenueChartSkeleton

import React from 'react'
import RevenueChartSkeleton from './RevenueChartSkeleton'
import SummaryCardsSkeleton from './SummaryCardsSkeleton'
import WithdrawalCardsSkeleton from './WithdrawalCardsSkeleton'

const EarningsSkeleton = () => {
    return (
        <div className="space-y-4 md:space-y-6">

            {/* Summary Cards */}
            <SummaryCardsSkeleton />

            {/* Revenue Chart and Withdraw Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                <RevenueChartSkeleton isRevenueChart={true} />
                <WithdrawalCardsSkeleton />
            </div>

            {/* Yearly Earnings Chart */}
            <RevenueChartSkeleton />

            {/* Top Selling Courses */}
            <RevenueChartSkeleton />

            {/* All Courses */}
            <RevenueChartSkeleton />

        </div>
    )
}

export default EarningsSkeleton

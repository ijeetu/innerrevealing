import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const SummaryCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Total Revenue Card */}
            <Skeleton className='w-full h-44 bg-gray-400' />
            {/* Total Commission Card */}
            <Skeleton className='w-full h-44 bg-gray-400' />
            {/* Total Earning Card */}
            <Skeleton className='w-full h-44 bg-gray-400' />
        </div>
    )
}

export default SummaryCardsSkeleton

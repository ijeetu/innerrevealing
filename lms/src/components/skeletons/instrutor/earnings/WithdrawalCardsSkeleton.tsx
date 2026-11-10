import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const WithdrawalCardsSkeleton = () => {
    return (
        <div className="flex flex-col md:flex-row lg:flex-col gap-3 md:gap-4">
            {/* Available to Withdraw Card */}
            <Skeleton className='w-full h-44 bg-gray-400' />

            {/* Total Withdrawal Card */}
            <Skeleton className='w-full h-44 bg-gray-400' />

        </div>
    )
}

    export default WithdrawalCardsSkeleton

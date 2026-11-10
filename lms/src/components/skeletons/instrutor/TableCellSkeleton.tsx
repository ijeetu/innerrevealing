'use client'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const TableCellSkeleton = () => {
    return (
        <div className='space-y-4'>
            {
                Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton className="h-[230px] md:h-10 rounded w-full !bg-gray-500" key={index} />
                ))
            }
        </div>
    )
}

export default TableCellSkeleton

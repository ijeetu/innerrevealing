"use client";
import React from 'react'
import { Skeleton } from "@/components/ui/skeleton";


const RefundDetailsSkeleton = () => {
  return (
    <div className="flex items-center gap-4 sectionBg py-2 px-4 rounded-lg w-max">
        {/* Course Thumbnail + Title */}
        <div className="flex gap-3 w-[300px] min-w-[280px]">
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>

        {/* Reject Reason */}
        <Skeleton className="h-4 w-[224px] min-w-[224px]" />

        {/* Attached File */}
        <Skeleton className="h-4 w-[224px] min-w-[224px]" />

        {/* Amount */}
        <Skeleton className="h-4 w-[100px] min-w-[100px]" />

        {/* Status */}
        <Skeleton className="h-6 w-[140px] min-w-[140px]" />
    </div>
  )
}

export default RefundDetailsSkeleton

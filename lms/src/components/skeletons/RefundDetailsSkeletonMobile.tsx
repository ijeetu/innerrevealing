"use client";
import React from 'react'
import { Skeleton } from "@/components/ui/skeleton";

const RefundDetailsSkeletonMobile = () => {
    return (
        // Mobile Skeleton View
        <div className="sectionBg p-4 rounded-2xl border border-[#E5E9F2] flex flex-col gap-3.5 mt-4 sm:hidden">
            {/* Top: Course Thumbnail + Name */}
            <div className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>

            <div className="border-b border-[#D8E0E6]" />

            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>

            <div className="border-b border-[#D8E0E6]" />

            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-24" />
            </div>

            <div className="border-b border-[#D8E0E6]" />

            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-14" />
            </div>

            <div className="border-b border-[#D8E0E6]" />

            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
        </div>
    )
}

export default RefundDetailsSkeletonMobile

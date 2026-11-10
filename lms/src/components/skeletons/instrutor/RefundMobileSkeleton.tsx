import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface RefundMobileSkeletonProps {
    rows?: number;
}

export default function RefundMobileSkeleton({ rows = 5 }: RefundMobileSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="p-4 border-b border-[#E8E8EC] space-y-4">
                    {/* Index */}
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-4 w-6" />
                    </div>

                    {/* Student Info */}
                    <div className="flex items-center gap-3 border-b border-[#E8E8EC] pb-4">
                        <Skeleton className="w-12 h-12 rounded-md bg-gray-200 shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        {/* Course */}
                        <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        {/* Enrollment Date */}
                        <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        {/* Student Progress */}
                        <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="w-10 h-10 rounded-full" />
                        </div>
                        {/* Status */}
                        <div className="flex justify-between items-center pb-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-6 w-20 rounded-sm" />
                        </div>
                        {/* Action */}
                        <div className="">
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

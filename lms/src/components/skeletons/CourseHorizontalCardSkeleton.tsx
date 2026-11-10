"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CourseHorizontalCardSkeleton = () => {
    return (
        <div className="rounded-[16px] overflow-hidden bg-white grid grid-cols-1 md:grid-cols-2 gap-4 h-full border borderColor p-3 md:p-4">
            {/* Image Skeleton */}
            <div className="relative aspect-video w-full rounded-[16px] h-full">
                <Skeleton className="w-full h-full rounded-[16px]" />
                {/* Bookmark button placeholder */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-200"></div>
            </div>

            {/* Content Skeleton */}
            <div className="flex flex-col gap-4">
                {/* Level + Rating */}
                <div className="flex items-center justify-between">
                    <Skeleton className="w-16 h-6 rounded-full" /> {/* Level */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-20 h-4 rounded" /> {/* Rating */}
                    </div>
                </div>

                {/* Title + Description */}
                <div className="flex flex-col gap-1">
                    <Skeleton className="w-3/4 h-6 rounded" /> {/* Title */}
                    <Skeleton className="w-full h-4 rounded" />
                    <Skeleton className="w-5/6 h-4 rounded" />
                    <Skeleton className="w-4/6 h-4 rounded" />
                </div>

                {/* Author */}
                <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-4 rounded" />
                    <Skeleton className="w-24 h-4 rounded" />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-24 h-6 rounded" /> {/* Price */}
                    <Skeleton className="w-20 h-4 rounded" /> {/* Discount */}
                </div>
            </div>
        </div>
    );
};

export default CourseHorizontalCardSkeleton;

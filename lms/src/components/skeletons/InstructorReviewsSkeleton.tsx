"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewMattersSkeleton from "./ReviewMattersSkeleton";

export default function InstructorReviewsSkeleton({
  showReviewForm = false
}: {
  showReviewForm?: boolean;
}) {
  return (
    <div className="grid grid-cols-12 max-575:gap-y-10 between-1200-1399:gap-y-20 max-1199:gap-y-20 gap-6">
      
      {/* Left Column */}
      <div className="max-1199:col-span-12 col-span-8 flex flex-col max-1199:order-1">
        
        {/* Title */}
        <Skeleton className="h-6 w-40 mb-4" />

        {/* Average Reviews Box */}
        <Skeleton className="h-40 w-full rounded-2xl mb-6" />

        {/* Review List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Right Column – only if purchased */}
      {showReviewForm && (
        <div className="max-1199:col-span-12 col-span-4 max-1199:order-2">
          <ReviewMattersSkeleton />
        </div>
      )}
    </div>
  );
}

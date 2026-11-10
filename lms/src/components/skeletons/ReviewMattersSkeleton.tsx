"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewMattersSkeleton() {
  return (
    <div className="w-full rounded-2xl p-4 space-y-4">
      {/* Title */}
      <Skeleton className="h-6 w-32" />

      {/* Textarea Box */}
      <Skeleton className="h-20 w-full rounded-xl" />

      {/* Stars */}
      <div className="flex gap-2">
        {[1,2,3,4,5].map((i) => (
          <Skeleton key={i} className="h-6 w-6 rounded-full" />
        ))}
      </div>

      {/* Submit Btn */}
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

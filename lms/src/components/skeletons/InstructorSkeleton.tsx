'use client'
import { Skeleton } from "@/components/ui/skeleton";

const InstructorSkeleton: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden rounded-2xl flex flex-col shadow-sm border border-gray-100">
      {/* Video thumbnail skeleton with improved styling */}
      <div className="relative aspect-video h-[200px] overflow-hidden">
        <Skeleton className="w-full h-full" />
        {/* Play button skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 rounded-full p-4 ">
            <Skeleton className="w-5 h-5 rounded" />
          </div>
        </div>
      </div>

      {/* Instructor info skeleton with improved spacing */}
      <div className="p-6 space-y-5">
        {/* Instructor profile section skeleton */}
        <div className="flex items-start gap-4">
          {/* Profile image skeleton */}
          <div className="relative flex-shrink-0">
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name skeleton */}
            <Skeleton className="h-5 w-32" />
            {/* Title skeleton */}
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Stats section skeleton */}
        <div className="space-y-3">
          {/* Rating section skeleton */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Courses section skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* CTA button skeleton */}
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  );
};

export default InstructorSkeleton;
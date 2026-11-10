'use client'
import { Skeleton } from "@/components/ui/skeleton";

const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-[16px] overflow-hidden bg-white flex flex-col gap-4 h-full border borderColor p-3 md:p-4">
      {/* Course Image Skeleton */}
      <div className="relative bg-slate-300 aspect-video w-full rounded-[16px] overflow-hidden">
        <Skeleton className="w-full h-full rounded-[16px]" />
        {/* Bookmark Button Skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Level and Rating Section */}
        <div className="flex items-center justify-between">
          {/* Level Badge Skeleton */}
          <Skeleton className="h-6 w-20 rounded-full" />
          {/* Rating Section Skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-2" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Title and Description Section */}
        <div className="flex flex-col gap-1 min-h-[112px]">
          {/* Title Skeleton */}
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          
          {/* Description Skeleton */}
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Instructor Section */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Price Section */}
        <div className="space-y-2">
          <hr className="w-[120%] -ml-6 borderColor" />
          <div className="flex items-center justify-between">
            {/* Price Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
            {/* Discount Skeleton */}
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton; 
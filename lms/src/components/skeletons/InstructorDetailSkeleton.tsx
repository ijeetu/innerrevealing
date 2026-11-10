'use client'
import { Skeleton } from "@/components/ui/skeleton";

const InstructorDetailSkeleton: React.FC = () => {
  return (
    <div className="commonGap">
      <div className="sectionBg py-8 md:py-12">
        <div className="container space-y-4">
          {/* Breadcrumb skeleton */}
          <div className="bg-white rounded-full py-2 px-4 w-max flexCenter gap-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Instructor Detail Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Thumbnail skeleton */}
            <div className="col-span-1 lg:col-span-1 h-full">
              <div className="relative bg-[#A5B7C4] aspect-video rounded-[24px] overflow-hidden">
                <Skeleton className="w-full h-full" />
                {/* Play button skeleton */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 opacity-90">
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Info skeleton */}
            <div className="col-span-1 lg:col-span-2">
              <div className="p-2 md:p-6 rounded-lg">
                {/* Profile section skeleton */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-[87px] h-[87px] md:w-[100px] md:h-[100px] rounded-[12px] overflow-hidden border border-[#ebebeb] p-1 flexCenter">
                    <Skeleton className="w-[78px] h-[78px] md:w-[92px] md:h-[92px] rounded-[6px]" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </div>

                {/* Stats grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-2xl">
                  {/* Rating skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  {/* Courses skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>

                  {/* Enrolled students skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Skills skeleton */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-12" />
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>

                {/* Social media section skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section skeleton */}
      <div className="mt-8 container">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* Courses Section skeleton */}
      <div className="sectionBg py-4 sm:py-8 md:py-12 lg:py-16">
        <div className="container space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-y-3">
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flexCenter">
            <Skeleton className="h-12 w-40 rounded" />
          </div>
        </div>
      </div>

      {/* Reviews Section skeleton */}
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-12 max-575:gap-y-10 between-1200-1399:gap-y-20 max-1199:gap-y-20 gap-6">
          <div className="max-1199:col-span-12 col-span-8 flex flex-col gap-12 max-1199:order-2">
            {/* Reviews content skeleton */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              {/* Rating distribution skeleton */}
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>

              {/* Individual reviews skeleton */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3 p-4 border border-[#ebebeb] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-1199:col-span-12 col-span-4 max-1199:order-1">
            {/* Review matters section skeleton */}
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailSkeleton;

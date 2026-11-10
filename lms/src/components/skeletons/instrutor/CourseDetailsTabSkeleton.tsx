import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card"; // or the Card you already use

export default function CourseDetailsTabSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="p-3 sm:p-4">
          <Skeleton className="h-5 w-40" />
        </div>

        <hr className="w-full h-[1px] border borderColor" />

        <div className="p-3 sm:p-4 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-3 w-40" />
          </div>

          {/* Short Desc */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-3 w-48" />
          </div>

          {/* Category + Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>

          {/* Language + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full rounded-md" />
              <div className="flex gap-2 mt-2 flex-wrap">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>

          {/* Co-Instructors */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>

          {/* Meta Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>

          {/* Media */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-40 w-full rounded-md" />
          </div>

          {/* Toggle */}
          <Skeleton className="h-6 w-64" />
        </div>
      </Card>

      {/* Button */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

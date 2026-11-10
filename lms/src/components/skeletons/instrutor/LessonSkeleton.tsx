import { Skeleton } from "@/components/ui/skeleton"

export function LessonSkeleton() {
  return (
    <div className="flex justify-between items-center p-3 md:p-4 sectionBg cursor-pointer">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Drag icon placeholder */}
        <Skeleton className="h-4 w-4 rounded" />
        <div>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Edit button */}
        <Skeleton className="h-7 w-7 md:h-8 md:w-8 rounded" />
        {/* Delete button */}
        <Skeleton className="h-7 w-7 md:h-8 md:w-8 rounded" />
        {/* Caret icon */}
        <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded" />
      </div>
    </div>
  )
}

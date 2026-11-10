import { Skeleton } from "@/components/ui/skeleton"

export function CurriculumSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden w-full borderColor">
      <div className="flex justify-between items-center p-4 cursor-pointer">
        {/* Left side */}
        <div className="flex items-center">
          <div className="flex items-center">
            {/* Play icon placeholder */}
            <Skeleton className="h-7 w-7 rounded-full mr-2" />
            {/* Index number placeholder */}
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            {/* Title placeholder */}
            <Skeleton className="h-4 w-32 sm:w-40" />
          </div>
        </div>

        {/* Right side (buttons) */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}

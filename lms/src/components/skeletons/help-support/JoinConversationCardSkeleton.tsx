'use client'
import { Skeleton } from "@/components/ui/skeleton";

const JoinConversationCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border borderColor flexColCenter group">
            <div className="flexColCenter text-center gap-2 mb-6">
                {/* Image skeleton */}
                <Skeleton className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-[14px] mb-8" />
                {/* Title skeleton */}
                <Skeleton className="h-6 w-3/4" />
                {/* Description skeleton */}
                <div className="min-h-[80px] w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
            {/* Button skeleton */}
            <Skeleton className="h-10 w-24 rounded-[4px]" />
        </div>
    );
};

export default JoinConversationCardSkeleton;
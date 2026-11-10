import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueMobileSkeletonProps {
    rows?: number;
}

export default function RevenueMobileSkeleton({ rows = 5 }: RevenueMobileSkeletonProps) {
    return (
        <React.Fragment>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="p-4 border-b border-[#E8E8EC] space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-6 rounded" />
                        <Skeleton className="h-[30px] w-[30px] rounded-[4px]" />
                    </div>

                    <div className="flex gap-3 border-b border-[#E8E8EC] pb-4">
                        <Skeleton className="h-[60px] w-[100px] rounded" />
                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-3 w-2/3 rounded" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                            <Skeleton className="h-4 w-28 rounded" />
                            <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-8 rounded" />
                                <Skeleton className="h-3 w-24 rounded" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-4">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="h-4 w-16 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </React.Fragment>
    );
}

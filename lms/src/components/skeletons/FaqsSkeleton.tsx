"use client"
import React from 'react'
import { Skeleton } from '../ui/skeleton'

const FaqsSkeleton = () => {
    return (
        <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="overflow-hidden border border-[#D8E0E6] rounded-[8px] p-4"
                >
                    {/* Question skeleton */}
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    {/* Answer skeleton (collapsed simulation) */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FaqsSkeleton

"use client";
import React from 'react'

const ReviewLoadMoreSkeleton = () => {
    return (
        <div className="p-6 border-b borderColor">
            <div className="flex items-start">
                <div className="mr-4 max-575:hidden">
                    <div className="h-[48px] w-[48px] rounded-[4px] bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewLoadMoreSkeleton

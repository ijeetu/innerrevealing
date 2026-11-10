"use client";
import React from 'react'
const MyLearningSkeleton = () => {
    return (
        <div className="bg-[#F2F5F7C2] rounded-2xl p-4 border borderColor flex flex-col h-full animate-pulse">
            <div className="flex flex-col sm:flex-row flex-grow">
                {/* Image skeleton */}
                <div className="w-full sm:w-1/3 bg-gray-200 rounded-lg mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 h-36 sm:h-24 md:h-32" />
                {/* Text skeleton */}
                <div className="w-full sm:w-2/3 flex flex-col justify-start space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    <div className="border-t border-gray-100 pt-2 sm:pt-1 mt-2 space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MyLearningSkeleton;
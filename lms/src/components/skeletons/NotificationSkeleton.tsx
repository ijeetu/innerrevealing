"use client"
import React from 'react'

const NotificationSkeleton = () => {
    return (
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="sectionBg p-4 rounded-[10px] flex gap-3 md:gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-gray-300 rounded-md flex-shrink-0"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default NotificationSkeleton

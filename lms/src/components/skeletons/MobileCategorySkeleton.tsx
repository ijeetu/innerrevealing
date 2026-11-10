"use client"
import React from 'react'

const MobileCategorySkeleton = () => {
    return (
        <>
            {/* Skeleton for subcategory item */}
            <div className="flex items-center justify-between w-full px-2 py-2 animate-pulse">
                {/* Left side: category name placeholder */}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                    <div className="w-32 h-4 bg-gray-300 rounded"></div>
                </div>

                {/* Right side: nested icon placeholder */}
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            </div>

        </>
    )
}

export default MobileCategorySkeleton

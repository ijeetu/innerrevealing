'use client'
import React from 'react'

const QuestionsResultSkeleton = () => {
  return (
    <div className="pb-4 md:pb-6 animate-pulse">
      {/* Question header */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3 md:mb-4">
        {/* Q. number box */}
        <div className="min-w-[40px] md:min-w-[50px] h-[40px] md:h-[50px] sectionBg rounded-md"></div>

        {/* Question text + status */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 md:w-2/3"></div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 pl-0 md:pl-[50px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border borderColor rounded-md p-2 md:p-3 flex items-center gap-2 text-sm sectionBg"
          >
            <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-gray-200 rounded-md"></div>
            <div className="flex-1 h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuestionsResultSkeleton

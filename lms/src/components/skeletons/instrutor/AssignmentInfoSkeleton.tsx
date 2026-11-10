'use client'
import React from 'react'

const AssignmentInfoSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse bg-white p-6 rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* left side */}
        <div className="flex sm:items-center gap-4 flex-col sm:flex-row sm:gap-2 w-full">
          <div className="bg-gray-200 rounded-full w-10 h-10"></div>
          <div className="h-4 bg-gray-200 rounded w-40 sm:w-64"></div>
        </div>

        {/* right side */}
        <div className="flex sm:flex-col sm:ml-0 justify-between w-full sm:justify-end sm:items-end">
          <div className="flex sm:flex-col items-center sm:items-end gap-1">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="border-t border-gray-200"></div>

      {/* Assignment Info section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div className="p-3 sectionBg rounded-[8px]">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="p-3 sectionBg rounded-[8px]">
          <div className="h-3 bg-gray-200 rounded w-28 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-36"></div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentInfoSkeleton

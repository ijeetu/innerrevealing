'use client'
import React from 'react'

const StudentInfoSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 gap-4 flex-wrap">
        {/* Left section - Back + Student Info */}
        <div className="flex items-center w-full md:w-auto">
          {/* Back button */}
          <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full mr-4 flex-shrink-0"></div>

          {/* Avatar + Student Info */}
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-md mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 md:w-40 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Right section - Quiz Score Summary */}
        <div className="flex flex-row justify-between gap-4 w-full md:w-auto">
          {/* Correct Answer */}
          <div className="bg-white p-3 md:p-4 flex-1 md:flex-none border-r borderColor rounded-md">
            <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-10"></div>
          </div>

          {/* Incorrect Answer */}
          <div className="bg-white p-3 md:p-4 flex-1 md:flex-none rounded-md">
            <div className="h-3 bg-gray-200 rounded w-28 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentInfoSkeleton

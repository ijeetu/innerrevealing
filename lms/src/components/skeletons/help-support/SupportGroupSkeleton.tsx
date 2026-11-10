"use client"
import React from 'react';

const SupportGroupSkeleton = () => {
  return (
    <div className="bg-white">
      {/* Stats Header Skeleton */}
      <div className="py-6 px-4 md:px-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3 animate-pulse">
        <div className="flex items-center flex-wrap gap-3 md:gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="h-8 w-32 bg-gray-300 rounded"></div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {/* Render 5 skeleton discussion items to match typical loading */}
        {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b border-gray-100 pb-4 animate-pulse">
          <div className="flex gap-3 md:gap-4">
            {/* Avatar Circle Skeleton */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>

            <div className="flex-grow">
              {/* Title and Author Row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <div className="flex-1">
                  {/* Discussion title skeleton */}
                  <div className="h-5 w-3/4 bg-gray-300 rounded mb-1"></div>
                  {/* Author skeleton */}
                  <div className="h-3 w-20 bg-gray-300 rounded"></div>
                </div>
                {/* Time skeleton */}
                <div className="h-3 w-16 bg-gray-300 rounded mt-1 sm:mt-0"></div>
              </div>

              {/* Description skeleton */}
              <div className="space-y-2 mb-3">
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
              </div>

              {/* Stats and Action Button Row */}
              <div className="flex justify-between items-center sectionBg py-3 px-3 rounded-[5px]">
                <div className="flex flex-wrap gap-2 md:gap-3 mb-2 sm:mb-0">
                  <div className="h-6 w-20 bg-gray-300 rounded"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}

        {/* Load More Button Skeleton */}
        <div className="text-center pt-4 mb-5">
          <div className="h-10 w-40 bg-gray-300 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SupportGroupSkeleton;

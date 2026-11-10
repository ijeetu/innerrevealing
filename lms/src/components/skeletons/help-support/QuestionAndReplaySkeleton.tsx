"use client"
import React from 'react';

const QuestionAndReplaySkeleton = () => {
  return (
    <div className="bg-white">
      {/* Back Navigation Skeleton */}
      <div className="p-4 md:p-6">
        <div className="mb-4 animate-pulse">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gray-200 my-4"></div>
        
        <div className="p-4 md:p-6">
          {/* Main Question Post Skeleton */}
          <div className="border-b border-gray-200 pb-6 mb-6 animate-pulse">
            <div className="flex gap-3 md:gap-4 items-start">
              {/* Avatar Skeleton */}
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              
              {/* Content Skeleton */}
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-grow">
                    {/* Title Skeleton */}
                    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                    {/* Author Info Skeleton */}
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                  </div>
                  {/* Time Skeleton */}
                  <div className="h-3 w-16 bg-gray-300 rounded flex-shrink-0 ml-2"></div>
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                </div>
                
                {/* Stats Skeleton */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Replies List Skeleton */}
          <div className="space-y-6 mb-8">
            {/* Reply 1 */}
            <div className="flex gap-3 md:gap-4 items-start border-b border-gray-100 pb-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Reply 2 */}
            <div className="flex gap-3 md:gap-4 items-start border-b border-gray-100 pb-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  <div className="h-3 w-14 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Reply 3 */}
            <div className="flex gap-3 md:gap-4 items-start animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 w-28 bg-gray-300 rounded"></div>
                  <div className="h-3 w-10 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Load More Button Skeleton */}
          <div className="text-center mb-8 animate-pulse">
            <div className="h-10 w-32 bg-gray-300 rounded mx-auto"></div>
          </div>

          {/* Reply Editor Section Skeleton */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 animate-pulse">
            {/* Title */}
            <div className="h-5 w-12 bg-gray-300 rounded mb-3"></div>
            
            {/* Textarea Skeleton */}
            <div className="w-full p-3 bg-white border border-gray-300 rounded-md min-h-[120px] mb-4">
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              </div>
            </div>
            
            {/* Button Group Skeleton */}
            <div className="flex justify-end gap-3">
              <div className="h-10 w-20 bg-gray-300 rounded"></div>
              <div className="h-10 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionAndReplaySkeleton;

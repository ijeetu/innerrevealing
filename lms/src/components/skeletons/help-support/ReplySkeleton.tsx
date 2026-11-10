import React from "react";

/**
 * Skeleton component for individual reply items
 * Used when loading more replies after clicking "Load More Reply" button
 * Matches the structure of lines 333-368 in the main component
 */
const ReplySkeleton = ({ instructorCourseTab }: { instructorCourseTab?: boolean }) => {
  return (
    <div className={`${instructorCourseTab && 'bg-white p-4 rounded-2xl'} flex gap-3 md:gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0 mb-4`}>
      {/* Avatar skeleton - matches the avatar container */}
      <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
        <div className="w-full h-full bg-gray-200 animate-pulse rounded-full"></div>
      </div>
      
      {/* Content skeleton - matches the content container */}
      <div className="flex-grow">
        {/* Header section with author name and time */}
        <div className="flex justify-between items-start mb-2">
          {/* Author name and tag section */}
          <div className="flex flex-col">
            {/* Author name skeleton */}
            <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-1"></div>
            {/* Optional tag skeleton (currently commented out in original) */}
            {/* <div className="h-3 bg-gray-200 animate-pulse rounded w-16"></div> */}
          </div>
          {/* Time skeleton */}
          <div className="h-3 bg-gray-200 animate-pulse rounded w-16 flex-shrink-0 ml-2 mt-0.5"></div>
        </div>
        
        {/* Reply content skeleton */}
        <div className="space-y-2">
          {/* First line of reply content */}
          <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
          {/* Second line of reply content (shorter) */}
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

export default ReplySkeleton;

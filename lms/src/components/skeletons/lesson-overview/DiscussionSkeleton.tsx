import React from "react";

const DiscussionSkeleton = () => {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div className="w-48 h-5 bg-gray-300 rounded"></div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
          {/* Search input */}
          <div className="flex items-center w-full sm:w-64 h-10 border border-gray-100 rounded pl-2 overflow-hidden">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
          </div>
          {/* Ask question button */}
          <div className="w-32 h-10 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Ask Question Form Skeleton */}
      <div className="sectionBg p-4 md:p-6 rounded-lg mb-6">
        <div className="w-40 h-5 bg-gray-300 mb-3 rounded"></div>
        <div className="w-full h-24 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-end gap-3">
          <div className="w-20 h-8 bg-gray-300 rounded"></div>
          <div className="w-28 h-8 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* Discussion Posts Skeleton */}
      <div className="space-y-4 sectionBg p-4 rounded-2xl border border-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>

              <div className="flex-1 space-y-3">
                {/* User info */}
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-gray-300 rounded"></div>
                  <div className="w-16 h-2 bg-gray-200 rounded"></div>
                </div>

                {/* Message content */}
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>

                {/* Action buttons */}
                <div className="flex gap-4 mt-3">
                  <div className="w-20 h-3 bg-gray-300 rounded"></div>
                  <div className="w-20 h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button Skeleton */}
      <div className="flex justify-center mt-6">
        <div className="w-28 h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default DiscussionSkeleton;

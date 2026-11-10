import React from "react";

const DiscussionTopicSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 animate-pulse mt-4">
      <div className="flex items-start gap-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>

        <div className="flex-1">
          {/* User info */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="h-3 w-24 bg-gray-300 rounded"></div>
            <div className="h-2 w-16 bg-gray-200 rounded"></div>
          </div>

          {/* Post content */}
          <div className="space-y-2 mb-3 border-b border-gray-200 pb-3">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Actions */}
          <div className="flex gap-6 mt-3">
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Optional reply thread skeleton */}
      <div className="mt-4 ml-12 space-y-3">
        <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default DiscussionTopicSkeleton;

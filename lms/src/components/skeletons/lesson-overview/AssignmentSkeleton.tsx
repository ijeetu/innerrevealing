import React from "react";

const AssignmentSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 border border-gray-200 animate-pulse rounded-lg">
      {/* Chapter Skeleton */}
      {[...Array(1)].map((_, chapterIndex) => (
        <div
          key={chapterIndex}
          className="p-4 sectionBg rounded-[8px] flex flex-col gap-4"
        >
          {/* Chapter Title */}
          <div className="h-5 w-1/3 bg-gray-300 rounded"></div>

          {/* Assignments Skeleton */}
          {[...Array(1)].map((_, assignmentIndex) => (
            <div
              key={assignmentIndex}
              className="bg-white rounded-[8px] overflow-hidden p-4 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 w-40 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>

              {/* Attachment */}
              <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 mt-4">
                <div className="w-10 h-10 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>

              {/* My Assignment Section */}
              <div className="bg-[#F8FAFC] rounded-[8px] p-4 mt-4">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AssignmentSkeleton;

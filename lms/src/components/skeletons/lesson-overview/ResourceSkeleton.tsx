"use client"
import React from "react";

const ResourceSkeleton = () => {
  // Create placeholders for 2 chapters
  const chapterCount = [1, 2];
  const lectureCount = [1, 2];

  return (
    <div className="bg-white flex flex-col gap-4 animate-pulse">
      {chapterCount.map((_, chapterIndex) => (
        <div
          key={`chapter-skel-${chapterIndex}`}
          className="rounded-[8px] overflow-hidden border border-gray-100"
        >
          {/* Chapter Header */}
          <div className="flex justify-between items-center p-4 bg-[#F2F5F7]">
            <div className="h-4 w-40 bg-gray-300 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
          </div>

          {/* Expanded Content Placeholder */}
          <div className="p-4">
            <div className="h-4 w-32 bg-gray-300 rounded mb-3"></div>

            {/* Chapter Resources */}
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="h-3 w-60 bg-gray-300 rounded"></div>
              </div>
            ))}

            {/* Lecture Section */}
            <div className="h-4 w-36 bg-gray-300 rounded mt-6 mb-3"></div>

            {lectureCount.map((_, lectureIndex) => (
              <div
                key={`lecture-skel-${lectureIndex}`}
                className="border border-gray-200 rounded mb-2"
              >
                {/* Lecture Header */}
                <div className="flex justify-between items-center p-3">
                  <div className="h-3 w-48 bg-gray-300 rounded"></div>
                  <div className="h-3 w-3 bg-gray-300 rounded"></div>
                </div>

                {/* Lecture Resources */}
                <div className="p-3 pt-0">
                  {[1, 2].map((_, resIndex) => (
                    <div
                      key={`lec-res-skel-${resIndex}`}
                      className="flex items-center gap-3 mt-2"
                    >
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      <div className="h-3 w-52 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceSkeleton;
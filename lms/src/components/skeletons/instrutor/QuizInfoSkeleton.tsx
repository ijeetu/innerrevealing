'use client'
import React from 'react'
import { Card } from '@/components/ui/card'

interface SkeletonQuizInfoProps {
  studentReportPage?: boolean
}

const SkeletonQuizInfo = ({ studentReportPage }: SkeletonQuizInfoProps) => {
  return (
    <div>
      <div
        className={`${
          studentReportPage
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4 my-6'
            : 'bg-white grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 m-4 md:m-6'
        } animate-pulse`}
      >
        {/* left side */}
        <Card className="grid items-start p-4 md:p-6 shadow-none">
          <div className="grid sm:grid-cols-[auto_auto_1fr] items-center gap-3 md:gap-6 mb-6">
            {/* Back button */}
            {!studentReportPage && (
              <div className="w-8 h-8 bg-gray-200 rounded-full mt-2"></div>
            )}

            {/* Quiz info block */}
            <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-200 rounded-md"></div>

            {/* Quiz title and questions */}
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 bg-gray-200 rounded w-40 md:w-64"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>

          {/* Course and Chapter details */}
          <div className="grid gap-6 text-sm border-t pt-6 borderColor">
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-36"></div>
            </div>
          </div>
        </Card>

        {/* right side */}
        <Card
          className={`${
            studentReportPage
              ? 'grid grid-cols-3 p-4 border-none shadow-none flex-wrap w-full sectionBg gap-4'
              : 'grid md:grid-cols-1 grid-cols-1 sm:grid-cols-3 gap-4 border-none shadow-none'
          }`}
        >
          {/* Skeleton boxes */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`${
                studentReportPage
                  ? 'flex items-center flex-wrap gap-3 p-4 flex-col bg-white justify-center text-center rounded-md'
                  : 'grid grid-cols-[auto_1fr] items-center gap-3 p-4 sectionBg rounded-md'
              } animate-pulse`}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default SkeletonQuizInfo

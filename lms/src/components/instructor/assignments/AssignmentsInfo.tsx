'use client'
import { useTranslation } from '@/hooks/useTranslation';
import { AssignmentType } from '@/utils/api/instructor/assignment/getAssignmentSubmissions';
import React from 'react'
import { BiArrowBack } from 'react-icons/bi'
import { formatDate } from '@/utils/helpers';

interface AssignmentsInfoProps {
  onBack?: () => void;
  assignmentDetails?: AssignmentType | undefined;
}

const AssignmentsInfo = ({ onBack, assignmentDetails }: AssignmentsInfoProps) => {

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-8">
        {/* left side */}
        <div className="flex items-start gap-3 w-full md:flex-1">
          {
            onBack &&
            <div
              className="bg-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-800 transition-colors mt-0.5"
              onClick={onBack}
              role="button" 
              tabIndex={0}
              aria-label="Go back"
              onKeyDown={(e) => e.key === "Enter" && onBack?.()}
            >
              <span className="text-white">
                <BiArrowBack size={20} />
              </span>
            </div>
          }
          <div className="pt-2">
            <h3 className="font-medium text-base md:text-lg leading-tight">
              {`${assignmentDetails?.id}. ${assignmentDetails?.title}`}
            </h3>
            {/* {assignmentDetails?.created_at && ( 
              <div className="text-xs sm:text-sm mt-1">
                <span className="text-gray-500">{t("due_date")} : </span>
                <span className="text-[#F54B4B] font-medium">
                  {formatDate(new Date(new Date(assignmentDetails.created_at).getTime() + (assignmentDetails.due_days || 0) * 24 * 60 * 60 * 1000).toISOString())}
                </span>
              </div>
            )} */}
          </div>
        </div>

        {/* right side */}
        <div className="flex flex-row md:flex-col justify-between items-center md:justify-end md:items-start w-full md:w-auto shrink-0 md:min-w-[120px] mt-2 md:mt-0">
          <span className="text-gray-600 text-sm">{t("total_points")}</span>
          <span className="font-medium">
            {Number(assignmentDetails?.points).toFixed(0)}
          </span>
        </div>
      </div>

      {/* divider */}
      <div className="border-t border-gray-200"></div>

      {/* Assignment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        <div className="p-3 sectionBg rounded-[8px]">
          <div className="text-gray-600 mb-1">{t("assignment_name")}</div>
          <div className="font-medium">
            {assignmentDetails?.title}
          </div>
        </div>
        <div className="p-3 sectionBg rounded-[8px]">
          <div className="text-gray-600 mb-1">{t("chapter_name")} :</div>
          <div className="font-medium">
            {assignmentDetails?.chapter?.title}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentsInfo

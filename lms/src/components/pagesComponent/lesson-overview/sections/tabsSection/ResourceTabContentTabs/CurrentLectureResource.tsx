import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import NoLecturesFound from '../../NoLecturesFound'
import { LectureWithResources } from '@/utils/api/user/getResources';
import Link from 'next/link';
import DataNotFound from '@/components/commonComp/DataNotFound';

interface CurrentLectureResourceProps {
  currentLectureResources?: LectureWithResources[];
}

const CurrentLectureResource: React.FC<CurrentLectureResourceProps> = ({ currentLectureResources }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const hasResources = currentLectureResources && currentLectureResources.length > 0;

  const isCurrentLectureResourcesHaveResources = currentLectureResources?.[0]?.resources && currentLectureResources?.[0]?.resources.length > 0;

  if (!isCurrentLectureResourcesHaveResources || currentLectureResources?.length === 0) {
    return <DataNotFound />
  }


  return (
    <div className="bg-white flex flex-col gap-4">
      {/* Lecture header */}
      <div className="border borderColor rounded-[8px] overflow-hidden">
        <div
          className="flex justify-between items-center p-4 bg-[#F2F5F7] cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-sm font-medium">1. {currentLectureResources?.[0]?.title}</h3>
          <div>
            {isExpanded ?
              <FaChevronUp className="text-gray-500" size={14} /> :
              <FaChevronDown className="text-gray-500" size={14} />
            }
          </div>
        </div>

        {/* current lecture resources */}
        {isExpanded && isCurrentLectureResourcesHaveResources && hasResources && currentLectureResources?.[0]?.resources.map((resource, resourceIndex) => (
          <div key={resource.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center pl-2">
                <Link href={(resource.type === 'external_link' ? resource.external_url : resource.file_url) || ''} target="_blank" className="text-blue-500 mr-3 bg-[#0186D81F] w-6 h-6 rounded-[4px] flexCenter cursor-pointer">
                  <FaArrowUpRightFromSquare size={16} />
                </Link>
                <p className="text-sm">{resourceIndex + 1}. {resource.title}</p>
              </div>
            </div>
          </div>
        ))}

        {isExpanded && !isCurrentLectureResourcesHaveResources && !hasResources && currentLectureResources?.[0]?.resources.length === 0 && (
          <NoLecturesFound />
        )}
      </div>
    </div>
  )
}

export default CurrentLectureResource

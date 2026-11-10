import React, { useState } from 'react'
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'
import { FiDownload } from 'react-icons/fi';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import type { AllResources } from '@/utils/api/user/getResources';
import { handleDownload } from '@/utils/helpers';
import Link from 'next/link';
import DataNotFound from '@/components/commonComp/DataNotFound';
import { useTranslation } from '@/hooks/useTranslation';

interface AllResourcesProps {
  allResources?: AllResources;
}

const AllResources: React.FC<AllResourcesProps> = ({ allResources }) => {
  const { chapters, lectures } = allResources || { chapters: [], lectures: [] };

  const { t } = useTranslation();

  // Track expanded sections dynamically (by chapter or lecture ID)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Combine chapters from direct chapters list and chapters inferred from lectures
  const allChapters = React.useMemo(() => {
    const combined = [...chapters];
    lectures.forEach((lecture) => {
      // Check if this lecture's chapter is already in the list
      if (!combined.some((c) => c.chapter_id === lecture.chapter_id)) {
        combined.push({
          chapter_id: lecture.chapter_id,
          chapter_title: lecture.chapter_title,
          resources: [] // Initialize with empty resources as these chapters are derived from lectures
        } as any);
      }
    });
    return combined;
  }, [chapters, lectures]);


  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (allChapters.length === 0) {
    return <DataNotFound />
  }

  return (
    <div className="bg-white flex flex-col gap-4">
      {/* Chapter 1 */}
      {allChapters.map((chapter, chapterIndex) => (
        <div key={`${chapter.chapter_id}-${chapterIndex}`} className="rounded-[8px] overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-[#F2F5F7] cursor-pointer"
            onClick={() => toggleSection(chapter.chapter_id.toString())}
          >
            <h3 className="text-sm md:text-base font-semibold">{chapterIndex + 1}. {chapter.chapter_title}</h3>
            <div>
              {expandedSections[chapter.chapter_id.toString()] ?
                <FaChevronUp className="text-gray-500" size={14} /> :
                <FaChevronDown className="text-gray-500" size={14} />}
            </div>
          </div>

          {expandedSections[chapter.chapter_id.toString()] && (
            <div className="p-4">
              {chapter.resources && chapter.resources.length > 0 && <h4 className="text-sm font-medium underline mb-3">{t("chapter_resources")}</h4>}
              <div className="space-y-3">
                {chapter.resources.map((resource, resourceIndex) => (
                  <div key={`${resource.id}-${resourceIndex}`} className="flex items-center pl-2">
                    <div
                      onClick={() => handleDownload(resource?.file_url || '', resource?.file_name || '')}
                      className="text-blue-500 mr-3 bg-[#0186D81F] w-6 h-6 rounded-[4px] flexCenter cursor-pointer" >
                      <FiDownload size={16} />
                    </div>
                    <p className="text-sm">{resourceIndex + 1}. {resource.title || resource.file_name}</p>
                  </div>
                ))}
              </div>
              {lectures.filter(lecture => lecture.chapter_id === chapter.chapter_id && lecture.resources.length > 0).length > 0 && <h4 className={`text-sm font-medium underline ${chapter.resources && chapter.resources.length > 0 ? "mt-6" : ""} mb-3`}>{t("lectures_resources")}</h4>}

              {/* Lecture 3 */}
              {lectures
                .filter(lecture => lecture.chapter_id === chapter.chapter_id && lecture.resources.length > 0)
                .map((lecture, lectureIndex) => (
                  <div key={`${lecture.id}-${lectureIndex}`} className="border border-gray-200 rounded mb-2">
                    <div
                      className="flex justify-between items-center p-3 cursor-pointer"
                      onClick={() => toggleSection(lecture?.id?.toString() || '')}
                    >
                      <h5 className="text-sm font-medium">{lectureIndex + 1}. {lecture?.title}</h5>
                      <div>
                        {expandedSections[lecture?.id?.toString() || ''] ?
                          <FaChevronUp className="text-gray-500" size={14} /> :
                          <FaChevronDown className="text-gray-500" size={14} />}
                      </div>
                    </div>

                    {expandedSections[lecture?.id?.toString() || ''] && (
                      <div className="p-3 pt-0">
                        {lecture.resources.map((resource, resourceIndex) => (
                          <div key={`${resource.id}-${resourceIndex}`} className="space-y-3 mt-3">
                            <div key={`${resource.id}-${resourceIndex}`} className="flex items-center pl-2">
                              <Link href={(resource.type === 'external_link' ? resource.external_url : resource.file_url) || ''} target="_blank" className="text-blue-500 mr-3 bg-[#0186D81F] w-6 h-6 rounded-[4px] flexCenter cursor-pointer">
                                {resource.type === 'external_link' ? <FaArrowUpRightFromSquare size={16} /> : <FiDownload size={16} />}
                              </Link>
                              <p className="text-sm">{resourceIndex + 1}. {resource.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AllResources
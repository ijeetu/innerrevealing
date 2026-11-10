import React, { useState, useEffect } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiLock,
} from 'react-icons/fi';
import { FaRegPlayCircle, FaCheck, FaPauseCircle } from "react-icons/fa";
import { FaRegCirclePause } from "react-icons/fa6";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbPacman } from 'react-icons/tb';
import { Chapter } from '@/utils/api/user/getCourse';
import { PiFolderOpenBold } from "react-icons/pi";
import { CurriculumItem } from '@/utils/api/user/getCourse';
import { AppDispatch } from '@/redux/store';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { currentCurriculumIdSelector, isCurriculumItemCompletedSelector, previouslyCompletedCurriculumsIdsSelector, selectedCurriculumItemSelector, setIsCurriculumItemCompleted, setSelectedCurriculumChapterId, setSelectedCurriculumItem } from '@/redux/reducers/helpersReducer';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import CoursePreviewModal from '@/components/modals/CoursePreviewModal';
import { PiLockKey } from "react-icons/pi";
import { PiLockBold } from "react-icons/pi";


interface CourseSectionProps {
  isExpandAll: boolean;
  isFirstSection?: boolean;
  chapter: Chapter;
  chapterIndex?: number;
  instructorPage?: boolean;
  lessonOverviewPage?: boolean;
  isSequentialAccess?: boolean;
  isPreviousChapterCompleted?: boolean;
}

const CourseSection: React.FC<CourseSectionProps> = ({
  isExpandAll,
  isFirstSection,
  chapter,
  chapterIndex,
  instructorPage = false,
  lessonOverviewPage,
  isSequentialAccess = false,
  isPreviousChapterCompleted = true
}) => {
  // Initialize first section as expanded on mount, others as collapsed
  const [isExpanded, setIsExpanded] = useState<boolean>(isFirstSection || false);
  const dispatch = useDispatch<AppDispatch>();

  const currentCurriculumId = useSelector(currentCurriculumIdSelector);
  const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
  const selectedCurriculumItemId = selectedCurriculumItem?.id;
  const isCurriculumItemCompleted = useSelector(isCurriculumItemCompletedSelector);
  const previouslyCompletedCurriculumsIds = useSelector(previouslyCompletedCurriculumsIdsSelector);

  const router = useRouter();
  const { slug } = useParams();
  const curriculum = chapter.curriculum as CurriculumItem[];
  const { t } = useTranslation();

  // return proper icon for each curriculum type
  const getIconByType = (type: string, isSelected?: boolean) => {
    switch (type) {
      case 'lecture':
        if (isSelected) {
          return <FaRegCirclePause className="w-[20px] h-[20px] shrink-0 " />;
        }
        return <FaRegPlayCircle className="w-[20px] h-[20px] shrink-0" />;
      case 'quiz':
        return <TbPacman className="w-[20px] h-[20px] shrink-0" />;
      case 'document':
        return <HiOutlineDocumentText className="w-[20px] h-[20px] shrink-0" />;
      case 'assignment':
        return <PiFolderOpenBold className="w-[20px] h-[20px] shrink-0" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (isExpandAll) {
      setIsExpanded(true);
    }
    else if (lessonOverviewPage && (isExpandAll || isFirstSection)) {
      setIsExpanded(true);
    }
    else {
      setIsExpanded(false);
    }
  }, [isExpandAll]);

  // Auto-select first item when component mounts and lessonOverviewPage is true
  useEffect(() => {
    if (lessonOverviewPage && curriculum?.length > 0 && !selectedCurriculumItem) {
      const currentCurriculumItem = curriculum.find(item => item.id === currentCurriculumId);
      if (currentCurriculumItem) {
        dispatch(setSelectedCurriculumItem(currentCurriculumItem as CurriculumItem));
      }
    }
  }, [lessonOverviewPage, curriculum, selectedCurriculumItem, currentCurriculumId]);

  const handleIsAssignmentCurriculumItemCompleted = (type: string) => {
    if (type === 'assignment') {
      router.push(`/course-details/${slug}?tab=Assignment`);
    }
    else {
      router.push(`/course-details/${slug}`);
    }
  }

  useEffect(() => {
    if (!lessonOverviewPage || !isCurriculumItemCompleted?.isNextItem || !selectedCurriculumItem) {
      return;
    }

    // Crucial: Only jump if the completed item is the one we are currently viewing
    // This prevents double jumping if state updates out of sync
    if (isCurriculumItemCompleted.itemId !== selectedCurriculumItem.id) {
      return;
    }

    const currentIndex = curriculum.findIndex(item => item.id === selectedCurriculumItem.id);

    // Check if item was found AND there's a next item
    if (currentIndex !== -1 && currentIndex < curriculum.length - 1) {
      const nextCurriculumItem = curriculum[currentIndex + 1];
      handleIsAssignmentCurriculumItemCompleted(nextCurriculumItem?.type);
      dispatch(setSelectedCurriculumItem(nextCurriculumItem));
      dispatch(setIsCurriculumItemCompleted({ completed: false, isNextItem: false }));

      return;
    }
  }, [isCurriculumItemCompleted, selectedCurriculumItem, curriculum, dispatch, lessonOverviewPage]);


  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectCurriculumItem = (item: CurriculumItem, index: number) => {
    dispatch(setSelectedCurriculumChapterId(chapter.id));
    // If sequential access is enabled, ensure all previous items in this chapter are completed
    if (isSequentialAccess && lessonOverviewPage && !instructorPage) {
      const hasIncompletePreviousInChapter = curriculum
        .slice(0, item.id === isCurriculumItemCompleted?.itemId ? index + 1 : index)
        .some(prevItem => {
          const isPrevCompleted = previouslyCompletedCurriculumsIds?.includes(prevItem?.id) || prevItem.is_completed || prevItem.id === isCurriculumItemCompleted?.itemId;
          return !isPrevCompleted;
        });

      const isLockedByPreviousChapter = (chapterIndex ?? 0) > 0 && !isPreviousChapterCompleted;

      if (hasIncompletePreviousInChapter || isLockedByPreviousChapter) {
        toast.error(t('please_complete_the_previous_item_to_access_this'));
        return;
      }
    }

    if (lessonOverviewPage) {
      dispatch(setSelectedCurriculumItem(item));
      handleIsAssignmentCurriculumItemCompleted(item.type);
    }
  };


  return (
    <div className="border borderColor bg-white rounded-[8px] overflow-hidden">
      <div
        onClick={toggleExpand}
        className={`flex justify-between items-center max-479:p-2 p-4 cursor-pointer ${lessonOverviewPage && 'bg-[#F2F5F7]'} ${instructorPage && 'sectionBg'}`}
      >
        <div className="flex flex-col gap-2">
          <span className="text-gray-800 font-semibold">
            {chapterIndex !== undefined ? `${chapterIndex + 1}. ` : ''}{chapter.title}
          </span>
          <div className="flex items-center space-x-6 max-[420px]:px-4" key={chapter.id}>
            <div className="max-[420px]:flex max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-2 flex items-center space-x-1 text-sm text-gray-500">
              {chapter.lecture_count > 0 && <span className='text-sm text-[#010211]'>{chapter.lecture_count} {chapter.lecture_count <= 1 ? t("lecture") : t("lectures")}</span>}
              {chapter.lecture_count > 0 && <span className='max-[420px]:hidden'>|</span>}
              {chapter.assignments_count > 0 && <span className='text-sm text-[#010211]'>{chapter.assignments_count} {chapter.assignments_count <= 1 ? t("Assignment") : t("Assignments")}</span>}
              {chapter.assignments_count > 0 && <span className='max-[420px]:hidden'>|</span>}
              {chapter.quizzes_count > 0 && <span className='text-sm text-[#010211]'>{chapter.quizzes_count} {chapter.quizzes_count <= 1 ? t("quiz") : t("quizzes")}</span>}
              {chapter.quizzes_count > 0 && <span className='max-[420px]:hidden'>|</span>}
              {chapter.duration > 0 && <span className='text-sm text-[#010211]'>{chapter.duration_formatted}</span>}
            </div>
          </div>
        </div>
        <div className='cursor-pointer w-[30px] h-[30px] bg-white rounded-full flexCenter'>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>

      {isExpanded && (
        <div className={`bg-white ${lessonOverviewPage ? 'p-0' : 'p-2'}`}>
          {curriculum?.length > 0 ? (
            curriculum?.map((item, index) => {
              const itemIsCompleted = previouslyCompletedCurriculumsIds?.includes(item?.id) || item.is_completed || item.id === isCurriculumItemCompleted?.itemId;

              const isLockedBySelf = curriculum.slice(0, index).some(prevItem => {
                const isPrevCompleted = previouslyCompletedCurriculumsIds?.includes(prevItem?.id) || prevItem.is_completed || prevItem.id === isCurriculumItemCompleted?.itemId;
                return !isPrevCompleted;
              });

              const sequentialLocked = isSequentialAccess && lessonOverviewPage && !instructorPage && (
                ((chapterIndex ?? 0) > 0 && !isPreviousChapterCompleted) || isLockedBySelf
              );

              const isLocked = sequentialLocked;

              return (
                <div
                  key={`${item.type}-${item.id || index}`}
                  className={`flex items-center justify-between py-3 px-2 mb-2 last:mb-0 ${lessonOverviewPage && !isLocked && 'cursor-pointer'} ${lessonOverviewPage ? selectedCurriculumItemId === item.id ? 'bg-[#E8E8EC] ' : '' : ''}`}
                  onClick={() => handleSelectCurriculumItem(item, index)}
                >
                  <div className="flex items-center">
                    {/* icon */}
                    <div className="w-6 h-6 flex items-center justify-center ltr:mr-3 rtl:ml-3 ">
                      {getIconByType(item.type, selectedCurriculumItemId === item.id)}
                    </div>

                    {/* title with numbering */}
                    <span className="max-479:text-sm text-gray-700 break-all max-w-[270px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[310px]">
                      {index + 1}. {item.title}
                    </span>
                  </div>

                  {/* right side lock or preview */}
                  {item.free_preview && !instructorPage && !lessonOverviewPage ? (
                    <CoursePreviewModal CourseCurriculum={true} currentPreviewVideo={item} />
                  ) : lessonOverviewPage ? (
                    // Case 2: When lessonOverviewPage is true
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm">{item.duration_formatted}</span>
                      {isLocked ? (
                        <PiLockKey className="w-[24px] h-[24px] shrink-0 text-[#010211]" />
                      ) : itemIsCompleted ? (
                        <div className="w-5 h-5 rounded-full primaryBg flex items-center justify-center shrink-0">
                          <FaCheck className="text-white text-[10px]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-400 shrink-0 bg-white" />
                      )}
                    </div>
                  ) : (
                    // Case 3: Default (show lock icon)
                    !instructorPage && !lessonOverviewPage && <PiLockBold className="text-gray-900" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm p-2">{t("no_curriculum_found")}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSection; 
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BiEditAlt,
  BiFile,
  BiFolderOpen,
  BiGame,
  BiGridVertical,
  BiPlayCircle,
  BiLeftArrowAlt,
  BiSolidTrash,
} from "react-icons/bi";
import ContentTabs, { TabType } from "../ContentTabs";
import { useCourseTab } from "@/contexts/CourseTabContext";
import { TbArrowsMove } from "react-icons/tb";
import { FaAngleRight, FaCaretDown, FaCaretUp } from "react-icons/fa";
// Import drag and drop components from @hello-pangea/dnd
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import AddLessonsModal from "../modals/AddLessonsModal";
import { useDispatch, useSelector } from "react-redux";
import { CurriculumTabDataType } from "@/types/instructorTypes/instructorTypes";
import toast from 'react-hot-toast';
import { CourseChapter, getCourseChapters } from '@/utils/api/instructor/createCourseApis/getChapters';
import { extractErrorMessage } from '@/utils/helpers';
import { createdCourseIdSelector, isLessonAddedOnceSelector, quizIdSelector, resetCourseRelatedData, setIsEditCurriculum, setIsUpdateFile, setLectureTypeId, setQuizQuestionId } from "@/redux/reducers/helpersReducer";
import { isLessonAddedSelector, resetAddCourseData, setIsLessonAdded } from "@/redux/instructorReducers/AddCourseSlice";
import { curriculamDataSelector, isCurriculumCreatedSelector, resetCurriculamData, setAssignmentData, setCurriculamData, setIsCurriculumCreated, setLectureData, setQuizData, setResourcesData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { LessonSkeleton } from "@/components/skeletons/instrutor/LessonSkeleton";
import { CurriculumRow, getCurriculumList } from "@/utils/api/instructor/createCourseApis/create-course/curriculamList";
import { CurriculumSkeleton } from "@/components/skeletons/instrutor/CurriculumSkeleton";
import { deleteCurriculumItemById } from "@/utils/api/instructor/createCourseApis/create-course/deleteChapter";
import { updateCurriculumOrderByIds } from "@/utils/api/instructor/createCourseApis/create-course/updateCurriculumOrder";
import { deleteChapter } from "@/utils/api/instructor/course/delete-update-course/deleteChapter";
import QuestionsList from "../quizQuestion/QuestionsList";
import { getCurriculumDetails } from "@/utils/api/instructor/course/getCurriculumDetails";
import AddQuestion from "../quizQuestion/AddQuestion";
import { convertDueDaysToDate, getFileType } from "@/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { isRTLSelector } from "@/redux/reducers/languageSlice";

interface CurriculumTabProps {
  teamSlug?: string;
}

export default function CurriculumTab({ teamSlug }: CurriculumTabProps) {

  const dispatch = useDispatch();
  const { goToPreviousTab, setActiveTab: setGlobalTab } = useCourseTab();
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [lessons, setLessons] = useState<CourseChapter[]>([]);
  const [lessonLoad, setlessonLoad] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [editLesson, setEditLesson] = useState({
    isEditLesson: false,
    lessonId: null as number | null,
    lessonTitle: null as string | null,
  })

  const createdCourseId = useSelector(createdCourseIdSelector);
  const isLessonAdded = useSelector(isLessonAddedSelector)
  const curriculamData = useSelector(curriculamDataSelector) as CurriculumTabDataType;
  const quizQuestionId = useSelector(quizIdSelector);

  const { chapterId } = curriculamData;
  const isCurriculumCreated = useSelector(isCurriculumCreatedSelector);
  const isLessonAddedOnce = useSelector(isLessonAddedOnceSelector);

  const [curriculumList, setCurriculumList] = useState<CurriculumRow[]>([]);
  const [curriculumListLoad, setCurriculumListLoad] = useState<boolean>(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  const [isAddQuestionForm, setisAddQuestionForm] = useState<boolean>(false);
  // const [isOpenQuestionForm, setisOpenQuestionForm] = useState<boolean>(false);
  const [openQuestionFormId, setOpenQuestionFormId] = useState<number | null>(null);


  const { slug } = useParams();

  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useSelector(isRTLSelector);

  // Handle drag end for curriculum items
  const handleDragEnd = (result: DropResult) => {
    // If dropped outside the droppable area
    if (!result.destination) {
      return;
    }

    // If dropped in the same position
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }

    // Get the current curriculum list
    if (!curriculumList || curriculumList.length === 0) {
      return;
    }

    // Reorder the curriculum items locally for immediate UI update
    const items = Array.from(curriculumList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UI
    setCurriculumList(items);

    // Extract the IDs in the new order
    const curriculumIds = items.map(item => item.id);

    // Get the current chapter ID from curriculum data
    if (chapterId) {
      // Call the API to update the order on the server in background
      updateCurriculumOrder(chapterId, curriculumIds);
    } else {
      toast.error("Chapter ID is missing. Cannot update curriculum order.");
    }
  };

  // Toggle lesson expansion
  // Closes all other lessons and opens only the clicked lesson
  const toggleLesson = (id: string, e?: React.MouseEvent) => {
    // Stop propagation if event is provided
    if (e) {
      e.stopPropagation();
    }

    // Check if the lesson is currently open or closed to toggle it correctly
    const currentLesson = lessons.find(l => l.id === Number(id));
    const isNowOpening = currentLesson ? !currentLesson.isOpen : false;

    // Close all lessons and open/toggle only the clicked lesson
    setLessons(
      lessons.map((lesson) =>
        lesson.id === Number(id)
          ? { ...lesson, isOpen: !lesson.isOpen }  // Toggle the clicked lesson
          : { ...lesson, isOpen: false }  // Close all other lessons
      ));

    // Reset UI states when switching chapters to prevent data persistence
    setActiveTab(null);
    setisAddQuestionForm(false);
    setOpenQuestionFormId(null);
    dispatch(setIsEditCurriculum(null));
    dispatch(setLectureTypeId(null));
    // dispatch(resetCurriculamData());

    // Update the chapterId in store: set to ID if opening, null if closing
    dispatch(setCurriculamData({ chapterId: isNowOpening ? Number(id) : null }));
  };

  

  // Fetch course chapters with pagination support
  const fetchAddedCourseChapters = async (loadMore: boolean = false) => {
    try {
      // Validate required data
      if (!createdCourseId) {
        console.log('Course ID not available');
        return;
      }

      // Calculate the page number to fetch
      const pageToFetch = loadMore ? currentPage + 1 : 1;

      // Set appropriate loading state based on whether we're loading more or initial load
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setlessonLoad(true);
      }

      // Use the getCourseChapters function from our API utility with pagination
      const response = await getCourseChapters(createdCourseId.toString(), pageToFetch, 10);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data && response.data.data.length > 0) {
            const chaptersData = response.data.data;

            if (loadMore) {
              // Append new chapters to existing ones for load more functionality
              setLessons(prevLessons => [...prevLessons, ...chaptersData]);
            } else {
              // Replace chapters for initial load or refresh
              setLessons(chaptersData);
            }

            // Check if there are more pages available
            // Compare current_page with last_page to determine if more pages exist
            const hasMore = response.data.current_page < response.data.last_page;
            setHasMorePages(hasMore);

            // Update current page
            setCurrentPage(response.data.current_page);
          } else {
            console.log('No chapters data found in response');
            if (!loadMore) {
              setLessons([]);
            }
            setHasMorePages(false);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch course chapters");
          if (!loadMore) {
            setLessons([]);
          }
          setHasMorePages(false);
        }
      } else {
        console.log("response is null in component", response);
        if (!loadMore) {
          setLessons([]);
        }
        setHasMorePages(false);
      }

    } catch (error) {
      extractErrorMessage(error);
      if (!loadMore) {
        setLessons([]);
      }
      setHasMorePages(false);
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setlessonLoad(false);
        dispatch(setIsLessonAdded(false));
      }
    }
  };

  // Handle load more button click
  const handleLoadMore = () => {
    if (hasMorePages && !loadingMore) {
      fetchAddedCourseChapters(true);
    }
  };

  useEffect(() => {
    if (isLessonAddedOnce || slug) {
      if (isLessonAdded || createdCourseId) {
        // Reset pagination state on initial fetch
        setCurrentPage(1);
        setHasMorePages(false);
        fetchAddedCourseChapters(false);
      }
    }
  }, [isLessonAdded, createdCourseId, isLessonAddedOnce]);

  useEffect(() => {
  }, [lessons])


  const handleDeleteChapter = async (id: number) => {
    try {
      // Validate required data
      if (!id) {
        console.warn('Chapter ID not available');
        toast.error('Chapter ID is required');
        return;
      }

      // Show loading state
      setDeletingItemId(id);

      // Call the delete chapter API
      const response = await deleteChapter({
        id: id,
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to delete chapter");
        } else {
          toast.success('Chapter deleted successfully!');

          // Remove the chapter from the lessons state
          setLessons(lessons.filter((lesson) => lesson.id !== id));

          // If the deleted chapter was currently selected, clear the selection
          if (chapterId === id) {
            dispatch(setCurriculamData({ chapterId: null }));
          }
        }
      } else {
        console.log("response is null in component", response);
        toast.error('Failed to delete chapter');
      }

    } catch (error) {
      // Handle unexpected errors using extractErrorMessage helper
      extractErrorMessage(error);
    } finally {
      // Clear loading state
      setDeletingItemId(null);
    }
  }


  const fetchCurriculumList = async () => {
    try {
      // Validate required data
      if (!chapterId) {
        console.log('Chapter ID not available');
        return;
      }
      setCurriculumListLoad(true)
      // Use the getCurriculumList function from our API utility
      const response = await getCurriculumList(chapterId);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.rows && response.rows.length > 0) {
            setCurriculumList(response.rows);
            dispatch(setIsCurriculumCreated(false));
          } else {
            setCurriculumList([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch curriculum list");
          setCurriculumList([]);
        }
      } else {
        console.log("response is null in component", response);
        setCurriculumList([]);
      }

    } catch (error) {
      extractErrorMessage(error);
      setCurriculumList([]);
    } finally {
      setCurriculumListLoad(false)
    }
  };


  useEffect(() => {
    if (chapterId || isCurriculumCreated) {
      fetchCurriculumList();
    }
  }, [chapterId, isCurriculumCreated]);

  const handleDeleteCurriculumItem = async (id: number, type: string) => {
    try {
      // Validate required data
      if (!id) {
        toast.error("Curriculum item ID is missing");
        return;
      }

      if (!type) {
        toast.error("Curriculum item type is missing");
        return;
      }

      setDeletingItemId(id);

      // Call the delete API
      const response = await deleteCurriculumItemById(id, type as 'lecture' | 'quiz' | 'assignment' | 'document');

      if (response.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);

        setCurriculumList(curriculumList.filter((item) => item.id !== id));
        // Refresh curriculum list to show updated data
        // fetchCurriculumList();

      } else {
        toast.error(response.error || `Failed to delete ${type}`);
        console.error("Delete curriculum item failed:", response);
      }

    } catch (error) {
      console.error("Error deleting curriculum item:", error);
      toast.error("An unexpected error occurred while deleting the item");
    } finally {
      setDeletingItemId(null);
    }
  };


  const handleEditLesson = (id: number, title: string) => {
    setEditLesson({
      isEditLesson: true,
      lessonId: id,
      lessonTitle: title,
    })
  }

  const fetchCurriculumDetails = async (e: React.MouseEvent, id: number, type: string) => {
    e.stopPropagation();
    try {
      // Validate required parameters
      if (!id || !type) {
        console.error('Missing required parameters: id and type');
        return;
      }

      // Call the API to fetch curriculum details
      const response = await getCurriculumDetails({
        id: id,
        type: type as 'lecture' | 'quiz' | 'assignment'
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            const curriculumDetails = response.data;

            dispatch(setLectureTypeId(id));

            // Set the curriculum data in Redux based on the type
            if (type === 'lecture') {
              setActiveTab('lecture');
              dispatch(setIsEditCurriculum('lecture'));
              dispatch(setIsUpdateFile({ curriculum: true }));

              // Map curriculum details to lecture data format
              const lectureData = {
                lectureTitle: curriculumDetails.title,
                lectureDescription: curriculumDetails.description || '',
                lectureHours: (curriculumDetails.hours || 0).toString(),
                lectureMinutes: (curriculumDetails.minutes || 0).toString(),
                lectureSeconds: (curriculumDetails.seconds || 0).toString(),
                lectureFreePreview: curriculumDetails.free_preview ? '1' : '0',
                lectureType: curriculumDetails.type === 'youtube_url'
                  ? 'youtube_url'
                  : getFileType(curriculumDetails.file_extension || '') === 'document'
                    ? 'document'
                    : 'file',
                lectureUrl: curriculumDetails.url || '',
                lectureYoutubeUrl: curriculumDetails.youtube_url || curriculumDetails.url || '',
                lectureFile: curriculumDetails.file || null, // File will be handled separately if needed
                resources: curriculumDetails.resources?.map(resource => {
                  let resType = getFileType(resource.file_extension || '');

                  // In UI, we use 'external_url', but getFileType returns 'url'
                  if (resource.type === 'url' || resType === 'url') {
                    resType = 'external_url';
                  }

                  return {
                    id: resource.id,
                    resource_type: resType as any,
                    resource_title: resource.title || `Resource ${resource.id}`,
                    resource_url: resource.url || '',
                    resource_file: resource.file || null,
                  };
                })
              };
              // Dispatch the lecture data to Redux
              dispatch(setLectureData(lectureData));
            } else if (type === 'quiz') {
              dispatch(setIsEditCurriculum('quiz'));
              dispatch(setQuizData({
                quiz_title: curriculumDetails.title,
                quiz_total_points: Number(curriculumDetails.total_points),
                quiz_passing_score: Number(curriculumDetails.passing_score),
                quiz_can_skip: curriculumDetails.can_skip,
              }));
            } else if (type === 'assignment') {
              setActiveTab('assignment');
              dispatch(setIsEditCurriculum('assignment'));
              dispatch(setIsUpdateFile({ curriculum: true }));

              dispatch(setAssignmentData({
                assignment_title: curriculumDetails.title,
                assignment_submission_date: convertDueDaysToDate(curriculumDetails.due_days || 0),
                assignment_short_description: curriculumDetails.description!,
                assignment_media: curriculumDetails.media,
                assignment_allowed_file_types: curriculumDetails.allowed_file_types || [],
                assignment_points: Number(curriculumDetails.points),
                assignment_can_skip: curriculumDetails.can_skip,
                media_url: curriculumDetails.media_url,
              }));
            }
            else if (type === 'document' || (curriculumDetails && curriculumDetails.curriculum_type === 'document')) {
              setActiveTab('resources');
              dispatch(setIsEditCurriculum('resources'));
              dispatch(setIsUpdateFile({ curriculum: true }));
              dispatch(setResourcesData({
                id: curriculumDetails.id,
                resource_type: curriculumDetails.type == "url" ? 'external_url' : getFileType(curriculumDetails.file_extension || ''),
                resource_title: curriculumDetails.title,
                resource_short_description: curriculumDetails.description || '',
                resource_file: curriculumDetails.file,
                resource_duration: Number(curriculumDetails.duration) || 0,
                resource_url: curriculumDetails.url || '',
              }));
            }
          } else {
            console.log('No curriculum details data found in response');
            toast.error('Failed to process curriculum details');
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch curriculum details");
        }
      } else {
        console.log("response is null in component", response);
        toast.error('Failed to fetch curriculum details');
      }
    } catch (error) {
      extractErrorMessage(error);
      toast.error('An unexpected error occurred while fetching curriculum details');
    }
  }

  const updateCurriculumOrder = async (chapterId: number, curriculumIds: number[]) => {
    try {
      // Call the API to update curriculum order in background
      const response = await updateCurriculumOrderByIds(chapterId, curriculumIds);

      if (response.success) {
        // toast.success("Curriculum order updated successfully!");
      } else {
        toast.error(response.error || "Failed to update curriculum order");
        console.error("Curriculum order update failed:", response);
        fetchCurriculumList();
      }
    } catch (error) {
      console.error("Error updating curriculum order:", error);
      toast.error("An unexpected error occurred while updating curriculum order");
      // Revert to original order by refetching
      fetchCurriculumList();
    }
  }

  useEffect(() => {
    if (quizQuestionId) {
      setisAddQuestionForm(true);
    }
  }, [quizQuestionId]);

  const handleBackClick = () => {
    router.back();
  }

  const handleSaveChanges = () => {
    router.push(`/my-teams/${teamSlug}/course`)
    dispatch(resetAddCourseData());
    dispatch(resetCourseRelatedData());
    dispatch(resetCurriculamData());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col h-full bg-white rounded-lg">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-center gap-3 md:gap-0 py-3 md:py-4 px-3 border-b borderColor max-479:flex-wrap">
          <div className="flex items-center justify-center gap-4">
            {
              teamSlug &&
              <button
                onClick={handleBackClick}
                className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full"
                aria-label="Go back"
              >
                <BiLeftArrowAlt size={24} />
              </button>
            }

            <h2 className="sm:text-lg md:text-xl font-semibold">
              {t("curriculum_content")}
            </h2>
          </div>
          <AddLessonsModal editLesson={editLesson} setEditLesson={setEditLesson} />
        </div>

        {/* Content Section - Lessons and Content */}
        <div className="flex-1 overflow-y-auto p-2 md:p-3">
          {lessonLoad ? (
            <div className="space-y-3 md:space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <LessonSkeleton />
                </div>
              ))}
            </div>
          ) : (
            lessons.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="border borderColor rounded-lg overflow-hidden"
                  >
                    {/* Lesson Header */}
                    <div
                      className="flex justify-between items-center p-3 md:p-4 sectionBg cursor-pointer"
                    >
                      <div className="flex items-center flex-1 min-w-0 me-4">
                        <div className="flex items-center gap-2 w-full">
                          <span className="flex-shrink-0">
                            <TbArrowsMove />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">
                              {index + 1}. {lesson.title}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-8 md:w-8 hover:bg-white transition-all duration-300"
                          onClick={() => handleEditLesson(lesson.id, lesson.title)}
                        >
                          <BiEditAlt className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-8 md:w-8 hover:bg-red-100 hover:text-red-500 transition-all duration-300"
                          onClick={() => handleDeleteChapter(lesson.id)}
                        >
                          <BiSolidTrash className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon" className="h-5 w-5 md:h-6 md:w-6 cursor-pointer bg-white rounded-[4px] flexCenter hover:bg-black hover:text-white transition-all duration-300"
                          onClick={(e) => toggleLesson(lesson.id.toString(), e)}
                        >
                          {lesson.isOpen ? (
                            <FaCaretUp className="" />
                          ) : (
                            <FaCaretDown className="" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Lesson Content */}
                    {lesson.isOpen && (
                      <div className="p-3 border-t borderColor">
                        {/* Chapter -> Lecture , quiz , assignment , resources */}
                        <ContentTabs
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                        />
                        {curriculumList ? (

                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="curriculum-items">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-4"
                                >
                                  {
                                    curriculumListLoad ? (
                                      <div className="space-y-3 md:space-y-4 mt-4">
                                        {[...Array(4)].map((_, index) => (
                                          <div key={index}>
                                            <CurriculumSkeleton />
                                          </div>
                                        ))}
                                      </div>
                                    ) :
                                      curriculumList?.map((item, index) => (
                                        <Draggable
                                          key={item.id}
                                          draggableId={item.id.toString()}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              style={provided.draggableProps.style as React.CSSProperties}
                                              className={`flex items-center gap-2 my-4 ${snapshot.isDragging ? "opacity-75" : ""
                                                }`}
                                            >
                                              {/* Drag Handle */}
                                              <div
                                                {...provided.dragHandleProps}
                                                className="cursor-grab active:cursor-grabbing"
                                              >
                                                <BiGridVertical size={20} />
                                              </div>

                                              {/* Curriculum Item Content */}
                                              {item.type === "quiz" ? (
                                                // Quiz with Accordion
                                                <div className="w-full border rounded-lg overflow-hidden borderColor">
                                                  <div
                                                    className=""
                                                  >
                                                    <div
                                                      className="flex flex-col cursor-pointer w-full [&>svg]:hidden hover:no-underline overflow-hidden p-4"
                                                    >
                                                      <div className="flex justify-between items-center w-full">
                                                        <div className="flex items-center flex-1 min-w-0 me-4">
                                                          <div className="flex items-center w-full">
                                                            <span className="flex-shrink-0 h-7 w-7 text-xl rounded-full flex items-center justify-center me-2">
                                                              <BiGame />
                                                            </span>
                                                            <span className="flex-shrink-0 me-2 text-sm sm:text-base">{index + 1}.</span>
                                                            <h3 className="text-base font-medium decoration-none truncate min-w-0">
                                                              {item.title}
                                                            </h3>
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                          {/* Edit Quiz Button */}
                                                          <div
                                                            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium bg-transparent"
                                                            onClick={(e) => fetchCurriculumDetails(e, item.id, item.type)}
                                                          >
                                                            <BiEditAlt className="h-4 w-4" />
                                                          </div>
                                                          <div
                                                            className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium bg-transparent transition-colors ${deletingItemId === item.id
                                                              ? 'cursor-not-allowed opacity-50'
                                                              : 'hover:bg-red-100 hover:text-red-500 cursor-pointer'
                                                              }`}
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              if (deletingItemId !== item.id) {
                                                                handleDeleteCurriculumItem(item.id, item.type);
                                                              }
                                                            }}
                                                          >
                                                            {deletingItemId === item.id ? (
                                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                            ) : (
                                                              <BiSolidTrash className="h-4 w-4" />
                                                            )}
                                                          </div>
                                                          <div className="h-5 w-5 md:h-6 md:w-6 cursor-pointer bg-white rounded-[4px] flexCenter hover:bg-black hover:text-white transition-all duration-300" onClick={() => setOpenQuestionFormId(openQuestionFormId === item.id ? null : item.id)}
                                                          >
                                                            {
                                                              openQuestionFormId === item.id ? (
                                                                <FaCaretUp className="" />
                                                              ) : (
                                                                <FaCaretDown className="" />
                                                              )
                                                            }
                                                          </div>
                                                        </div>
                                                      </div>
                                                      {
                                                        (!isAddQuestionForm || openQuestionFormId !== item.id || quizQuestionId) &&
                                                        <button className="py-1 px-2 primaryBg text-white rounded-[4px] w-max mt-2" onClick={() => {
                                                          setisAddQuestionForm(true);
                                                          setOpenQuestionFormId(item.id);
                                                          dispatch(setQuizQuestionId(null));
                                                        }}
                                                        >{t('add_question')}</button>
                                                      }
                                                    </div>
                                                    {
                                                      openQuestionFormId === item.id &&
                                                      <div className="flex flex-col gap-4 p-4 border-t borderColor">
                                                        <QuestionsList
                                                          quizId={item.id}
                                                        />
                                                        {
                                                          isAddQuestionForm &&
                                                          <AddQuestion
                                                            fetchCurriculumList={fetchCurriculumList}
                                                            quizId={item.id}
                                                            setisAddQuestionForm={setisAddQuestionForm}
                                                          />
                                                        }
                                                      </div>
                                                    }
                                                  </div>
                                                </div>
                                              ) : (
                                                // Regular items (lecture, assignment, resources)
                                                <div className="border rounded-lg overflow-hidden w-full borderColor">
                                                  <div className="flex justify-between items-center p-4 cursor-pointer">
                                                    <div className="flex items-center flex-1 min-w-0 me-4">
                                                      <div className="flex items-center w-full">
                                                        <span className="flex-shrink-0 h-7 w-7 text-xl rounded-full flex items-center justify-center me-2">
                                                          {
                                                            item.type === 'lecture' ? (
                                                              <BiPlayCircle />
                                                            ) : item.type === 'assignment' ? (
                                                              <BiFolderOpen />
                                                            ) : (
                                                              <BiFile />
                                                            )
                                                          }

                                                        </span>
                                                        <span className="flex-shrink-0 me-2 text-sm sm:text-base">{index + 1}.</span>
                                                        <h3 className="font-medium truncate min-w-0">
                                                          {item.title}
                                                        </h3>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white transition-all duration-300"
                                                        onClick={(e) => fetchCurriculumDetails(e, item.id, item.type)}
                                                      >
                                                        <BiEditAlt className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-red-100 hover:text-red-500 transition-all duration-300"
                                                        onClick={() => handleDeleteCurriculumItem(item.id, item.type)}
                                                      >
                                                        <BiSolidTrash className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 md:py-12">
                            <h3 className="text-lg md:text-xl font-semibold mb-2">
                              {t("no_curriculum_list_found")}
                            </h3>
                          </div>
                        )}

                        {/* Draggable Curriculum Items */}
                      </div>
                    )}
                  </div>
                ))}
                {
                  hasMorePages && (
                    <div className="flexCenter py-2">
                      <button
                        className="commonBtn"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? t("loading") || "Loading..." : t("load_more")}
                      </button>
                    </div>
                  )
                }
              </div>
            )
              :
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  {t("no_courses_created")}
                </h3>
                <p className="text-center text-sm md:text-base mb-1">
                  {t("no_lessons_or_lectures_have_been_added_yet")}
                </p>
                <p className="text-center text-sm md:text-base">
                  {t("start_adding_content_now")}
                </p>
              </div>
          )
          }
        </div>

      </div>
      {/* Footer Navigation */}
      {
        teamSlug ?
          <div className="flex justify-end items-center gap-4 p-3 sectionBg">
            <Button
              className="w-auto bg-black text-white hover:bg-black/90 px-4 md:px-6 text-sm md:text-base"
              onClick={handleSaveChanges}
            >
              {t("save_changes")}
            </Button>
          </div>
          :
          <div className="flex justify-end items-center gap-4 p-3 sectionBg">
            <Button
              variant="ghost"
              className="w-auto text-sm md:text-base"
              onClick={goToPreviousTab}
            >
              {t("previous")}
            </Button>
            <Button
              className="w-auto bg-black text-white hover:bg-black/90 px-4 md:px-6 text-sm md:text-base"
              onClick={() => setGlobalTab("publish")}
            >
              {t("save_and_continue")}
              <FaAngleRight className={`h-3.5 w-3.5 md:h-4 md:w-4 ml-1.5 md:ml-2 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
      }
    </div >
  );
}

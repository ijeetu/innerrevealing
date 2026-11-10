"use client";
import React, { useEffect, useState } from "react";
import VideoSect from "./sections/courseTyes/VideoSect";
import CourseContent from "./sections/courseContent/CourseContent";
import TabSect from "./sections/tabsSection/TabSect";
import Link from "next/link";
import { IoArrowBackSharp } from "react-icons/io5";
import QuizPlay from "./sections/courseTyes/quizPlay/QuizPlay";
import Footer from "@/components/layout/Footer";
import { Course } from "@/utils/api/user/getCourse";
import { useDispatch, useSelector } from "react-redux";
import { currentCourseIdSelector, isCurriculumItemCompletedSelector, previouslyCompletedCurriculumsIdsSelector, resetLessonOverviewData, selectedCurriculumChapterIdSelector, selectedCurriculumItemSelector, setCurrentCourseId, setCurrentCurriculumId, setIsCurriculumItemCompleted, setPreviouslyCompletedCurriculumsIds, setSelectedCurriculumChapterId } from "@/redux/reducers/helpersReducer";
import FileSect from "./sections/courseTyes/FileSect";
import AssignmentSect from "./sections/courseTyes/AssignmentSect";
import FormSubmitLoader from "@/components/Loaders/FormSubmitLoader";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import { curriculumMarkComplete } from "@/utils/api/user/lesson-overview/curriculumMarkComplete";
import ShareCourseModal from "@/components/modals/ShareCourseModal";
import { PiListBold } from "react-icons/pi";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import withBalanceCheck from "@/components/hoc/withBalanceCheck";

interface LessonOverviewProps {
  courseData: Course;
}

const LessonOverview: React.FC<LessonOverviewProps> = ({ courseData }) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentCurriculumId = courseData?.current_curriculum?.model_id;
  const currentChapterId = courseData?.current_curriculum?.chapter_id
  const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
  const selectedCurriculumChapterId = useSelector(selectedCurriculumChapterIdSelector);
  const isCurriculumItemCompleted = useSelector(isCurriculumItemCompletedSelector);
  const previouslyCompletedCurriculumsIds = useSelector(previouslyCompletedCurriculumsIdsSelector);
  const currentCourseId = useSelector(currentCourseIdSelector);
  const isPurchased = courseData?.is_purchased;

  const isSequentialAccess = courseData?.sequential_access;

  const settings = useSelector(settingsSelector);
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const logo = settings?.data?.horizontal_logo;

  const [isLoading, setIsLoading] = useState(false);
  const isQuizPage = selectedCurriculumItem?.type === 'quiz';
  const isLecturePage = selectedCurriculumItem?.type === 'lecture';
  const isAssignmentPage = selectedCurriculumItem?.type === 'assignment';
  const isDocumentPage = selectedCurriculumItem?.type === 'document';




  const [isCourseCurriculumOpen, setIsCourseCurriculumOpen] = useState(false);

  const handleCourseCurriculumOpen = () => {
    setIsCourseCurriculumOpen(!isCourseCurriculumOpen);
  }

  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--primary-color', settings?.data?.system_color || '#5a5bb5')
      // Set favicon from settings API
      if (settings?.data?.favicon) {
        const favicon: HTMLLinkElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement("link") as HTMLLinkElement;
        favicon.rel = "icon";
        favicon.href = settings?.data?.favicon;
        if (!document.querySelector('link[rel="icon"]')) {
          document.head.appendChild(favicon);
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    if (currentCourseId !== courseData?.id) {
      dispatch(resetLessonOverviewData());
      dispatch(setCurrentCourseId(courseData?.id));
      dispatch(setPreviouslyCompletedCurriculumsIds([]));
    }
  }, [courseData]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [selectedCurriculumItem]);

  useEffect(() => {
    if (currentCurriculumId) {
      dispatch(setCurrentCurriculumId(currentCurriculumId));
    }
    if (!selectedCurriculumChapterId) {
      dispatch(setSelectedCurriculumChapterId(currentChapterId));
    }
  }, [currentCurriculumId, currentChapterId]);


  const markCurriculumItemCompleted = async () => {
    try {
      // Call the start quiz API
      const response = await curriculumMarkComplete({
        course_chapter_id: selectedCurriculumChapterId as number,
        model_id: selectedCurriculumItem?.id as number,
        model_type: selectedCurriculumItem?.type as "lecture" | "quiz" | "assignment" | "document",
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to mark curriculum item completed");
        }
        else {
          toast.success("Curriculum item completed successfully");
          dispatch(setIsCurriculumItemCompleted({ completed: false, itemId: selectedCurriculumItem?.id as number, isNextItem: selectedCurriculumItem?.type !== 'quiz' }));
          dispatch(setPreviouslyCompletedCurriculumsIds([...(previouslyCompletedCurriculumsIds || []), selectedCurriculumItem?.id as number]));
          dispatch(setCurrentCurriculumId(response.data?.next_curriculum.next_model_id as number));
        }

      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    }
  }

  const isIdIncludes = previouslyCompletedCurriculumsIds?.includes(selectedCurriculumItem?.id as number)

  useEffect(() => {
    if (isCurriculumItemCompleted.completed && !isIdIncludes) {
      markCurriculumItemCompleted();
    }
    else {
      if (isCurriculumItemCompleted.completed && selectedCurriculumItem?.is_completed && selectedCurriculumItem?.type !== 'quiz') {
        dispatch(setIsCurriculumItemCompleted({ completed: false, isNextItem: true, itemId: selectedCurriculumItem?.id }));
      }
    }
  }, [isCurriculumItemCompleted]);

  useEffect(() => {
    if (selectedCurriculumItem?.type === 'document' && !selectedCurriculumItem?.is_completed) {
      markCurriculumItemCompleted();
    }
  }, [selectedCurriculumItem]);

  const handleBack = () => {
    dispatch(resetLessonOverviewData());
  }


  return (
    <>
      <div className=' space-y-8 md:space-y-12 lg:space-y-16' dir={currentLanguageCode === "ar" ? "rtl" : "ltr"}>
        <div className="grid grid-cols-12 max-575:gap-y-8 between-1200-1399:gap-y-20 max-1199:gap-y-20 mb-12">
          {/* letf side content */}
          <div className={`max-1199:col-span-12  ${isCourseCurriculumOpen ? 'col-span-12' : 'col-span-8'} ltr:border-r rtl:border-l borderColor flex flex-col gap-y-4 md:gap-y-8`}>
            {/* video section */}
            <div className="relative sectionBg">
              <div className="relative w-full">
                {/* header */}
                <div className="bg-[#010211] p-4 md:p-6 flex items-center justify-between border-b border-white text-white  ">
                  <div className="flex items-center gap-2">
                    <Link href={`/?lang=${currentLanguageCode}`} onClick={() => handleBack()}>
                      <div className="w-[112px] max-h-[48px] sm:w-[120px] sm:max-h-[64px] md:max-h-[80px] h-auto overflow-hidden hidden md:block">
                        <CustomImageTag
                          src={logo}
                          alt={t("logo")}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="md:hidden p-1 w-[32px] h-[32px] rounded-full flexCenter bg-[#FFFFFF29]">
                        <IoArrowBackSharp size={20} className="" />
                      </div>
                    </Link>
                    <div className="h-[36px] border border-l border-gray-400 hidden md:block"></div>
                    <div>
                      <h1 className="md:text-xl font-semibold">{courseData?.title}</h1>
                      {settings?.data?.instructor_mode == "multi" && (
                        <p className="text-sm text-gray-300 capitalize">
                          {t("by")} {""}
                          {
                            courseData?.instructor?.instructor_type === "team" ?
                              <span>{courseData?.instructor?.team_name}</span> :
                              courseData?.author_name !== 'admin' ? (
                                <Link href={`/instructors/${courseData?.instructor?.slug}`} className="underline">{courseData?.author_name}</Link>
                              ) : (
                                <span>{courseData?.author_name}</span>
                              )
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flexCenter gap-2">
                    <ShareCourseModal courseTitle={courseData?.title} courseSlug={courseData?.slug} />
                    {isCourseCurriculumOpen &&
                      <button
                        onClick={handleCourseCurriculumOpen}
                        className="max-[1200px]:hidden"
                      >
                        <PiListBold size={20}
                          className="cursor-pointer"
                        />
                      </button>
                    }
                  </div>
                </div>

                {/* content here*/}
                {
                  isLoading ? (
                    <div className="w-full min-h-[356px] sm:min-h-[486px] md:min-h-[686px] flexColCenter">
                      <FormSubmitLoader primaryBorder={true} />
                    </div>
                  )
                    :
                    isQuizPage ? <QuizPlay /> : isLecturePage ? <VideoSect /> : isAssignmentPage ? <AssignmentSect /> : isDocumentPage ? <FileSect /> : null
                }

              </div>
            </div>

            <TabSect courseData={courseData} />
          </div>

          <div className={`max-1199:col-span-12 max-[1200px]:block  ${isCourseCurriculumOpen ? 'hidden' : 'col-span-4'}`}>
            <CourseContent
              courseData={courseData}
              isSequentialAccess={isSequentialAccess}
              handleCourseCurriculumOpen={handleCourseCurriculumOpen}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>

  );
};

export default withBalanceCheck(LessonOverview);

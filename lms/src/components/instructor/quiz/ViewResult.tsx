"use client";
import React, { useState, useEffect } from "react";
import { BiCheck,  BiX } from "react-icons/bi";
import { Card } from "@/components/ui/card";
import { getQuizResultDetails, QuizResultDetailsDataType, GetQuizResultDetailsParams } from "@/utils/api/instructor/quiz/getQuizResultDetails";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import QuestionsResultSkeleton from "@/components/skeletons/instrutor/QuestionsResultSkeleton";
import { FaCheck } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import StudentInfoSkeleton from "@/components/skeletons/instrutor/StudentInfoSkeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { GoArrowLeft } from "react-icons/go";


interface ViewResultProps {
  attemptId?: number;
  onBackClick?: () => void;
  isCousePage?: boolean;
}

const ViewResult: React.FC<ViewResultProps> = ({
  attemptId,
  onBackClick,
  isCousePage = true,
}) => {

  const { t } = useTranslation();

  // State for quiz result details data
  const [quizResultDetails, setQuizResultDetails] = useState<QuizResultDetailsDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch quiz result details function
  const fetchQuizResultDetails = async () => {
    setIsLoading(true);

    try {
      // Build API parameters
      const apiParams: GetQuizResultDetailsParams = {
        attempt_id: attemptId as number,
      };

      // Fetch quiz result details with API parameters
      const response = await getQuizResultDetails(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setQuizResultDetails(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch quiz result details");
          setQuizResultDetails(null);
        }
      } else {
        console.log("response is null in component", response);
        setQuizResultDetails(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setQuizResultDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch quiz result details on component mount
  useEffect(() => {
    if (attemptId) {
      fetchQuizResultDetails();
    }
  }, [attemptId]);

  // Use fetched data or fallback to mock data
  const quizSummary = quizResultDetails?.quiz_summary;
  const questions = quizResultDetails?.questions || [];
  return (
    <div className={`w-full ${isCousePage ? '' : 'bg-white rounded-2xl'}`}>
      {/* Student info section */}
      <div className="">
        {
          isLoading ? <StudentInfoSkeleton /> :
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 gap-4 flex-wrap">
              <div className="flex items-center w-full md:w-auto min-w-0">

                {
                  isCousePage &&
                  <button
                    onClick={onBackClick}
                    className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full me-4 flex-shrink-0"
                    aria-label="Go back"
                  >
                    <GoArrowLeft size={24} />
                  </button>
                }

                <div className="flex items-center min-w-0">
                  <CustomImageTag
                    src={undefined}
                    alt={quizSummary?.student_name || ''}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-md me-3 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-base truncate">
                      {quizSummary?.student_name || '-'}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 break-words">
                      {t("quiz")} - {quizSummary?.quiz_title || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz score summary */}
              <div className="flex flex-row justify-between gap-4 w-full md:w-auto">
                <div className="bg-white p-3 md:p-4 flex-1 md:flex-none border-r borderColor">
                  <div className="text-gray-500 text-xs md:text-sm">
                    {t("correct_answer")}
                  </div>
                  <div className="text-sm md:text-base font-bold">
                    {quizSummary?.correct_answers}
                  </div>
                </div>
                <div className="bg-white p-3 md:p-4 flex-1 md:flex-none">
                  <div className="text-gray-500 text-xs md:text-sm">
                    {t("incorrect_answer")}
                  </div>
                  <div className="text-sm md:text-base font-bold">
                    {quizSummary?.incorrect_answers}
                  </div>
                </div>
              </div>
            </div>
        }

        {/* divider */}
        <div className="border-t border-gray-200"></div>

        {/* Quiz Summary */}
        <div className="px-4 md:px-6 mt-4 md:mt-6">
          <h2 className="font-semibold text-sm md:text-base mb-4 md:mb-6 sectionBg p-3 md:p-4 rounded-md">
            {t("quiz_summary")}
          </h2>
        </div>

        {/* Quiz Summary */}
        <Card className="border-none shadow-none mx-4 md:m-6">
          <div className="space-y-6 md:space-y-8">
          {isLoading ? (
              [...Array(3)].map((_, i) => <QuestionsResultSkeleton key={i} />)
            ) : questions.length > 0 ? (
              questions.map((question) => (
                <div key={question.question_number} className="pb-4 md:pb-6">
                  <div className="flex flex-row items-center gap-2 mb-3 md:mb-4">
                    <div className="min-w-[40px] md:min-w-[50px] h-[40px] md:h-[50px] flex items-center justify-center font-medium sectionBg p-2 rounded-md text-sm md:text-base">
                      Q.{question.question_number}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm md:text-base">
                        {question.question_text || "-"}
                      </div>
                      <div className="flex items-center gap-2 mb-2 mt-2 md:mt-0">
                        {question.is_correct ? (
                          <span className="inline-flex items-center text-sm font-medium text-[#83B807]">
                            <BiCheck className="text-white bg-[#83B807] rounded-full w-4 h-4 me-1" />
                            {t("correct")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-sm font-medium text-[#DB3D26]">
                            <BiX className="text-white bg-[#DB3D26] rounded-full w-4 h-4 me-1" />
                            {t("incorrect")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 ps-0 md:ps-[50px]">
                    {question.options.map((option, index) => (
                      <div
                        key={option.id}
                        className={`border borderColor rounded-[8px] p-2 md:p-3 flex items-center gap-2 text-sm 
                          ${option.is_selected && option.is_correct
                            ? "bg-[#83B8070A] border-[#83B807]"
                            : ""
                          }
                          ${option.is_selected && !option.is_correct
                            ? "bg-red-50 border-red-200"
                            : ""
                          }
                          ${option.is_correct && !option.is_selected
                            ? "bg-[#83B8070A] border-[#83B807]"
                            : ""
                          }
                        `}
                      >
                        <div>
                          {option.is_selected && option.is_correct && (
                            <div className="text-white bg-[#83B807] rounded flexCenter w-6 h-6 md:w-8 md:h-8 text-lg">
                              <FaCheck />
                            </div>
                          )}
                          {option.is_selected && !option.is_correct && (
                            <div className="text-white bg-[#DB3D26] rounded flexCenter w-6 h-6 md:w-8 md:h-8 text-lg">
                              <IoCloseSharp size={24} />
                            </div>
                          )}
                          {option.is_correct && !option.is_selected && (
                            <div className="text-white bg-[#83B807] rounded flexCenter w-6 h-6 md:w-8 md:h-8 text-lg">
                              <FaCheck />
                            </div>
                          )}
                          {
                            !option.is_selected && !option.is_correct && !option.is_selected && !option.is_correct && !option.is_correct && !option.is_selected && <div className="rounded flexCenter w-6 h-6 md:w-8 md:h-8 font-medium border border-black">
                              {String.fromCharCode(65 + index)}
                            </div>
                          }
                        </div>
                        <div className="flex-1 text-xs md:text-sm">
                          {option.option_text || '-'}
                        </div>

                        {/* show check icon if option is selected and correct */}
                        {
                          option.is_selected && option.is_correct && (
                            <span className="text-[#83B807] text-sm font-semibold ">
                              {t("correct_answer")}
                            </span>
                          )
                        }
                        {
                          option.is_selected && !option.is_correct && (
                            <div className="text-[#DB3D26] text-sm font-semibold  ">
                              {t("incorrect_answer")}
                            </div>
                          )
                        }
                        {
                          option.is_correct && !option.is_selected && (
                            <div className="text-[#83B807] text-sm font-semibold  ">
                              {t("correct_answer")}
                            </div>
                          )
                        }
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("no_questions_available")}
              </div>
            )}
          </div>
        </Card>
      </div >
    </div >
  );
};

export default ViewResult;

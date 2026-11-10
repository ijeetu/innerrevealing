'use client'
import React, { useState, useEffect } from 'react'
import StartQuiz from './StartQuiz'
import QuestionScreen from './QuestionScreen'
import ResultScreen from './ResultScreen'
import { FaArrowRight } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { selectedCurriculumItemSelector, setIsCurriculumItemCompleted } from '@/redux/reducers/helpersReducer'
import { submitQuizAnswer } from '@/utils/api/user/lesson-overview/quiz/quizAnswer'
import { extractErrorMessage } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { finishQuiz } from '@/utils/api/user/lesson-overview/quiz/finishQuiz'
import { useTranslation } from '@/hooks/useTranslation'

const QuizPlay = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);

    // State for quiz flow
    const [isStartingQuiz, setIsStartingQuiz] = useState(false);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    // Single-select only: store the selected option id or null when nothing is selected
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isFinishingQuiz, setIsFinishingQuiz] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const isPassed = selectedCurriculumItem?.is_completed ? true : score >= (selectedCurriculumItem?.passing_score || 0);
    // Get total questions count
    const totalQuestions = selectedCurriculumItem?.questions?.length || 0;

    // Calculate progress based on current question (1-based for display)
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

    // Check if we're on the last question
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;


    // Handle next question navigation
    const handleFinishQuiz = async () => {
        try {
            // Call the start quiz API
            const response = await finishQuiz({
                attempt_id: attemptId as number,
            });

            if (response) {
                // Check if API returned an error (error: true in response)
                if (response.error) {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to finish quiz");
                }
                else {
                    setIsFinishingQuiz(true);
                    setScore(response.data?.score || 0);
                }
            } else {
                console.log("response is null in component", response);
                toast.error("Failed to finish quiz");
            }
        } catch (error) {
            extractErrorMessage(error);
        }
    }

    // Handle next question navigation
    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            // Reset selected option for the next question
            setSelectedOption(null);
        }
        else {
            handleFinishQuiz();
        }
    };


    // Handle submit question answer function with proper error handling
    const handleSubmitQuestionAnswer = async () => {
        setIsSubmittingAnswer(true);

        try {
            // Get current question
            const currentQuestion = selectedCurriculumItem?.questions?.[currentQuestionIndex];

            // Check if we have a selected option and attempt ID
            if (selectedOption === null) {
                toast.error("Please select an answer before proceeding");
                return;
            }

            if (!attemptId) {
                toast.error("Quiz session not initialized. Please start the quiz again.");
                return;
            }

            if (!currentQuestion?.id) {
                toast.error("Question not found");
                return;
            }

            // Submit the single selected option for this question
            const response = await submitQuizAnswer({
                quiz_question_id: currentQuestion.id,
                quiz_option_id: selectedOption,
                attempt_id: attemptId,
            });

            if (response?.error) {
                console.log("API error:", response?.message);
                toast.error(response?.message || "Failed to submit answer");
                return;
            }

            // Success - move to next question or show completion
            handleNextQuestion();
        } catch (error) {
            extractErrorMessage(error);
            toast.error("An unexpected error occurred while submitting answer");
        } finally {
            setIsSubmittingAnswer(false);
        }
    }

    const playAgain = () => {
        setIsStartingQuiz(false);
        setIsFinishingQuiz(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setAttemptId(null);
    }


    // Reset question index when quiz starts
    useEffect(() => {
        if (isStartingQuiz) {
            setCurrentQuestionIndex(0);
        }
    }, [isStartingQuiz]);

    useEffect(() => {
        if ((isPassed && isFinishingQuiz) || selectedCurriculumItem?.is_completed) {
            dispatch(setIsCurriculumItemCompleted({ completed: true }));
        }
    }, [isPassed, isFinishingQuiz]);


    return (
        <div className=''>
            {!isStartingQuiz && <StartQuiz isStartingQuiz={isStartingQuiz} setIsStartingQuiz={setIsStartingQuiz} setAttemptId={setAttemptId} />}
            {
                isStartingQuiz && !isFinishingQuiz &&
                <div>
                    {/* Header with quiz title and question count */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full p-6 bg-white">
                        <span className="font-semibold">{selectedCurriculumItem?.id}. {selectedCurriculumItem?.title}</span>
                        <span className="text-gray-600 wrap-break-word">
                            {t("question")} : {currentQuestionIndex + 1} {t("of")} {totalQuestions}
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full">
                        <div className="h-1.5 bg-gray-200 rounded-full w-full">
                            <div className="h-1.5 primaryBg transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className='h-[350px] overflow-y-auto md:h-auto'>
                        <QuestionScreen
                            currentQuestionIndex={currentQuestionIndex}
                            // Single-select props
                            selectedOption={selectedOption}
                            setSelectedOption={setSelectedOption}
                        />
                    </div>
                    <div className='bg-white flexCenter'>
                        <div className='flex items-center justify-end bg-white pt-8 2xl:w-[928px] mx-auto'>
                            <button
                                onClick={handleSubmitQuestionAnswer}
                                // Disable when submitting or nothing is selected
                                disabled={isSubmittingAnswer || selectedOption === null}
                                className={`text-xl bg-black text-white px-4 py-2 rounded-[4px] flexCenter gap-2 hover:bg-gray-800 transition-colors ${isSubmittingAnswer || selectedOption === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmittingAnswer ? t("submitting") : t("next")}
                                {!isLastQuestion && !isSubmittingAnswer && <FaArrowRight size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            }

            {(isFinishingQuiz) && <ResultScreen isPassed={isPassed} playAgain={playAgain} passingScore={selectedCurriculumItem?.passing_score || 0} />}


        </div>
    )
}

export default QuizPlay

'use client'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { getQuizQuestions, QuizQuestion } from "@/utils/api/instructor/createCourseApis/create-course/quizQuestion/getQuestions";
import { extractErrorMessage } from "@/utils/helpers";
import { deleteQuizQuestion } from "@/utils/api/instructor/course/delete-update-course/deleteQuizQuestion";
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { BiEditAlt, BiSolidTrash } from 'react-icons/bi';
import { Skeleton } from '@/components/ui/skeleton';
import { setQuizQuestionId } from '@/redux/reducers/helpersReducer';

interface QuestionsListProps {
    quizId: number;
}

const QuestionsList = ({ quizId }: QuestionsListProps) => {

    const dispatch = useDispatch();

    // State for quiz questions
    const [quizQuestionsList, setQuizQuestionsList] = useState<QuizQuestion[]>([]);
    const [quizQuestionsListLoading, setQuizQuestionsListLoading] = useState<boolean>(false);

    const fetchQuizQuestions = async (quizId: number) => {
        try {
            // Validate quiz ID
            if (!quizId || quizId <= 0) {
                console.error("Invalid quiz ID provided to fetchQuizQuestions");
                toast.error("Invalid quiz ID");
                return;
            }

            setQuizQuestionsListLoading(true);

            // Call the getQuizQuestions API
            const response = await getQuizQuestions(quizId);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data && response.data.length > 0) {
                        // Sort questions by order if they have order property
                        const sortedQuestions = response.data.sort((a, b) => a.order - b.order);
                        setQuizQuestionsList(sortedQuestions);
                    } else {
                        console.log('No quiz questions data found in response');
                        setQuizQuestionsList([]);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch quiz questions");
                    setQuizQuestionsList([]);
                }
            } else {
                console.log("response is null in component", response);
                setQuizQuestionsList([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setQuizQuestionsList([]);
        } finally {
            setQuizQuestionsListLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizQuestions(quizId);
    }, [quizId]);

    const handleDeleteQuizQuestion = async (questionId: number) => {       
        try {            
            // Call the delete API
            const response = await deleteQuizQuestion(questionId);
            
            if (response.success) {
                toast.success("Question deleted successfully!");
                setQuizQuestionsList(quizQuestionsList.filter((question) => question.id !== questionId));
            } else {
                toast.error(response.error || "Failed to delete question");
                console.error("Question deletion failed:", response);
            }

        } catch (error) {
            console.error("Error deleting quiz question:", error);
            toast.error("An unexpected error occurred while deleting the question");
        }
    }

    return (
        quizQuestionsListLoading ?
            <>
                <div className='flex flex-col gap-2'>
                    {
                        Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton className='w-full h-[40px]' key={index} />
                        ))
                    }
                </div>
                <hr className='borderColor w-[120%] -ml-4' />
            </>
            :
            quizQuestionsList.length > 0 &&
            <>
                {
                    quizQuestionsList.map((question, index) => (
                        <div key={index} className='flex items-center justify-between py-2 px-4 sectionBg rounded-[8px]'>

                            <div className='flex items-center gap-2 font-medium'>
                                <span>Q.{index + 1}</span>
                                <span>{question.question}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-white transition-all duration-300"
                                    onClick={() => dispatch(setQuizQuestionId(question.id))}
                                >
                                    <BiEditAlt className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-100 hover:text-red-500 transition-all duration-300"
                                    onClick={() => handleDeleteQuizQuestion(question.id)}
                                >
                                    <BiSolidTrash className="h-4 w-4" />
                                </Button>
                            </div>

                        </div>
                    ))
                }
                <hr className='borderColor w-[120%] -ml-4' />
            </>

    )
}

export default QuestionsList

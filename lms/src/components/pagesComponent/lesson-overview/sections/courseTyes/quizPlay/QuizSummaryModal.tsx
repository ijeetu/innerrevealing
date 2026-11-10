'use client'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { getQuizSummary, QuizSummaryData, GetQuizSummaryParams } from '@/utils/api/user/lesson-overview/quiz/quizSummary'
import toast from 'react-hot-toast'
import { extractErrorMessage } from '@/utils/helpers'
import { selectedCurriculumItemSelector } from '@/redux/reducers/helpersReducer'
import { XIcon } from 'lucide-react'
import { FaCheckCircle } from 'react-icons/fa'
import { IoIosCloseCircle } from "react-icons/io";
import { useTranslation } from '@/hooks/useTranslation'
import { Skeleton } from '@/components/ui/skeleton'
import DataNotFound from '@/components/commonComp/DataNotFound'

const QuizSummaryModal = () => {

    const { t } = useTranslation()

    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector)

    // State for quiz summary data
    const [quizSummaryData, setQuizSummaryData] = useState<QuizSummaryData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Fetch quiz summary function
    const fetchQuizSummary = async () => {

        setIsLoading(true)

        try {
            // Build API parameters
            const apiParams: GetQuizSummaryParams = {
                course_chapter_quiz_id: selectedCurriculumItem?.id as number
            }

            // Fetch quiz summary with API parameters
            const response = await getQuizSummary(apiParams)

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data) {
                        setQuizSummaryData(response.data)
                    }
                } else {
                    console.log('API error:', response.message)
                    toast.error(response.message || 'Failed to fetch quiz summary')
                    setQuizSummaryData(null)
                }
            } else {
                console.log('response is null in component', response)
                setQuizSummaryData(null)
            }
        } catch (error) {
            extractErrorMessage(error)
            setQuizSummaryData(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch quiz summary when modal opens and attemptId is available
    useEffect(() => {
        if (isOpen && selectedCurriculumItem?.id) {
            fetchQuizSummary()
        }
    }, [isOpen, selectedCurriculumItem])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className="flex items-center justify-center border primaryBorder primaryColor px-6 py-2 rounded  text-base bg-white transition w-full sm:w-auto"
                    onClick={() => setIsOpen(true)}
                >
                    {t("view_summary")}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white [&>.closeBtn]:hidden">
                <DialogHeader className='bg-black p-4 text-white rounded-[8px]'>
                    <div className='flex items-center justify-between'>

                        <DialogTitle>
                            {t("quiz_summary")}
                        </DialogTitle>
                        <DialogClose asChild className=''>
                            <button className='w-6 h-6 !sectionBg rounded text-black !text-sm'>

                                <XIcon />
                            </button>
                        </DialogClose>
                    </div>
                </DialogHeader>
                {/* Loading state */}
                {isLoading ? (
                    <div className="space-y-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton className='w-full h-20 bg-gray-400' key={index} />
                        ))}
                    </div>
                ) : quizSummaryData && quizSummaryData.questions.length > 0 ? (
                    <div className="w-full">

                        <div className='flex items-center justify-between flex-wrap gap-2'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <div className='flexCenter gap-2 text-[#83B807]'>
                                    <FaCheckCircle />
                                    <span>{t("correct_answers")}</span>
                                </div>
                                <div className='flexCenter gap-2 text-[#DB3D26]'>
                                    <IoIosCloseCircle size={20} />
                                    <span>{t("incorrect_answers")}</span>
                                </div>

                            </div>
                            <div className='primaryLightBg py-2 px-4 rounded-[8px] font-semibold primaryColor'>
                                {t("total_points")}: {quizSummaryData.total_points}
                            </div>
                        </div>
                        {/* Quiz Questions Accordion */}
                        <div className="my-4">

                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {quizSummaryData.questions.map((question, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`question-${question.question_id}`}
                                        className="border-none sectionBg p-4 rounded-[8px] "
                                    >
                                        <AccordionTrigger className="border-none hover:no-underline [&>.downIcon]:bg-black [&>.downIcon]:text-white [&>.downIcon]:rounded-full [&>.downIcon]:w-6 [&>.downIcon]:h-6 [&>.downIcon]:flexCenter [&>.downIcon]:!p-1">
                                            <div className="flex items-start gap-4 w-full text-base">
                                                <span>{question.question_number}</span>
                                                <span>{question.question}</span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="pt-0 pb-4 text-base space-y-4">
                                            <div className='flex items-start gap-2'>
                                                <FaCheckCircle className='text-[#83B807] shrink-0 mt-1' />
                                                <span className='break-all'>{t("correct_answer")} : {question.correct_answer}</span>
                                            </div>
                                            {
                                                !question.is_correct &&
                                                <div className='flex items-start gap-2'>
                                                    <IoIosCloseCircle className='text-[#DB3D26] shrink-0 mt-1' size={20} />
                                                    <span className='break-all'>{t("your_answer")} : {question.your_answer}</span>
                                                </div>
                                            }
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                ) : (
                    !isLoading &&
                    <DataNotFound />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default QuizSummaryModal

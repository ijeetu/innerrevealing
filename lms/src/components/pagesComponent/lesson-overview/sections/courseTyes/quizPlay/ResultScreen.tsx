'use client'
import React from 'react'
import QuizSummaryModal from './QuizSummaryModal'
import { useDispatch } from 'react-redux'
import { setIsCurriculumItemCompleted } from '@/redux/reducers/helpersReducer'
import completedImg from '@/assets/images/lesson-overview/completed.svg'
import failedImg from '@/assets/images/lesson-overview/play-again.svg'
import { useTranslation } from '@/hooks/useTranslation'
import ThemeSvg from '@/components/commonComp/customImage/ThemeSvg'
import { selectedCurriculumItemSelector } from '@/redux/reducers/helpersReducer'
import { useSelector } from 'react-redux'

interface ResultScreenProps {
    isPassed: boolean
    playAgain: () => void
    passingScore: number
}

const ResultScreen = ({ isPassed, playAgain, passingScore }: ResultScreenProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);

    const handleNextChapter = () => {
        dispatch(setIsCurriculumItemCompleted({ completed: false, isNextItem: true, itemId: selectedCurriculumItem?.id }));
    }

    return (
        <div className="flex items-center justify-center sectionBg py-10 md:py-20 max-575:px-4">
            {/* Card Container */}
            <div className="bg-white rounded-xl p-4 md:p-10 w-full max-575:max-w-[95%] max-w-[80%] md:max-w-2xl flex flex-col items-center">
                {/* Image Placeholder */}
                <ThemeSvg
                    src={isPassed ? completedImg : failedImg}
                    alt='quiz'
                    className={`w-[200px] h-[160px] md:w-[366px] md:h-[300px] object-cover`}
                />
                {
                    isPassed ?
                        <div>
                            {/* Headline */}
                            <h2 className="mt-8 text-center text-lg md:text-2xl font-bold text-gray-900">
                                {t("quiz_completed")}
                            </h2>
                            {/* Subtext */}
                            <p className="mt-2 text-center text-gray-700 text-sm md:text-base">
                                {t("quiz_completed_description")}
                            </p>
                        </div>
                        :
                        <div>
                            {/* Headline */}
                            <h2 className="mt-8 text-center text-lg md:text-2xl font-bold text-gray-900">
                                {t("quiz_failed")}
                            </h2>
                            {/* Subtext */}
                            <p className="mt-2 text-center text-gray-700 text-sm md:text-base">
                                {t("quiz_failed_desc1")} {passingScore} {t("quiz_failed_desc2")}
                            </p>
                        </div>
                }
                {/* Button Row */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
                    {
                        isPassed ?
                            <button
                                className="flex items-center justify-center bg-black text-white px-6 py-2 rounded  text-base transition hover:bg-gray-900 w-full sm:w-auto"
                                onClick={handleNextChapter}
                            >
                                {t("next_chapter")}
                            </button>
                            :
                            <button
                                className="flex items-center justify-center bg-black text-white px-6 py-2 rounded  text-base transition hover:bg-gray-900 w-full sm:w-auto"
                                onClick={playAgain}
                            >
                                {t("play_again")}
                            </button>
                    }
                    {isPassed && (
                        <QuizSummaryModal />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResultScreen

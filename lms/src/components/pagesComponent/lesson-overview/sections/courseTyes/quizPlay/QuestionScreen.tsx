'use client'
import { useTranslation } from '@/hooks/useTranslation';
import { selectedCurriculumItemSelector } from '@/redux/reducers/helpersReducer'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

interface QuestionScreenProps {
    currentQuestionIndex: number;
    // Single-select: hold the selected option id or null
    selectedOption: number | null;
    setSelectedOption: (optionId: number | null) => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
    currentQuestionIndex,
    selectedOption,
    setSelectedOption
}) => {

    const { t } = useTranslation();
    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);

    // Get current question based on index
    const currentQuestion = selectedCurriculumItem?.questions?.[currentQuestionIndex];

    // Reset selected option when question changes
    useEffect(() => {
        setSelectedOption(null);
    }, [currentQuestionIndex, setSelectedOption]);

    // Handle option selection for single-select
    const handleOptionToggle = (optionId: number) => {
        // Toggle off when the same option is clicked; otherwise set the new option
        if (selectedOption === optionId) {
            setSelectedOption(null);
            return;
        }
        setSelectedOption(optionId);
    }

    // Handle keyboard navigation for accessibility
    const handleKeyDown = (event: React.KeyboardEvent, optionId: number) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleOptionToggle(optionId)
        }
    }

    // Generate option labels (A, B, C, D...)
    const getOptionLabel = (index: number): string => {
        return String.fromCharCode(65 + index); // A, B, C, D...
    }

    // Don't render if no question found
    if (!currentQuestion) {
        return (
            <div className="sectionBg flex flex-col items-center justify-center w-full px-4 md:px-0 py-20">
                <p className="text-gray-500">{t("question_not_found")}</p>
            </div>
        );
    }

    return (
        <div className=''>
            <div className="sectionBg flex flex-col items-center w-full px-4 md:px-0">
                <div className='flexColCenter w-full md:w-[600px] 2xl:w-[928px] py-10 md:py-20'>
                    {/* Question card */}
                    <div className="bg-white rounded-[8px] p-6 w-full mb-8 flex items-center gap-4">
                        {/* Black circle with question number */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-[4px] bg-black text-white font-bold text-lg shrink-0">
                            Q.{currentQuestionIndex + 1}
                        </div>
                        {/* Question text */}
                        <div className="text-base font-semibold text-gray-800 flex-1 min-w-0 wrap-break-word">
                            {currentQuestion.question}
                        </div>
                    </div>
                    {/* Options grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {currentQuestion.options?.map((option, index) => {
                            // Single-select: check if this option is selected
                            const isSelected = selectedOption === option.id;
                            const optionLabel = getOptionLabel(index);

                            return (
                                <button
                                    key={option.id}
                                    className={`flex items-center rounded-[8px] border px-4 py-3 cursor-pointer transition gap-4 ${isSelected
                                        ? 'primaryLightBg primaryBorder'
                                        : 'bg-white borderColor hover:bg-gray-100'
                                        }`}
                                    tabIndex={0}
                                    aria-label={`Option ${optionLabel}: ${option.option}`}
                                    aria-pressed={isSelected}
                                    onClick={() => handleOptionToggle(option.id)}
                                    onKeyDown={(e) => handleKeyDown(e, option.id)}
                                >
                                    {/* Option letter in a rounded box */}
                                    <span className={`flex items-center justify-center w-8 shrink-0 h-8 rounded-[4px] border font-medium mr-2 text-base ${isSelected
                                        ? 'primaryBg text-white border-transparent'
                                        : 'border-gray-300'
                                        }`}>
                                        {optionLabel}
                                    </span>
                                    <span className="text-sm font-medium flex-1 min-w-0 wrap-break-word">{option.option}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuestionScreen

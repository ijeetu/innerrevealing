'use client'
import { useTranslation } from '@/hooks/useTranslation';
import { selectedCurriculumItemSelector, setIsCurriculumItemCompleted, setSkipAssignment } from '@/redux/reducers/helpersReducer';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';

const AssignmentSect = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
    const isAssignmentSkippable = selectedCurriculumItem?.can_skip;
    const isAssignmentSubmitted = selectedCurriculumItem?.is_submitted;

    const handleSkipAssignment = () => {
        if (isAssignmentSkippable) {
            dispatch(setIsCurriculumItemCompleted({ completed: true }));
            dispatch(setSkipAssignment(true));
        }
    }

    return (
        <>
            {isAssignmentSubmitted ? (
                <div className='w-full min-h-[356px] sm:min-h-[486px] md:min-h-[686px] overflow-y-auto customScrollbar flexColCenter text-center gap-6 p-2'>
                    <div className='space-y-2'>
                        <h3 className='text-base sm:text-lg md:text-xl font-semibold'> {t("congratulation_your_assignment_submitted_title")} </h3>
                        <p className=''> {t("congratulation_your_assignment_submitted")} </p>
                    </div>
                </div >
            ) : (
                <div className='w-full min-h-[356px] sm:min-h-[486px] md:min-h-[686px] overflow-y-auto customScrollbar flexColCenter text-center gap-6 p-2'>
                    <div className='space-y-2'>
                        <h3 className='text-base sm:text-lg md:text-xl font-semibold'> {t("subm_assignment_title")} </h3>
                        {isAssignmentSkippable ? (
                            <p className=''> {t("assignment_skippable_desc")} </p>
                        ) : (
                            <p className=''> {t("subm_assignment_title_desc")} </p>

                        )}
                    </div>
                    <div>
                        <button className={`${isAssignmentSkippable ? 'cursor-pointer' : 'cursor-not-allowed text-gray-400'} border rounded sm:w-[186px] w-[146px] sm:h-[46px] h-[36px] text-base sm:text-lg md:text-xl`} disabled={!isAssignmentSkippable} onClick={() => handleSkipAssignment()}>{t("skip_assignment")}</button>
                    </div>
                </div >
            )}
        </>
    )
}

export default AssignmentSect

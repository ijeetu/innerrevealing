'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectedCurriculumItemSelector } from '@/redux/reducers/helpersReducer'
import { useTranslation } from '@/hooks/useTranslation'

const FileSect = () => {
    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
    const [consent, setConsent] = useState(false);
    const { t } = useTranslation();

    const fileUrl = selectedCurriculumItem?.file;

    return (
        <div className="relative w-full min-h-[356px] sm:min-h-[486px] md:min-h-[686px]">

            {consent && (
                <iframe
                    src={fileUrl || ''}
                    className="absolute inset-0 w-full h-full customScrollbar"
                />
            )}

            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 
                ${consent ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-white'}`}
            >
                <button
                    onClick={() => setConsent(true)}
                    className="px-4 py-2 primaryBg text-white rounded"
                >
                    {t("downloadDocument")}
                </button>
            </div>
        </div>
    )
}

export default FileSect
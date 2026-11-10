import React from 'react'
import { BsFolder2 } from 'react-icons/bs'
import { useTranslation } from '@/hooks/useTranslation';

const NoLecturesFound: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div>
            <div className="p-8 bg-[#F8FAFC] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-[#A5B7C4] rounded mb-4 flex items-center justify-center">
                    <BsFolder2 size={36} className="text-white" />
                </div>
                <h4 className="text-base font-medium mb-2">{t("lecture_resources_unavailable")}</h4>
                <p className="text-sm text-gray-600 text-center">
                    {t("there_are_no_resources_available_for_this_lecture_at_the_moment")}
                </p>
            </div>
        </div>
    )
}

export default NoLecturesFound

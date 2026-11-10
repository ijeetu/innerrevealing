"use client"
import noDataImage from "@/assets/images/states-imgs/No-data-found.svg";
import ThemeSvg from "@/components/commonComp/customImage/ThemeSvg";
import { useTranslation } from "@/hooks/useTranslation";
import React from 'react'
import EmptyStatesContent from "./EmptyStatesContent";

const DataNotFound = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center sm:py-12 py-6 px-6">
            <div className="mb-6">
                <ThemeSvg
                    src={noDataImage}
                    alt="Data Not Found"
                    className="w-auto h-auto max-w-[280px] max-h-[274px]"
                    colorMap={{
                        "#5A5BB5": "var(--primary-color)",
                        "#04294C": "var(--hover-color)",
                        "#EEF2FA": "var(--primary-light-color)",
                    }}
                />
            </div>
            <EmptyStatesContent title={t("no_data_found")} description={t("no_data_found_desc")} />
        </div>
    )
}

export default DataNotFound

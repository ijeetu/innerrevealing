'use client'
import React from 'react'
import maintenanceModeImage from "@/assets/images/states-imgs/maintanance-mode.svg";
import { useTranslation } from '@/hooks/useTranslation';
import EmptyStatesContent from './EmptyStatesContent';
import ThemeSvg from "@/components/commonComp/customImage/ThemeSvg";

const MaintenanceMode = () => {
    const { t } = useTranslation();
    return (
        <div className='flexColCenter h-screen'>
            <ThemeSvg
                src={maintenanceModeImage}
                alt="Maintenance Mode"
                className="emptyStatesImg"
                colorMap={{
                    "#5A5BB5": "var(--primary-color)",
                    "#04294C": "var(--hover-color)",
                    "#EEF2FA": "var(--primary-light-color)",
                }}
            />
            <EmptyStatesContent title={t("maintenance_mode")} description={t("maintenance_mode_desc")} />
        </div>
    )
}

export default MaintenanceMode

"use client";
import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import SidebarFilter from "@/components/commonComp/SidebarFilter";
import { FaChevronDown } from "react-icons/fa";
import { SidebarFilterTypes } from "@/types";
import { useTranslation } from '@/hooks/useTranslation';
import { isRTLSelector } from '@/redux/reducers/languageSlice';
import { useSelector } from 'react-redux';

const SidebarFilterSheet: React.FC<{
    sidebarFilter: SidebarFilterTypes,
    setSidebarFilter: (filter: SidebarFilterTypes) => void,
    isInstructorPage?: boolean
}> = ({ sidebarFilter, setSidebarFilter, isInstructorPage = false }) => {
    const { t } = useTranslation();
    const isRTL = useSelector(isRTLSelector);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="w-full">
                    <div className={`flexCenter !justify-between py-2 px-4 border-[1.5px] borderColor text-base bg-white w-full rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="">{t('filter_by')}</span>
                        <FaChevronDown className="text-gray-400" />
                    </div>
                </SheetTrigger>
                <SheetContent side='right'  >
                    <SheetTitle className={`text-xl font-semibold flex justify-between text-black pt-4 pb-2 px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>{t('filter_by')}</SheetTitle>
                    <div className="">
                        <SidebarFilter
                            sidebarFilter={sidebarFilter}
                            setSidebarFilter={setSidebarFilter}
                            mobileComp={true}
                            isInstructorPage={isInstructorPage}
                            onCategorySelect={() => setTimeout(() => setIsOpen(false), 50)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default SidebarFilterSheet;

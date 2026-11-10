"use client";
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { FaChevronDown } from "react-icons/fa";
import { useTranslation } from '@/hooks/useTranslation';
import { isRTLSelector } from '@/redux/reducers/languageSlice';
import { useSelector } from 'react-redux';

interface SortByProps {
    sortBy: string;
    onChangeSortBy: (value: string) => void;
}

const SortByFilterSheet: React.FC<SortByProps> = ({ sortBy, onChangeSortBy }) => {
    const { t } = useTranslation();
    const isRTL = useSelector(isRTLSelector);
    const options = [
        { value: "newest", label: t('sort_by_newest') },
        { value: "oldest", label: t('sort_by_oldest') },
        { value: "most_popular", label: t('sort_by_most_popular') },
    ];

    const handleSelect = (value: string) => {
        if (sortBy === value) {
            onChangeSortBy("");
        } else {
            onChangeSortBy(value);
        }
    }

    return (
        <Sheet>
            <SheetTrigger className="w-full" >
                <div className={`flexCenter !justify-between py-2 px-4 border-[1.5px] borderColor text-base bg-white w-full rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{t('sort_by')}</span>
                    <FaChevronDown className="text-gray-400" />
                </div>
            </SheetTrigger>

            <SheetContent side='right'  >
                <div className="pt-4 p-6 space-y-6">
                    <SheetTitle className={`font-semibold text-xl text-[#010211] flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t('sort_by')}
                    </SheetTitle>
                    <div className="space-y-6">
                        {options.map((item) => (
                            <div
                                key={item.value}
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => handleSelect(item.value)}
                            >
                                <input
                                    type="radio"
                                    checked={sortBy === item.value}
                                    readOnly
                                    className="h-4 w-4 accent-primaryBg border borderColor rounded cursor-pointer"
                                />
                                <span
                                    className={`text-base ${sortBy === item.value
                                        ? "font-normal text-primary"
                                        : "text-gray-700"
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SortByFilterSheet;

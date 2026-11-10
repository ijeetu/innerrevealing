"use client";
import React, { useEffect, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { FaAngleRight, FaArrowLeft } from "react-icons/fa";
import { CategoryDataType, SubCategoriesDataType } from '@/types';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { getCategories } from '@/utils/api/user/getCategories';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import MobileCategorySkeleton from '../skeletons/MobileCategorySkeleton';
import { useSelector } from 'react-redux';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import { isRTLSelector } from '@/redux/reducers/languageSlice';

interface NestedCateSheetProps {
    selectedSubCategory: number | null;
    setOpenSubCategory: (open: boolean) => void;
    setIsOpen: (open: boolean) => void;
}

const NestedCateSheet: React.FC<NestedCateSheetProps> = ({ selectedSubCategory, setOpenSubCategory, setIsOpen }) => {
    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const [openNestedCategory, setOpenNestedCategory] = useState(false)
    const [nestedCategoriesData, setNestedCategoriesData] = useState<CategoryDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const isRTL = useSelector(isRTLSelector);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories({
                id: selectedSubCategory || undefined,
                get_subcategory: 1,
                per_page: 16,
                page: 1,
            });
            if (!response?.error) {
                if (response?.data?.data) {
                    setNestedCategoriesData(response?.data?.data);
                } else {
                    console.log("No nested categories data found in response");
                    setNestedCategoriesData([]);
                }
            } else {
                console.log("API error:", response.message);
                toast.error(response.message || "Failed to fetch nested categories");
                setNestedCategoriesData([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setNestedCategoriesData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (selectedSubCategory) {
            fetchCategories();
        }
    }, [selectedSubCategory])

    const handleBackClick = () => {
        setOpenNestedCategory(false)
        setOpenSubCategory(true)
    }

    return (
        <div className="w-full">
            <Sheet open={openNestedCategory} onOpenChange={setOpenNestedCategory}>
                <SheetTrigger className="w-full">
                    <span className={`flexCenter rounded-full w-[20px] h-[20px] p-1 ${isRTL ? 'rotate-180' : ''}`}>
                        <FaAngleRight className="text-gray-600 text-sm" />
                    </span>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetTitle className={`text-xl font-semibold text-black pt-4 pb-2 px-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div
                            className="cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={handleBackClick}
                        >
                            <FaArrowLeft className='text-gray-600' />
                        </div>
                        <span>{t("filter_by")}</span>
                        {/* <span className="!bg-[#0102110D] sheetCloseBtn p-1 border rounded-[8px] borderColor data-[state=open]:bg-secondary absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100  disabled:pointer-events-none z-10" onClick={handleCloseClick}>
                            <XIcon className="size-4" />
                            <span className="sr-only">{t("close")}</span>
                        </span> */}
                    </SheetTitle>
                    <div className="flex flex-col gap-4 px-4">
                        {loading ? (
                            <MobileCategorySkeleton />
                        ) : (
                            nestedCategoriesData[0]?.subcategories?.map((nestedCategory: SubCategoriesDataType) => (
                                <div
                                    className={`flex items-center justify-between w-full transition-all duration-300 hover:primaryColor px-2  ${nestedCategory.id === 1 ? "" : ""}`}
                                    key={nestedCategory.id}
                                >
                                    <Link href={`/courses/${nestedCategory.slug}?lang=${currentLanguageCode}`}>
                                        <span>{nestedCategory.name}</span>
                                    </Link>
                                </div>
                            )))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default NestedCateSheet;      

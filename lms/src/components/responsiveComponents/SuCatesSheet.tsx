"use client";
import React, { useEffect, useRef, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { FaAngleRight, FaArrowLeft } from "react-icons/fa";
import { CategoryDataType, SubCategoriesDataType } from '@/types';
import Link from 'next/link';
import NestedCateSheet from './NestedCateSheet';
import CustomImageTag from '../commonComp/customImage/CustomImageTag';
import { XIcon } from 'lucide-react';
import { getCategories } from '@/utils/api/user/getCategories';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import MobileCategorySkeleton from '../skeletons/MobileCategorySkeleton';
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import { isRTLSelector } from '@/redux/reducers/languageSlice';

interface CategoriesSheetProps {
    selectedCategory: number | null;
    categoryId: number;
    setIsOpen: (open: boolean) => void;
}

const SubCatesSheet: React.FC<CategoriesSheetProps> = ({ selectedCategory, categoryId, setIsOpen }) => {


    const settings = useSelector(settingsSelector);
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const logo = settings?.data?.horizontal_logo;
    const [openSubCategory, setOpenSubCategory] = useState(false)
    const [subCategoriesData, setSubCategoriesData] = useState<CategoryDataType[]>([]);
    const lastFetchedCategoryRef = useRef<number | null>(null); // store last fetched category to avoid duplicate API calls
    const [loading, setLoading] = useState(false);
    const isRTL = useSelector(isRTLSelector);

    const { t } = useTranslation();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories({
                id: selectedCategory || undefined,
                get_subcategory: 1,
                per_page: 16,
                page: 1,
            });
            if (!response?.error) {
                if (response?.data?.data) {
                    setSubCategoriesData(response?.data?.data);
                }
                else {
                    console.log("No sub categories data found in response");
                    setSubCategoriesData([]);
                }
            } else {
                console.log("API error:", response.message);
                toast.error(response.message || "Failed to fetch sub categories");
                setSubCategoriesData([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setSubCategoriesData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch when the sheet is open and the current instance matches the selected category.
        if (!openSubCategory || !selectedCategory || selectedCategory !== categoryId) {
            return;
        }

        // Guard against duplicate calls caused by React StrictMode re-renders.
        if (lastFetchedCategoryRef.current === selectedCategory) {
            return;
        }

        lastFetchedCategoryRef.current = selectedCategory;
        fetchCategories();
    }, [openSubCategory, selectedCategory, categoryId]);

    useEffect(() => {
        // Reset cached category when the sheet closes so the data refreshes next time it opens.
        if (!openSubCategory) {
            lastFetchedCategoryRef.current = null;
        }
    }, [openSubCategory]);

    const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null)

    const handleCategoryClick = (id: number) => {
        setSelectedSubCategory(id)
    }

    const handleBackClick = () => {
        setOpenSubCategory(false)
        setSelectedSubCategory(null)
        setIsOpen(true)
    }

    const handleCloseClick = () => {
        setOpenSubCategory(false)
        setIsOpen(false)
    }

    return (
        <div className="w-full">
            <Sheet open={openSubCategory} onOpenChange={setOpenSubCategory}>
                <SheetTrigger className="w-full">
                    <span className={`flexCenter rounded-full w-[20px] h-[20px] p-1 ${isRTL ? 'rotate-180' : ''}`}>
                        <FaAngleRight className="text-gray-600 text-sm" />
                    </span>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetTitle className={`text-xl font-semibold text-black pt-4 pb-2 px-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                            <FaArrowLeft className='text-gray-600' onClick={handleBackClick} />
                        </div>
                        <div className="w-[112px] max-h-[48px] sm:w-[207px] sm:max-h-[64px] md:max-h-[80px] h-auto  flex items-center">
                            <CustomImageTag
                                src={logo}
                                alt="logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="!bg-[#0102110D] sheetCloseBtn p-1 border rounded-[8px] borderColor data-[state=open]:bg-secondary absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100  disabled:pointer-events-none z-10" onClick={handleCloseClick}>
                            <XIcon className="size-4" />
                            <span className="sr-only">{t("close")}</span>
                        </span>
                    </SheetTitle>
                    <div className="flex flex-col gap-4 px-4">
                        {loading ? (
                            <MobileCategorySkeleton />
                        ) : (
                            subCategoriesData[0]?.subcategories?.map((subCategory: SubCategoriesDataType) => (
                                <div
                                    className={`flex items-center justify-between w-full transition-all duration-300 hover:primaryColor px-2 ${subCategory.id === 1 ? "" : ""}`}
                                    key={subCategory.id}
                                    onClick={() => handleCategoryClick(subCategory.id)}
                                >
                                    <Link href={`/courses/${subCategory.slug}?lang=${currentLanguageCode}`}>
                                        <span>{subCategory.name}</span>
                                    </Link>

                                    {
                                        subCategory.has_subcategory &&
                                        // <span className="flexCenter rounded-full w-[20px] h-[20px] p-1">
                                        //   <FaAngleRight className="text-gray-600 text-sm" />
                                        // </span>
                                        <div className="">
                                            <NestedCateSheet selectedSubCategory={selectedSubCategory} setOpenSubCategory={setOpenSubCategory} setIsOpen={setIsOpen} />
                                        </div>
                                    }
                                </div>
                            )))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default SubCatesSheet;      

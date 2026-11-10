'use client'
import React, { useEffect, useState, useRef } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoCaretDownSharp } from 'react-icons/io5';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';
import { TbCategoryPlus } from 'react-icons/tb';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { getCategoryTree, CategoryTreeItem, CategoryTreeResult } from '@/utils/api/user/getCategories';
import { useTranslation } from '@/hooks/useTranslation';
import { useRTL } from '@/hooks/useRTL';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import { getDirection } from '@/utils/helpers';
import { createPortal } from 'react-dom';

const CategoryIcon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [error, setError] = useState(false);
    return (
        <span className="shrink-0 w-10 h-10 rounded-lg sectionBg flexCenter">
            {error || !src
                ? <TbCategoryPlus size={22} />
                : <img src={src} alt={alt} className="w-6 h-6 object-contain" onError={() => setError(true)} />
            }
        </span>
    );
};

const CATEGORY_PER_PAGE = 12;

const CategoriesDropdown: React.FC = () => {

    const { t } = useTranslation();
    const { isRTL } = useRTL();

    const currentLanguageCode = useSelector(currentLanguageSelector);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);

    const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [categoryPage, setCategoryPage] = useState(1);
    const [categoryHasMore, setCategoryHasMore] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<CategoryTreeItem | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<CategoryTreeItem | null>(null);

    const [showSubCategory, setShowSubCategory] = useState<boolean>(false);
    const [showNestedCategory, setShowNestedCategory] = useState<boolean>(false);

    // Refs to track mouse position and dropdown elements
    const dropdownRef = useRef<HTMLDivElement>(null);
    const subDropdownRef = useRef<HTMLDivElement>(null);
    const nestedDropdownRef = useRef<HTMLDivElement>(null);
    const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Position state for sub and nested dropdowns (fixed positioning)
    const [subPosition, setSubPosition] = useState<{ top: number; left: number } | null>(null);
    const [nestedPosition, setNestedPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        setIsCategoryLoading(true);
        getCategoryTree({ page: 1, per_page: CATEGORY_PER_PAGE }).then((result: CategoryTreeResult | null) => {
            if (result) {
                setCategoryTree(result.items);
                setCategoryHasMore(result.hasMore);
                setCategoryPage(1);
            }
            setIsCategoryLoading(false);
        });
    }, []);

    const handleLoadMoreCategories = async () => {
        setIsLoadingMore(true);
        const nextPage = categoryPage + 1;
        const result = await getCategoryTree({ page: nextPage, per_page: CATEGORY_PER_PAGE });
        if (result) {
            setCategoryTree(prev => [...prev, ...result.items]);
            setCategoryHasMore(result.hasMore);
            setCategoryPage(nextPage);
        }
        setIsLoadingMore(false);
    };

    // Handle category click - find subs from tree, show flyout
    const handleCategoryClick = (_e: React.MouseEvent<HTMLDivElement>, categoryId: number) => {
        setSelectedSubCategory(null);
        setShowNestedCategory(false);

        const found = categoryTree.find(c => c.id === categoryId) ?? null;
        setSelectedCategory(found);
        setShowSubCategory(!!found?.subcategories?.length);

        const dropdownRect = dropdownRef.current?.getBoundingClientRect();
        if (dropdownRect) {
            if (isRTL) {
                setSubPosition({ top: dropdownRect.top, left: dropdownRect.left - 250 });
            } else {
                setSubPosition({ top: dropdownRect.top, left: dropdownRect.right + 3 });
            }
        }
    };

    // Handle sub-category click - find nested from tree, show flyout
    const handleSubCategoryClick = (_e: React.MouseEvent<HTMLDivElement>, subcategoryId: number) => {
        const found = selectedCategory?.subcategories?.find(s => s.id === subcategoryId) ?? null;
        setSelectedSubCategory(found);
        setShowNestedCategory(!!found?.subcategories?.length);

        const subRect = subDropdownRef.current?.getBoundingClientRect();
        if (subRect) {
            if (isRTL) {
                setNestedPosition({ top: subRect.top, left: subRect.left - 250 });
            } else {
                setNestedPosition({ top: subRect.top, left: subRect.right });
            }
        }
    };

    // Helper function to check if mouse is over any dropdown
    const isMouseOverAnyDropdown = (event: MouseEvent): boolean => {
        const elements = [dropdownRef.current, subDropdownRef.current, nestedDropdownRef.current];

        return elements.some(element => {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
            );
        });
    };

    // Improved mouse leave handler with proper boundary detection
    const handleMouseLeave = (event: React.MouseEvent) => {
        // Clear any existing timeout
        if (mouseLeaveTimeoutRef.current) {
            clearTimeout(mouseLeaveTimeoutRef.current);
        }

        // Add a small delay to prevent flickering when moving between dropdowns
        mouseLeaveTimeoutRef.current = setTimeout(() => {
            const mouseEvent = event.nativeEvent;

            // Check if mouse is still over any dropdown
            if (!isMouseOverAnyDropdown(mouseEvent)) {
                // setShowCategoryDropdown(false);
                // setShowSubCategory(false);
                // setShowNestedCategory(false);
            }
        }, 100); // Small delay to allow smooth transition
    };

    // Mouse enter handler to cancel close timeout
    const handleMouseEnter = () => {
        if (mouseLeaveTimeoutRef.current) {
            clearTimeout(mouseLeaveTimeoutRef.current);
        }
    };

    // Handle sub-category mouse leave
    const handleSubCategoryLeave = (event: React.MouseEvent) => {
        if (mouseLeaveTimeoutRef.current) {
            clearTimeout(mouseLeaveTimeoutRef.current);
        }

        mouseLeaveTimeoutRef.current = setTimeout(() => {
            const mouseEvent = event.nativeEvent;
            const mainDropdown = dropdownRef.current?.getBoundingClientRect();
            const subDropdown = subDropdownRef.current?.getBoundingClientRect();
            const nestedDropdown = nestedDropdownRef.current?.getBoundingClientRect();

            let isOverValidArea = false;

            // Check if mouse is over main dropdown
            if (mainDropdown) {
                isOverValidArea = isOverValidArea || (
                    mouseEvent.clientX >= mainDropdown.left &&
                    mouseEvent.clientX <= mainDropdown.right &&
                    mouseEvent.clientY >= mainDropdown.top &&
                    mouseEvent.clientY <= mainDropdown.bottom
                );
            }

            // Check if mouse is over sub dropdown
            if (subDropdown) {
                isOverValidArea = isOverValidArea || (
                    mouseEvent.clientX >= subDropdown.left &&
                    mouseEvent.clientX <= subDropdown.right &&
                    mouseEvent.clientY >= subDropdown.top &&
                    mouseEvent.clientY <= subDropdown.bottom
                );
            }

            // Check if mouse is over nested dropdown
            if (nestedDropdown && showNestedCategory) {
                isOverValidArea = isOverValidArea || (
                    mouseEvent.clientX >= nestedDropdown.left &&
                    mouseEvent.clientX <= nestedDropdown.right &&
                    mouseEvent.clientY >= nestedDropdown.top &&
                    mouseEvent.clientY <= nestedDropdown.bottom
                );
            }

            if (!isOverValidArea) {
                if (!mainDropdown || !(
                    mouseEvent.clientX >= mainDropdown.left &&
                    mouseEvent.clientX <= mainDropdown.right &&
                    mouseEvent.clientY >= mainDropdown.top &&
                    mouseEvent.clientY <= mainDropdown.bottom
                )) {
                }
            }
        }, 100);
    };

    // Handle nested category mouse leave
    const handleNestedCategoryLeave = (event: React.MouseEvent) => {
        if (mouseLeaveTimeoutRef.current) {
            clearTimeout(mouseLeaveTimeoutRef.current);
        }

        mouseLeaveTimeoutRef.current = setTimeout(() => {
            const mouseEvent = event.nativeEvent;

            if (!isMouseOverAnyDropdown(mouseEvent)) {
                // setShowNestedCategory(false);
                // Check if we should also close sub and main dropdowns
                const mainDropdown = dropdownRef.current?.getBoundingClientRect();
                const subDropdown = subDropdownRef.current?.getBoundingClientRect();

                let shouldCloseAll = true;

                if (mainDropdown && (
                    mouseEvent.clientX >= mainDropdown.left &&
                    mouseEvent.clientX <= mainDropdown.right &&
                    mouseEvent.clientY >= mainDropdown.top &&
                    mouseEvent.clientY <= mainDropdown.bottom
                )) {
                    shouldCloseAll = false;
                }

                if (subDropdown && (
                    mouseEvent.clientX >= subDropdown.left &&
                    mouseEvent.clientX <= subDropdown.right &&
                    mouseEvent.clientY >= subDropdown.top &&
                    mouseEvent.clientY <= subDropdown.bottom
                )) {
                    shouldCloseAll = false;
                }

            }
        }, 100);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (mouseLeaveTimeoutRef.current) {
                clearTimeout(mouseLeaveTimeoutRef.current);
            }
        };
    }, []);

    // Close dropdown on resize if screen size is smaller than lg breakpoint (1024px)
    useEffect(() => {
        const handleResize = () => {
            if (window?.innerWidth < 1024) {
                setShowCategoryDropdown(false);
                setShowSubCategory(false);
                setShowNestedCategory(false);
            }
        };

        window?.addEventListener('resize', handleResize);
        // Initial check just in case it loads on smaller screen
        handleResize();

        return () => window?.removeEventListener('resize', handleResize);
    }, []);

    // Sub-categories panel rendered via portal (fixed positioning, outside DropdownMenuContent)
    const renderSubCategories = () => {
        if (!showSubCategory || !selectedCategory?.subcategories?.length || !subPosition) return null;

        return createPortal(
            <div
                ref={subDropdownRef}
                className="bg-white text-black w-[250px] h-max flex flex-col z-[9999] rounded-md"
                style={{ position: 'fixed', top: subPosition.top, left: subPosition.left }}
                onMouseLeave={handleSubCategoryLeave}
                onMouseEnter={handleMouseEnter}
            >
                <div className="px-3 py-2">
                    <span className="text-sm font-medium uppercase tracking-wider">{selectedCategory.name}</span>
                </div>
                {selectedCategory.subcategories.map((subcategory) => (
                    subcategory.has_subcategory ? (
                        <div
                            className={`flexCenter justify-between px-3 py-2 cursor-pointer hover:sectionBg hover:primaryColor transition-all duration-300 ${selectedSubCategory?.id === subcategory.id ? 'sectionBg primaryColor' : 'bodyBg'}`}
                            key={subcategory.id}
                            onClick={(e) => handleSubCategoryClick(e, subcategory.id)}
                        >
                            <span className='break-all text-base'>{subcategory.name}</span>
                            <span className="shrink-0">
                                {isRTL ? <MdChevronLeft /> : <MdChevronRight />}
                            </span>
                        </div>
                    ) : (
                        <Link
                            href={`/courses/${selectedCategory.slug}/${subcategory.slug}?lang=${currentLanguageCode}`}
                            title={subcategory.name}
                            className="flexCenter justify-between px-3 py-2 bodyBg hover:sectionBg hover:primaryColor transition-all duration-300"
                            key={subcategory.id}
                        >
                            <span className='break-all text-base'>{subcategory.name}</span>
                        </Link>
                    )
                ))}
            </div>,
            document.body
        );
    };

    // Nested categories panel rendered via portal (fixed positioning, outside DropdownMenuContent)
    const renderNestedCategories = () => {
        if (!showNestedCategory || !selectedSubCategory?.subcategories?.length || !nestedPosition) return null;

        return createPortal(
            <div
                ref={nestedDropdownRef}
                className="bg-white text-black w-[250px] h-max flex flex-col z-[10000] rounded-md"
                style={{ position: 'fixed', top: nestedPosition.top, left: nestedPosition.left }}
                onMouseLeave={handleNestedCategoryLeave}
                onMouseEnter={handleMouseEnter}
            >
                <div className="px-3 py-2">
                    <span className="text-sm font-medium uppercase tracking-wider">{selectedSubCategory.name}</span>
                </div>
                {selectedSubCategory.subcategories.map((subcategory) => (
                    <Link
                        href={`/courses/${selectedCategory?.slug}/${selectedSubCategory.slug}/${subcategory.slug}?lang=${currentLanguageCode}`}
                        title={subcategory.name}
                        className="flexCenter justify-between px-3 py-2 bodyBg hover:sectionBg hover:primaryColor transition-all duration-300"
                        key={subcategory.id}
                    >
                        <span className='break-all text-base'>{subcategory.name}</span>
                    </Link>
                ))}
            </div>,
            document.body
        );
    };

    return (
        <>
            <div className="sm:col-span-12 lg:col-span-5 xl:col-span-3 2xl:col-span-2 between-1200-1399:col-span-3 col-span-2 primaryLightBg py-3 p-3 rounded-[4px] hidden lg:flexCenter gap-3 primaryColor cursor-pointer relative w-full "
                onClick={() => {
                    setShowCategoryDropdown(true);
                }}
            >
                <DropdownMenu
                    open={showCategoryDropdown}
                    onOpenChange={(open) => {
                        setShowCategoryDropdown(open);
                        if (!open) {
                            setShowSubCategory(false);
                            setShowNestedCategory(false);
                        }
                    }}
                    dir={getDirection() as 'ltr' | 'rtl'}
                >
                    <DropdownMenuTrigger asChild>
                        <div className='flexCenter gap-2'>
                            <span className="">
                                <TbCategoryPlus size={24} />
                            </span>
                            <div
                                className="flexCenter gap-1"
                                onClick={() => {
                                    setShowCategoryDropdown(true);
                                }}
                            >
                                <span className="font-semibold">{t('explore_cat')}</span>
                                <span>
                                    <IoCaretDownSharp />
                                </span>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[250px] max-w-full border-none shadow-lg"
                        align="center"
                        onMouseLeave={handleMouseLeave}
                        onMouseEnter={handleMouseEnter}
                        onPointerDownOutside={(e) => {
                            // Prevent closing when clicking on sub-category or nested category panels (rendered via portal)
                            const target = e.target as HTMLElement;
                            if (subDropdownRef.current?.contains(target) || nestedDropdownRef.current?.contains(target)) {
                                e.preventDefault();
                            }
                        }}
                        onInteractOutside={(e) => {
                            // Prevent closing when interacting with sub-category or nested category panels
                            const target = e.target as HTMLElement;
                            if (subDropdownRef.current?.contains(target) || nestedDropdownRef.current?.contains(target)) {
                                e.preventDefault();
                            }
                        }}
                    >
                        {/* Categories */}
                        {showCategoryDropdown && (
                            <div
                                ref={dropdownRef}
                                className="bg-white text-black w-full h-max flex flex-col z-1 "
                                onMouseEnter={handleMouseEnter}
                            >
                                <div className="px-3 py-2">
                                    <span className="text-sm font-medium uppercase tracking-wider">{t('all_categories')}</span>
                                </div>
                                <div className="bg-white text-black w-full max-h-[600px] overflow-y-scroll flex flex-col">
                                    {isCategoryLoading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-2">
                                                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                                                <div className="h-3 rounded bg-gray-200 animate-pulse flex-1" style={{ width: `${50 + (i % 3) * 20}%` }} />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {categoryTree.map((category) => (
                                                category.has_subcategory ? (
                                                    <div
                                                        className={`flexCenter justify-between px-3 py-2 cursor-pointer hover:sectionBg hover:primaryColor transition-all duration-300 ${selectedCategory?.id === category.id ? 'sectionBg primaryColor' : 'bodyBg'}`}
                                                        key={category.id}
                                                        onClick={(e) => handleCategoryClick(e, category.id)}
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <CategoryIcon src={category.image ?? ''} alt={category.name} />
                                                            <span className='break-all text-base'>{category.name}</span>
                                                        </div>
                                                        <span className="shrink-0">
                                                            {isRTL ? <MdChevronLeft /> : <MdChevronRight />}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/courses/${category.slug}?lang=${currentLanguageCode}`}
                                                        title={category.name}
                                                        className="flexCenter justify-between px-3 py-2 bodyBg hover:sectionBg hover:primaryColor transition-all duration-300"
                                                        key={category.id}
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <CategoryIcon src={category.image ?? ''} alt={category.name} />
                                                            <span className='break-all text-base'>{category.name}</span>
                                                        </div>
                                                    </Link>
                                                )
                                            ))}
                                            {categoryHasMore && (
                                                <button
                                                    type="button"
                                                    className="text-sm primaryColor font-medium hover:underline px-3 py-2 text-start disabled:opacity-50"
                                                    onClick={handleLoadMoreCategories}
                                                    disabled={isLoadingMore}
                                                >
                                                    {isLoadingMore ? t('loading') : t('load_more')}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Sub-categories and Nested categories rendered via portals outside DropdownMenuContent */}
            {renderSubCategories()}
            {renderNestedCategories()}
        </>
    )
}

export default CategoriesDropdown
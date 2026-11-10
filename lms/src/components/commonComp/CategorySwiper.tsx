'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import type { Swiper as SwiperType } from 'swiper';
import { CategoryDataType, SubCategoriesDataType } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CategorySwiperSkeleton from '../skeletons/CategorySwiperSkeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { getCategories, GetCategoriesParams } from '@/utils/api/user/getCategories';
import { extractErrorMessage } from '@/utils/helpers';
import { useSelector } from 'react-redux';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';


interface CategorySwiperProps {
    cateSlug?: string
    nestedCatePage?: boolean
}

const CategorySwiper: React.FC<CategorySwiperProps> = ({ cateSlug, nestedCatePage = false }) => {

    const currentLanguageCode = useSelector(currentLanguageSelector)
    const swiperRef = useRef<SwiperType | null>(null);
    const router = useRouter();
    const { t } = useTranslation();
    const params = useParams();
    const mainCate = params.mainCate as string;

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [categoriesData, setCategoriesData] = useState<(CategoryDataType | SubCategoriesDataType)[]>([]);

    const limit = 12
    const [page, setPage] = useState<number>(1);
    const [isLoadMoreCategories, setIsLoadMoreCategories] = useState<boolean>(false);
    const [totalCategories, setTotalCategories] = useState<number>(0);

    // Add state to track if user has interacted with swiper
    const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
    const isRTL = useSelector(isRTLSelector);

    const fetchCategories = async () => {
        try {
            // Build query parameters for the API request
            const queryParams: GetCategoriesParams = {};

            if (cateSlug) queryParams.slug = cateSlug;
            if (cateSlug) queryParams.get_subcategory = 1;
            else queryParams.get_subcategory = 0;
            if (limit) queryParams.per_page = limit;
            if (page) queryParams.page = page;

            // Call the getCategories utility function
            const response = await getCategories(queryParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data?.data) {
                        const extractedCategories = response.data.data;

                        if (extractedCategories && extractedCategories.length > 0) {
                            // Set total categories count
                            setTotalCategories(response.data.total || 0);

                            if (!isLoadMoreCategories) {
                                if (params.mainCate) {
                                    // For subcategories, get the subcategories from the first category
                                    setCategoriesData(extractedCategories[0]?.subcategories || []);
                                } else {
                                    // For main categories
                                    setCategoriesData(extractedCategories);
                                }
                                setIsLoading(false);
                            } else {
                                if (params.mainCate) {
                                    // Append subcategories for load more
                                    setCategoriesData([...categoriesData, ...(extractedCategories[0]?.subcategories || [])]);
                                } else {
                                    // Append main categories for load more
                                    setCategoriesData([...categoriesData, ...extractedCategories]);
                                }
                            }
                        } else {
                            setCategoriesData([]);
                            setIsLoading(false);
                        }
                    } else {
                        console.warn('No categories data found in response');
                        setCategoriesData([]);
                        setIsLoading(false);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch categories");
                    setCategoriesData([]);
                    setIsLoading(false);
                }
            } else {
                console.log("response is null in component", response);
                setCategoriesData([]);
                setIsLoading(false);
            }
        } catch (error) {
            extractErrorMessage(error);
            toast.error(t("something_went_wrong"));
            setCategoriesData([]);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!nestedCatePage) {
            fetchCategories();
        }
    }, [page])


    // console.log(categoryData, 'categoryData');

    const [showNavBut, setshowNavBut] = useState<boolean>(false)

    // Function to determine if navigation buttons should be shown
    const checkShowNavButtons = () => {
        if (typeof window !== 'undefined' && categoriesData) {
            if (window.innerWidth > 1539) {
                setshowNavBut(categoriesData.length > 10);
            } else if (window.innerWidth > 1199) {
                setshowNavBut(categoriesData.length > 8);
            } else if (window.innerWidth > 1023) {
                setshowNavBut(categoriesData.length > 6);
            } else if (window.innerWidth > 639) {
                setshowNavBut(categoriesData.length > 4);
            } else {
                setshowNavBut(false);
                // if(categoriesData.length > 2){
                //     setshowNavBut(true);
                // }
            }
        }
    };

    useEffect(() => {
        // console.log(categoriesData, 'categoriesData')
        // Run the check on initial render and when categoryData changes
        checkShowNavButtons();

        // Add resize event listener
        const handleResize = () => {
            checkShowNavButtons();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };


    }, [categoriesData]);

    const handleLoadMore = () => {
        if (hasUserInteracted && totalCategories > limit && totalCategories !== categoriesData?.length) {
            // console.log(totalCategories, 'totalCategories')
            // console.log(categoriesData?.length, 'categoriesData?.length')
            setIsLoadMoreCategories(true)
            setPage(page + 1)
        }
    }

    const categoryRedirect = (slug: string) => {
        if (params.mainCate && !params.subCate && !params.nestedCate) {
            router.push(`/courses/${params.mainCate}/${slug}?lang=${currentLanguageCode}`)
        } else if (params.subCate && !params.nestedCate) {
            router.push(`/courses/${params.mainCate}/${params.subCate}/${slug}?lang=${currentLanguageCode}`)
        } else if (params.nestedCate) {
            router.push(`/courses/${params.mainCate}/${params.subCate}/${params.nestedCate}/${slug}?lang=${currentLanguageCode}`)
        }
        else {
            router.push(`/courses/${slug}?lang=${currentLanguageCode}`)
        }
    }

    return (
        isLoading && !nestedCatePage ? (
            <div className='bg-black'>
                <div className='container relative'>
                    <div className='flex items-center gap-3 py-4'>
                        <button
                            onClick={() => {
                                setHasUserInteracted(true);
                                swiperRef.current?.slidePrev();
                            }}
                            className="p-1 sm:p-3 rounded-full bg-white flex items-center justify-center cursor-pointer"
                        >
                            {isRTL ? <FaArrowRight className='' /> : <FaArrowLeft className='' />}
                        </button>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                            spaceBetween={16}
                            slidesPerView={1}
                            navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            }}
                            breakpoints={{
                                0: {
                                    slidesPerView: 2.5,
                                },
                                640: {
                                    slidesPerView: 4,
                                },
                                1024: {
                                    slidesPerView: 6,
                                },
                                1200: {
                                    slidesPerView: 8,
                                },
                                1540: {
                                    slidesPerView: 10,
                                },
                            }}
                            onSlideChange={() => {
                                // Mark that user has interacted with swiper
                                setHasUserInteracted(true);
                            }}
                            onReachEnd={() => {
                                console.log('onReachEnd')
                                // Only trigger load more if user has interacted and conditions are met
                                handleLoadMore()

                            }}
                            className="relative items-center flex w-full"
                        >
                            {(
                                Array.from({ length: 16 }).map((_, index) => (
                                    <SwiperSlide key={index}>
                                        <CategorySwiperSkeleton />
                                    </SwiperSlide>
                                ))
                            )}

                            <div className="mt-6 flex justify-center">
                                <div className="swiper-pagination"></div>
                            </div>
                        </Swiper>
                        <button
                            onClick={() => {
                                setHasUserInteracted(true);
                                swiperRef.current?.slideNext();
                            }}
                            className="p-1 sm:p-3 rounded-full bg-white flex items-center justify-center cursor-pointer 2xl"
                        >
                            {isRTL ? <FaArrowLeft className='' /> : <FaArrowRight className='' />}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            !nestedCatePage && categoriesData.length > 0 &&
            <div className='bg-black px-0 sm:px-3'>
                <div className='container relative'>
                    <div className='flex items-center gap-3 py-4'>
                        {/* {
                            showNavBut && ( */}
                        <button
                            onClick={() => {
                                setHasUserInteracted(true);
                                swiperRef.current?.slidePrev();
                            }}
                            className="p-1 sm:p-3 rounded-full  bg-white flex items-center justify-center cursor-pointer"
                        >
                            {isRTL ? <FaArrowRight className='' /> : <FaArrowLeft className='' />}
                        </button>
                        {/* )
                        } */}
                        <Swiper
                            modules={[Navigation, Pagination]}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                            key={currentLanguageCode || 'default'}
                            dir={isRTL ? 'rtl' : 'ltr'}
                            spaceBetween={16}
                            slidesPerView="auto"
                            navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            }}
                            onSlideChange={() => {
                                // Mark that user has interacted with swiper
                                setHasUserInteracted(true);
                            }}
                            onReachEnd={() => {
                                console.log('onReachEnd')
                                // Only trigger load more if user has interacted and conditions are met
                                handleLoadMore()

                            }}
                            className="relative items-center flex w-full"
                        >
                            {
                                isLoading ? (
                                    Array.from({ length: 16 }).map((_, index) => (
                                        <SwiperSlide key={index}>
                                            <CategorySwiperSkeleton />
                                        </SwiperSlide>
                                    ))
                                ) : (
                                    categoriesData.map((item: CategoryDataType | SubCategoriesDataType, index: number) => {
                                        return (
                                            <SwiperSlide key={index} className='w-auto'>
                                                <span onClick={() => categoryRedirect(item.slug)} className={`cursor-pointer text-white flexCenter py-2 px-4 rounded-[4px] ${item.slug === mainCate ? 'bg-[#343541] border border-[#D8E0E633]' : ''} hover:bg-[#343541] border border-transparent hover:border hover:border-[#D8E0E633] transition-all duration-300`}>
                                                    {item.name}
                                                </span>
                                            </SwiperSlide>
                                        )
                                    }))
                            }

                            <div className="mt-6 flex justify-center">
                                <div className="swiper-pagination"></div>
                            </div>
                        </Swiper>
                        {/* {
                            showNavBut && ( */}
                        <button
                            onClick={() => {
                                setHasUserInteracted(true);
                                swiperRef.current?.slideNext();
                            }}
                            className="p-1 sm:p-3 rounded-full bg-white flex items-center justify-center cursor-pointer 2xl"
                        >
                            {isRTL ? <FaArrowLeft className='' /> : <FaArrowRight className='' />}
                        </button>
                        {/* )
                        } */}
                    </div>
                </div>
            </div >
        )
    )
}

export default CategorySwiper

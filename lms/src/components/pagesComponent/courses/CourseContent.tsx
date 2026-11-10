'use client'
import React, { useEffect, useState, useRef } from 'react'
import SidebarFilter from '@/components/commonComp/SidebarFilter'
import CourseCard from '@/components/cards/CourseCard'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import toast from 'react-hot-toast'
import CourseCardSkeleton from '@/components/skeletons/CourseCardSkeleton'
import { Course, SidebarFilterTypes } from '@/types'
import { getCourses, GetCoursesParams } from '@/utils/api/user/getCourses'
import { extractErrorMessage } from '@/utils/helpers'
import { useRouter, useSearchParams } from 'next/navigation'
import SidebarFilterSheet from '@/components/responsiveComponents/coursedComponests/SidebarFilterSheet'
import SortByFilterSheet from '@/components/responsiveComponents/coursedComponests/SortByFilterSheet'
import { useTranslation } from '@/hooks/useTranslation';
import DataNotFound from '@/components/commonComp/DataNotFound'

interface CourseContentProps {
    cateSlug?: string
    searchPage?: boolean
    search?: string
}

type SortByOption = 'newest' | 'oldest' | 'most-popular'

const CourseContent: React.FC<CourseContentProps> = ({ cateSlug, searchPage, search }) => {
    const limit = 12
    const { t } = useTranslation();
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [loadMoreLoading, setLoadMoreLoading] = useState(false)
    const [totalCourses, setTotalCourses] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const isInitialized = useRef(false)

    // Helper function to safely decode URL parameters
    const safeDecodeParam = (value: string | null): string => {
        if (!value) return ''
        try {
            return decodeURIComponent(value)
        } catch {
            return value
        }
    }

    // Function to get filters from URL parameters
    const getFiltersFromURL = (paramsStr: string): SidebarFilterTypes => {
        const params = new URLSearchParams(paramsStr)
        return {
            level: safeDecodeParam(params.get('level')),
            language: safeDecodeParam(params.get('language')),
            duration: safeDecodeParam(params.get('duration')),
            price: safeDecodeParam(params.get('price')),
            rating: safeDecodeParam(params.get('rating')),
            category: safeDecodeParam(params.get('category')),
            feature_section: safeDecodeParam(params.get('feature_section')),
        }
    }

    const [filterInitialized, setFilterInitialized] = useState(false)

    const [sidebarFilter, setSidebarFilter] = useState<SidebarFilterTypes>(() =>
        getFiltersFromURL(searchParams.toString())
    )

    // Function to update URL with current filters (for shareable URLs)
    const updateURLWithFilters = (filters: SidebarFilterTypes) => {
        // Manually construct URL parameters to avoid automatic encoding
        const params: string[] = []

        // Add non-empty filter values to URL
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 0) {
                const stringValue = String(value)/*  */
                params.push(`${key}=${stringValue}`)
            }
        })

        // Update URL without page reload
        const newURL = params.length > 0 ? `?${params.join('&')}` : window.location.pathname
        router.replace(newURL, { scroll: false })
    }

    // Function to clear all filters and update URL
    const clearAllFilters = () => {
        const emptyFilters: SidebarFilterTypes = {
            level: '',
            language: '',
            duration: '',
            price: '',
            rating: '',
            category: '',
            feature_section: '',
        }
        setSidebarFilter(emptyFilters)
        router.replace(window.location.pathname, { scroll: false })
    }

    const [sortBy, setSortBy] = useState<SortByOption>('newest')

    const handleSortBy = (value: string) => {
        setSortBy(value as SortByOption);
    }

    // Function to fetch courses from API
    const fetchCourses = async (page: number = 1, loadMore: boolean = false, filtersOverride?: SidebarFilterTypes) => {
        const activeFilters = filtersOverride ?? sidebarFilter
        try {
            if (loadMore) {
                setLoadMoreLoading(true)
            } else {
                setLoading(true)
            }

            // Build parameters object for the API function
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: GetCoursesParams = {
                per_page: limit,
                page: page
            };

            if (search) params.search = search;
            if (cateSlug) params.category_slug = cateSlug;
            if (activeFilters.price) params.course_type = activeFilters.price;
            if (activeFilters.level) params.level = activeFilters.level;
            if (activeFilters.rating) params.rating_filter = activeFilters.rating;
            if (activeFilters.duration) params.duration_filter = activeFilters.duration.toString();
            if (sortBy) params.post_filter = sortBy;
            if (activeFilters.language) params.language_id = activeFilters.language;
            if (activeFilters.feature_section) {
                params.feature_section = activeFilters.feature_section;
            } else if (searchPage) {
                params.feature_section = "";
            }

            const response = await getCourses(params);

            if (response) {
                if (!response.error) {
                    if (response.data?.data) {
                        const courseData = response.data.data;

                        if (loadMore) {
                            setCourses(prev => [...prev, ...courseData as unknown as Course[]]);
                        } else {
                            setCourses(courseData as unknown as Course[]);
                        }

                        setTotalCourses(response.data.total);

                        // Check if there are more pages
                        const totalPages = Math.ceil(response.data.total / limit);
                        setHasMore(page < totalPages);
                    } else {
                        if (!loadMore) {
                            setCourses([]);
                        }
                        setTotalCourses(0);
                        setHasMore(false);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch courses");

                    if (!loadMore) {
                        setCourses([]);
                    }
                    setTotalCourses(0);
                    setHasMore(false);
                }
            } else {
                console.log("response is null in component", response);

                if (!loadMore) {
                    setCourses([]);
                }
                setTotalCourses(0);
                setHasMore(false);
            }
        } catch (error) {
            extractErrorMessage(error);
            if (!loadMore) {
                setCourses([]);
            }
            setTotalCourses(0);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadMoreLoading(false);
        }
    }

    // Load more courses function
    const handleLoadMore = () => {
        const nextPage = currentPage + 1
        setCurrentPage(nextPage)
        fetchCourses(nextPage, true)
    }

    const handleWishlistToggle = (courseId: number, status: boolean) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === courseId ? { ...course, is_wishlisted: status } : course
            )
        );
    }


    // URL is the single source of truth.
    // This is the ONLY effect that triggers the API call.
    useEffect(() => {
        const urlFilters = getFiltersFromURL(searchParams.toString())
        setSidebarFilter(urlFilters)
        setCurrentPage(1)
        fetchCourses(1, false, urlFilters) // pass urlFilters directly to avoid stale closure
        isInitialized.current = true
        setFilterInitialized(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, sortBy, search, cateSlug])

    // When the user picks a filter, update the URL.
    // The searchParams effect above will then call the API.
    // Skips when sidebarFilter was just synced FROM the URL (already in sync = no router.replace needed).
    useEffect(() => {
        if (!isInitialized.current) return
        const urlFilters = getFiltersFromURL(searchParams.toString())
        const isInSync = (Object.keys(sidebarFilter) as Array<keyof SidebarFilterTypes>)
            .every(key => sidebarFilter[key] === urlFilters[key])
        if (!isInSync) {
            setLoading(true)
            updateURLWithFilters(sidebarFilter)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sidebarFilter])

    return (
        <div className={`container px-4 md:px-8 grid grid-cols-12 gap-6 mb-12 ${searchPage ? 'lg:-mt-24' : ''}`}>
            <div className={`col-span-12 lg:col-span-4 xl:col-span-3 lg:flex flex-col gap-3 ${searchPage ? '-mt-6' : ''}`}>
                {
                    searchPage && <span className='md:text-xl font-semibold hidden lg:block'>{t('filter_by')}</span>
                }
                {/* Mobile Filter */}
                <div className='mt-6 lg:hidden space-y-4'>
                    <h4 className='font-semibold'>{totalCourses} {totalCourses > 1 ? t('courses') : t('course')} {t('available')}</h4>
                    <div className=' w-full flex justify-between items-center gap-6 mb-2 sm:mb-4 b'>
                        <SidebarFilterSheet sidebarFilter={sidebarFilter} setSidebarFilter={setSidebarFilter} />
                        <SortByFilterSheet sortBy={sortBy} onChangeSortBy={handleSortBy} />
                    </div>
                </div>
                {/* Desktop Filter */}
                <div className='hidden lg:block'>
                    <SidebarFilter sidebarFilter={sidebarFilter} setSidebarFilter={setSidebarFilter} />
                </div>
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
                {/* Filter */}
                <div className='hidden lg:flex items-center justify-between flex-wrap gap-2'>
                    <div className='flex items-center gap-4'>
                        <h4 className='font-semibold'>{totalCourses} {totalCourses > 1 ? t('courses') : t('course')} {t('available')}</h4>
                        {/* Clear Filters Button - only show if any filter is applied */}
                        {(sidebarFilter.level || sidebarFilter.language || sidebarFilter.duration || sidebarFilter.price || sidebarFilter.rating || sidebarFilter.category) && (
                            <button
                                onClick={clearAllFilters}
                                className='text-sm text-red-600 hover:text-red-700 underline'
                            >
                                {t('clear_filters')}
                            </button>
                        )}
                    </div>
                    <div className=''>
                        <Select value={sortBy} onValueChange={handleSortBy}>
                            <SelectTrigger className="w-[135px] sm:w-[180px] md:w-[200px] lg:w-[250px] xl:w-[400px] h-[56px] border borderColor text-base bg-white">
                                <SelectValue placeholder={t('sort_by_all_products')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="newest">{t('sort_by_newest')}</SelectItem>
                                    <SelectItem value="oldest">{t('sort_by_oldest')}</SelectItem>
                                    <SelectItem value="most_popular">{t('sort_by_most_popular')}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Skeleton */}
                {loading ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index}>
                                <CourseCardSkeleton />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Courses */}
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.map((item) => {
                                return <CourseCard courseData={item} key={item.id} onWishlistToggle={handleWishlistToggle} />
                            })}
                            {/* Load more skeletal items */}
                            {loadMoreLoading && (
                                <>
                                    {[...Array(3)].map((_, index) => (
                                        <div key={index}>
                                            <CourseCardSkeleton />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                        {/* No courses found */}
                        {courses.length === 0 && !loading && (
                            <div className='flexCenter h-screen'>
                                <DataNotFound />
                            </div>
                        )}
                        {/* Load More */}
                        {hasMore && !loadMoreLoading && (
                            <div className='flexCenter'>
                                <button
                                    className='commonBtn'
                                    onClick={() => handleLoadMore()}
                                    disabled={loadMoreLoading}
                                >
                                    {loadMoreLoading ? t('loading') : t('load_more_courses')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default CourseContent

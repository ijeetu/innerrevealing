'use client'
import React, { useState, useRef } from 'react'
import { FiSearch } from 'react-icons/fi'
import { FaRegClock } from 'react-icons/fa'
import { BiRepeat } from "react-icons/bi"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation';
import { getSearchSuggestions, RecentSearchItem, CourseSuggestionItem, OtherSuggestionItem } from '@/utils/api/user/getSearchSuggestions'
import { extractErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { currentLanguageSelector } from '@/redux/reducers/languageSlice'

const SearchDropdown = () => {

    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const router = useRouter()

    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(true)
    const [suggestions, setSuggestions] = useState<OtherSuggestionItem[]>([])
    const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])
    const [topCourses, setTopCourses] = useState<CourseSuggestionItem[]>([])
    const isSearchOpenCondition = isSearchOpen && (suggestions.length > 0 || recentSearches.length > 0 || topCourses.length > 0)


    const [search, setSearch] = useState('')

    // Function to replace spaces with plus signs for URL formatting
    const formatSearchQuery = (query: string): string => {
        return encodeURIComponent(query.trim()).replace(/%20/g, '+')
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!search.trim()) {
            return;
        }
        const formattedSearch = formatSearchQuery(search)
        router.push(`/courses/search/${formattedSearch}?lang=${currentLanguageCode}`)
    }
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const onClickSearch = (value: string) => {

        setSearch(value);
        setIsSearchOpen(true);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await getSearchSuggestions({ query: value });
                console.log("response search dropdown getSearchSuggestions: ", response);
                if (response) {
                    // Check if API returned an error (error: true in response)
                    if (!response.error) {
                        if (response.data) {
                            setSuggestions(response.data.other_suggestions || []);
                            setTopCourses(response.data.top_courses || []);
                            setRecentSearches(response.data.recent_searches || []);
                        } else {
                            console.log('No search suggestions data found in response');
                            setSuggestions([]);
                            setTopCourses([]);
                            setRecentSearches([]);
                        }
                    } else {
                        console.log("API error:", response.message);
                        toast.error(response.message || "Failed to fetch search suggestions");
                        setSuggestions([]);
                        setTopCourses([]);
                        setRecentSearches([]);
                    }
                } else {
                    console.log("response is null in component", response);
                    setSuggestions([]);
                    setTopCourses([]);
                    setRecentSearches([]);
                }
            } catch (error) {
                extractErrorMessage(error);
                setSuggestions([]);
                setTopCourses([]);
                setRecentSearches([]);
            }
        }, 1000);
    }
    return (

        <div className="h-full w-full"
            onClick={() => setIsSearchOpen(true)}
        >
            <div className='w-full h-full flexCenter !justify-between'>
                <form onSubmit={handleSearch} className='flex items-center gap-2 w-full'>
                    <input
                        type="text"
                        placeholder={t("search_placeholder")}
                        className="focus:outline-hidden w-full"
                        value={search}
                        onChange={(e) => onClickSearch(e.target.value)}
                    />
                    <button type='submit' className='flexCenter bg-black w-14 h-12 ltr:rounded-r-[4px] rtl:rounded-l-[4px]'>
                        <FiSearch className='text-xl text-white' />
                    </button>
                </form>
            </div>
            {
                isSearchOpenCondition && search.length > 0 &&
                <div
                    className="border-none shadow-lg top-[50px] between-1400-1680:top-[55px] w-full overflow-y-auto mt-1 absolute m-auto left-0 right-0"
                    onMouseLeave={() => setIsSearchOpen(false)}
                >
                    <div className="flex flex-col md:flex-row bg-white">
                        {/* Left: Suggestions & Recent Searches */}
                        <div className="lg:w-1/2 w-full p-3 sm:p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-white">

                            {/* Suggestions */}
                            <div className="mb-8">
                                <ul className="space-y-4">
                                    {suggestions.map((item, idx) => (
                                        <li key={`suggestion-${idx}`}>
                                            <Link href={`/courses/search/${formatSearchQuery(search)}?lang=${currentLanguageCode}`} className="flex items-center gap-3 cursor-pointer " title={item.text}>
                                                <FiSearch className="text-gray-400" />
                                                <span className="text-base text-gray-600">{item.text}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Recent Searches */}
                            <div>
                                <h4 className="font-semibold text-base mb-3">{t("recent_searches")}</h4>
                                <ul className="space-y-3">
                                    {recentSearches.map((item, index) => (
                                        <li key={`recent-search-${index}`} >
                                            <Link href={`/courses/search/${formatSearchQuery(search)}?lang=${currentLanguageCode}`} className="flex items-center gap-3 cursor-pointer " title={item.text}>
                                                {/* <FaRegClock /> */}
                                                <div className='bg-[#5A5BB514] p-1 rounded-full'><BiRepeat className="primaryColor" /></div>
                                                <span className="text-base text-gray-600">{item.text}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* Right: Top Courses */}
                        <div className="lg:w-1/2 w-full p-3 sm:p-6 flex flex-col bg-white">
                            <h3 className="font-semibold text-lg mb-6">
                                {t("top_courses_in")} <span className="primaryColor">"{search}"</span>
                            </h3>
                            <div className="flex flex-col gap-5">
                                {topCourses.map((course, idx) => (
                                    <Link href={`/course-details/${course.slug}?lang=${currentLanguageCode}`} className="flex items-center gap-4" title={course.text} key={`top-course-${idx}`}>
                                        <div className="max-1199:hidden w-12 h-12 bg-gray-300 rounded-md flex-shrink-0 overflow-hidden">
                                            <Image
                                                src={course?.course_image}
                                                alt={course?.text}
                                                className="object-cover w-full h-full"
                                                width={0}
                                                height={0}
                                            />
                                        </div>
                                        <div>
                                            <div className=" text-sm sm:text-base leading-tight">{course.text}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span className="font-semibold text-gray-400 text-sm">{t("course_by_label")} :</span><span className="text-sm"> {course.author_name}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default SearchDropdown

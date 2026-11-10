"use client"
import React, { useRef, useState } from 'react'
import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { IoSearch } from "react-icons/io5";
import UpperCardSect from './sections/UpperCardSect';
import JoinConversion from './sections/JoinConversion';
import Faqs from './sections/Faqs';
import { HelpdeskQuestion, searchHelpdeskQuery } from '@/utils/api/user/helpdesk/search-query/searchQuery';
import { FiSearch } from 'react-icons/fi'
import { useTranslation } from '@/hooks/useTranslation'
import { useSelector } from 'react-redux'
import { currentLanguageSelector } from '@/redux/reducers/languageSlice'
import { extractErrorMessage } from '@/utils/helpers'

const HelpSupport: React.FC = () => {

    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector)
    // State for search query questions 
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<HelpdeskQuestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        setIsLoading(true);
        setShowDropdown(true);
        try {
            const response = await searchHelpdeskQuery({ query, type: 'questions' });
            if (response) {
                if (!response.error) {
                    if (response.data?.data?.questions?.data && response.data?.data?.questions?.data.length > 0) {
                        setSearchResults(response.data?.data?.questions?.data);
                    } else {
                        setSearchResults([]);
                    }
                }
                else {
                    console.log("API error:", response.message);
                    setSearchResults([]);
                }
            } else {
                console.log("response is null in component");
                setSearchResults([]);
            }
            setHasSearched(true);
        } catch (error) {
            extractErrorMessage(error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (value: string) => {
        setQuery(value);
        // opne dropdown only if input is not empty
        setShowDropdown(value.trim().length > 0);

        // Clear previous search results so old results are not shown
        setSearchResults([]);
        // reset when user starts typing again
        setHasSearched(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        // set new timeout 
        typingTimeoutRef.current = setTimeout(() => {
            handleSearch(value);
        }, 1000); // wait 1s after user stops typing

    }

    // Encode query for URL (spaces replaced with +)
    const queryParam = encodeURIComponent(query).replace(/%20/g, "+");

    return (
        <Layout>
            <div className="commonGap">
                <div className='bg-[#010211] pt-8 md:pt-20 pb-16 md:pb-40 text-white relative'>
                    <div className="container space-y-4">

                        {/* breadcrumb */}
                        <div className='bg-[#FFFFFF3D] rounded-full py-2 px-4 w-max flexCenter gap-1'>
                            <Link href={`/?lang=${currentLanguageCode}`} className='' title='Home'>{t("home")}</Link>
                            <span><MdKeyboardArrowRight size={22} /></span>
                            <span>{t("courses")}</span>
                        </div>

                        {/* title and description */}
                        <div className='flexColCenter items-start gap-2 mb-6 md:mb-12'>
                            <h1 className='font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]'>{t("help_greeting")}</h1>
                            <p className='sectionPara lg:w-[52%] opacity-75'>{t("help_description")}</p>
                        </div>

                        {/* Search Query Help and Support */}
                        <div className='grid grid-cols-1 md:grid-cols-2 relative'>
                            <div className='flex bg-white rounded-[4px] overflow-hidden w-full justify-between items-center p-[1px]'>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder={t("search_for_query")}
                                    className='text-black outline-none pl-4' />
                                <button onClick={() => handleSearch(query)}
                                    className='commonBtn flexCenter gap-1 !py-2 px-2 md:!px-4'>
                                    <span className='hidden md:block'>
                                        {t("search")}
                                    </span>
                                    <IoSearch />
                                </button>
                            </div>
                            {/* search results */}
                            {showDropdown && searchResults.length > 0 && (
                                <div
                                    className="absolute top-full left-0 md:w-[50%] w-full mt-1 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden"
                                    onMouseLeave={() => setShowDropdown(false)}
                                >
                                    <div className="max-h-72 overflow-y-auto">
                                        <ul className="divide-y divide-gray-100">
                                            {searchResults.map((searchResult, idx) => (
                                                <Link href={`/help-support/support-group/${searchResult?.group?.slug}/${searchResult?.slug}?query=${queryParam}&lang=${currentLanguageCode}`}
                                                    key={idx}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                                                >
                                                    <FiSearch className="text-gray-400 text-lg w-[20px] h-[20px] shrink-0" />
                                                    <span className="text-gray-800 text-sm sm:text-base line-clamp-1">
                                                        {searchResult.title}
                                                    </span>
                                                </Link>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* No results */}
                            {showDropdown && !isLoading && searchResults.length === 0 && hasSearched && (
                                <div className="absolute top-full left-0 md:w-[50%] w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-md p-3 text-gray-500 text-sm z-50">
                                    {t("result_not_found")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='sectionBg'>
                    <UpperCardSect />
                    <JoinConversion />
                </div>
                <Faqs />
            </div>
        </Layout>
    )
}

export default HelpSupport

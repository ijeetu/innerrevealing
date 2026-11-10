"use client"
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import ReplySkeleton from '@/components/skeletons/help-support/ReplySkeleton';
import SupportGroupSkeleton from '@/components/skeletons/help-support/SupportGroupSkeleton';
import { getQuestions, QuestionItem } from '@/utils/api/user/helpdesk/question/getQuestions';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { BiMessageAltDetail, BiMessageSquareAdd, BiMessageSquareDots, BiReply, BiShow } from 'react-icons/bi';
import { useTranslation } from '@/hooks/useTranslation';
import RichTextContent from '@/components/commonComp/RichText';
import { useSelector } from 'react-redux';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';

const GroupAllQuestion = ({ groupSlug }: { groupSlug: string }) => {

    const currentLanguageCode = useSelector(currentLanguageSelector)
    // State for the questions, page, & loading
    const [questions, setQuestions] = useState<QuestionItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalReplies, setTotalReplies] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const { t } = useTranslation();

    // Fetch getQuestions API data with proper error handling and pagination
    const fetchQuestions = async (loadMore: boolean = false) => {
        try {
            setLoading(true);

            // Calculate the page number to fetch
            const pageToFetch = loadMore ? page + 1 : 1;

            // Call the API with current group slug and pagination parameters
            const response = await getQuestions({
                group_slug: groupSlug,
                per_page: 5,
                page: pageToFetch,
            });

            // Check if response exists and is not an error
            if (response && !response.error && response.data) {
                // Extract questions data directly from response
                const questionsData = response.data.data;

                if (questionsData && questionsData.length > 0) {
                    if (loadMore) {
                        // Append new questions to existing ones for load more functionality
                        setQuestions(prevQuestions => [...prevQuestions, ...questionsData]);
                    } else {
                        // Replace questions for initial load or refresh
                        setQuestions(questionsData);
                    }

                    // Update totals from response data
                    const totals = response.data.totals;
                    if (totals) {
                        setTotalQuestions(totals.total_questions || 0);
                        setTotalReplies(totals.total_replies || 0);
                    }

                    // Check if there are more pages - compare current page with last page
                    const hasMoreData = response.data.current_page < response.data.last_page;
                    setHasMore(hasMoreData);

                    // Update current page - use the page we actually fetched
                    setPage(pageToFetch);

                    // Mark that we've completed initial load
                    if (!loadMore) {
                        setHasInitiallyLoaded(true);
                    }

                } else {
                    // No questions found in response
                    console.log('No questions data found in response');
                    setQuestions([]);
                    // Mark as loaded even if no data
                    if (!loadMore) {
                        setHasInitiallyLoaded(true);
                    }
                }
            } else {
                // Handle API error - response is null or has error flag
                const errorMessage = response?.message || 'Failed to fetch questions';
                console.error('API Error:', errorMessage);

                // Set empty state on error
                setQuestions([]);
                setTotalQuestions(0);
                setTotalReplies(0);
                setHasMore(false);
                // Mark as loaded even on error
                if (!loadMore) {
                    setHasInitiallyLoaded(true);
                }
            }
        } catch (error) {
            // Handle unexpected errors
            console.error('Unexpected error fetching questions:', error);
            setQuestions([]);
            setTotalQuestions(0);
            setTotalReplies(0);
            setHasMore(false);
            // Mark as loaded even on error
            if (!loadMore) {
                setHasInitiallyLoaded(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load questions when component mounts or slug changes
    useEffect(() => {
        if (groupSlug) {
            setHasInitiallyLoaded(false); // Reset initial load state
            //   fetchCheckGroupApproval();
            fetchQuestions(false); // Load first page, don't append
        }
    }, [groupSlug]);

    // Handle load more functionality
    const handleLoadMore = async () => {
        if (!loading && hasMore && !loadingMore) {
            setLoadingMore(true);
            await fetchQuestions(true); // Load next page and append to existing questions
            setLoadingMore(false);
        }
    };

    return (
        <div className="flex-grow bg-white">
            {/* Show skeleton only on initial load when we haven't loaded data yet */}
            {loading && !hasInitiallyLoaded && (
                <SupportGroupSkeleton />
            )}

            {/* Stats Header - only show when not in initial loading state */}
            {loading || hasInitiallyLoaded ? (
                <div className="py-6 px-4 md:px-6  flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center flex-wrap gap-3 md:gap-6 max-407:gap-18">
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-4 h-4">
                                <BiMessageSquareDots />
                            </span>
                            <span className="text-sm font-normal text-gray-900">
                                <strong>{totalQuestions}</strong> {t("questions")}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-4 h-4">
                                <BiReply />
                            </span>
                            <span className="text-sm font-normal text-gray-900">
                                <strong>{totalReplies}</strong> {t("replies")}
                            </span>
                        </div>
                    </div>
                    <Link
                        href={`/help-support/support-group/${groupSlug}/ask-question/?lang=${currentLanguageCode}`}
                        className="max-407:w-full w-auto"
                    >
                        <button className="bg-black text-white px-4 py-1.5 rounded text-sm flex items-center gap-1.5 max-407:justify-center max-407:w-full w-auto">
                            <BiMessageSquareAdd />
                            {t("ask_question")}
                        </button>
                    </Link>
                </div>
            ) : null}

            {/* Show empty state only when we've completed initial load and have no data */}
            {!loading && hasInitiallyLoaded && questions.length === 0 && (
                <div className="p-4 md:p-6 text-center flex flex-col gap-2 items-center justify-center md:min-h-[500px]">
                    <p className="text-gray-500 text-xl font-semibold">{t("no_questions_found")}</p>
                    <span className="text-gray-500">{t("there_are_currently_no_questions_available_in_this_group_please_check_back_later_or_add_new_questions_to_get_started")}</span>
                </div>
            )}

            {/* Show questions only when we have data */}
            {questions.length > 0 && (
                <div className="p-4 md:p-6 space-y-4">
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            className="border-b border-gray-100 pb-4"
                        >
                            <div className="flex gap-3 md:gap-4">
                                {/* Avatar Circle */}
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <CustomImageTag
                                            src={question.author.avatar}
                                            alt={question.author.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="flex-grow">


                                    <div className="text-sm text-gray-600 mt-2 mb-3" style={{ lineBreak: 'anywhere' }}>
                                        <RichTextContent content={question.description} />
                                    </div>

                                    <div className="flex  justify-between items-center sectionBg py-3 px-3 rounded-[5px]">
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded text-xs text-gray-900">
                                                <BiMessageAltDetail size={12} />
                                                {question.replies_count} {t("answers")}
                                            </span>
                                            {question.views_count > 0 && (
                                                <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded text-xs text-gray-900">
                                                    <BiShow size={12} />
                                                    {question.views_count} {t("views")}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/help-support/support-group/${groupSlug}/${question.slug}?lang=${currentLanguageCode}`}
                                        >
                                            <button className="bg-black text-white px-3 py-1 rounded text-xs">
                                                {t("answer")}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Skeleton loading for load more */}
                    {loadingMore && (
                        <div>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <ReplySkeleton key={index} />
                            ))}
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && questions.length > 0 && (
                        <div className="text-center pt-4 mb-5">
                            <button
                                className="commonBtn"
                                onClick={handleLoadMore}
                                disabled={loading || loadingMore}
                            >
                                {loadingMore ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {t("loading")}
                                    </div>
                                ) : (
                                    t("load_more_discussion")
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default GroupAllQuestion

'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import { getCourseReviews, CourseReviewsData } from '@/utils/api/user/getCourseReviews';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import AllReviews from './AllReviews';
import AddReviewModal from './AddReviewModal';
import ReviewsSkeleton from '@/components/skeletons/ReviewSkeleton';
import { Course } from '@/utils/api/user/getCourse';
import AverageReviewsComp from './AverageReviewsComp';
import { useTranslation } from '@/hooks/useTranslation';


interface ReviewTabConentProps {
    courseDetailsPage?: boolean;
    courseData?: Course;
}

const ReviewSection: React.FC<ReviewTabConentProps> = ({ courseDetailsPage, courseData }) => {

    const { t } = useTranslation();

    // Get course slug from URL params
    const { slug } = useParams();

    // State management following ReviewsSect pattern
    const [reviewsData, setReviewsData] = useState<CourseReviewsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Fetch reviews function following ReviewsSect pattern
    const fetchCourseReviews = async (page: number = 1, loadMore: boolean = false) => {
        if (!slug) {
            return;
        }

        try {
            // Set appropriate loading state based on whether we're loading more or initial load
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            const apiParams = {
                slug: slug as string,
                per_page: 5, // Set a reasonable per_page limit
                page: page,
            };

            const response = await getCourseReviews(apiParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data) {
                        if (loadMore) {
                            // Append new reviews to existing ones
                            setReviewsData(prevData => {
                                if (prevData && response.data) {
                                    return {
                                        ...prevData,
                                        reviews: {
                                            ...prevData.reviews,
                                            data: [...prevData.reviews.data, ...response.data.reviews.data]
                                        }
                                    };
                                }
                                return response.data;
                            });
                        } else {
                            setReviewsData(response.data);
                        }

                        // Check if there are more pages
                        const totalPages = Math.ceil(response.data.reviews.total / 5);
                        setHasMore(page < totalPages);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch reviews");

                    if (!loadMore) {
                        setReviewsData(null);
                    }
                    setHasMore(false);
                }
            } else {
                console.log("response is null in ReviewTabContent", response);

                if (!loadMore) {
                    setReviewsData(null);
                }
                setHasMore(false);
            }
        } catch (error) {
            extractErrorMessage(error);

            if (!loadMore) {
                setReviewsData(null);
            }
            setHasMore(false);
        } finally {
            // Reset appropriate loading state
            if (loadMore) {
                setLoadingMore(false);
            } else {
                setIsLoading(false);
            }
        }
    };

    // Load reviews on component mount and when slug changes
    useEffect(() => {
        if (slug) {
            fetchCourseReviews(1, false);
        }
    }, [slug]);

    // Load more reviews function following ReviewsSect pattern
    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchCourseReviews(nextPage, true);
        }
    };

    if (isLoading) {
        return <ReviewsSkeleton instructorPage={true} />;
    }

    // Show no data state
    if (!reviewsData) {
        return (
            <div className='p-3 md:p-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='sm:text-lg md:text-xl font-semibold text-gray-800 mb-3'>{t("reviews")}</h2>
                    <AddReviewModal
                        courseId={courseData?.id}
                        courseSlug={courseData?.slug}
                        onReviewSubmitted={() => fetchCourseReviews(1, false)}
                    />
                </div>
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">{t("no_reviews_available")}</div>
                </div>
            </div>
        );
    }

    // Extract data from API response

    // overall rating hold average ratings for the course

    // rating distribution hold the percentage of the rating

    // in this we have the all reviews data
    const allReviews = reviewsData.reviews.data;

    return (
        <div className={`${courseDetailsPage ? '' : 'p-3 md:p-6 flex flex-col gap-2'}`}>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-1'>
                <h2 className={`sm:text-lg md:text-xl font-semibold text-gray-800 ${!courseDetailsPage ? 'mb-3' : 'mb-0'}`}>{t("reviews")}</h2>    
                {!courseDetailsPage ? (
                    <AddReviewModal
                        courseId={courseData?.id}
                        courseSlug={courseData?.slug}
                        onReviewSubmitted={() => fetchCourseReviews(1, false)}
                    />
                ) : ''}
            </div>
            <AverageReviewsComp reviewsData={reviewsData} />
            <AllReviews
                reviews={allReviews}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
                totalReviews={reviewsData.reviews.total}
                courseDetailsPage={courseDetailsPage}
            />
        </div>
    )
}

export default ReviewSection

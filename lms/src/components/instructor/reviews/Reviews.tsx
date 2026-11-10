import React, { useState, useEffect } from 'react';
import CustomPagination from '../commonCommponents/pagination/CustomPagination';
import { getReviews, GetReviewsParams } from '@/utils/api/instructor/reviews/getReviews';
import { CourseReviewsData } from '@/utils/api/user/getCourseReviews';
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { FaStar, FaRegStar } from "react-icons/fa";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useTranslation } from "@/hooks/useTranslation";
import ReviewsSkeleton from '@/components/skeletons/ReviewSkeleton';
import DataNotFound from '@/components/commonComp/DataNotFound';

// Define props interface for the Reviews component
interface ReviewsProps {
    teamSlug?: string;
    courseSlug?: string;
}

const Reviews: React.FC<ReviewsProps> = ({ teamSlug, courseSlug }) => {

    // Translation hook
    const { t } = useTranslation();

    // Local state for reviews data
    const [reviewsData, setReviewsData] = useState<CourseReviewsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch reviews function - following the same pattern as fetchAddedCourses
    const fetchReviews = async (params?: {
        page?: number;
        per_page?: number;
    }) => {
        setIsLoading(true);

        try {
            // Build API parameters based on current state
            const apiParams: GetReviewsParams = {
                slug: courseSlug,
                per_page: params?.per_page || rowsPerPage,
                page: params?.page || currentPage,
            };

            // Add team_user_slug if provided
            if (teamSlug) {
                apiParams.team_user_slug = teamSlug;
            }

            // Fetch reviews with server-side pagination
            const response = await getReviews(apiParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data) {
                        setReviewsData(response.data);

                        // Set pagination data from reviews data
                        if (response.data.reviews) {
                            setTotalReviews(response.data.reviews.total);
                            setTotalPages(response.data.reviews.last_page);
                        } else {
                            setTotalReviews(0);
                            setTotalPages(0);
                        }
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch reviews");
                    setReviewsData(null);
                    setTotalReviews(0);
                    setTotalPages(0);
                }
            } else {
                console.log("response is null in component", response);
                setReviewsData(null);
                setTotalReviews(0);
                setTotalPages(0);
            }
        } catch (error) {
            extractErrorMessage(error);
            setReviewsData(null);
            setTotalReviews(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler functions for pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchReviews({ page });
    };

    const handleRowsPerPageChange = (perPage: number) => {
        setRowsPerPage(perPage);
        setCurrentPage(1); // Reset to first page when changing rows per page
        fetchReviews({ per_page: perPage, page: 1 });
    };

    const handleRowsPerPageSelectChange = (value: string): void => {
        handleRowsPerPageChange(parseInt(value, 10));
    };

    // Fetch reviews on component mount
    useEffect(() => {
        fetchReviews();
    }, []);

    // Early return if no data and not loading
    if (!isLoading && !reviewsData) {
        return (
            <DataNotFound />
        );
    }

    // Early return if loading
    if (isLoading && !reviewsData) {
        return (
            <ReviewsSkeleton instructorPage={true} />
        );
    }

    // Extract data from API response - safely access with null checks
    const statistics = reviewsData?.statistics;
    const reviews = reviewsData?.reviews;

    // overall rating hold average ratings for the course
    const overallRating = statistics?.average_rating || 0;

    // rating distribution hold the percentage of the rating
    const ratingDistribution = {
        five: statistics?.percentage_breakdown?.["5_stars"] || 0,
        four: statistics?.percentage_breakdown?.["4_stars"] || 0,
        three: statistics?.percentage_breakdown?.["3_stars"] || 0,
        two: statistics?.percentage_breakdown?.["2_stars"] || 0,
        one: statistics?.percentage_breakdown?.["1_star"] || 0,
    };

    // in this we have the all reviews data
    const allReviews = reviews?.data || [];

    // Create star rating component - local component for this file
    const RatingStars = ({ rating }: { rating: number }) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FaStar key={i} className="text-[#DB9305]" size={16} />
            );
        }

        // Add half star if needed
        if (hasHalfStar) {
            stars.push(
                <FaRegStar key="half" className="text-[#DB9305]" size={16} />
            );
        }

        // Add empty stars
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FaRegStar key={`empty-${i}`} className="text-gray-300" size={16} />
            );
        }

        return <div className="flex">{stars}</div>;
    };

    return (
        <div className={`w-full ${!courseSlug ? "bg-white rounded-2xl border borderColor" : ""}`}>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 border-b borderColor p-3 sm:p-6">{t("instructor_reviews")}</h2>
            <div className="p-3 sm:p-6 space-y-6">
                <div className="py-6 px-4 border borderColor rounded-2xl overflow-hidden bg-white">
                    {/* Rating summary section */}
                    <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-4 w-full">
                        {/* Overall score */}
                        <div className="text-center md:text-left bg-[#DB93050F] p-4 rounded-[4px] flexColCenter gap-1">
                            <div className="text-4xl font-bold text-gray-900">{overallRating.toFixed(1)}</div>
                            <div className="flex justify-center md:justify-start mb-1">
                                <RatingStars rating={overallRating} />
                            </div>
                            <div className="text-[#DB9305] font-medium">{t("ratings")}</div>
                        </div>

                        {/* Rating distribution */}
                        <div className="flex-grow md:w-[80%]">
                            {/* 5 star row */}
                            <div className="flex items-center mb-2">
                                <div className="flex items-center w-20">
                                    <div className="flex text-[#DB9305] mr-1">
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                    </div>
                                </div>
                                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-[#DB9305] rounded-full"
                                        style={{ width: `${ratingDistribution.five}%` }}
                                    ></div>
                                </div>
                                <div className="w-10 text-right text-sm">{ratingDistribution.five}%</div>
                            </div>

                            {/* 4 star row */}
                            <div className="flex items-center mb-2">
                                <div className="flex items-center w-20">
                                    <div className="flex text-[#DB9305] mr-1">
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaRegStar size={14} />
                                    </div>
                                </div>
                                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-[#DB9305] rounded-full"
                                        style={{ width: `${ratingDistribution.four}%` }}
                                    ></div>
                                </div>
                                <div className="w-10 text-right text-sm">{ratingDistribution.four}%</div>
                            </div>

                            {/* 3 star row */}
                            <div className="flex items-center mb-2">
                                <div className="flex items-center w-20">
                                    <div className="flex text-[#DB9305] mr-1">
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaRegStar size={14} />
                                        <FaRegStar size={14} />
                                    </div>
                                </div>
                                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-[#DB9305] rounded-full"
                                        style={{ width: `${ratingDistribution.three}%` }}
                                    ></div>
                                </div>
                                <div className="w-10 text-right text-sm">{ratingDistribution.three}%</div>
                            </div>

                            {/* 2 star row */}
                            <div className="flex items-center mb-2">
                                <div className="flex items-center w-20">
                                    <div className="flex text-[#DB9305] mr-1">
                                        <FaStar size={14} />
                                        <FaStar size={14} />
                                        <FaRegStar size={14} />
                                        <FaRegStar size={14} />
                                        <FaRegStar size={14} />
                                    </div>
                                </div>
                                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-[#DB9305] rounded-full"
                                        style={{ width: `${ratingDistribution.two}%` }}
                                    ></div>
                                </div>
                                <div className="w-10 text-right text-sm">{ratingDistribution.two}%</div>
                            </div>

                            {/* 1 star row */}
                            <div className="flex items-center">
                                <div className="flex items-center w-20">
                                    <div className="flex text-[#DB9305] mr-1">
                                        <FaStar size={14} />
                                        <FaRegStar size={14} />
                                        <FaRegStar size={14} />
                                        <FaRegStar size={14} />
                                        <FaRegStar size={14} />
                                    </div>
                                </div>
                                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-[#DB9305] rounded-full"
                                        style={{ width: `${ratingDistribution.one}%` }}
                                    ></div>
                                </div>
                                <div className="w-10 text-right text-sm">{ratingDistribution.one}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews list */}
                <div className="border borderColor rounded-2xl overflow-hidden bg-white">
                    {allReviews.map((review) => (
                        <div key={review.id} className="p-3 sm:p-6 border-b borderColor last:border-b-0">
                            <div className="flex items-start">
                                <div className="mr-4">
                                    <div className="h-[48px] w-[48px] rounded-[4px] overflow-hidden">
                                        <CustomImageTag
                                            src={review.user.avatar}
                                            alt={review.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-medium text-gray-800">{review.user.name}</h4>
                                        <div className="flex items-center">
                                            <span className="text-[#DB9305] mr-1">
                                                <FaStar size={16} />
                                            </span>
                                            <span className="text-sm font-medium">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#010211] mb-2">{review.created_at}</p>
                                    <p className="text-[#010211]">{review.review}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

            </div>
            {/* Pagination - only show if there are multiple pages */}
            {totalPages > 0 && (
                <div className="border-t borderColor p-4">
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        totalItems={totalReviews}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageSelectChange}
                        showResultText={true}
                    />
                </div>
            )}

        </div>
    )
}

export default Reviews

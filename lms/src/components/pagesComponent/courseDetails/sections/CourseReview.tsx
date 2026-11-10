'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';


interface Review {
    id: number;
    userName: string;
    date: string;
    rating: number;
    comment: string;
    userImage: string;
}

interface CourseReviewProps {
    overallRating: number;
    ratingDistribution: {
        five: number;
        four: number;
        three: number;
        two: number;
        one: number;
    };
    reviews: Review[];
}

const CourseReview: React.FC<CourseReviewProps> = ({
    overallRating,
    ratingDistribution,
    reviews: allReviews
}) => {
    const [visibleReviews, setVisibleReviews] = useState<number>(5);
    const { t } = useTranslation();
    const handleLoadMore = () => {
        setVisibleReviews(prev => prev + 5);
    };

    // Create star rating component
    const RatingStars = ({ rating }: { rating: number }) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="text-[#DB9305]" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} className="text-[#DB9305]" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-[#DB9305]" />);
            }
        }

        return <div className="flex">{stars}</div>;
    };

    return (
        <div className="">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">{t("reviews")}</h2>
            <div className="p-4 border borderColor rounded-2xl overflow-hidden bg-white">
                {/* Rating summary section */}
                <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-4 w-full border border-red-500">
                    {/* Overall score */}
                    <div className="text-center md:text-left bg-[#DB93050F] p-4 rounded-[4px] flexColCenter gap-1">
                        <div className="text-4xl font-bold text-gray-900">{overallRating}</div>
                        <div className="flex justify-center md:justify-start mb-1">
                            <RatingStars rating={overallRating} />
                        </div>
                        <div className="text-[#DB9305] font-medium">{t("course_ratings")}</div>
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
            <div className="">
                {allReviews.slice(0, visibleReviews).map((review) => (
                    <div key={review.id} className="p-6 border-b borderColor">
                        <div className="flex items-start">
                            <div className="mr-4 max-575:hidden">
                                <div className="h-[48px] w-[48px] rounded-[4px] bg-gray-300 overflow-hidden">
                                    <Image
                                        src={review.userImage}
                                        alt={review.userName}
                                        width={0}
                                        height={0}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium text-gray-800">{review.userName}</h4>
                                    <div className="flex items-center">
                                        <span className="text-[#DB9305] mr-1">
                                            <FaStar size={16} />
                                        </span>
                                        <span className="text-sm font-medium">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[#010211] mb-2">{review.date}</p>
                                <p className="text-[#010211]">{review.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load more button */}
            {visibleReviews < allReviews.length && (
                <div className="p-6 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 border primaryBorder rounded-[4px] primaryColor cursor-pointer"
                    >
                        {t("load_more_reviews")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseReview;

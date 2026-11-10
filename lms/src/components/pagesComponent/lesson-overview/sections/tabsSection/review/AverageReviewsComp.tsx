import { useTranslation } from '@/hooks/useTranslation';
import { CourseReviewsData } from '@/utils/api/user/getCourseReviews';
import { InstructorReviewsData } from '@/utils/api/user/getInstructorReviews';
import { renderStarRating } from '@/utils/helpers';
import React from 'react'
import { FaRegStar, FaStar } from 'react-icons/fa'

interface AverageReviewsCompProps {
    reviewsData: CourseReviewsData | InstructorReviewsData;
    instructorDetailsPage?: boolean;
    hasReviews?: boolean;
}

const AverageReviewsComp = ({ reviewsData, instructorDetailsPage, hasReviews }: AverageReviewsCompProps) => {
    const { t } = useTranslation();
    if (!reviewsData) {
        return null; // or show a loader / skeleton
    }

    const { statistics } = reviewsData as CourseReviewsData;
    const overallRating = statistics.average_rating;

    const ratingDistribution = {
        five: statistics.percentage_breakdown["5_stars"],
        four: statistics.percentage_breakdown["4_stars"],
        three: statistics.percentage_breakdown["3_stars"],
        two: statistics.percentage_breakdown["2_stars"],
        one: statistics.percentage_breakdown["1_star"],
    };

    return (
        <div
            className={`${instructorDetailsPage
                ? `border ${hasReviews ? 'border-b-0' : 'border-b rounded-bl-[8px] rounded-br-[8px]'} rounded-none rounded-tl-[8px] rounded-tr-[8px]` : 'rounded-2xl'}
                    grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 md:items-center w-full border borderColor p-4`}>

            {/* Overall score */}
            <div className="md:col-span-4 text-center md:text-left bg-[#DB93050F] p-4 rounded-[4px] flexColCenter gap-1">
                <div className="text-4xl font-bold text-gray-900">{overallRating.toFixed(1)}</div>
                <div className="flex justify-center md:justify-start mb-1">
                    {renderStarRating(overallRating)}
                </div>
                <div className="text-[#DB9305] font-medium text-center">{instructorDetailsPage ? t("instructor_ratings") : t("course_ratings")}</div>
            </div>

            {/* Rating distribution */}
            <div className="md:col-span-8">
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
    )
}

export default AverageReviewsComp

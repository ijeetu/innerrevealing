"use client"
import { renderStarRating } from '@/utils/helpers'
import React from 'react'
import { BiSolidStar } from 'react-icons/bi'

interface RatingOverviewCardProps {
    ratings: { stars: number, percentage: number }[];
    instructorRatings?: boolean;
}

const RatingOverviewCard = ({ ratings, instructorRatings = false }: RatingOverviewCardProps) => {

    const rating = 4.5;

    return (
        <div className="bg-white rounded-lg border borderColor mx-3 sm:mx-6 p-3 sm:p-4 flex flex-col md:flex-row items-center">
            <div className="flex flex-col items-center mr-0 md:mr-4 bg-[#DB93050F] p-3 sm:p-4 rounded-md w-full md:w-auto mb-4 md:mb-0">
                <div className="text-2xl sm:text-3xl font-semibold">{rating}</div>
                <div className="mb-2">{renderStarRating(4.5, "lg")}</div>
                <div className="text-xs sm:text-sm text-[#DB9305]">
                    {instructorRatings ? "Instructor Ratings" : "Course Ratings"}
                </div>
            </div>

            <div className="flex-1 w-full">
                {ratings.map((rating) => (
                    <div key={rating.stars} className="flex items-center mb-2">
                        <div className="flex items-center w-16 sm:w-20">
                            {[...Array(rating.stars)].map((_, i) => (
                                <BiSolidStar
                                    key={i}
                                    className="w-3 h-3 sm:w-4 sm:h-4 fill-[#DB9305] text-[#DB9305]"
                                />
                            ))}
                            {[...Array(5 - rating.stars)].map((_, i) => (
                                <BiSolidStar
                                    key={i}
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300"
                                />
                            ))}
                        </div>
                        <div className="flex-1 mx-2 sm:mx-4">
                            <div className="bg-gray-200 h-1.5 sm:h-2 rounded-full w-full">
                                <div
                                    className="bg-[#DB9305] h-1.5 sm:h-2 rounded-full"
                                    style={{ width: `${rating.percentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 w-8 sm:w-10">
                            {rating.percentage}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RatingOverviewCard

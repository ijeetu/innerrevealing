'use client'
import { FaStar } from 'react-icons/fa'
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import ReviewLoadMoreSkeleton from '@/components/skeletons/ReviewLoadMoreSkeleton';
import { Review } from '@/utils/api/user/getCourseReviews';
import { InstructorReview } from '@/utils/api/user/getInstructorReviews';
import { useTranslation } from '@/hooks/useTranslation';

// Union type to accept both course and instructor reviews
type ReviewType = Review | InstructorReview;

interface AllReviewsProps {
    reviews: ReviewType[];
    hasMore: boolean;
    loadingMore: boolean;
    onLoadMore: () => void;
    totalReviews: number;
    courseDetailsPage?: boolean;
    instructorDetailsPage?: boolean;
}

const AllReviews: React.FC<AllReviewsProps> = ({
    reviews,
    hasMore,
    loadingMore,
    onLoadMore,
    totalReviews,
    courseDetailsPage,
    instructorDetailsPage
}) => {
    const { t } = useTranslation();
    return (
        <div className="w-full bg-white">
            {/* Header with search */}
            {!courseDetailsPage && !instructorDetailsPage && reviews?.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-2 md:p-5 border-b border-gray-100 my-3">
                    <h2 className="text-lg font-medium mb-4 md:mb-0">{t("all_reviews")} ({totalReviews}) </h2>
                </div>
            )}

            {/* Reviews list */}
            {reviews?.length > 0 && (
                <div className={` ${!courseDetailsPage && !instructorDetailsPage ? 'sectionBg' : ''}  ${instructorDetailsPage ? 'border border-[#D8E0E6] rounded-bl-[8px] rounded-br-[8px] rounded-none p-0 md:p-0' : 'p-2 md:p-4'} rounded-[8px]`}>
                    {reviews.map(review => (
                        <div key={review.id} className="p-2 sm:p-4 border-b borderColor last:border-b-0">
                            <div className="flex items-start">
                                {/* Avatar */}
                                <div className="me-3 flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                                        <CustomImageTag
                                            src={review?.user?.avatar}
                                            alt={review?.user?.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Review content */}
                                <div className="flex-1">
                                    <div className="flex flex-row sm:items-center mb-1 justify-between">
                                        <h3 className="font-medium">{review?.user?.name}</h3>
                                        <div className="flex items-center mb-2 gap-1">
                                            <FaStar className="text-[#DB9305]" />
                                            <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center mb-2">
                                        <span className="text-sm text-gray-500">{review.created_at}</span>
                                    </div>

                                    {/* Review text */}
                                    <p className="text-sm secondaryTextColor" style={{ lineBreak: 'anywhere' }}>{review.review}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Show loading skeleton when loading more reviews */}
                    {loadingMore && (
                        Array.from({ length: 3 }).map((_, index) => (
                            <ReviewLoadMoreSkeleton key={index} />
                        ))
                    )}

                    {/* Load more button */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={onLoadMore}
                                disabled={loadingMore}
                                className="px-4 py-2 border borderPrimary rounded-[4px] text-sm sm:text-base primaryColor hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? 'Loading Reviews...' : 'Load More Reviews'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AllReviews

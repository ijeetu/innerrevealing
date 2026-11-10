"use client"
import React from 'react'
import { ReviewType } from '@/types';
import CustomImageTag from '../commonComp/customImage/CustomImageTag';
import { BiCommentError, BiMessageSquareAdd, BiSolidStar } from 'react-icons/bi';
import { Button } from '../ui/button';
import { useTranslation } from "@/hooks/useTranslation";

interface ReviewCardProps {
    reviews: ReviewType[];
    showReplyInput?: boolean;
    setShowReplyInput?: (show: boolean) => void;
    replyText?: string;
    setReplyText?: (text: string) => void;
    handleOpenReportModal?: (post: ReviewType) => void;
    instructorCourseTab?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ reviews, showReplyInput, setShowReplyInput, replyText, setReplyText, handleOpenReportModal, instructorCourseTab = false }) => {
    const { t } = useTranslation();
    return (
        <div className={` sectionBg ${instructorCourseTab ? 'p-2 my-3 sm:my-4 space-y-3 sm:space-y-4 sm:p-4 mx-3 sm:mx-6 rounded-lg' : 'border-t borderColor'}`}>
            {reviews.map((post, index) => (
                <div
                    key={post.id}
                    className={`p-3 sm:p-6 bg-white ${instructorCourseTab ? 'rounded-lg' : 'border-b borderColor'} ${index === 0 && showReplyInput ? "pb-4 sm:pb-6" : ""
                        }`}
                >
                    <div className="flex gap-2 sm:gap-3">
                        {/* Avatar */}
                        <div className="h-8 w-8 sm:h-10 sm:w-10 text-white flex-shrink-0 rounded-[4px]">
                            <CustomImageTag
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-full h-full rounded"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row">
                                <div className="flex flex-col">
                                    <h3 className="font-medium text-xs sm:text-sm">
                                        {post.author.name}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {post.timestamp}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1 sm:mt-[-15px]">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <BiSolidStar className="w-3 h-3 sm:w-4 sm:h-4 fill-[#DB9305] text-[#DB9305]" />
                                        {post.rating}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-2 text-xs sm:text-sm break-words">
                                {post.content}
                            </p>

                            {/* divider */}
                            {
                                instructorCourseTab &&
                                <div className="my-2 sm:my-4 border-t border-gray-200"></div>
                            }
                            {/* Actions */}
                            {
                                instructorCourseTab &&
                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    <button
                                        className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500"
                                        onClick={() =>
                                            index === 0 && setShowReplyInput?.(true)
                                        }
                                    >
                                        <BiMessageSquareAdd className="h-3 w-3 sm:h-4 sm:w-4" />
                                        {t("add_reply")}
                                    </button>
                                    {/* right side divider line */}
                                    <div className="hidden sm:block border-r border-gray-200"></div>
                                    <button
                                        className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500"
                                        onClick={() => handleOpenReportModal?.(post)}
                                    >
                                        <BiCommentError className="h-3 w-3 sm:h-4 sm:w-4" />
                                        {t("report")}
                                    </button>
                                </div>
                            }
                        </div>
                    </div>

                    {/* Reply Input Area - Only shown for the first post when reply is clicked */}
                    {index === 0 && showReplyInput && instructorCourseTab && (
                        <div className="mt-3 sm:mt-6 ml-2 sm:ml-12">
                            <div className="sectionBg p-2 sm:p-4 rounded-lg">
                                <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                                    {t("reply")}
                                </h3>
                                <textarea
                                    placeholder="Write Reply"
                                    value={replyText || ''}
                                    onChange={(e) => setReplyText?.(e.target.value)}
                                    className="w-full p-2 border border-gray-200 bg-white rounded-md text-xs sm:text-sm min-h-[60px] sm:min-h-[80px] resize-none"
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowReplyInput?.(false)}
                                        className="h-7 sm:h-8 px-2 sm:px-4 text-xs"
                                    >
                                        {t("cancel_button")}
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-7 sm:h-8 px-2 sm:px-4 text-xs bg-black hover:bg-gray-800"
                                    >
                                        {t("add")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ReviewCard

"use client"
import React, { useState } from 'react'
import { FaRegStar, FaStar } from 'react-icons/fa'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { z } from 'zod';
import toast from 'react-hot-toast';
import { postRatingsReview } from '@/utils/api/user/postRatingsReview';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

interface AddReviewModalProps {
    courseId?: number;
    courseSlug?: string;
    onReviewSubmitted?: () => void;
}

type FormErrors = {
    course_id?: string;
    rating?: string;
    review?: string;
};

const AddReviewModal: React.FC<AddReviewModalProps> = ({ courseId, courseSlug, onReviewSubmitted }) => {

    const { t } = useTranslation();

    // validation schema using zod
    const reviewFormSchema = z.object({
        course_id: z.number().min(1, t("course_id_required")),
        rating: z.number().min(1, t("rating_required")).max(5, t("rating_must_be_between_1_and_5")),
        review: z.string().min(1, t("review_required")).max(2000, t("review_must_be_less_than_2000_characters")),
    });

    const [rating, setRating] = useState<number>(0)
    const [hover, setHover] = useState<number>(0)
    const [feedback, setFeedback] = useState<string>('')
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errors, setErrors] = useState<FormErrors>({})

    const router = useRouter();

    // Validate form using Zod
    const validateForm = () => {
        try {
            if (!courseId) {
                toast.error("Course ID is missing")
                return false
            }

            const dataToValidate = {
                course_id: courseId,
                rating,
                review: feedback,
            }

            reviewFormSchema.parse(dataToValidate)
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {}
                error.errors.forEach(err => {
                    const field = err.path[0] as keyof FormErrors
                    newErrors[field] = err.message
                })
                setErrors(newErrors)
                toast.error("Please fix the validation errors before submitting")
            }
            return false
        }
    }

    const handleSubmitReview = async () => {
        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const response = await postRatingsReview({ course_id: courseId, rating, review: feedback });
            if (!response.success) {
                toast.error(response.error || response.message)
                return
            }
            toast.success(response.message || "Review submitted successfully")
            setIsOpen(false)
            setRating(0)
            setFeedback('')
            setErrors({})

            // Call the callback to refresh reviews in parent component
            if (onReviewSubmitted) {
                onReviewSubmitted()
            }
            router.push(`/course-details/${courseSlug}`);
        } catch (error) {
            console.error("Error in handleSubmitReview:", error)
            toast.error("Failed to submit review")
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className='py-1 px-2 bg-black text-white rounded-[4px] flexCenter gap-2 w-full md:w-auto' onClick={() => setIsOpen(true)}>
                    <span className='-mt-1'><FaRegStar /></span>
                    <span className=''>{t("add_review")}</span>
                </button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-md p-4 max-w-md w-full">
                <DialogTitle className='text-lg font-semibold text-gray-800'>{t("add_review")}</DialogTitle>
                <div className="bg-[#F2F5F7] p-4 rounded-[8px] mb-6">
                    <p className="text-sm md:text-base mb-3">
                        {t("share_review")}
                    </p>

                    {/* Star Rating */}
                    <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1
                            return (
                                <label key={index} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                        className="hidden"
                                    />
                                    <FaStar
                                        className="mr-1"
                                        color={ratingValue <= (hover || rating) ? '#DB9305' : '#A5B7C4'}
                                        size={24}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            )
                        })}
                    </div>
                    {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
                    {/* Feedback Input */}
                    <div className="mb-4">
                        <p className="text-sm font-medium mb-2">{t("your_feedback")}</p>
                        <textarea
                            className="w-full border border-gray-200 rounded p-3 min-h-[120px] resize-none focus:outline-none focus:ring-1"
                            placeholder={t("write_here")}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        ></textarea>
                        {errors.review && <p className="text-sm text-red-500">{errors.review}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        className="w-full bg-black text-white py-3 rounded-[4px] font-medium"
                        onClick={handleSubmitReview}
                        disabled={isLoading}
                    >
                        {isLoading ? t("submitting") : t("submit_review")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddReviewModal

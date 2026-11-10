'use client'
import { MyInstructorReview } from '@/utils/api/user/getInstructorReviews';
import React, { useEffect, useState } from 'react'
import { LiaStarSolid } from "react-icons/lia";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { postRatingsReview } from '@/utils/api/user/postRatingsReview';
import { z } from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { deleteReview } from '@/utils/api/user/deleteReview';
import { setIsLoginModalOpen } from '@/redux/reducers/helpersReducer';
import { isLoginSelector } from '@/redux/reducers/userSlice';

// Validation schema using zod - matches the pattern from AddReviewModal
const reviewFormSchema = z.object({
  instructor_id: z.number().min(1, "Instructor ID is required"),
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  review: z.string().min(1, "Review is required").max(2000, "Review must be less than 2000 characters"),
});

// Type for form errors
type FormErrors = {
  instructor_id?: string;
  rating?: string;
  review?: string;
};

interface ReviewMattersProps {
  myReview?: MyInstructorReview | null;
  instructorId?: number;
  onReviewSubmitted?: () => void; // Callback to refresh reviews after successful submission
}

const ReviewMatters = ({ myReview, instructorId, onReviewSubmitted }: ReviewMattersProps) => {

  const { t } = useTranslation();
  const isLogin = useSelector(isLoginSelector);

  const [rating, setRating] = useState<number>(0)
  const [hover, setHover] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [showForm, setShowForm] = useState<boolean>(false);

  // New state for API integration
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const dispatch = useDispatch();

  useEffect(() => {
    if (myReview) {
      setShowForm(false); // Hide form → show submitted review
    } else {
      setShowForm(true); // Show form for new review
    }
  }, [myReview]);

  // Validate form using Zod - matches the pattern from AddReviewModal
  const validateForm = () => {
    try {
      if (!instructorId) {
        toast.error("Instructor ID is missing")
        return false
      }

      const dataToValidate = {
        instructor_id: instructorId,
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
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await postRatingsReview({ instructor_id: instructorId, rating, review: feedback });

      // Check if response is successful
      if (!response.success) {
        toast.error(response.message || "Failed to submit review")
        return
      }

      toast.success(response.message || "Review submitted successfully")
      setRating(0)
      setFeedback('')
      setErrors({})
      setShowForm(false);

      // Call the callback to refresh reviews in parent component
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error in handleSubmitReview:", error)
      toast.error("Failed to submit review")
      setRating(0)
      setFeedback('')
      setErrors({})
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditReview = () => {
    if (myReview) {
      setRating(myReview?.rating || 0)
      setFeedback(myReview?.review || '')
    }
    setShowForm(true);
  }

  const handleDeleteReview = async () => {

    if (!myReview?.id) {
      toast.error("Review ID is missing")
      return
    }

    setIsLoading(true)

    try {
      const response = await deleteReview(myReview.id);

      // Check if response exists and if there's an error
      if (!response || response?.data?.error) {
        toast.error(response?.data?.message || response?.message || "Failed to delete review")
        return
      }

      toast.success(response?.data?.message || response?.message || "Review deleted successfully")
      setShowForm(true);

      // Call the callback to refresh reviews in parent component
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error in handleDeleteReview:", error)
      toast.error("Failed to delete review")
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl">
      <h2 className="text-xl font-bold mb-4">{t("your_review_matters")}</h2>

      {/* Review Form */}
      {showForm && (
        <div className="bg-[#F2F5F7] p-4 rounded-[8px] mb-0">
          <p className="text-sm text-gray-700 mb-3">
            {t("help_shape_the_future_of_learning_share_your_instructor_review")}
          </p>

          {/* Star Rating */}
          <div className="flex items-center mb-4 gap-2">
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
                  <div className="border border-[#E8E8EC] rounded-[4px] p-[7px] bg-white">
                  <LiaStarSolid
                    className=""
                    color={ratingValue <= (hover || rating) ? '#DB9305' : '#A5B7C4'}
                    size={24}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                  </div>
                </label>
              )
            })}
          </div>
          {errors.rating && <p className="text-sm text-red-500 mb-2">{errors.rating}</p>}

          {/* Feedback Input */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">{t("your_feedback")}</p>
            <textarea
              className="w-full border border-[#E8E8EC] rounded p-3 min-h-[120px] resize-none focus:outline-none focus:ring-1 bg-white"
              placeholder={t("write_here")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
            {errors.review && <p className="text-sm text-red-500 mt-1">{errors.review}</p>}
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
      )}
      {/* Submitted Review */}
      {!showForm && myReview && (
        <div className="bg-[#F2F5F7] p-4 rounded-[8px]">
          <h3 className="font-medium mb-3">{t("my_review")}</h3>

          {/* Submitted Rating */}
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1
              return (
                <LiaStarSolid
                  key={index}
                  className="mr-1 "
                  color={ratingValue <= (myReview?.rating || 0) ? '#DB9305' : '#A5B7C4'}
                  size={24}
                />
              )
            })}
          </div>

          {/* Submitted Feedback */}
          <div className="mb-4">
            <p className="font-medium mb-1">{t("feedback")}</p>
            <p className="text-sm text-gray-700" style={{ lineBreak: 'anywhere' }}>{myReview?.review}</p>
          </div>

          {/* Edit Button */}
          <button
            className="w-full bg-black text-white py-3 rounded-[4px] font-medium mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleEditReview}
            disabled={isLoading}
          >
            {t("edit_review")}
          </button>

          {/* Delete Option */}
          <p
            className={`text-center text-[#DB3D26] ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={isLoading ? undefined : handleDeleteReview}
          >
            {isLoading ? t("deleting") || "Deleting..." : t("delete")}
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewMatters

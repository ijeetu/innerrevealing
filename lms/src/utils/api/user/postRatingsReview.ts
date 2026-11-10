"use client"
import axiosClient from "../axiosClient";
import { ratingAddApiRoute } from '@/utils/apiRoutes';


// Interface for rating/review data structure - matches the API request
export interface PostRatingsReviewData {
  instructor_id?: number;
  course_id?: number;
  rating: number;
  review: string;
}

// Interface for the API response data structure
export interface PostRatingsReviewResponseData {
  id: number;
  instructor_id?: number;
  course_id?: number;
  user_id: number;
  rating: number;
  review: string;
  updated_at: string;
  created_at: string;
}

// Interface for the actual API response structure
export interface PostRatingsReviewApiResponse {
  error: boolean;
  message: string;
  data: PostRatingsReviewResponseData;
  code: number;
}

// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

/**
 * Post a rating and review for an instructor
 * @param ratingReviewData - The rating and review data to post
 * @returns Promise with standardized API response structure
 */
export const postRatingsReview = async (
  ratingReviewData: PostRatingsReviewData,
): Promise<ApiResponse<PostRatingsReviewApiResponse>> => {
  try {
    // Get API URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;
    
    if (!baseURL || !endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        message: "Configuration error",
        code: 500
      };
    }

    // Validate required fields - either course_id or instructor_id is required
    if (!ratingReviewData.instructor_id && !ratingReviewData.course_id) {
      return {
        success: false,
        data: null,
        error: "Either course_id or instructor_id is required",
        message: "Either course_id or instructor_id is required",
        code: 400
      };
    }

    if (!ratingReviewData.rating) {
      return {
        success: false,
        data: null,
        error: "Rating is required",
        message: "Rating field is required",
        code: 400
      };
    }

    if (!ratingReviewData.review) {
      return {
        success: false,
        data: null,
        error: "Review is required",
        message: "Review field is required",
        code: 400
      };
    }

    // Validate rating range (assuming 1-5 scale)
    if (ratingReviewData.rating < 1 || ratingReviewData.rating > 5) {
      return {
        success: false,
        data: null,
        error: "Rating must be between 1 and 5",
        message: "Rating must be between 1 and 5",
        code: 400
      };
    }

    // Build the API URL for posting rating and review
    const apiUrl = ratingAddApiRoute;

    // Prepare the request data
    const requestData: PostRatingsReviewData = {
      rating: ratingReviewData.rating,
      review: ratingReviewData.review
    };

    // Add either instructor_id or course_id based on what's provided
    if (ratingReviewData.instructor_id) {
      requestData.instructor_id = ratingReviewData.instructor_id;
    }
    if (ratingReviewData.course_id) {
      requestData.course_id = ratingReviewData.course_id;
    }

    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: requestData,
      timeout: 10000,
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: response.data,
        error: response.data.message || "API returned an error",
        message: response.data.message,
        code: response.data.code
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message,
      code: response.data.code
    };

  } catch (error: unknown) {
    // Type cast error to access properties
    const err = error as {
      message: string;
      response?: {
        data: unknown;
        status: number;
      };
      config?: {
        url: string;
        method: string;
        timeout: number;
      };
    };

    // Improved error logging
    console.error("Post Ratings Review API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        timeout: err.config?.timeout,
      },
    });

    // Return standardized error response
    return {
      success: false,
      data: null,
      error: err.message || "An unexpected error occurred",
      message: (err.response?.data as { message?: string })?.message || "Failed to post rating and review",
      code: err.response?.status || 500
    };
  }
}

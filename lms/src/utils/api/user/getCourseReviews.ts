import axiosClient from "../axiosClient";
import { ApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { getCourseReviewsApiRoute } from "@/utils/apiRoutes";

// Interface for course information in reviews response
export interface CourseInfo {
  id: number;
  title: string;
  slug: string;
}

// Interface for rating breakdown statistics
export interface RatingBreakdown {
  "5_stars": number;
  "4_stars": number;
  "3_stars": number;
  "2_stars": number;
  "1_star": number;
}
// Interface for review statistics
export interface ReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: RatingBreakdown;
  percentage_breakdown: RatingBreakdown;
}

// Interface for user information in reviews
export interface ReviewUser {
  id: number;
  name: string;
  avatar: string;
  email: string;
}

// Interface for individual review
export interface Review {
  id: number;
  rating: number;
  review: string;
  user: ReviewUser;
  created_at: string;
  timestamp: string;
  time_ago: string;
}

// Use common PaginatedData interface for reviews
export type PaginatedReviews = PaginatedData<Review>;

// Interface for the complete course reviews response data
export interface CourseReviewsData {
  course: CourseInfo;
  statistics: ReviewStatistics;
  my_review: Review | null;
  reviews: PaginatedReviews;
}

// Interface for get course reviews request parameters
export interface GetCourseReviewsParams {
  slug?: string;
  per_page?: number;
  page?: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetCourseReviewsResponse = ApiResponse<CourseReviewsData>;

/**
 * Fetch course reviews from the API by course slug
 * @param params - Parameters for fetching course reviews (slug, per_page, page)
 * @returns Promise with course reviews response or null
 */
export const getCourseReviews = async (params: GetCourseReviewsParams): Promise<GetCourseReviewsResponse | null> => {
  try {

    const { ...queryParams } = params;

    const queryParamsObj: Record<string, string | number> = {};

    // Required parameter: slug
    if (queryParams.slug !== undefined) queryParamsObj.slug = queryParams.slug as string;

    // Optional parameters - only add if they exist
    if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page;
    if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page;


    const response = await axiosClient.get<GetCourseReviewsResponse>(getCourseReviewsApiRoute, {
      params: queryParamsObj,
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetCourseReviewsResponse } };
    console.log("Error in getCourseReviews:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

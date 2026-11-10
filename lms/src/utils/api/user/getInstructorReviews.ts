import axiosClient from "../axiosClient";
import { ApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { getInstructorReviewsApiRoute } from "@/utils/apiRoutes";

// Interface for instructor information in reviews response
export interface InstructorInfo {
  id: number;
  name: string;
  slug: string;
  profile: string;
}

// Interface for rating breakdown in instructor reviews
export interface InstructorRatingBreakdown {
  "5_stars": number;
  "4_stars": number;
  "3_stars": number;
  "2_stars": number;
  "1_star": number;
}

// Interface for instructor review statistics
export interface InstructorReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: InstructorRatingBreakdown;
  percentage_breakdown: InstructorRatingBreakdown;
}

// Interface for user information in instructor reviews
export interface InstructorReviewUser {
  id: number;
  name: string;
  avatar: string;
  email: string;
}

// Use shared pagination types across the app for consistency
export type InstructorReviewsPagination = PaginatedData<InstructorReview>;

// Interface for my instructor review (includes can_edit field)
export interface MyInstructorReview {
  id: number;
  rating: number;
  review: string;
  created_at: string;
  timestamp: string;
  time_ago: string;
  can_edit?: boolean;
}

// Interface for individual instructor review
export interface InstructorReview {
  id: number;
  rating: number;
  review: string;
  user: InstructorReviewUser;
  created_at: string;
  timestamp: string;
  time_ago: string;
}

// Interface for the complete instructor reviews response data
export interface InstructorReviewsData {
  instructor: InstructorInfo;
  statistics: InstructorReviewStatistics;
  my_review: MyInstructorReview | null;
  reviews: InstructorReviewsPagination;
}

// Interface for get instructor reviews request parameters
export interface GetInstructorReviewsParams {
  instructor_id?: number;
  slug?: string;
  per_page?: number;
  page?: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetInstructorReviewsResponse = ApiResponse<InstructorReviewsData>;

/**
 * Fetch instructor reviews from the API by instructor ID and slug
 * @param params - Parameters for fetching instructor reviews (instructor_id, slug, per_page, page)
 * @returns Promise with instructor reviews response or null
 */
export const getInstructorReviews = async (params: GetInstructorReviewsParams): Promise<GetInstructorReviewsResponse | null> => {
  try {
    // Extract query parameters
    const { ...queryParams } = params;

    // Build query parameters object
    const queryParamsObj: Record<string, string | number> = {};

    // Required parameters: instructor_id and slug
    if (queryParams.instructor_id !== undefined) queryParamsObj.instructor_id = queryParams.instructor_id as number;
    if (queryParams.slug !== undefined) queryParamsObj.slug = queryParams.slug as string;

    // Optional parameters - only add if they exist
    if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page;
    if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page;

    const response = await axiosClient.get<GetInstructorReviewsResponse>(getInstructorReviewsApiRoute, {
      params: queryParamsObj,
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetInstructorReviewsResponse } };
    console.log("Error in getInstructorReviews:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

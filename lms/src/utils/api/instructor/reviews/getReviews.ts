import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getReviewsApiRoute } from "@/utils/apiRoutes";
import { CourseReviewsData } from "../../user/getCourseReviews";

// Use the common ApiResponse interface for consistent response handling
export type GetCourseReviewsResponse = ApiResponse<CourseReviewsData>;

export interface GetReviewsParams {
    id?: number;
    per_page?: number;
    page?: number;
    slug?: string;
    team_user_slug?: string;
}

/**
 * Fetch course reviews from the API by course slug
 * @param params - Parameters for fetching course reviews (slug, per_page, page)
 * @returns Promise with course reviews response or null
 */
export const getReviews = async (params: GetReviewsParams): Promise<GetCourseReviewsResponse | null> => {
    try {

        const { ...queryParams } = params;

        const queryParamsObj: Record<string, string | number> = {};

        // Required parameter: slug
        queryParamsObj.id = queryParams.id as number;
        queryParamsObj.slug = queryParams.slug as string;
        queryParamsObj.team_user_slug = queryParams.team_user_slug as string;

        // Optional parameters - only add if they exist
        if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page;
        if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page;

        const response = await axiosClient.get<GetCourseReviewsResponse>(getReviewsApiRoute, { params: queryParamsObj });

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

import { Course } from "@/types";
import axiosClient from "../axiosClient";
import { PaginatedApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { myLearningApiRoute } from "@/utils/apiRoutes";

// Use the common PaginatedData interface for my learning courses
export type PaginatedMyLearningCourses = PaginatedData<Course>;

// Interface for get my learning request parameters
export interface GetMyLearningParams {
  per_page?: number;
  page?: number;
  progress_status?: "all" | "in_progress" | "completed"; // Filter courses by progress status
}

// Use the common PaginatedApiResponse interface for consistent response handling
export type GetMyLearningResponse = PaginatedApiResponse<Course>;

/**
 * Fetch user's learning courses from the API
 * @param params - Parameters for fetching my learning courses (per_page, page, progress_status)
 * @returns Promise with my learning courses response or null
 */
export const getMyLearning = async (params: GetMyLearningParams = {}): Promise<GetMyLearningResponse | null> => {
  try {
    // Extract query parameters
    const { ...queryParams } = params;
    
    // Build query parameters object
    const queryParamsObj: Record<string, string | number> = {};
    
    // Optional parameters - only add if they exist
    if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page;
    if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page;
    if (queryParams?.progress_status !== undefined) queryParamsObj.progress_status = queryParams.progress_status;

    const response = await axiosClient.get<GetMyLearningResponse>(myLearningApiRoute, {
      params: queryParamsObj,
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetMyLearningResponse } };
    console.log("Error in getMyLearning:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};

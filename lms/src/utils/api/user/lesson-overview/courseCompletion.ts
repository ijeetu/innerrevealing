import axiosClient from "../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { courseCompletionApiRoute } from "@/utils/apiRoutes";

// Interface for course completion status data structure
export interface CourseCompletionData {
  all_curriculum_completed: boolean;
  all_assignments_submitted: boolean;
  certificate: string;
  certificate_fee_paid: boolean;
  certificate_fee: number | null;

  certificate_tax_percentage: number;
  certificate_tax_amount: number;
  certificate_total: number;
}

// Interface for get course completion request parameters
export interface GetCourseCompletionParams {
  course_id: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetCourseCompletionResponse = ApiResponse<CourseCompletionData>;

/**
 * Fetch course completion status from the API
 * @param params - Parameters for fetching course completion (course_id)
 * @returns Promise with course completion response or null
 */
export const getCourseCompletion = async (params: GetCourseCompletionParams): Promise<GetCourseCompletionResponse | null> => {
  try {

    const { course_id } = params;

    // Build query parameters object
    const queryParamsObj: Record<string, string | number> = {
      course_id: course_id,
    };

    const response = await axiosClient.get<GetCourseCompletionResponse>(courseCompletionApiRoute, {
      params: queryParamsObj
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetCourseCompletionResponse } };
    console.log("Error in getCourseCompletion:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCourseEnrollStudentsApiRoute } from "@/utils/apiRoutes";

// Interface for enrolled student data structure (matches actual API response)
export interface EnrolledStudentDataType {
  id: number;
  name: string;
  email: string;
  profile: string;
  enrolled_at: string;
  progress_percentage: number;
}

// Use the common PaginatedApiResponse interface with EnrolledStudentDataType
export type EnrolledStudentsResponse = PaginatedApiResponse<EnrolledStudentDataType>;

// Interface for API parameters (matches the API documentation)
export interface GetCourseEnrolledStudentsParams {
  id?: number;
  page?: number;
  per_page?: number;
  search?: string;
}

/**
 * Fetch enrolled students for a course from the API
 * @param params - Optional parameters for the API request
 * @returns Promise with enrolled students data or null if error
 */
export const getCourseEnrolledStudents = async (
  params?: GetCourseEnrolledStudentsParams
): Promise<EnrolledStudentsResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Only add parameters that are not undefined
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.get<EnrolledStudentsResponse>(getCourseEnrollStudentsApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: EnrolledStudentsResponse } };
    console.log("Error in getCourseEnrolledStudents:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

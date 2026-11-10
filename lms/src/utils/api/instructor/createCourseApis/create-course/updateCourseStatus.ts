import axiosClient from "@/utils/api/axiosClient";
import { updateCourseStatusApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for course status change request data structure
export interface CourseStatusChangeData {
  course_id: number;
  status: 'draft' | 'publish'; // Status must be 'draft' or 'publish'
  certificate_enabled: string;
  certificate_fee: number;
}

// Interface for course status change submission response structure
export interface CourseStatusChangeResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Update course status using the update-course-status API
 * @param course_id - Course ID to update
 * @param status - Status to set ('draft' or 'publish')
 * @returns Promise with standardized API response structure
 */
export const updateCourseStatus = async (
  course_id: number,
  status: 'draft' | 'publish' | '',
  certificate_enabled: string,
  certificate_fee: number
): Promise<ApiResponse<CourseStatusChangeResponse>> => {
  try {

    // Validate required parameters
    if (!course_id || course_id <= 0) {
      return {
        success: false,
        data: null,
        error: "Valid course ID is required",
        message: "Valid course ID is required",
        code: 400
      };
    }

    // Create FormData for the request body
    const formData = new FormData();
    formData.append('course_id', course_id.toString());
    if (status) {
      formData.append('status', status);
    }
    formData.append('certificate_enabled', certificate_enabled.toString());
    if (certificate_enabled === '1' && certificate_fee) {
      formData.append('certificate_fee', certificate_fee.toString());
    }

    // Send the POST request to the backend API
    const response = await axiosClient.post(updateCourseStatusApiRoute, formData, {
      timeout: 10000,
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Course status update failed",
        message: response.data.message || "Course status update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Course status updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Course Status API request failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to update course status",
      code: errorCode
    };
  }
}

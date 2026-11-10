import axiosClient from "../../../axiosClient";
import { discussionCourseApiRoute } from '@/utils/apiRoutes';


// Interface for course discussion data structure - matches the API request
export interface CourseDiscussionData {
  course_id: number;
  message: string;
  parent_id?: number; // Optional field for replies to existing discussions
}

// Interface for the API response data structure
export interface CourseDiscussionResponseData {
  id: number;
  course_id: number;
  user_id: number;
  message: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

// Interface for the actual API response structure
export interface CourseDiscussionApiResponse {
  error: boolean;
  message: string;
  data: CourseDiscussionResponseData;
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
 * Post a discussion message for a course
 * @param discussionData - The discussion data to post (course_id, message, optional parent_id)
 * @returns Promise with standardized API response structure
 */
export const postCourseDiscussion = async (
  discussionData: CourseDiscussionData,
): Promise<ApiResponse<CourseDiscussionApiResponse>> => {
  try {
    // Get API URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;

    // Validate environment configuration
    if (!baseURL || !endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        message: "Configuration error",
        code: 500
      };
    }

    // Validate required fields
    if (!discussionData.course_id) {
      return {
        success: false,
        data: null,
        error: "Course ID is required",
        message: "Course ID field is required",
        code: 400
      };
    }

    if (!discussionData.message || discussionData.message.trim().length === 0) {
      return {
        success: false,
        data: null,
        error: "Message is required",
        message: "Message field is required and cannot be empty",
        code: 400
      };
    }

    // Validate message length (optional - adjust as needed)
    if (discussionData.message.length > 1000) {
      return {
        success: false,
        data: null,
        error: "Message is too long",
        message: "Message cannot exceed 1000 characters",
        code: 400
      };
    }

    // Build the API URL for course discussion
    const apiUrl = discussionCourseApiRoute;

    // Create FormData for the request (following placeOrder.ts pattern)
    const formData = new FormData();
    formData.append('course_id', discussionData.course_id.toString());
    formData.append('message', discussionData.message.trim());

    // Add parent_id if provided (for replies)
    if (discussionData.parent_id) {
      formData.append('parent_id', discussionData.parent_id.toString());
    }



    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: formData,
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

    // Improved error logging for debugging
    console.error("Course Discussion API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to post course discussion",
      code: err.response?.status || 500
    };
  }
}

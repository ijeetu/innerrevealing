import axiosClient from "../../../axiosClient";
import { helpdeskQuestionDetailsApiRoute } from '@/utils/apiRoutes';


// Interface for question data structure - matches the API request
export interface PostQuestionData {
  group_slug: string;
  title: string;
  description: string;
  is_private?: boolean;
}

// Interface for the API response data structure
export interface PostQuestionResponseData {
  group_id: string;
  user_id: number;
  title: string;
  description: string;
  is_private: boolean;
  updated_at: string;
  created_at: string;
  id: number;
}

// Interface for the actual API response structure
export interface PostQuestionApiResponse {
  error: boolean;
  message: string;
  data: PostQuestionResponseData;
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
 * Post a question to the helpdesk API
 * @param questionData - The question data to post
 * @returns Promise with standardized API response structure
 */
export const postQuestion = async (
  questionData: PostQuestionData,
): Promise<ApiResponse<PostQuestionApiResponse>> => {
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

    // Validate required fields
    if (!questionData.group_slug) {
      return {
        success: false,
        data: null,
        error: "Group slug is required",
        message: "Group slug field is required",
        code: 400
      };
    }

    if (!questionData.title) {
      return {
        success: false,
        data: null,
        error: "Question title is required",
        message: "Question title field is required",
        code: 400
      };
    }

    if (!questionData.description) {
      return {
        success: false,
        data: null,
        error: "Question description is required",
        message: "Question description field is required",
        code: 400
      };
    }

    // Build the API URL for posting question
    const apiUrl = helpdeskQuestionDetailsApiRoute;

    // Prepare the request data
    const requestData = {
      group_slug: questionData.group_slug,
      title: questionData.title,
      description: questionData.description,
      is_private: questionData.is_private || false
    };

    // Send the POST request to the backend API
    // Set Content-Type to application/json since we're sending JSON data, not FormData
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: requestData,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error("Post Question API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to post question",
      code: err.response?.status || 500
    };
  }
}
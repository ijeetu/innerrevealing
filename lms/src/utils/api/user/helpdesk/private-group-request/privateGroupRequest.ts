import axiosClient from "../../../axiosClient";
import { helpdeskGroupsRequestApiRoute } from '@/utils/apiRoutes';


// Interface for private group request data structure - matches the API request
export interface PrivateGroupRequestData {
  group_slug: string;
}

// Interface for the API response data structure
export interface PrivateGroupRequestResponseData {
  group_id: string;
  group_name: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// Interface for the complete API response
export interface PrivateGroupRequestApiResponse {
  success: boolean;
  data: PrivateGroupRequestResponseData;
  message: string;
  code: number;
}

// Standardized API response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string;
  code?: number;
}

/**
 * Send a private group request to the helpdesk API
 * @param requestData - The group request data containing group_slug
 * @returns Promise with standardized API response structure
 */
export const postPrivateGroupRequest = async (
  requestData: PrivateGroupRequestData,
): Promise<ApiResponse<PrivateGroupRequestApiResponse>> => {
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
    if (!requestData.group_slug) {
      return {
        success: false,
        data: null,
        error: "Group slug is required",
        message: "Group slug field is required",
        code: 400
      };
    }

    // Build the API URL for private group request
    const apiUrl = helpdeskGroupsRequestApiRoute;

    // Prepare the request data
    const requestPayload = {
      group_slug: requestData.group_slug
    };

    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: requestPayload,
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
    console.error("Private Group Request API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to send private group request",
      code: err.response?.status || 500
    };
  }
}

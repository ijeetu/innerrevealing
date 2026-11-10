import axiosClient from "../../../axiosClient";
import { helpdeskCheckGroupApprovalApiRoute } from '@/utils/apiRoutes';


// Interface for group data structure - matches the actual API response
export interface GroupData {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_private: number;        // 0 for public, 1 for private
  is_active: number;         // 0 for inactive, 1 for active
}

// Interface for the check group approval response data
export interface CheckGroupApprovalData {
  group: GroupData;
  is_approved: boolean;
  user_request_status: string;
  can_post_questions: boolean;
}

// Interface for the actual API response structure
export interface CheckGroupApprovalResponse {
  error: boolean;
  message: string;
  data: CheckGroupApprovalData;
  code: number;
}

// Interface for query parameters
interface CheckGroupApprovalParams {
  group_slug: string;        // Required: The slug of the group to check approval for
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
 * Check group approval status for a user
 * @param params - Parameters containing group_slug
 * @returns Promise with standardized API response structure containing approval status
 */
export const checkGroupApproval = async (params: CheckGroupApprovalParams): Promise<ApiResponse<CheckGroupApprovalResponse>> => {
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

    // Build the API URL for check group approval
    const apiUrl = helpdeskCheckGroupApprovalApiRoute;

    // Build query parameters object
    const queryParams: Record<string, string> = {
      group_slug: params.group_slug
    };

    // Send the GET request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'GET',
      params: queryParams,
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
    console.error("Check Group Approval API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to check group approval",
      code: err.response?.status || 500
    };
  }
}

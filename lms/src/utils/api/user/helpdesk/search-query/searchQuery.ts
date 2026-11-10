import axiosClient from "../../../axiosClient";
import { helpdeskSearchApiRoute } from '@/utils/apiRoutes';


// Interface for group information in helpdesk search
export interface HelpdeskGroup {
  id: number;
  name: string;
  slug: string;
}

// Interface for user information in helpdesk search
export interface HelpdeskUser {
  id: number;
  name: string;
}

// Interface for individual question item structure
export interface HelpdeskQuestion {
  id: number;
  title: string;
  slug: string;
  description: string;
  views: number;
  is_private: number;
  group: HelpdeskGroup;
  user: HelpdeskUser;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

// Interface for paginated questions response
export interface PaginatedQuestions {
  data: HelpdeskQuestion[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

// Interface for paginated groups response
export interface PaginatedGroups {
  data: HelpdeskGroup[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Interface for helpdesk search response data structure
// Updated to match new API response with paginated questions and groups
export interface HelpdeskSearchResponse {
  questions: PaginatedQuestions;
  groups: PaginatedGroups;
}

// Interface for the actual API response structure
export interface HelpdeskSearchApiResponse {
  error: boolean;
  message: string;
  data: HelpdeskSearchResponse;
  code: number;
}

// Interface for helpdesk search request parameters
export interface HelpdeskSearchParams {
  query: string;
  type?: 'questions';
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
 * Search helpdesk questions and groups based on search query
 * @param params - Parameters containing the search query and optional type filter
 * @returns Promise with standardized API response structure containing helpdesk search results
 */
export const searchHelpdeskQuery = async (params: HelpdeskSearchParams): Promise<ApiResponse<HelpdeskSearchApiResponse>> => {
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

    // Validate required query parameter
    if (!params.query || params.query.trim() === '') {
      return {
        success: false,
        data: null,
        error: "Search query is required",
        message: "Search query field is required",
        code: 400
      };
    }

    // Build the API URL for helpdesk search
    const apiUrl = helpdeskSearchApiRoute;

    // Build query parameters object
    const queryParams: Record<string, string> = {
      query: params.query.trim()
    };

    // Add type parameter if provided (only 'questions' is allowed)
    if (params.type) {
      queryParams.type = params.type;
    }

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
    console.error("Helpdesk Search API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to search helpdesk",
      code: err.response?.status || 500
    };
  }
}

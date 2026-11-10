import axiosClient from "../../../axiosClient";
import { helpdeskGroupsApiRoute } from '@/utils/apiRoutes';


// Interface for group data structure - matches the actual API response
export interface GroupItem {
  id: number;
  name: string;
  description: string;
  image: string;
  is_private: number;        // 0 for public, 1 for private
  row_order: number;         // Display order
  is_active: number;         // 0 for inactive, 1 for active
  created_at: string;        // ISO date string
  updated_at: string;        // ISO date string
  deleted_at: string | null; // ISO date string or null
  slug: string;
}

// Interface for the actual API response structure
export interface GroupsResponse {
  error: boolean;
  message: string;
  data: GroupItem[];
  code: number;
}

// Interface for query parameters (optional for future filtering)
interface GetGroupsParams {
  is_active?: number;        // Filter by active status (0 or 1)
  is_private?: number;       // Filter by privacy status (0 or 1)
  search?: string;           // Search by name or description
  sort_by?: string;          // Sort field (name, created_at, etc.)
  sort_order?: string;       // Sort direction (asc, desc)
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
 * Fetch groups from the helpdesk API
 * @param params - Optional query parameters for filtering groups
 * @returns Promise with standardized API response structure containing groups
 */
export const getGroups = async (params: GetGroupsParams = {}): Promise<ApiResponse<GroupsResponse>> => {
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

    // Build the API URL for helpdesk groups
    const apiUrl = helpdeskGroupsApiRoute;

    // Build query parameters object (only include defined parameters)
    const queryParams: Record<string, string | number> = {};

    if (params.is_active !== undefined) queryParams.is_active = params.is_active;
    if (params.is_private !== undefined) queryParams.is_private = params.is_private;
    if (params.search) queryParams.search = params.search;
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_order) queryParams.sort_order = params.sort_order;

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
    console.error("Get Groups API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to fetch groups",
      code: err.response?.status || 500
    };
  }
}

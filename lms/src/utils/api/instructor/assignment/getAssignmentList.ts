import axiosClient from "@/utils/api/axiosClient";
import { getAssignmentsListApiRoute } from "@/utils/apiRoutes";

// Interface for assignment data structure (matches actual API response)
export interface AssignmentDataType {
  id: number;
  assignment_name: string;
  assignment_slug: string;
  due_date: string;
  chapter_name: string;
  lecture_name: string;
  total_points: number;
  description: string;
  instructions: string | null;
  can_skip: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course_name: string;
}

// Interface for pagination links
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Interface for assignment list response data (matches new API structure)
export interface AssignmentListData {
  current_page: number;
  data: AssignmentDataType[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Interface for assignment list API response
export interface AssignmentListResponse {
  error: boolean;
  message: string;
  data: AssignmentListData;
  code: number;
}

// Interface for API parameters
export interface GetAssignmentListParams {
  id?: string;
  page?: number;
  per_page?: number;
  slug?: string;
  team_user_slug?: string;
  search?: string;
}

/**
 * Fetch assignment list from the API
 * @param params - Optional parameters for the API request
 * @returns Promise with assignment list data or null if error
 */
export const getAssignmentList = async (
  params?: GetAssignmentListParams
): Promise<AssignmentListResponse | null> => {
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
    const response = await axiosClient.get<AssignmentListResponse>(getAssignmentsListApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AssignmentListResponse } };
    console.log("Error in getAssignmentList:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

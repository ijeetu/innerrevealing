import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getDiscussionApiRoute } from "@/utils/apiRoutes";

// Interface for discussion author data structure
export interface DiscussionAuthor {
  id: number;
  name: string;
  avatar: string;
  email: string;
}

// Interface for discussion data structure (matches actual API response)
export interface DiscussionDataType {
  id: number;
  message: string;
  author: DiscussionAuthor;
  created_at: string;
  timestamp: string;
  time_ago: string;
  reply_count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replies: any[];
}

// Interface for pagination links
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Interface for discussions pagination data
export interface DiscussionsPaginationData {
  current_page: number;
  data: DiscussionDataType[];
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

// Interface for course data in discussions response
export interface DiscussionCourseData {
  id: number;
  title: string;
  slug: string;
}

// Interface for statistics data
export interface DiscussionStatistics {
  total_discussions: number;
  search_term: string | null;
}

// Interface for discussion response data
export interface DiscussionResponseData {
  course: DiscussionCourseData;
  statistics: DiscussionStatistics;
  discussions: DiscussionsPaginationData;
}

// Use the common ApiResponse interface for consistent response handling
export type GetDiscussionResponse = ApiResponse<DiscussionResponseData>;

// Interface for API parameters (matches the API documentation)
export interface GetDiscussionParams {
  id?: number;
  page?: number;
  per_page?: number;
  slug?: string;
  search?: string;
}

/**
 * Fetch course discussions from the API
 * @param params - Optional parameters for the API request
 * @returns Promise with discussion data or null if error
 */
export const getDiscussion = async (
  params?: GetDiscussionParams
): Promise<GetDiscussionResponse | null> => {
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
    const response = await axiosClient.get<GetDiscussionResponse>(getDiscussionApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetDiscussionResponse } };
    console.log("Error in getDiscussion:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

import axiosClient from "../../../axiosClient";
import { ApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";

// Interface for user information in discussions
export interface DiscussionUser {
  id: number;
  name: string;
  slug: string;
  email: string;
  mobile: string | null;
  country_code: string | null;
  email_verified_at: string | null;
  profile: string | null;
  is_active: number;
  wallet_balance: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for individual discussion message
export interface DiscussionMessage {
  id: number;
  course_id: number;
  user_id: number;
  message: string;
  parent_id: number | null;
  user: DiscussionUser;
  time_ago: string;
  created_at: string;
  updated_at: string;
  replies?: DiscussionMessage[]; // Nested replies for threaded discussions
}

// Use common PaginatedData interface for discussions
export type PaginatedDiscussions = PaginatedData<DiscussionMessage>;

// The API response directly returns paginated discussions without course wrapper
// So we use PaginatedDiscussions directly as the data type

// Interface for get course discussion request parameters
export interface GetCourseDiscussionParams {
  course_id: number;
  per_page?: number;
  page?: number;
  search?: string; // Add search parameter for filtering discussions
}

// Use the common ApiResponse interface for consistent response handling
// The API response data is directly the paginated discussions
export type GetCourseDiscussionResponse = ApiResponse<PaginatedDiscussions>;

/**
 * Fetch course discussions from the API by course ID
 * @param params - Parameters for fetching course discussions (course_id, per_page, page, search)
 * @returns Promise with course discussion response or null
 */
export const getCourseDiscussion = async (params: GetCourseDiscussionParams): Promise<GetCourseDiscussionResponse | null> => {
  try {
    const { ...queryParams } = params;

    const queryParamsObj: Record<string, string | number> = {};

    queryParamsObj.course_id = queryParams.course_id;

    // Optional parameters - only add if they exist
    if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page;
    if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page;
    if (queryParams?.search !== undefined && queryParams.search.trim() !== '') {
      queryParamsObj.search = queryParams.search.trim();
    }

    const response = await axiosClient.get<GetCourseDiscussionResponse>("/discussion/course", {
      params: queryParamsObj,
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetCourseDiscussionResponse } };
    console.log("Error in getCourseDiscussion:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

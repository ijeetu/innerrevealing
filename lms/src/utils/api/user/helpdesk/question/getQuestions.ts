import axiosClient from "../../../axiosClient";
import { helpdeskQuestionsApiRoute } from "@/utils/apiRoutes";

// Interface for author data structure in question response
export interface QuestionAuthor {
  id: number;
  name: string;
  avatar: string | null;
}

// Interface for group data structure in question response
export interface QuestionGroup {
  id: number;
  name: string;
  slug: string;
}

// Interface for question data structure - matches the API response
export interface QuestionItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  is_private: number;
  created_at: string;
  created_at_formatted: string;
  time_ago: string;
  updated_at: string;
  author: QuestionAuthor;
  group: QuestionGroup;
  replies_count: number;
  views_count: number;
}

// Interface for totals data
export interface TotalsData {
  total_questions: number;
  total_replies: number;
}

// Interface for the nested data structure - matches API response
// Questions array is at data.data, pagination fields are directly under data
export interface QuestionsData {
  data: QuestionItem[];              // Questions array
  current_page: number;              // Pagination fields directly under data
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  totals: TotalsData;                // Totals remain nested
}

// Interface for the actual API response structure
export interface GetQuestionsResponse {
  error: boolean;
  message: string;
  data: QuestionsData;
  code: number;
}

// Interface for query parameters (optional for filtering)
export interface GetQuestionsParams {
  group_slug?: string;        // Filter by group slug
  is_private?: number;        // Filter by privacy status (0 or 1)
  search?: string;           // Search by title or description
  sort_by?: string;          // Sort field (created_at, title, etc.)
  sort_order?: string;       // Sort direction (asc, desc)
  limit?: number;            // Number of questions to fetch
  page?: number;             // Page number for pagination
  per_page?: number;         // Number of questions per page
}

/**
 * Fetch questions from the helpdesk API
 * 
 * @param params - Optional query parameters for filtering questions
 * @returns Promise with API response containing questions with pagination and totals, or null on error
 */
export const getQuestions = async (
  params: GetQuestionsParams = {},
): Promise<GetQuestionsResponse | null> => {
  try {
    // Build query parameters object (only include defined parameters)
    const queryParams: Record<string, string | number> = {};
    
    if (params.group_slug) queryParams.group_slug = params.group_slug;
    if (params.is_private !== undefined) queryParams.is_private = params.is_private;
    if (params.search) queryParams.search = params.search;
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_order) queryParams.sort_order = params.sort_order;
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.per_page) queryParams.per_page = params.per_page;

    // Send the GET request to the backend API using the new pattern
    const response = await axiosClient.get<GetQuestionsResponse>(helpdeskQuestionsApiRoute, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle error using the new pattern - return response data if available, otherwise null
    const axiosError = error as { response?: { data?: GetQuestionsResponse } };
    console.log("Error in getQuestions:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
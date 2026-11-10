import axiosClient from "../../../../axiosClient";
import { helpdeskQuestionDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for author data structure in question response
export interface QuestionAnswerAuthor {
  id: number;
  name: string;
  avatar: string | null;
  email?: string;
}

// Interface for group data structure in question response
export interface QuestionAnswerGroup {
  id: number;
  name: string;
  slug: string;
}

// Interface for reply data structure - matches the API response
export interface QuestionReply {
  id: number;
  reply: string;
  created_at: string;
  time_ago: string;
  author: QuestionAnswerAuthor;
  children: QuestionReply[]; // For nested replies
}

// Interface for the main question data structure - matches the API response
export interface QuestionData {
  id: number;
  title: string;
  description: string;
  slug: string;
  views: number;
  created_at: string;
  updated_at: string;
  time_ago: string;
  author: QuestionAnswerAuthor;
  group: QuestionAnswerGroup;
  replies_count: number;
}

// Interface for the nested data structure - matches the new API response
// Question is at data.question, replies array is at data.replies, pagination fields are directly under data
export interface QuestionAnswersData {
  question: QuestionData;        // Question object
  replies: QuestionReply[];      // Array of replies
  current_page: number;          // Pagination fields directly under data
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_more_pages: boolean;
}

// Interface for the actual API response structure
export interface GetQuestionAnswersResponse {
  error: boolean;
  message: string;
  data: QuestionAnswersData;
  code: number;
}

// Interface for query parameters (optional for filtering)
export interface GetQuestionAnswersParams {
  slug?: string; // Filter by question slug
  question_id?: number; // Filter by question id
  page?: number; // Page number for pagination (default: 1)
  per_page?: number; // Number of replies per page (default: 10)
}

/**
 * Fetch question answers from the helpdesk API
 * 
 * @param params - Optional query parameters for filtering or pagination
 * @returns Promise with API response containing question with replies and pagination, or null on error
 */
export const getQuestionAnswers = async (
  params: GetQuestionAnswersParams = {},
): Promise<GetQuestionAnswersResponse | null> => {
  try {
    // Build query parameters object (only include defined parameters)
    const queryParams: Record<string, string | number> = {};
    
    if (params.slug) queryParams.slug = params.slug;
    if (params.question_id) queryParams.question_id = params.question_id;
    if (params.page) queryParams.page = params.page;
    if (params.per_page) queryParams.per_page = params.per_page;

    // Send the GET request to the backend API using the new pattern
    const response = await axiosClient.get<GetQuestionAnswersResponse>(helpdeskQuestionDetailsApiRoute, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle error using the new pattern - return response data if available, otherwise null
    const axiosError = error as { response?: { data?: GetQuestionAnswersResponse } };
    console.log("Error in getQuestionAnswers:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
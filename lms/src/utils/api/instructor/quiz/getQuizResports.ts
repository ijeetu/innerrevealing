import axiosClient from "@/utils/api/axiosClient";
import { PaginatedData, PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getQuizReportsApiRoute } from "@/utils/apiRoutes";

// Interface for quiz report data structure (matches actual API response)
export interface QuizReportDataType {
  id: number;
  quiz_name: string;
  quiz_slug: string;
  student_name: string;
  student_email: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  time_taken: number; // in seconds
  completed_at: string;
  course_name: string;
  chapter_name: string;
  lecture_name: string;
  status: 'completed' | 'incomplete' | 'failed';
  created_at: string;
  updated_at: string;
}

// Interface for quiz reports response data (matches API structure)
export type QuizReportsData = PaginatedData<QuizReportDataType>;

// Interface for quiz reports API response
export type QuizReportsResponse = PaginatedApiResponse<QuizReportDataType>;

// Interface for API parameters (matches the API documentation)
export interface GetQuizReportsParams {
  id?: number;
  page?: number;
  per_page?: number;
  slug?: string;
  team_user_slug?: string;
  search?: string;
  category_id?: string;
}

/**
 * Fetch quiz reports from the API
 * @param params - Optional parameters for the API request
 * @returns Promise with quiz reports data or null if error
 */
export const getQuizReports = async (
  params?: GetQuizReportsParams
): Promise<QuizReportsResponse | null> => {
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
    const response = await axiosClient.get<QuizReportsResponse>(getQuizReportsApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: QuizReportsResponse } };
    console.log("Error in getQuizReports:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

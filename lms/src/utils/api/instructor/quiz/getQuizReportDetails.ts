import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getQuizReportDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for quiz info data structure
export interface QuizInfoType {
  quiz_id: number;
  quiz_title: string;
  quiz_number: string;
  total_questions: number;
  course_name: string;
  chapter_name: string;
  course_id: number;
  chapter_id: number;
}

// Interface for quiz statistics data structure
export interface QuizStatisticsType {
  passing_points: number;
  total_points: number;
  total_attempts: number;
  pass_rate: number;
  average_score: number;
}

// Interface for student performance data structure
export interface StudentPerformanceType {
  user_id: number;
  player_name: string;
  player_email: string;
  player_image: string;
  attempt_id: number;
  total_attempts: number;
  correct_answers: number;
  incorrect_answers: number;
  earned_points: number | null;
  pass_fail: "Pass" | "Fail";
  pass_fail_status: boolean;
  last_attempt_date: string;
  last_attempt_datetime: string;
  time_ago: string;
}

// Interface for filters data structure
export interface FiltersType {
  quiz_reports: string[];
  pass_fail: string[];
}

// Interface for quiz report details data structure
export interface QuizReportDetailsDataType {
  quiz_info: QuizInfoType;
  quiz_statistics: QuizStatisticsType;
  student_performance: StudentPerformanceType[];
  filters: FiltersType;
}

// Interface for quiz report details API response
export type QuizReportDetailsResponse = ApiResponse<QuizReportDetailsDataType>;

// Interface for API parameters (matches the API documentation)
export interface GetQuizReportDetailsParams {
  quiz_id?: number;
  quiz_slug?: string;
  team_user_slug?: string;
  search?: string;
  status_filter?: string;
  date_filter?: string;
}

/**
 * Fetch quiz report details from the API
 * @param params - Required parameters for the API request
 * @returns Promise with quiz report details data or null if error
 */
export const getQuizReportDetails = async (
  params: GetQuizReportDetailsParams
): Promise<QuizReportDetailsResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    // Add required quiz_id parameter
    if (params.quiz_id) {
      queryParams.quiz_id = params.quiz_id;
    }

    // Add optional parameters if they exist
    if (params.quiz_slug) {
      queryParams.quiz_slug = params.quiz_slug;
    }
    if (params.team_user_slug) {
      queryParams.team_user_slug = params.team_user_slug;
    }
    if (params.search) {
      queryParams.search = params.search;
    }
    if (params.status_filter) {
      queryParams.status_filter = params.status_filter;
    }
    if (params.date_filter) {
      queryParams.date_filter = params.date_filter;
    }
    // Send the GET request to the backend API with query parameters
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.get<QuizReportDetailsResponse>(getQuizReportDetailsApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: QuizReportDetailsResponse } };
    console.log("Error in getQuizReportDetails:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

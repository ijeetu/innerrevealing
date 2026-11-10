import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getQuizResultDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for quiz summary data structure
export interface QuizSummaryType {
  student_name: string;
  student_email: string;
  quiz_title: string;
  course_name: string;
  chapter_name: string;
  attempt_date: string;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  earned_points: number;
  max_points: number;
  score_percentage: number;
  pass_fail_status: "Pass" | "Fail";
}

// Interface for question option data structure
export interface QuestionOptionType {
  id: number;
  option_text: string | null;
  is_selected: boolean;
  is_correct: boolean;
  status: "correct_answer" | "normal";
}

// Interface for correct option data structure
export interface CorrectOptionType {
  id: number;
  option_text: string | null;
}

// Interface for question data structure
export interface QuestionType {
  question_number: number;
  question_text: string | null;
  question_type: "multiple_choice" | "true_false" | "fill_blank";
  points: string;
  is_correct: boolean;
  status: "Correct" | "Incorrect";
  options: QuestionOptionType[];
  user_selected_option: number | null;
  correct_option: CorrectOptionType;
}

// Interface for quiz result details data structure
export interface QuizResultDetailsDataType {
  quiz_summary: QuizSummaryType;
  questions: QuestionType[];
}

// Interface for quiz result details API response
export type QuizResultDetailsResponse = ApiResponse<QuizResultDetailsDataType>;

// Interface for API parameters (matches the API documentation)
export interface GetQuizResultDetailsParams {
  attempt_id: number;
  course_id?: number;
  team_user_slug?: string;
}

/**
 * Fetch quiz result details from the API
 * @param params - Required parameters for the API request
 * @returns Promise with quiz result details data or null if error
 */
export const getQuizResultDetails = async (
  params: GetQuizResultDetailsParams
): Promise<QuizResultDetailsResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    // Add required parameters
    queryParams.attempt_id = params.attempt_id;
    if (params.course_id) {
      queryParams.course_id = params.course_id;
    }

    // Add optional parameters if they exist
    if (params.team_user_slug) {
      queryParams.team_user_slug = params.team_user_slug;
    }

    // Send the GET request to the backend API with query parameters
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.get<QuizResultDetailsResponse>(getQuizResultDetailsApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: QuizResultDetailsResponse } };
    console.log("Error in getQuizResultDetails:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

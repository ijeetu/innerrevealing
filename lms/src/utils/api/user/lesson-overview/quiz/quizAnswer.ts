import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { quizAnswerApiRoute } from "@/utils/apiRoutes";

// Interface for quiz answer response data
export interface QuizAnswerResponseData {
  id: number;
  user_id: number;
  user_quiz_attempt_id: number | null;
  quiz_question_id: number;
  quiz_option_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Use the common ApiResponse interface for consistent response handling
export type QuizAnswerResponse = ApiResponse<QuizAnswerResponseData>;

// Interface for API parameters (matches the API documentation)
export interface QuizAnswerParams {
  quiz_question_id: number;
  quiz_option_id: number;
  attempt_id: number;
}

/**
 * Submit a quiz answer to the API
 * @param params - Parameters for the quiz answer request
 * @returns Promise with quiz answer data or null if error
 */
export const submitQuizAnswer = async (
  params: QuizAnswerParams
): Promise<QuizAnswerResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData (as shown in API documentation)
    formData.append('quiz_question_id', params.quiz_question_id.toString());
    formData.append('quiz_option_id', params.quiz_option_id.toString());
    formData.append('attempt_id', params.attempt_id.toString());

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation: quizAnswerApiRoute
    const response = await axiosClient.post<QuizAnswerResponse>(quizAnswerApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: QuizAnswerResponse } };
    console.log("Error in submitQuizAnswer:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

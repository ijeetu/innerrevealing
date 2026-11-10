import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { quizStartApiRoute } from "@/utils/apiRoutes";

// Interface for start quiz response data
export interface StartQuizResponseData {
  user_id: number;
  course_chapter_quiz_id: string;
  total_time: number;
  time_taken: number;
  score: string;
  updated_at: string;
  created_at: string;
  id: number; // This is the attempt_id
}

// Use the common ApiResponse interface for consistent response handling
export type StartQuizResponse = ApiResponse<StartQuizResponseData>;

// Interface for API parameters (matches the API documentation)
export interface StartQuizParams {
  course_chapter_quiz_id: number;
}

/**
 * Start a quiz from the API
 * @param params - Parameters for the start quiz request
 * @returns Promise with start quiz data or null if error
 */
export const startQuiz = async (
  params: StartQuizParams
): Promise<StartQuizResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData (as shown in API documentation)
    formData.append('course_chapter_quiz_id', params.course_chapter_quiz_id.toString());

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation: quizStartApiRoute
    const response = await axiosClient.post<StartQuizResponse>(quizStartApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: StartQuizResponse } };
    console.log("Error in startQuiz:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

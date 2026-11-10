import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { courseChaptersQuizQuestionsListApiRoute } from "@/utils/apiRoutes";

// Interface for quiz question option data structure (matches actual API response)
export interface QuizQuestionOption {
  id: number;
  user_id: number;
  quiz_question_id: number;
  option: string;
  is_correct: boolean; // true/false in actual response
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for quiz question data structure (matches actual API response)
export interface QuizQuestion {
  id: number;
  user_id: number;
  course_chapter_quiz_id: number;
  question: string;
  points: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  options: QuizQuestionOption[];
}

// Use the common ApiResponse interface with QuizQuestion array
export type QuizQuestionsApiResponse = ApiResponse<QuizQuestion[]>;

/**
 * Get quiz questions list from the backend API
 * @param quizId - The ID of the quiz to get questions for
 * @returns Promise with API response structure containing quiz questions
 */
export const getQuizQuestions = async (
  quizId: number,
): Promise<QuizQuestionsApiResponse | null> => {
  try {
    // Send the GET request to the backend API with query parameter
    const response = await axiosClient.get<QuizQuestionsApiResponse>(courseChaptersQuizQuestionsListApiRoute, {
      params: {
        id: quizId // Query parameter as shown in the image
      },
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: QuizQuestionsApiResponse } };
    console.log("Error in getQuizQuestions:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
}

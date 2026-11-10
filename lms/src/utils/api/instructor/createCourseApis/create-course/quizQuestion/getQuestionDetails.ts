import axiosClient from "../../../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { courseChaptersCurriculumQuizGetQuestionApiRoute } from "@/utils/apiRoutes";

// Interface for quiz question option
export interface QuizOption {
  id: number;
  option: string;
  is_correct: boolean;
  order: number;
  is_active: boolean;
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
}

// Interface for question details data structure (matches actual API response)
export interface QuestionDetailsData {
  question: QuizQuestion;
  options: QuizOption[];
}

// Use the common ApiResponse interface with QuestionDetailsData
export type QuestionDetailsApiResponse = ApiResponse<QuestionDetailsData>;

// Interface for question details request options
export interface QuestionDetailsOptions {
  question_id: number;
}

// Interface for processed question details (matches the expected frontend format)
export interface ProcessedQuestionDetails {
  id: number;
  user_id: number;
  course_chapter_quiz_id: number;
  question: string;
  points: number;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  options: {
    id: number;
    option: string;
    is_correct: boolean;
    order: number;
    is_active: boolean;
  }[];
}

/**
 * Get question details from the backend API
 * @param options - Question details request options
 * @returns Promise with API response structure containing question details
 */
export const getQuestionDetails = async (
  options: QuestionDetailsOptions
): Promise<QuestionDetailsApiResponse | null> => {
  try {
    // Send the GET request to the backend API with query parameter
    const response = await axiosClient.get<QuestionDetailsApiResponse>(courseChaptersCurriculumQuizGetQuestionApiRoute, {
      params: {
        question_id: options.question_id
      },
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: QuestionDetailsApiResponse } };
    console.log("Error in getQuestionDetails:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
}

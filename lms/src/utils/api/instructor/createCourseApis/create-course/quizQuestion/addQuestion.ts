
import axiosClient from "@/utils/api/axiosClient";
import { courseChaptersCurriculumQuizAddQuestionApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for quiz question data structure (for adding questions to existing quiz)
export interface QuizQuestionData {
  quiz_id: number;
  question: string;
  option_data: Array<{
    option: string;
    is_correct: number; // 0 for incorrect, 1 for correct
  }>;
}

// Interface for adding quiz question API response
export interface AddQuizQuestionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

export const addQuizQuestion = async (
  questionData: QuizQuestionData,
): Promise<ApiResponse<AddQuizQuestionResponse>> => {
  try {

    // Validate required fields
    if (!questionData.quiz_id || !questionData.question || !questionData.option_data || questionData.option_data.length === 0) {
      return {
        success: false,
        data: null,
        error: "Quiz ID, question text, and at least one option are required",
        message: "Quiz ID, question text, and at least one option are required",
        code: 400
      };
    }

    // Get endpoint from environment variables
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;

    if (!endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_END_POINT",
        message: "API configuration missing: NEXT_PUBLIC_END_POINT",
        code: 500
      };
    }

    // Create the API endpoint path for adding quiz question
    const apiEndpoint = courseChaptersCurriculumQuizAddQuestionApiRoute;

    // Create URLSearchParams object to match the exact API structure from the image
    // The API expects urlencoded data with these specific parameter names
    const formData = new URLSearchParams();

    // Add quiz_id (required parameter)
    formData.append("quiz_id", questionData.quiz_id.toString());

    // Add question data in the exact format: quiz_data[0][question]
    formData.append("quiz_data[0][question]", questionData.question);

    // Add option data in the exact format: quiz_data[0][option_data][index][option] and quiz_data[0][option_data][index][is_correct]
    // This matches the structure shown in the API documentation image
    questionData.option_data.forEach((option, index) => {
      formData.append(`quiz_data[0][option_data][${index}][option]`, option.option);
      formData.append(`quiz_data[0][option_data][${index}][is_correct]`, option.is_correct.toString());
    });

    // Send the form data to the backend API
    const response = await axiosClient.post(apiEndpoint, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 30000, // 30 second timeout for API request
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Failed to add quiz question",
        message: response.data.message || "Failed to add quiz question",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Quiz question added successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Add Quiz Question API request failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to add quiz question",
      code: errorCode
    };
  }
};

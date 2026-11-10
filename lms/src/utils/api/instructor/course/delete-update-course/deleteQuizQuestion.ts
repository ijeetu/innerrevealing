
import axiosClient from "../../../axiosClient";
import { courseChaptersCurriculumQuizDeleteQuestionApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}
// Interface for delete quiz question response
export interface DeleteQuizQuestionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Delete a quiz question by ID
 * @param questionId - Quiz Question ID to delete
 * @returns Promise with standardized API response structure
 */
export const deleteQuizQuestion = async (
  questionId: number,
): Promise<ApiResponse<DeleteQuizQuestionResponse>> => {
  try {
    // Validate required parameters
    if (!questionId) {
      return {
        success: false,
        data: null,
        error: "Question ID is required",
        message: "Question ID is required",
        code: 400
      };
    }

    // Get API URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;

    if (!baseURL || !endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        message: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        code: 500
      };
    }

    // Create the API URL for delete quiz question
    const apiUrl = courseChaptersCurriculumQuizDeleteQuestionApiRoute;

    // Create URLSearchParams for URL-encoded data
    const formData = new URLSearchParams();
    formData.append('id', questionId.toString());

    // Send the DELETE request to the backend API
    const response = await axiosClient.delete(apiUrl, {
      data: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Quiz question deletion failed",
        message: response.data.message || "Quiz question deletion failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Quiz question deleted successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Delete Quiz Question API request failed:",
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
      message: "Failed to delete quiz question",
      code: errorCode
    };
  }
}
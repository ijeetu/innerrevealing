import axiosClient from "../../axiosClient";
import { courseChaptersCurriculumQuizUpdateQuestionApiRoute, courseChaptersCurriculumQuizUpdateApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for quiz question update form data structure
export interface QuizQuestionUpdateData {
  quiz_id: number;
  question_id: number;
  quiz_data: Array<{
    question: string;
    option_data: Array<{
      option: string;
      is_correct: number;
    }>;
  }>;
}

// Interface for quiz update form data structure
export interface QuizUpdateFormData {
  quiz_type_id: number;
  chapter_id: number;
  is_active: number;
  type: 'quiz';
  qa_required: number;
  quiz_title: string;
  quiz_description?: string;
  quiz_time_limit: number;
  quiz_total_points: number;
  quiz_passing_score: number;
  quiz_can_skip: number;
  resource_status: number;
  resource_data?: Array<{
    id?: number;
    resource_type: 'url' | 'file';
    resource_title?: string;
    resource_url?: string;
    resource_file?: File;
  }>;
}

// Interface for quiz update submission response structure
export interface QuizUpdateSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Helper function to get file extension from MIME type
 */
const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };

  return extensions[mimeType] || 'bin';
};

/**
 * Update quiz question data to the backend API
 * @param questionData - Object containing quiz question update details
 * @returns Promise with standardized API response structure
 */
export const updateQuizQuestion = async (
  questionData: QuizQuestionUpdateData,
  questionId: number,
): Promise<ApiResponse<QuizUpdateSubmissionResponse>> => {
  try {

    // Validate required fields
    if (!questionData.quiz_id) {
      return {
        success: false,
        data: null,
        error: "Quiz ID is required",
        message: "Quiz ID is required",
        code: 400
      };
    }

    if (!questionData.quiz_data || questionData.quiz_data.length === 0) {
      return {
        success: false,
        data: null,
        error: "Quiz data is required",
        message: "Quiz data is required",
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

    // Create the API URL for quiz question update
    const apiUrl = courseChaptersCurriculumQuizUpdateQuestionApiRoute;

    // Create URLSearchParams for URL-encoded data
    const formData = new URLSearchParams();

    // Add quiz_id
    formData.append('quiz_id', questionData.quiz_id.toString());

    // Add quiz_data array
    questionData.quiz_data.forEach((question, questionIndex) => {
      formData.append(`quiz_data[${questionIndex}][question_id]`, questionId.toString());
      formData.append(`quiz_data[${questionIndex}][question]`, question.question);

      question.option_data.forEach((option, optionIndex) => {
        formData.append(`quiz_data[${questionIndex}][option_data][${optionIndex}][option]`, option.option);
        formData.append(`quiz_data[${questionIndex}][option_data][${optionIndex}][is_correct]`, option.is_correct.toString());
      });
    });

    // Send the POST request to the backend API
    const response = await axiosClient.post(apiUrl, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Quiz question update failed",
        message: response.data.message || "Quiz question update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Quiz question updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Quiz Question API request failed:",
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
      message: "Failed to update quiz question",
      code: errorCode
    };
  }
}

/**
 * Helper function to update quiz question with individual parameters
 * @param quizId - Quiz ID
 * @param question - Question text
 * @param options - Array of options with correctness indicators
 * @returns Promise with standardized API response structure
 */
export const updateQuizQuestionById = async (
  quizId: number,
  questionId: number,
  question: string,
  options: Array<{ option: string; is_correct: number }>,
): Promise<ApiResponse<QuizUpdateSubmissionResponse>> => {
  const questionData: QuizQuestionUpdateData = {
    quiz_id: quizId,
    question_id: questionId,
    quiz_data: [{
      question,
      option_data: options
    }]
  };

  return await updateQuizQuestion(questionData, questionId);
}

/**
 * Update quiz form data to the backend API
 * @param formData - FormData object containing quiz update details
 * @returns Promise with standardized API response structure
 */
export const updateQuiz = async (
  formData: FormData,
): Promise<ApiResponse<QuizUpdateSubmissionResponse>> => {
  try {

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

    // Create the API URL for quiz update
    const apiUrl = courseChaptersCurriculumQuizUpdateApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add _method: PUT for Laravel method override
    apiFormData.append('_method', 'PUT');

    // Map all the quiz update form fields - basic quiz fields
    const basicFields = [
      'quiz_type_id', 'chapter_id', 'is_active', 'type', 'qa_required',
      'quiz_title', 'quiz_description', 'quiz_time_limit', 'quiz_total_points',
      'quiz_passing_score', 'quiz_can_skip', 'resource_status'
    ];

    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        apiFormData.append(field, value.toString());
      }
    });

    // Handle resource_data array
    const entries = Array.from(formData.entries());
    const resourceDataEntries = entries.filter(([key]) => key.startsWith('resource_data['));
    if (resourceDataEntries.length > 0) {
      resourceDataEntries.forEach(([key, value]) => {
        if (value instanceof File) {
          // Handle file uploads for resources
          const fileName = value.name || `resource_file.${getFileExtension(value.type)}`;
          apiFormData.append(key, value, fileName);
        } else {
          apiFormData.append(key, value.toString());
        }
      });
    }

    // Handle file uploads - quiz media files (if any)
    const fileFields = ['quiz_file'];
    for (const fileField of fileFields) {
      const file = formData.get(fileField);
      if (file && file instanceof Blob) {
        // For browser FormData, we can append the file directly
        const fileName = (file as File).name || `${fileField}.${getFileExtension(file.type)}`;
        apiFormData.append(fileField, file, fileName);
      }
    }

    // Send the form data to the backend API
    const response = await axiosClient.post(apiUrl, apiFormData, {
      timeout: 30000, // Increased timeout for quiz update with files
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Quiz update failed",
        message: response.data.message || "Quiz update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Quiz updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Quiz API request failed:",
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
      message: "Failed to update quiz",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param quizData - Object containing quiz update details
 * @returns Promise with standardized API response structure
 */
export const updateQuizWithData = async (
  quizData: QuizUpdateFormData,
): Promise<ApiResponse<QuizUpdateSubmissionResponse>> => {
  try {
    // Create FormData from the provided quiz data
    const formData = new FormData();

    // Add basic quiz fields
    formData.append("quiz_type_id", quizData.quiz_type_id.toString());
    formData.append("chapter_id", quizData.chapter_id.toString());
    formData.append("is_active", quizData.is_active.toString());
    formData.append("type", quizData.type);

    formData.append("quiz_title", quizData.quiz_title);
    formData.append("quiz_time_limit", quizData.quiz_time_limit.toString());
    formData.append("quiz_total_points", quizData.quiz_total_points.toString());
    formData.append("quiz_passing_score", quizData.quiz_passing_score.toString());
    formData.append("quiz_can_skip", quizData.quiz_can_skip.toString());
    formData.append("resource_status", '0');
    formData.append("qa_required", '0');

    // Add optional fields if provided
    if (quizData.quiz_description) {
      formData.append("quiz_description", quizData.quiz_description);
    }

    // Use the main submission function
    return await updateQuiz(formData);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to update quiz",
      code: errorCode
    };
  }
}
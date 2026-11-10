
import axiosClient from "../../../axiosClient";
import { extractApiErrorMessage } from "@/utils/helpers";
import { courseChaptersCurriculumApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for curriculum creation form data structure
export interface CurriculumCreationFormData {
  chapter_id: number;
  type: 'lecture' | 'document' | 'quiz' | 'assignment' | 'resource';
  qa_required?: number; // 0 or 1 based on whether it's a quiz

  // Lecture fields
  lecture_title?: string;
  lecture_description?: string;
  lecture_type?: 'youtube_url' | 'file';
  lecture_file?: File;
  lecture_youtube_url?: string;
  lecture_hours?: string;
  lecture_minutes?: string;
  lecture_seconds?: string;
  lecture_free_preview?: string;
  /** Video name returned by chunked upload API (used instead of lecture_file) */
  lecture_video_name?: string;

  // Document fields
  document_type?: 'file' | 'url';
  document_title?: string;
  document_description?: string;
  document_file?: File | string;
  document_duration?: number | null;
  document_url?: string;

  // Quiz fields
  quiz_title?: string;
  quiz_description?: string;
  quiz_time_limit?: number;
  quiz_total_points?: number;
  quiz_passing_score?: number;
  quiz_can_skip?: number;
  quiz_data?: Array<{
    question_id?: number;
    question: string;
    option_data: Array<{
      option: string;
      option_id?: number;
      is_correct: number;
    }>;
  }>;

  // Assignment fields
  assignment_title: string;
  assignment_points: number;
  assignment_description: string;
  assignment_media: File;
  assignment_instructions?: string;
  assignment_due_days?: number;
  assignment_can_skip?: number;
  assignment_allowed_file_types: string[];

  // Resource fields
  resource_status?: number;
  resource_data?: Array<{
    id?: number;
    resource_type: 'url' | 'file';
    resource_title: string;
    resource_url?: string;
    resource_file?: File;
  }>;
}

// Interface for course creation submission response structure
export interface CourseCreationSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Interface for the API response structure
export interface CourseCreationApiResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Create curriculum form data to the backend API
 * @param formData - FormData object containing curriculum creation details
 * @returns Promise with standardized API response structure
 */
export const createCurriculum = async (
  formData: FormData,
): Promise<ApiResponse<CourseCreationSubmissionResponse>> => {
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

    // Create the API endpoint path (axiosClient already has baseURL configured)
    const apiEndpoint = courseChaptersCurriculumApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Get all form entries
    const entries = Array.from(formData.entries());

    // Handle basic curriculum fields
    const basicFields = [
      'chapter_id', 'type', 'qa_required', 'lecture_title', 'lecture_description', 'lecture_type',
      'lecture_youtube_url', 'lecture_hours', 'lecture_minutes', 'lecture_seconds',
      'lecture_free_preview', 'document_type', 'document_title', 'document_description', 'document_duration',
      'quiz_title', 'quiz_description', 'quiz_time_limit', 'quiz_total_points',
      'quiz_passing_score', 'quiz_can_skip', 'assignment_title', 'assignment_points',
      'assignment_description', 'assignment_instructions', 'assignment_due_days', 'assignment_media',
      'assignment_can_skip', 'resource_status', 'document_url', 'lecture_file_chunk_path'
    ];


    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined && value !== '') {
        apiFormData.append(field, value as string);
      }
    });

    // Handle file uploads
    const fileFields = ['lecture_file', 'document_file'];
    for (const fileField of fileFields) {
      const file = formData.get(fileField);
      if (file && file instanceof File) {
        apiFormData.append(fileField, file);
      }
    }

    // Handle quiz_data array
    const quizDataEntries = entries.filter(([key]) => key.startsWith('quiz_data['));
    if (quizDataEntries.length > 0) {
      quizDataEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle assignment_allowed_file_types array
    const assignmentFileTypesEntries = entries.filter(([key]) => key.startsWith('assignment_allowed_file_types['));
    if (assignmentFileTypesEntries.length > 0) {
      assignmentFileTypesEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle resource_data array
    const resourceDataEntries = entries.filter(([key]) => key.startsWith('resource_data['));
    if (resourceDataEntries.length > 0) {
      resourceDataEntries.forEach(([key, value]) => {
        // Handle file uploads in resource_data
        if (key.includes('[resource_file]') && value instanceof File) {
          apiFormData.append(key, value);
        } else {
          apiFormData.append(key, value);
        }
      });
    }

    // Send the form data to the backend API
    // Set a longer timeout (10 minutes) for large video file uploads
    // This prevents timeout errors when uploading large lecture videos
    const response = await axiosClient.post(apiEndpoint, apiFormData, {
      timeout: 600000, // 10 minutes (600000ms) - sufficient for large video uploads
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Curriculum creation failed",
        message: response.data.message || "Curriculum creation failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Curriculum created successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Create Curriculum API request failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Use common error extraction utility
    const errorInfo = extractApiErrorMessage(error, "Failed to create curriculum");

    return {
      success: false,
      data: null,
      error: errorInfo.message,
      message: errorInfo.message,
      code: errorInfo.statusCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param curriculumData - Object containing curriculum creation details
 * @param addingQuiz - Boolean indicating if this is a quiz (affects qa_required field)
 * @returns Promise with standardized API response structure
 */
export const createCurriculumWithData = async (
  curriculumData: CurriculumCreationFormData,
  addingQuiz?: boolean
): Promise<ApiResponse<CourseCreationSubmissionResponse>> => {
  try {
    // Create FormData from the provided curriculum data
    const formData = new FormData();

    // Add required fields
    formData.append("chapter_id", curriculumData.chapter_id.toString());
    formData.append("type", curriculumData.type);

    // Add qa_required field (0 for non-quiz, 1 for quiz)
    // Use addingQuiz parameter if provided, otherwise check type
    const qaRequired = addingQuiz !== undefined ? (addingQuiz ? 1 : 0) : (curriculumData.type === 'quiz' ? 1 : 0);
    formData.append("qa_required", qaRequired.toString());

    // Add lecture fields if provided
    if (curriculumData.lecture_title) {
      formData.append("lecture_title", curriculumData.lecture_title);
    }
    if (curriculumData.lecture_description) {
      formData.append("lecture_description", curriculumData.lecture_description);
    }
    if (curriculumData.lecture_type) {
      formData.append("lecture_type", curriculumData.lecture_type);
    }
    if (curriculumData.lecture_youtube_url) {
      formData.append("lecture_youtube_url", curriculumData.lecture_youtube_url);
    }
    if (curriculumData.lecture_hours) {
      formData.append("lecture_hours", curriculumData.lecture_hours);
    }
    if (curriculumData.lecture_minutes) {
      formData.append("lecture_minutes", curriculumData.lecture_minutes);
    }
    if (curriculumData.lecture_seconds) {
      formData.append("lecture_seconds", curriculumData.lecture_seconds);
    }
    if (curriculumData.lecture_free_preview) {
      formData.append("lecture_free_preview", curriculumData.lecture_free_preview);
    }
    if (curriculumData.lecture_file) {
      formData.append("lecture_file", curriculumData.lecture_file);
    }
    if (curriculumData.lecture_video_name) {
      formData.append("lecture_file_chunk_path", curriculumData.lecture_video_name);
    }

    // Add document fields if provided
    if (curriculumData.document_type) {
      formData.append("document_type", curriculumData.document_type);
    }
    if (curriculumData.document_title) {
      formData.append("document_title", curriculumData.document_title);
    }
    if (curriculumData.document_description) {
      formData.append("document_description", curriculumData.document_description);
    }
    if (curriculumData.document_duration !== undefined && curriculumData.document_duration !== null) {
      formData.append("document_duration", curriculumData.document_duration.toString());
    }
    if (curriculumData.document_file) {
      formData.append("document_file", curriculumData.document_file);
    }

    console.log("curriculumData.document_url", curriculumData.document_url)
    if (curriculumData.document_url) {
      console.log("curriculumData.document_url inside if condition ", curriculumData.document_url)
      formData.append("document_url", curriculumData.document_url);
    }

    // Add quiz fields if provided
    if (curriculumData.quiz_title) {
      formData.append("quiz_title", curriculumData.quiz_title);
    }
    if (curriculumData.quiz_description) {
      formData.append("quiz_description", curriculumData.quiz_description);
    }
    // formData.append("quiz_time_limit", '120');
    if (curriculumData.quiz_total_points !== undefined) {
      formData.append("quiz_total_points", curriculumData.quiz_total_points.toString());
    }
    if (curriculumData.quiz_passing_score !== undefined) {
      formData.append("quiz_passing_score", curriculumData.quiz_passing_score.toString());
    }
    if (curriculumData.quiz_can_skip !== undefined) {
      formData.append("quiz_can_skip", curriculumData.quiz_can_skip.toString());
    }

    // Handle quiz_data array
    if (curriculumData.quiz_data && curriculumData.quiz_data.length > 0) {
      curriculumData.quiz_data.forEach((question, questionIndex) => {
        if (question.question_id !== undefined) {
          formData.append(`quiz_data[${questionIndex}][question_id]`, question.question_id.toString());
        }
        formData.append(`quiz_data[${questionIndex}][question]`, question.question);

        question.option_data.forEach((option, optionIndex) => {
          if (option.option_id !== undefined) {
            formData.append(`quiz_data[${questionIndex}][option_data][${optionIndex}][option_id]`, option.option_id.toString());
          }
          formData.append(`quiz_data[${questionIndex}][option_data][${optionIndex}][option]`, option.option);
          formData.append(`quiz_data[${questionIndex}][option_data][${optionIndex}][is_correct]`, option.is_correct.toString());
        });
      });
    }

    // Add assignment fields if provided
    if (curriculumData.assignment_title) {
      formData.append("assignment_title", curriculumData.assignment_title);
    }
    if (curriculumData.assignment_points !== undefined) {
      formData.append("assignment_points", curriculumData.assignment_points.toString());
    }
    if (curriculumData.assignment_description) {
      formData.append("assignment_description", curriculumData.assignment_description);
    }
    if (curriculumData.assignment_media) {
      formData.append("assignment_media", curriculumData.assignment_media);
    }
    if (curriculumData.assignment_instructions) {
      formData.append("assignment_instructions", curriculumData.assignment_instructions);
    }
    if (curriculumData.assignment_due_days !== undefined) {
      formData.append("assignment_due_days", curriculumData.assignment_due_days.toString());
    }
    if (curriculumData.assignment_can_skip !== undefined) {
      formData.append("assignment_can_skip", curriculumData.assignment_can_skip.toString());
    }

    // Handle assignment_allowed_file_types array
    if (curriculumData.assignment_allowed_file_types && curriculumData.assignment_allowed_file_types.length > 0) {
      curriculumData.assignment_allowed_file_types.forEach((fileType, index) => {
        formData.append(`assignment_allowed_file_types[${index}]`, fileType);
      });
    }

    // Add resource fields if provided
    if (curriculumData.resource_status !== undefined) {
      formData.append("resource_status", curriculumData.resource_status.toString());
    }

    // Handle resource_data array
    if (curriculumData.resource_data && curriculumData.resource_data.length > 0) {
      curriculumData.resource_data.forEach((resource, index) => {
        if (resource.id !== undefined) {
          formData.append(`resource_data[${index}][id]`, resource.id.toString());
        }
        formData.append(`resource_data[${index}][resource_type]`, resource.resource_type);
        formData.append(`resource_data[${index}][resource_title]`, resource.resource_title);

        if (resource.resource_url) {
          formData.append(`resource_data[${index}][resource_url]`, resource.resource_url);
        }
        if (resource.resource_file) {
          formData.append(`resource_data[${index}][resource_file]`, resource.resource_file);
        }
      });
    }

    // Use the main submission function
    return await createCurriculum(formData);

  } catch (error) {
    // Use common error extraction utility
    const errorInfo = extractApiErrorMessage(error, "Failed to create curriculum");

    return {
      success: false,
      data: null,
      error: errorInfo.message,
      message: errorInfo.message,
      code: errorInfo.statusCode
    };
  }
}

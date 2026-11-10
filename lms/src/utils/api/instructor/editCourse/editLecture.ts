import axiosClient from "../../axiosClient";
import { courseChaptersCurriculumLectureUpdateApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for lecture update form data structure
export interface LectureUpdateFormData {
  lecture_type_id: number;
  chapter_id: number;
  is_active: number;
  type: 'lecture';
  lecture_title: string;
  lecture_description?: string;
  lecture_type: 'youtube_url' | 'file';
  lecture_youtube_url?: string;
  lecture_file?: File;
  lecture_hours: number;
  lecture_minutes: number;
  lecture_seconds: number;
  lecture_free_preview: number;
  resource_status: number;
  /** Video name returned by chunked upload API (used instead of lecture_file) */
  lecture_video_name?: string;
  resource_data?: Array<{
    id?: number;
    resource_type: 'url' | 'file';
    resource_title?: string;
    resource_url?: string;
    resource_file?: File;
  }>;
}

// Interface for lecture update submission response structure
export interface LectureUpdateSubmissionResponse {
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
 * Update lecture form data to the backend API
 * @param formData - FormData object containing lecture update details
 * @returns Promise with standardized API response structure
 */
export const updateLecture = async (
  formData: FormData,
): Promise<ApiResponse<LectureUpdateSubmissionResponse>> => {
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

    // Create the API URL for lecture update
    const apiUrl = courseChaptersCurriculumLectureUpdateApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add _method: PUT for Laravel method override
    apiFormData.append('_method', 'PUT');

    // Map all the lecture update form fields - basic lecture fields
    const basicFields = [
      'lecture_type_id', 'chapter_id', 'is_active', 'type', 'lecture_title',
      'lecture_description', 'lecture_type', 'lecture_youtube_url', 'lecture_hours',
      'lecture_minutes', 'lecture_seconds', 'lecture_free_preview', 'resource_status',
      'lecture_file_chunk_path'
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

    // Handle file uploads - lecture media files
    const fileFields = ['lecture_file'];
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
      timeout: 30000, // Increased timeout for lecture update with files
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Lecture update failed",
        message: response.data.message || "Lecture update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Lecture updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Lecture API request failed:",
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
      message: "Failed to update lecture",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param lectureData - Object containing lecture update details
 * @returns Promise with standardized API response structure
 */
export const updateLectureWithData = async (
  lectureData: LectureUpdateFormData,
): Promise<ApiResponse<LectureUpdateSubmissionResponse>> => {
  try {
    // Create FormData from the provided lecture data
    const formData = new FormData();

    // Add basic lecture fields
    formData.append("lecture_type_id", lectureData.lecture_type_id.toString());
    formData.append("chapter_id", lectureData.chapter_id.toString());
    formData.append("is_active", lectureData.is_active.toString());
    formData.append("type", lectureData.type);
    formData.append("lecture_title", lectureData.lecture_title);
    formData.append("lecture_type", lectureData.lecture_type);
    formData.append("lecture_hours", lectureData.lecture_hours.toString());
    formData.append("lecture_minutes", lectureData.lecture_minutes.toString());
    formData.append("lecture_seconds", lectureData.lecture_seconds.toString());
    formData.append("lecture_free_preview", lectureData.lecture_free_preview.toString());
    formData.append("resource_status", lectureData.resource_status.toString());

    if (lectureData.lecture_file) {
      formData.append("lecture_file", lectureData.lecture_file);
    }

    // Add optional fields if provided
    if (lectureData.lecture_description) {
      formData.append("lecture_description", lectureData.lecture_description);
    }
    if (lectureData.lecture_youtube_url) {
      formData.append("lecture_youtube_url", lectureData.lecture_youtube_url);
    }
    if (lectureData.lecture_video_name) {
      formData.append("lecture_file_chunk_path", lectureData.lecture_video_name);
    }

    // Handle resource_data array
    if (lectureData.resource_data && lectureData.resource_data.length > 0) {
      lectureData.resource_data.forEach((resource, index) => {
        if (resource.id) {
          formData.append(`resource_data[${index}][id]`, resource.id.toString());
        }
        formData.append(`resource_data[${index}][resource_type]`, resource.resource_type);

        if (resource.resource_title) {
          formData.append(`resource_data[${index}][resource_title]`, resource.resource_title);
        }

        if (resource.resource_url) {
          formData.append(`resource_data[${index}][resource_url]`, resource.resource_url);
        }

        if (resource.resource_file) {
          formData.append(`resource_data[${index}][resource_file]`, resource.resource_file);
        }
      });
    }

    // Use the main submission function
    return await updateLecture(formData);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to update lecture",
      code: errorCode
    };
  }
}
import axiosClient from "../../axiosClient";
import { courseChaptersCurriculumAssignmentUpdateApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for assignment update form data structure
export interface AssignmentUpdateFormData {
  assignment_type_id: number;
  chapter_id: number;
  is_active: number;
  type: 'assignment';
  assignment_title: string;
  assignment_points: number;
  assignment_description: string;
  assignment_instructions?: string;
  assignment_due_days: number;
  assignment_can_skip: number;
  assignment_allowed_file_types: string[];
  assignment_media?: File;
}

// Interface for assignment update submission response structure
export interface AssignmentUpdateSubmissionResponse {
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
 * Update assignment form data to the backend API
 * @param formData - FormData object containing assignment update details
 * @returns Promise with standardized API response structure
 */
export const updateAssignment = async (
  formData: FormData,
): Promise<ApiResponse<AssignmentUpdateSubmissionResponse>> => {
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

    // Create the API URL for assignment update
    const apiUrl = courseChaptersCurriculumAssignmentUpdateApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add _method: PUT for Laravel method override
    apiFormData.append('_method', 'PUT');

    // Map all the assignment update form fields - basic assignment fields
    const basicFields = [
      'assignment_type_id', 'chapter_id', 'is_active', 'type', 'assignment_title',
      'assignment_points', 'assignment_description', 'assignment_instructions',
      'assignment_due_days', 'assignment_can_skip'
    ];

    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        apiFormData.append(field, value.toString());
      }
    });

    // Handle assignment_allowed_file_types array
    const allowedFileTypes = formData.getAll('assignment_allowed_file_types[]');
    if (allowedFileTypes.length > 0) {
      allowedFileTypes.forEach(fileType => {
        apiFormData.append('assignment_allowed_file_types[]', fileType.toString());
      });
    }

    // Handle file uploads - assignment media files
    const fileFields = ['assignment_media'];
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
      timeout: 30000, // Increased timeout for assignment update with files
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Assignment update failed",
        message: response.data.message || "Assignment update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Assignment updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Assignment API request failed:",
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
      message: "Failed to update assignment",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param assignmentData - Object containing assignment update details
 * @returns Promise with standardized API response structure
 */
export const updateAssignmentWithData = async (
  assignmentData: AssignmentUpdateFormData,
): Promise<ApiResponse<AssignmentUpdateSubmissionResponse>> => {
  try {
    // Create FormData from the provided assignment data
    const formData = new FormData();

    // Add basic assignment fields
    formData.append("assignment_type_id", assignmentData.assignment_type_id.toString());
    formData.append("chapter_id", assignmentData.chapter_id.toString());
    formData.append("is_active", assignmentData.is_active.toString());
    formData.append("type", assignmentData.type);
    formData.append("assignment_title", assignmentData.assignment_title);
    formData.append("assignment_points", assignmentData.assignment_points.toString());
    formData.append("assignment_description", assignmentData.assignment_description);
    formData.append("assignment_due_days", assignmentData.assignment_due_days.toString());
    formData.append("assignment_can_skip", assignmentData.assignment_can_skip.toString());

    // Add optional fields if provided
    if (assignmentData.assignment_instructions) {
      formData.append("assignment_instructions", assignmentData.assignment_instructions);
    }

    // Handle assignment_allowed_file_types array
    if (assignmentData.assignment_allowed_file_types && assignmentData.assignment_allowed_file_types.length > 0) {
      assignmentData.assignment_allowed_file_types.forEach(fileType => {
        formData.append("assignment_allowed_file_types[]", fileType);
      });
    }

    // Handle assignment media file
    if (assignmentData.assignment_media) {
      formData.append("assignment_media", assignmentData.assignment_media);
    }

    // Use the main submission function
    return await updateAssignment(formData);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to update assignment",
      code: errorCode
    };
  }
}
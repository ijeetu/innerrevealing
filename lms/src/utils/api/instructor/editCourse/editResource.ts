import axiosClient from "../../axiosClient";
import { courseChaptersCurriculumResourceUpdateApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for resource update form data structure
export interface ResourceUpdateFormData {
  document_type_id: number;
  chapter_id: number;
  is_active: number;
  type: 'resource';
  document_type: 'file' | 'url';
  document_title: string;
  document_description?: string;
  document_file?: File;
  document_duration?: number | null;
  document_url?: string;
}

// Interface for resource update submission response structure
export interface ResourceUpdateSubmissionResponse {
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
 * Update resource form data to the backend API
 * @param formData - FormData object containing resource update details
 * @returns Promise with standardized API response structure
 */
export const updateResource = async (
  formData: FormData,
): Promise<ApiResponse<ResourceUpdateSubmissionResponse>> => {
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

    // Create the API URL for resource update
    const apiUrl = courseChaptersCurriculumResourceUpdateApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add _method: PUT for Laravel method override
    apiFormData.append('_method', 'PUT');

    // Map all the resource update form fields - basic resource fields
    const basicFields = [
      'document_type_id', 'chapter_id', 'is_active', 'type', 'document_type',
      'document_title', 'document_description', 'resource_status', 'document_duration', 'document_url'
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

    // Handle file uploads - resource media files
    const fileFields = ['document_file'];
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
      timeout: 30000, // Increased timeout for resource update with files
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Resource update failed",
        message: response.data.message || "Resource update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Resource updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Resource API request failed:",
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
      message: "Failed to update resource",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param resourceData - Object containing resource update details
 * @returns Promise with standardized API response structure
 */
export const updateResourceWithData = async (
  resourceData: ResourceUpdateFormData,
): Promise<ApiResponse<ResourceUpdateSubmissionResponse>> => {
  try {
    // Create FormData from the provided resource data
    const formData = new FormData();

    // Add basic resource fields
    formData.append("document_type_id", resourceData.document_type_id.toString());
    formData.append("chapter_id", resourceData.chapter_id.toString());
    formData.append("is_active", resourceData.is_active.toString());
    formData.append("type", resourceData.type);
    formData.append("document_type", resourceData.document_type);
    formData.append("document_title", resourceData.document_title);
    if (resourceData.document_file) {
      formData.append("document_file", resourceData.document_file);
    }

    // Add optional fields if provided
    if (resourceData.document_description) {
      formData.append("document_description", resourceData.document_description);
    }

    // document_duration
    if (resourceData.document_duration) {
      formData.append("document_duration", resourceData.document_duration.toString());
    }

    console.log("resourceData.document_url", resourceData.document_url)
    if (resourceData.document_url) {
      console.log("hello world")
      console.log("resourceData.document_url", resourceData.document_url)
      formData.append("document_url", resourceData.document_url);
    }

    // Use the main submission function
    return await updateResource(formData);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to update resource",
      code: errorCode
    };
  }
}
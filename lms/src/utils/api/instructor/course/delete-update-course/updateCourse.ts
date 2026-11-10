
import axiosClient from "../../../axiosClient";
import { updateCourseApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for course update form data structure
// Based on the API documentation for update-course endpoint
export interface CourseUpdateFormData {
  id: number; // Required for course updates
  title: string; // Required
  short_description: string; // Required
  level: string; // Required: beginner, intermediate, advanced
  course_type: string; // Required: free, paid
  price: string; // Required if course_type is paid
  discount_price?: string; // Optional, must be less than price
  category_id: string; // Required
  is_active: string; // Required: 0 or 1
  meta_tags?: string; // Optional
  meta_title?: string; // Optional
  meta_description?: string; // Optional
  language_id?: string; // Required
  thumbnail?: File; // Optional: jpg,png,gif,webp, max 2MB
  intro_video?: File; // Optional: mp4,avi,mov,webm, max 10MB
  meta_image?: File; // Optional: jpg,png,jpeg,gif,webp, max 2MB
  course_tags?: Array<{ id: number; name: string }>; // Optional array, use "new__" prefix for new tags
  learnings_data?: Array<{ id: number; title: string }>; // Optional array
  requirements_data?: Array<{ id: number; title: string }>; // Optional array
  instructors?: Array<{ id: number; name: string }>; // Optional array
  sequential_access?: string; // Optional: 0 or 1
  certificate_enabled?: string; // Optional: 0 or 1
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
 * Update course form data to the backend API
 * @param courseId - Course ID to update
 * @param formData - FormData object containing course update details (optional)
 * @param status - Course status to update (optional)
 * @returns Promise with standardized API response structure
 */
export const updateCourse = async (
  courseId: number,
  formData?: FormData,
): Promise<ApiResponse<CourseCreationSubmissionResponse>> => {
  try {

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

    // Create the API URL for course update
    const apiUrl = updateCourseApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add the _method field for PUT request (required by Laravel)
    apiFormData.append('_method', 'PUT');
    apiFormData.append('id', courseId.toString());

    // Only process formData if it's provided
    if (formData) {
      // Map all the course update form fields - basic course fields
      const basicFields = [
        'title', 'short_description', 'level', 'course_type',
        'price', 'discount_price', 'category_id', 'is_active', 'meta_tags',
        'meta_title', 'meta_description', 'language_id', 'status', 'sequential_access', 'certificate_enabled'
      ];

      basicFields.forEach(field => {
        const value = formData.get(field);
        if (value) {
          apiFormData.append(field, value);
        }
      });

      // Handle course tags array - simple array format as per API docs
      const entries = Array.from(formData.entries());
      const courseTagsEntries = entries.filter(([key]) => key.startsWith('course_tags['));
      if (courseTagsEntries.length > 0) {
        courseTagsEntries.forEach(([key, value]) => {
          apiFormData.append(key, value);
        });
      }

      // Handle learning objectives array - format: learnings_data[0][id] and learnings_data[0][learning]
      const learningsEntries = entries.filter(([key]) => key.startsWith('learnings_data['));
      if (learningsEntries.length > 0) {
        learningsEntries.forEach(([key, value]) => {
          apiFormData.append(key, value);
        });
      }

      // Handle requirements array - format: requirements_data[0][id] and requirements_data[0][requirement]
      const requirementsEntries = entries.filter(([key]) => key.startsWith('requirements_data['));
      if (requirementsEntries.length > 0) {
        requirementsEntries.forEach(([key, value]) => {
          apiFormData.append(key, value);
        });
      }

      // Handle instructors array - simple array format: instructors[0]
      const instructorsEntries = entries.filter(([key]) => key.startsWith('instructors['));
      if (instructorsEntries.length > 0) {
        instructorsEntries.forEach(([key, value]) => {
          apiFormData.append(key, value);
        });
      }
      else {
        // Send explicit empty array so backend clears instructors when user removes all
        apiFormData.append('instructors[0]', '');
      }

      // Handle file uploads - course media files
      const fileFields = ['thumbnail', 'intro_video', 'meta_image'];
      for (const fileField of fileFields) {
        const file = formData.get(fileField);
        if (file && file instanceof Blob) {
          // For browser FormData, we can append the file directly
          const fileName = (file as File).name || `${fileField}.${getFileExtension(file.type)}`;
          apiFormData.append(fileField, file, fileName);
        }
      }
    }

    // Send the form data to the backend API
    const response = await axiosClient.post(apiUrl, apiFormData, {
      timeout: 600000,
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Course update failed",
        message: response.data.message || "Course update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Course updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Course API request failed:",
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
      message: "Failed to update course",
      code: errorCode
    };
  }
}

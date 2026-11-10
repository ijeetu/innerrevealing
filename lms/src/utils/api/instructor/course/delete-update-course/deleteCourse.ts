
import axiosClient from "../../../axiosClient";
import { deleteCourseApiRoute } from "@/utils/apiRoutes";

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
  meta_title?: string; // Optional
  meta_description?: string; // Optional
  language_id?: string; // Required
  thumbanil?: File; // Optional: jpg,png,gif,webp, max 2MB
  intro_video?: File; // Optional: mp4,avi,mov,webm, max 10MB
  meta_image?: File; // Optional: jpg,png,jpeg,gif,webp, max 2MB
  course_tags?: Array<{ id: number; name: string }>; // Optional array, use "new__" prefix for new tags
  learnings_data?: Array<{ id: number; title: string }>; // Optional array
  requirements_data?: Array<{ id: number; title: string }>; // Optional array
  instructors?: Array<{ id: number; name: string }>; // Optional array
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

// Interface for delete course chapter request parameters
export interface DeleteCourseChapterParams {
  id?: number; // Course Chapter ID (required when slug is empty)
  slug?: string; // Course Chapter Slug (required when id is empty)
}

// Interface for delete course chapter response
export interface DeleteCourseChapterResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Delete a course chapter using either ID or slug
 * @param courseId - Course ID (path parameter)
 * @param params - Object containing either id or slug of the chapter to delete
 * @returns Promise with standardized API response structure
 */
export const deleteCourseChapter = async (
  courseId: number,
  params: DeleteCourseChapterParams,
): Promise<ApiResponse<DeleteCourseChapterResponse>> => {
  try {
    // Validate required parameters
    if (!courseId) {
      return {
        success: false,
        data: null,
        error: "Course ID is required",
        message: "Course ID is required",
        code: 400
      };
    }

    // Validate that either id or slug is provided, but not both
    if (!params.id && !params.slug) {
      return {
        success: false,
        data: null,
        error: "Either id or slug must be provided",
        message: "Either id or slug must be provided",
        code: 400
      };
    }

    if (params.id && params.slug) {
      return {
        success: false,
        data: null,
        error: "Only one of id or slug should be provided, not both",
        message: "Only one of id or slug should be provided, not both",
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


    // Prepare request parameters
    const requestParams: Record<string, string> = {};

    if (params.id) {
      requestParams.id = params.id.toString();
    } else if (params.slug) {
      requestParams.slug = params.slug;
    }

    // Send the DELETE request to the backend API
    const response = await axiosClient.delete(`${deleteCourseApiRoute}/${courseId}`, { params: requestParams });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Course chapter deletion failed",
        message: response.data.message || "Course chapter deletion failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Course chapter deleted successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Delete Course Chapter API request failed:",
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
      message: "Failed to delete course chapter",
      code: errorCode
    };
  }
}

/**
 * Delete a course chapter by ID
 * @param courseId - Course ID (path parameter)
 * @param chapterId - Course Chapter ID to delete
 * @returns Promise with standardized API response structure
 */
export const deleteCourseChapterById = async (
  courseId: number,
  chapterId: number,
): Promise<ApiResponse<DeleteCourseChapterResponse>> => {
  return await deleteCourseChapter(courseId, { id: chapterId });
}
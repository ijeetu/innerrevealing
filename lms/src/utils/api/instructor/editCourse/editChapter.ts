import axiosClient from "@/utils/api/axiosClient";
import { updateCourseChapterApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for course chapter edit form data structure
export interface CourseChapterFormData {
  id: string;
  title: string;
  description?: string | null;
  is_active?: string;
}

// Interface for course chapter edit submission response structure
export interface CourseChapterSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Update course chapter form data to the backend API
 * @param formData - FormData object containing course chapter edit details
 * @param chapterId - The ID of the chapter to update
 * @returns Promise with standardized API response structure
 */
export const updateCourseChapter = async (
  formData: FormData,
  chapterId: number
): Promise<ApiResponse<CourseChapterSubmissionResponse>> => {
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
    const apiEndpoint = updateCourseChapterApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Get the course chapter parameters from form data
    const title = formData.get("title");
    const description = formData.get("description");
    const is_active = formData.get("is_active");

    // Validate required fields
    if (!title) {
      return {
        success: false,
        data: null,
        error: "Chapter title is required",
        message: "Chapter title is required",
        code: 400
      };
    }

    // Add the _method field for PUT request tunneling
    apiFormData.append('_method', 'PUT');

    // Add the chapter ID
    apiFormData.append('id', chapterId.toString());

    // Add the title
    apiFormData.append('title', title as string);

    // Add optional fields if provided
    if (description) {
      apiFormData.append('description', description as string);
    }

    if (is_active !== null && is_active !== undefined) {
      apiFormData.append('is_active', is_active as string);
    }

    // Send the form data to the backend API
    const response = await axiosClient.post(apiEndpoint, apiFormData, {
      timeout: 10000,
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Course chapter update failed",
        message: response.data.message || "Course chapter update failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Course chapter updated successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Update Course Chapter API request failed:",
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
      message: "Failed to update course chapter",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param chapterData - Object containing course chapter edit details
 * @param chapterId - The ID of the chapter to update
 * @returns Promise with standardized API response structure
 */
export const updateCourseChapterWithData = async (
  chapterData: CourseChapterFormData,
  chapterId: number
): Promise<ApiResponse<CourseChapterSubmissionResponse>> => {
  try {
    // Create FormData from the provided chapter data
    const formData = new FormData();

    // Add required chapter fields
    formData.append("title", chapterData.title);

    // Add optional fields if provided
    if (chapterData.description) {
      formData.append("description", chapterData.description);
    }
    if (chapterData.is_active !== undefined && chapterData.is_active !== null) {
      formData.append("is_active", chapterData.is_active);
    }

    // Use the main submission function
    return await updateCourseChapter(formData, chapterId);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to update course chapter",
      code: errorCode
    };
  }
}

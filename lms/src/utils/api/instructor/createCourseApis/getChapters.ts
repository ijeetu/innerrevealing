
import axiosClient from "@/utils/api/axiosClient";
import { PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { getAddedCourseChaptersApiRoute } from "@/utils/apiRoutes";

// Interface for course chapter data structure (matches API response)
export interface CourseChapter {
  id: number;
  user_id: number;
  course_id: number;
  title: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  chapter_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  total_duration?: number;
  isOpen?: boolean;
}

// Use the common PaginatedData interface with CourseChapter
export type PaginatedChaptersData = PaginatedData<CourseChapter>;

// Interface for course chapters response structure
export interface CourseChaptersResponse {
  error: boolean;
  message: string;
  data: PaginatedChaptersData;
  code: number;
}

// Interface for API parameters
export interface GetChaptersParams {
  course_id: string;
  page?: number;
  per_page?: number;
}

/**
 * Get course chapters from the backend API with pagination support
 * @param courseId - The ID of the course to get chapters for
 * @param page - Page number for pagination (default: 1)
 * @param perPage - Number of items per page (default: 10)
 * @returns Promise with API response structure containing course chapters
 */
export const getCourseChapters = async (
  courseId: string,
  page: number = 1,
  perPage: number = 10
): Promise<CourseChaptersResponse | null> => {
  try {
    // Build query parameters
    const params: GetChaptersParams = {
      course_id: courseId,
      page: page,
      per_page: perPage,
    };

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<CourseChaptersResponse>(getAddedCourseChaptersApiRoute, { params: params });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CourseChaptersResponse } };
    console.log("Error in getCourseChapters:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
}

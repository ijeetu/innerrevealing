import axiosClient from "@/utils/api/axiosClient";
import { PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { getAddedCoursesApiRoute } from "@/utils/apiRoutes";

// Interface for course data structure (matches actual API response)
export interface CourseDataType {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  category: {
    id: number;
    name: string;
  };
  total_revenue: number;
  total_lesson_count: number;
  total_chapter_count: number;
  price: string | null;
  discount_price: string | null;
  total_enrolled_students: number;
  status: 'draft' | 'pending' | 'publish';
  is_active: boolean;
  average_rating: number;
  rating_count: number;
  created_at: Date;
  updated_at: Date;
}

// Interface for statistics data
export interface CourseStatistics {
  total_courses: number;
  publish: number;
  pending: number;
  rejected: number;
  draft: number;
  approved: number;
  active: number;
}


// Use the common PaginatedData interface with CourseDataType
export type PaginatedCoursesData = PaginatedData<CourseDataType>;

// Interface for added courses response structure
export interface AddedCoursesResponse {
  error: boolean;
  message: string;
  data: {
    statistics: CourseStatistics;
    courses: PaginatedCoursesData;
  };
  code: number;
}

// Interface for query parameters (all optional as per API documentation)
export interface GetAddedCoursesParams {
  id?: number;
  slug?: string,
  level?: 'beginner' | 'intermediate' | 'advanced';
  search?: string; // Search includes: title, short_description, level, language, and tags
  per_page?: number; // Default: 15
  page?: number; // Default: 1
  sort_by?: 'title' | 'price'; // Updated to match API field names
  sort_order?: 'asc' | 'desc'; // Default: desc
  course_type?: 'free' | 'paid';
  status?: 'draft' | 'pending' | 'publish' | null;
  is_active?: boolean | null; // Updated to boolean to match API
  approval_status?: 'approved' | 'rejected' | 'pending' | null;
  category_id?: number; // Added category filter
  language_id?: number; // Added language filter
  team_user_slug?: string;
  team_user_id?: number;
}

// fetch added courses
export const getAddedCourses = async (
  params?: GetAddedCoursesParams
): Promise<AddedCoursesResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Only add parameters that are not undefined
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<AddedCoursesResponse>(getAddedCoursesApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AddedCoursesResponse } };
    console.log("Error in getAddedCourses:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

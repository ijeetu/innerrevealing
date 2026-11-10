import axiosClient from "@/utils/api/axiosClient";
import { courseViewApiRoute } from "@/utils/apiRoutes";

// Interface for course tag pivot data
export interface CourseTagPivot {
  course_id: number;
  tag_id: number;
}

// Interface for course tag
export interface CourseTag {
  id: number;
  tag: string;
  slug: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  pivot: CourseTagPivot;
}

// Interface for course data in the response
export interface CourseViewCourse {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  description: string | null;
  image: string | null;
  category_id: number;
  category_name: string;
  level: string;
  course_type: string;
  sequential_access: boolean;
  certificate_enabled: boolean;
  certificate_fee: number | null;
  ratings: number;
  average_rating: number;
  author_name: string;
  price: number;
  discount_price: number;
  total_tax_percentage: number;
  tax_amount: number;
  tax_type: string;
  is_purchased: boolean;
  learnings: unknown[];
  requirements: unknown[];
  reviews: unknown[];
  tags: CourseTag[];
  language: string;
  instructors: unknown[];
  chapters: unknown[];
  chapter_count: number;
  lecture_count: number;
  total_duration: number;
  total_duration_formatted: string;
  view_count: number;
  unique_view_count: number;
}

// Interface for view information
export interface ViewInfo {
  viewed_at: string;
  user_id: number | null;
  ip_address: string;
  user_agent: string;
  total_views: number;
  unique_views: number;
}

// Interface for course view response data
export interface CourseViewData {
  course: CourseViewCourse;
  view_info: ViewInfo;
}

// Interface for course view API response (matches the actual API response structure)
export interface CourseViewResponse {
  error: boolean;
  message: string;
  data: CourseViewData;
  code: number;
}

// Interface for API parameters
export interface CourseViewParams {
  course_id: number;
}

/**
 * Track a course view in the API
 * This endpoint records when a user views a course page
 * @param params - Parameters for the course view request (course_id)
 * @returns Promise with course view response or null if error
 */
export const courseView = async (
  params: CourseViewParams
): Promise<CourseViewResponse | null> => {
  try {
    // Validate required parameters
    if (!params.course_id) {
      console.error("Course ID is required for course view tracking");
      return null;
    }

    // Send POST request to track course view
    // course_id is passed as a query parameter
    const response = await axiosClient.post<CourseViewResponse>(
      courseViewApiRoute,
      null, // No body data needed, course_id is in query params
      {
        params: {
          course_id: params.course_id,
        },
      }
    );

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CourseViewResponse } };
    console.log("Error in courseView:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

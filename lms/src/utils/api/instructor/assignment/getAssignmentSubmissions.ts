import axiosClient from "@/utils/api/axiosClient";
import { assignmentSubmissionsApiRoute } from "@/utils/apiRoutes";

// Interface for user data in assignment submission
export interface AssignmentSubmissionUserType {
  id: number;
  name: string;
  email: string;
  profile: string;
}

// Interface for assignment data in assignment submission
export interface AssignmentSubmissionAssignmentType {
  id: number;
  title: string;
  points: string;
  chapter_name: string;
}

// Interface for course data in assignment submission
export interface AssignmentSubmissionCourseType {
  id: number;
  title: string;
  slug: string;
}

// Interface for file data in assignment submission
export interface AssignmentSubmissionFileType {
  id: number;
  type: string;
  file: string;
  url: string | null;
  file_extension: string;
}

// Interface for assignment submission data structure (matches actual API response)
export interface AssignmentSubmissionDataType {
  id: number;
  user: AssignmentSubmissionUserType;
  assignment: AssignmentSubmissionAssignmentType;
  course: AssignmentSubmissionCourseType;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  comment: string | null;
  feedback: string | null;
  points: string;
  rejection_reason: string | null;
  submitted_at: string;
  files: AssignmentSubmissionFileType[];
}

// Interface for assignment data in the response
export interface AssignmentType {
  id: number;
  title: string;
  slug: string;
  description: string;
  instructions: string | null;
  points: string;
  due_days: number;
  max_file_size: number | null;
  allowed_file_types: string[];
  media: string;
  media_extension: string;
  is_active: boolean;
  can_skip: boolean;
  order: number | null;
  chapter_order: number;
  created_at: string;
  updated_at: string;
  chapter: {
    id: number;
    title: string;
    chapter_order: number;
    is_active: boolean;
  };
  course: {
    id: number;
    title: string;
    slug: string;
  };
}

// Interface for assignment submissions response data (includes assignment info)
export interface AssignmentSubmissionsData {
  assignment: AssignmentType;
  current_page: number;
  data: AssignmentSubmissionDataType[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Interface for assignment submissions API response
export interface AssignmentSubmissionsResponse {
  error: boolean;
  message: string;
  data: AssignmentSubmissionsData;
  code: number;
}

// Interface for API parameters (matches the API documentation)
export interface GetAssignmentSubmissionsParams {
  course_id?: number;
  assignment_id?: number;
  assignment_slug?: string;
  status?: 'pending' | 'submitted' | 'accepted' | 'rejected';
  per_page?: number;
  page?: number;
  sort_by?: 'id' | 'created_at' | 'submitted_at' | 'points';
  sort_order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Fetch assignment submissions from the API
 * @param params - Optional parameters for the API request
 * @returns Promise with assignment submissions data or null if error
 */
export const getAssignmentSubmissions = async (
  params?: GetAssignmentSubmissionsParams
): Promise<AssignmentSubmissionsResponse | null> => {
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
    // Using the correct endpoint as per API documentation
    const response = await axiosClient.get<AssignmentSubmissionsResponse>(assignmentSubmissionsApiRoute, {params: queryParams});

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AssignmentSubmissionsResponse } };
    console.log("Error in getAssignmentSubmissions:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};

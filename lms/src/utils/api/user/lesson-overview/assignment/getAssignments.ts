import axiosClient from "../../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getAssignmentsApiRoute } from "@/utils/apiRoutes";

// Interface for assignment submission statistics
export interface AssignmentSubmissionStats {
  total_submissions: number;
  accepted_submissions: number;
  rejected_submissions: number;
  pending_submissions: number;
  latest_status: string | null;
  has_submissions: boolean;
}

// Interface for individual assignment submission
export interface AssignmentSubmission {
  id: number;
  submitted_file: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  status: string;
  status_label: string;
  feedback: string | null;
  grade: number | null;
  comment: string | null;
  submitted_at: string;
  submitted_at_formatted: string;
  time_ago: string;
  updated_at: string;
  can_resubmit: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// Interface for individual assignment
export interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  points: string;
  due_days: number;
  max_file_size: number | null;
  allowed_file_types: string[];
  media: string;
  media_extension: string;
  media_url: string;
  can_skip: boolean;
  is_skip: number;
  is_active: boolean;
  created_at: string;
  created_at_formatted: string;
  time_ago: string;
  submissions: AssignmentSubmission[];
  submission_stats: AssignmentSubmissionStats;
}

// Interface for chapter containing assignments
export interface ChapterWithAssignments {
  chapter_id: number;
  chapter_title: string;
  course_name: string;
  course_image: string;
  course_id: number;
  assignments: Assignment[];
}

// Interface for the complete assignments data structure
export interface AssignmentsData {
  chapters: ChapterWithAssignments[];
  current_chapter_assignments: ChapterWithAssignments[];
}

// Interface for get assignments request parameters
export interface GetAssignmentsParams {
  course_id?: number;
  chapter_id?: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetAssignmentsResponse = ApiResponse<AssignmentsData>;

/**
 * Fetch course assignments from the API
 * @param params - Parameters for fetching assignments (course_id, chapter_id)
 * @returns Promise with assignments response or null
 */
export const getAssignments = async (params: GetAssignmentsParams = {}): Promise<GetAssignmentsResponse | null> => {
  try {

    const { ...queryParams } = params;

    const queryParamsObj: Record<string, string | number> = {};

    // Optional parameters - only add if they exist
    if (queryParams?.course_id !== undefined) queryParamsObj.course_id = queryParams.course_id;
    if (queryParams?.chapter_id !== undefined) queryParamsObj.chapter_id = queryParams.chapter_id;

    const response = await axiosClient.get<GetAssignmentsResponse>(getAssignmentsApiRoute, { params: queryParamsObj });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetAssignmentsResponse } };
    console.log("Error in getAssignments:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

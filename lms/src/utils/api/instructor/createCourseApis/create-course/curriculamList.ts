import axiosClient from "../../../axiosClient";
import { courseChaptersCurriculumListApiRoute } from "@/utils/apiRoutes";

// Interface for curriculum resource data structure
export interface CurriculumResource {
  id: number;
  user_id: number;
  lecture_id: number;
  type: "file" | "url";
  file: string | null;
  file_extension: string | null;
  url: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for curriculum all details structure
export interface CurriculumAllDetails {
  id: number;
  user_id: number;
  course_chapter_id: number;
  title: string;
  slug: string;
  type: "youtube_url" | "file" | "vimeo_url";
  file: string | null;
  file_extension: string | null;
  url: string | null;
  youtube_url: string | null;
  hours: number;
  minutes: number;
  seconds: number;
  description: string;
  chapter_order: number;
  is_active: boolean;
  free_preview: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  formatted_duration: string;
  curriculum_type: "lecture" | "quiz" | "assignment";
  resources: CurriculumResource[];
}

// Interface for curriculum row data structure
export interface CurriculumRow {
  no: number;
  id: number;
  title: string;
  type: "lecture" | "quiz" | "assignment";
  table_name: string;
  duration: string;
  status: boolean;
  all_details: CurriculumAllDetails;
  resources: number;
  particular_details_url: string;
  update_status_url: string;
  restore_url: string;
  operate: string;
}

// Interface for curriculum list response structure
export interface CurriculumListResponse {
  error: boolean;
  message: string;
  total: number;
  rows: CurriculumRow[];
  code: number;
}

/**
 * Get curriculum list from the backend API
 * @param chapterId - The chapter ID to get curriculum for
 * @returns Promise with API response structure containing curriculum list
 */
export const getCurriculumList = async (
  chapterId: number
): Promise<CurriculumListResponse | null> => {
  try {
    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<CurriculumListResponse>(courseChaptersCurriculumListApiRoute, { params: { chapter_id: chapterId } });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CurriculumListResponse } };
    console.log("Error in getCurriculumList:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
}

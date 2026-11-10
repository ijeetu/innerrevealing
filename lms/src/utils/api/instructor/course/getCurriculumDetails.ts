import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCurriculumDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for curriculum resource data structure
export interface CurriculumResource {
  id: number;
  user_id: number;
  lecture_id: number;
  title: string | null;
  type: 'file' | 'url';
  file: string | null;
  file_extension: string | null;
  url: string | null;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Interface for curriculum details data structure (matches API response)
export interface CurriculumDetails {
  id: number;
  user_id: number;
  course_chapter_id: number;
  title: string;
  slug: string;
  type?: 'youtube_url' | 'file' | 'url'; // Optional for document type
  file?: string | null;
  file_extension?: string | null;
  url?: string | null;
  youtube_url?: string | null;
  hours?: number; // Optional for document type
  minutes?: number; // Optional for document type
  seconds?: number; // Optional for document type
  description?: string | null;
  chapter_order: number;
  is_active: boolean;
  free_preview?: boolean; // Optional for document type
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  formatted_duration?: string; // Optional for document type
  curriculum_type: 'lecture' | 'quiz' | 'assignment' | 'document';
  resources?: CurriculumResource[]; // Optional for document type
  // Quiz-specific fields
  time_limit?: number;
  total_points?: number;
  passing_score?: number;
  can_skip?: boolean;
  // Assignment-specific fields
  points?: number;
  due_days?: number;
  // Document-specific fields
  duration?: string | null;
  allowed_file_types?: string[];
  media?: string | null;
  media_url?: string;
}

// Use the common ApiResponse interface with CurriculumDetails
export type CurriculumDetailsApiResponse = ApiResponse<CurriculumDetails>;

// Interface for query parameters
export interface GetCurriculumDetailsParams {
  id: number;
  type: 'lecture' | 'quiz' | 'assignment';
}

/**
 * Get curriculum details from the backend API
 * @param params - Required query parameters (id and type)
 * @returns Promise with API response structure containing curriculum details
 */
export const getCurriculumDetails = async (
  params: GetCurriculumDetailsParams
): Promise<CurriculumDetailsApiResponse | null> => {
  try {
    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<CurriculumDetailsApiResponse>(getCurriculumDetailsApiRoute, {
      params: {
        id: params.id,
        type: params.type
      },
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CurriculumDetailsApiResponse } };
    console.log("Error in getCurriculumDetails:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
}
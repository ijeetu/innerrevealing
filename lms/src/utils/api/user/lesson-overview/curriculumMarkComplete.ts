import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { curriculumMarkCompleteApiRoute } from "@/utils/apiRoutes";

// Response data for curriculum mark-completed (matches API response)

export interface NextCurriculum {
  next_course_chapter_id: string;
  next_model_id: number;
  next_model_type: "lecture" | "quiz" | "assignment" | "document";
  next_title: string;
}
export interface CurriculumTrackResponseData {
  chapter_id: string; // e.g., "49"
  chapter_title: string;
  model_id: string; // e.g., "32"
  model_type: string; // e.g., fully qualified class name
  model_type_short: "lecture" | "quiz" | "assignment" | "document";
  model_class_name: string; // e.g., "CourseChapterQuiz"
  item: {
    id: number;
    title: string;
    type: "lecture" | "quiz" | "assignment" | "document";
    time_limit: number | null;
    total_points: number | null;
    passing_score: number | null;
    chapter_order: number;
  };
  item_tracking: {
    id: number;
    status: "pending" | "in_progress" | "completed";
    started_at: string | null; // ISO datetime
    completed_at: string | null; // ISO datetime
    time_spent: number | null;
  };
  chapter_tracking_status: "pending" | "in_progress" | "completed";
  tracked_at: string; // ISO datetime
  next_curriculum: NextCurriculum;
}

// Use the common ApiResponse interface for consistent response handling
export type CurriculumTrackResponse = ApiResponse<CurriculumTrackResponseData>;

// Interface for API parameters (matches the API documentation)
export interface CurriculumTrackParams {
  course_chapter_id: number;
  model_id: number;
  model_type: "lecture" | "quiz" | "assignment" | "document";
}

/**
 * Mark curriculum item completed
 * @param params - Parameters for the course track request
 * @returns Promise with course track data or null if error
 */
export const curriculumMarkComplete = async (
  params: CurriculumTrackParams
): Promise<CurriculumTrackResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData (as shown in API documentation)
    formData.append('course_chapter_id', params.course_chapter_id.toString());
    formData.append('model_id', params.model_id.toString());
    formData.append('model_type', params.model_type);

    // Send the POST request to the backend API with FormData
    // Using the endpoint from the screenshot: curriculumMarkCompleteApiRoute
    const response = await axiosClient.post<CurriculumTrackResponse>(curriculumMarkCompleteApiRoute, formData,);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CurriculumTrackResponse } };
    console.log("Error in curriculumTrack:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

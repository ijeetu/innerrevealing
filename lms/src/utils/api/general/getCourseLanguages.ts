import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCourseLanguagesApiRoute } from "@/utils/apiRoutes";

// Interface for course language data structure (matches actual API response)
export interface CourseLanguage {
  id: number;
  name: string;
  slug: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Use the common ApiResponse interface with CourseLanguage array
export type CourseLanguagesResponse = ApiResponse<CourseLanguage[]>;

/**
 * Get course languages from the backend API
 * @returns Promise with API response structure containing course languages
 */
export const getCourseLanguages = async (): Promise<CourseLanguagesResponse | null> => {
  try {
    // Send the GET request to the backend API
    const response = await axiosClient.get<CourseLanguagesResponse>(getCourseLanguagesApiRoute);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CourseLanguagesResponse } };
    console.log("Error in getCourseLanguages:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
}

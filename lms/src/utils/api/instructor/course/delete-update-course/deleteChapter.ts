import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { deleteCourseChapterApiRoute } from "@/utils/apiRoutes";

// Interface for delete course chapter response data
export interface DeleteChapterResponseData {
  message?: string;
  [key: string]: unknown;
}

// Use the common ApiResponse interface for consistent response handling
export type DeleteChapterResponse = ApiResponse<DeleteChapterResponseData>;

// Interface for API parameters (matches the API documentation)
// Either id or slug must be provided, but not both
export interface DeleteChapterParams {
  id?: number; // Course Chapter ID (required when slug is empty)
  slug?: string; // Course Chapter Slug (required when id is empty)
}

/**
 * Delete a course chapter from the API
 * @param params - Parameters for the delete request (either id or slug)
 * @returns Promise with delete chapter response data or null if error
 */
export const deleteChapter = async (
  params: DeleteChapterParams
): Promise<DeleteChapterResponse | null> => {
  try {
    // Validate that either id or slug is provided
    if (!params.id && !params.slug) {
      console.log("Error in deleteChapter: Either id or slug must be provided");
      return null;
    }

    // Validate that both are not provided at the same time
    if (params.id && params.slug) {
      console.log("Error in deleteChapter: Only one of id or slug should be provided");
      return null;
    }

    // Build query parameters for the DELETE request
    // The API expects either id or slug as a query parameter
    const queryParams = new URLSearchParams();
    if (params.id) {
      queryParams.append('id', params.id.toString());
    } else if (params.slug) {
      queryParams.append('slug', params.slug);
    }

    // Construct the endpoint URL with query parameters
    const endpoint = `${deleteCourseChapterApiRoute}?${queryParams.toString()}`;

    // Send the DELETE request to the backend API
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.delete<DeleteChapterResponse>(endpoint);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: DeleteChapterResponse } };
    console.log("Error in deleteChapter:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

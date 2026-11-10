import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getTagsApiRoute } from "@/utils/apiRoutes";

// Interface for tag data structure - matches actual API response
// Based on the real API response: { id, tag, slug, is_active, created_at, updated_at, deleted_at }
export interface Tag {
  id: number;
  tag: string;        // The actual tag name (not 'name' as previously assumed)
  slug: string;       // URL-friendly version of the tag
  is_active: number;  // 1 for active, 0 for inactive
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // ISO date string or null if not deleted
}

// Use the common ApiResponse interface with Tag array
export type TagsResponse = ApiResponse<Tag[]>;

/**
 * Get tags from the backend API
 * @returns Promise with API response structure containing tags
 */
export const getTags = async (): Promise<TagsResponse | null> => {
  try {
    // Send the GET request to the backend API
    const response = await axiosClient.get<TagsResponse>(getTagsApiRoute);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: TagsResponse } };
    console.log("Error in getTags:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
}

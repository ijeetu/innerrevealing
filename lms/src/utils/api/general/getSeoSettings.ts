import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getSeoSettingsApiRoute } from "@/utils/apiRoutes";

// Interface for SEO settings data structure based on actual API response
// Each SEO setting contains metadata for a specific page type and language
export interface SeoSettings {
  id: number;
  language_id: number;
  language_name: string;
  language_code: string;
  page_type: string; // e.g., "home", "course", "about", etc.
  meta_title: string; // SEO meta title for the page
  meta_description: string; // SEO meta description for the page
  meta_keywords: string; // Comma-separated keywords for SEO
  schema_markup: string; // JSON-LD schema markup as a string
  og_image: string; // Open Graph image URL for social media sharing
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// Use the common ApiResponse interface for consistent response handling
// The data field contains an array of SEO settings
export type GetSeoSettingsResponse = ApiResponse<SeoSettings[]>;

// Parameters for fetching SEO settings
// Allows filtering by page type and language code
export interface GetSeoSettingsParams {
  type: string; // Page type (e.g., "home", "course", "about")
  language_code: string; // Language code (e.g., "en", "es", "fr")
}

/**
 * Fetch SEO settings from the API
 * @param params - Object containing type and language_code for filtering SEO settings
 * @returns Promise with SEO settings response or null
 * 
 * Example usage:
 * const seoSettings = await getSeoSettings({ type: "home", language_code: "en" });
 */
export const getSeoSettings = async (
  params: GetSeoSettingsParams
): Promise<GetSeoSettingsResponse | null> => {
  try {
    // Build query parameters for the API request
    const queryParams = new URLSearchParams({
      type: params.type,
      language_code: params.language_code,
    });

    const response = await axiosClient.get<GetSeoSettingsResponse>(
      `${getSeoSettingsApiRoute}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    // Handle errors gracefully and return API error response if available
    const axiosError = error as { response?: { data?: GetSeoSettingsResponse } };
    console.log("Error in getSeoSettings:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
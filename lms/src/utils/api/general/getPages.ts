import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getPagesApiRoute } from "@/utils/apiRoutes";

// Interface for page data structure based on actual API response
export interface Page {
  id: number;
  language_id: number;
  language_name: string;
  title: string;
  page_type: string;
  slug: string;
  page_content: string;
  page_type_slug: string;
  page_icon: string | null;
  og_image: string | null;
  schema_markup: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_custom: number;
  is_termspolicy: number;
  is_privacypolicy: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// Interface for query parameters when fetching pages
export interface GetPagesParams {
  language_id?: number;
  language_code?: string;
  type?: string;
}

// Use the common ApiResponse interface for consistent response handling
// Note: The API returns data as an array of pages
export type GetPagesResponse = ApiResponse<Page[]>;

/**
 * Fetch pages from the API
 * This endpoint returns pages based on optional language_id and type filters
 * @param params - Optional query parameters for filtering pages (language_id and type)
 * @returns Promise with pages response or null
 */
export const getPages = async (
  params?: GetPagesParams,
): Promise<GetPagesResponse | null> => {
  try {
    // Build query parameters object (only include defined parameters)
    const queryParams: Record<string, string | number> = {};

    if (params?.language_code) {
      queryParams.language_code = params.language_code;
    }
    if (params?.type) {
      queryParams.type = params.type;
    }

    // Send the GET request to the backend API
    const response = await axiosClient.get<GetPagesResponse>(getPagesApiRoute, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle error using the standard pattern - return response data if available, otherwise null
    const axiosError = error as { response?: { data?: GetPagesResponse } };
    console.log("Error in getPages:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
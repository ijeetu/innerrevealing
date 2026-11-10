import axiosClient from "../axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { faqsApiRoute } from "@/utils/apiRoutes";

// Interface for FAQ data structure
export interface FaqData {
    id: number;
    question: string;
    answer: string;
    created_at: string;
    updated_at: string;
}

// Use the PaginatedApiResponse interface for consistent response handling
// The API returns paginated data with metadata (current_page, total, links, etc.)
export type GetFaqsResponse = PaginatedApiResponse<FaqData>;

/**
 * Interface for pagination parameters
 * Used to control which page of FAQs to fetch
 */
export interface GetFaqsParams {
  page?: number;      // Page number to fetch (default: 1)
  per_page?: number;  // Number of FAQs per page (optional, uses API default)
}

/**
 * Fetch FAQs from the API with pagination support
 * This endpoint returns paginated FAQs with metadata
 * @param params - Optional pagination parameters (page, per_page)
 * @returns Promise with paginated FAQs response or null
 */
export const getFaqs = async (params?: GetFaqsParams): Promise<GetFaqsResponse | null> => {
  try {
    // Build query parameters object (only include defined parameters)
    const queryParams: Record<string, number> = {};
    
    if (params?.page) queryParams.page = params.page;
    if (params?.per_page) queryParams.per_page = params.per_page;

    const response = await axiosClient.get<GetFaqsResponse>(faqsApiRoute, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetFaqsResponse } };
    console.log("Error in getFaqs:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};


import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getSearchSuggestionsApiRoute } from "@/utils/apiRoutes";

// Interface for recent search item structure
export interface RecentSearchItem {
  type: "recent";
  text: string;
  query: string;
  icon: string;
  search_count: number;
  last_searched: string;
}

// Interface for course suggestion item structure
export interface CourseSuggestionItem {
  type: "course";
  text: string;
  slug: string;
  icon: string;
  author_name: string;
  course_image: string;
  course_id: number;
}

// Interface for category/tag suggestion item structure
export interface OtherSuggestionItem {
  type: "category" | "tag";
  text: string;
  slug: string;
  icon: string;
}

// Interface for search suggestions response data structure
export interface SearchSuggestionsResponse {
  recent_searches: RecentSearchItem[];
  top_courses: CourseSuggestionItem[];
  other_suggestions: OtherSuggestionItem[];
  total_courses: number;
  total_other: number;
  total_recent: number;
  query: string;
}

// Interface for get search suggestions request parameters
export interface GetSearchSuggestionsParams {
  query: string;
}

// Use the common ApiResponse interface for consistent response handling
export type GetSearchSuggestionsApiResponse = ApiResponse<SearchSuggestionsResponse>;

/**
 * Fetch search suggestions from the API based on search query
 * @param params - Parameters containing the search query
 * @returns Promise with search suggestions response or null
 */
export const getSearchSuggestions = async (params: GetSearchSuggestionsParams): Promise<GetSearchSuggestionsApiResponse | null> => {
  try {
    const queryParams: Record<string, string> = {};
    if (params.query) queryParams.query = params.query.trim();

    const response = await axiosClient.get<GetSearchSuggestionsApiResponse>(getSearchSuggestionsApiRoute, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetSearchSuggestionsApiResponse } };
    console.log("Error in getSearchSuggestions:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
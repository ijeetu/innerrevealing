import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { systemLanguagesApiRoute } from "@/utils/apiRoutes";

// Interface for translations data structure
export interface TranslationsWeb {
  [key: string]: string;
}

// Interface for language data structure
export interface LanguageItem {
  id: number;
  name: string;
  code: string;
  is_rtl: boolean;
  is_default: boolean;
  image: string;
  translations_web: TranslationsWeb;
}

// Interface for the nested data structure in API response
export interface LanguageData {
  languages: LanguageItem[];
}

// Use the common ApiResponse interface with LanguageData
export type LanguageResponse = ApiResponse<LanguageData>;

// Interface for query parameters
export interface GetLanguageParams {
  system_type: "web";
  code: string;
}

// Fetch system languages from the API - following getTeamMembers pattern
export const getLanguage = async (params: GetLanguageParams): Promise<LanguageResponse | null> => {
  try {
    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<LanguageResponse>(systemLanguagesApiRoute, {
      params: params, // Pass query parameters
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: LanguageResponse } };
    console.log("Error in getLanguage:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};

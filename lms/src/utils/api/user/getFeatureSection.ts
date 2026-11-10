import axiosClient from '@/utils/api/axiosClient';
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { Course } from '@/types';
import { getFeatureSectionsApiRoute } from "@/utils/apiRoutes";

// Interface for offer data structure
export interface Offer {
  id: number;
  feature_section_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface WhyChooseUsType {
  title: string;
  description: string;
  image: string | null;
  button_text: string;
  button_link: string;
  points: string[];
}

// Interface for feature section data structure
export interface FeatureSectionData {
  id: number;
  title: string;
  type: 'top_rated_courses' | 'offer' | 'newly_added_courses' | 'become_instructor' | 'free_courses' | 'wishlist' | "recommend_for_you" | 'why_choose_us' | 'searching_based' | 'top_rated_instructors' | 'most_viewed_courses' | 'my_learning';
  data: Course[] | Offer[] | WhyChooseUsType[];
}

// Interface for query parameters
export interface GetFeatureSectionParams {
  // page?: number;
  // per_page?: number;
  type?: 'top_rated_courses' | 'offer' | 'newly_added_courses' | 'become_instructor' | 'free_courses' | 'wishlist' | "recommend_for_you" | 'why_choose_us' | 'searching_based' | 'top_rated_instructors' | 'my_learning';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Use the common ApiResponse interface for consistent response handling
export type GetFeatureSectionsResponse = ApiResponse<FeatureSectionData[]>;

/**
 * Fetch feature sections from the API with optional filtering parameters
 * @param params - Optional query parameters for filtering feature sections
 * @returns Promise with feature sections response or null
 */
export const getFeatureSections = async (params: GetFeatureSectionParams = {}): Promise<GetFeatureSectionsResponse | null> => {
  try {
    
    const { ...queryParams } = params;

    const response = await axiosClient.get<GetFeatureSectionsResponse>(getFeatureSectionsApiRoute, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetFeatureSectionsResponse } };
    console.log("Error in getFeatureSections:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
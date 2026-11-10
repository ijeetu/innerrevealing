import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCategoriesApiRoute } from "@/utils/apiRoutes";


// Interface for category data structure
export interface Category {
  id: number;
  name: string;
  image: string;
  parent_category_id: number | null;
  description: string | null;
  status: boolean;
  slug: string;
  subcategories_count: number;
  parent_category_count: number;
  courses_count: number;
  has_subcategory: boolean;
  has_parent_category: boolean;
  // Optional subcategories array for when fetching subcategories
  subcategories?: SubCategory[];
}

// Interface for subcategory data structure
export interface SubCategory {
  id: number;
  sequence: number | null;
  name: string;
  image: string;
  parent_category_id: number;
  description: string | null;
  status: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  has_subcategory: boolean;
  has_parent_category: boolean;
}

// Use the common ApiResponse interface for consistent response handling
export type GetCategoriesResponse = ApiResponse<Category[]>;

/**
 * Fetch categories from the API

 * @returns Promise with categories response or null
 */
export const getCategories = async (): Promise<GetCategoriesResponse | null> => {
  try {
    const response = await axiosClient.get<GetCategoriesResponse>(getCategoriesApiRoute);
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetCategoriesResponse } };
    console.log("Error in getCategories:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

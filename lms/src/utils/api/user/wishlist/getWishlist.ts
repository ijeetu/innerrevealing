import axiosClient from "../../axiosClient";
import { ApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { wishlistApiRoute } from "@/utils/apiRoutes";

// Interface for wishlist course data structure
export interface WishlistCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  instructor: string;
  is_wishlisted: boolean;
  promo_code: string | null;
  original_price: number;
  course_discount: number;
  subtotal: number;
  promo_discount: number;
  taxable_amount: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  category_id: number;
  category_name: string;
  course_type: 'free' | 'paid';
  level: 'beginner' | 'intermediate' | 'advanced';
  ratings: number;
  average_rating: number;
  short_description: string;
  author_name: string;
  discount_percentage: number;
  is_enrolled: boolean;
}


// Interface for query parameters
export interface GetWishlistParams {
  page?: number;
  per_page?: number;
  search?: string;
  course_type?: 'free' | 'paid';
  level?: 'beginner' | 'intermediate' | 'advanced';
  category_id?: number;
  sort_by?: 'title' | 'price' | 'average_rating' | 'created_at';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  is_enrolled?: boolean;
}

// Use the common ApiResponse interface for consistent response handling
export type GetWishlistResponse = ApiResponse<PaginatedData<WishlistCourse>>;

/**
 * Fetch wishlist courses from the API with optional filtering parameters
 * @param params - Optional query parameters for filtering wishlist courses
 * @returns Promise with wishlist response or null
 */
export const getWishlist = async (params: GetWishlistParams = {}): Promise<GetWishlistResponse | null> => {
  try {
    // Extract query parameters
    const { ...queryParams } = params;

    const response = await axiosClient.get<GetWishlistResponse>(wishlistApiRoute, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetWishlistResponse } };
    console.log("Error in getWishlist:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { wishlistAddUpdateApiRoute } from "@/utils/apiRoutes";

// Interface for wishlist response data
export interface WishlistResponseData {
  error?: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type AddWishlistResponse = ApiResponse<WishlistResponseData>;

// Interface for API parameters (matches the API documentation)
export interface AddWishlistParams {
  course_id: number | string;
  status: number | string;
}

/**
 * Add or update course in wishlist from the API
 * @param params - Parameters for the wishlist request
 * @returns Promise with wishlist data or null if error
 */
export const addToWishlist = async (
  params: AddWishlistParams
): Promise<AddWishlistResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();
    
    // Add required parameters to FormData
    formData.append('course_id', params.course_id.toString());
    formData.append('status', params.status.toString());

    // Send the POST request to the backend API with FormData
    const response = await axiosClient.post<AddWishlistResponse>(wishlistAddUpdateApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AddWishlistResponse } };
    console.log("Error in addToWishlist:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};
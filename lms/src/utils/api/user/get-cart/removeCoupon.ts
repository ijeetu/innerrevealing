import axiosClient from "@/utils/api/axiosClient";
import { cartRemovePromoApiRoute } from "@/utils/apiRoutes";
import { ApplyAdminPromoApiResponse } from "./applyAdminPromo";

/**
 * Remove promo code from cart
 * @returns Promise with remove promo API response data or null if error
 */
export const removePromo = async (
): Promise<ApplyAdminPromoApiResponse | null> => {
  try {
    // Send the POST request to the backend API
    // This follows the same pattern as applyAdminPromo.ts
    const response = await axiosClient.post<ApplyAdminPromoApiResponse>(cartRemovePromoApiRoute);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: ApplyAdminPromoApiResponse } };
    console.log("Error in removePromo:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};


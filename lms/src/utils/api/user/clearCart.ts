import axiosClient from "@/utils/api/axiosClient";
import { clearCartApiRoute } from "@/utils/apiRoutes";
import { CartData } from "@/utils/api/user/get-cart/getCart";

// Response structure returned by the backend when a course is removed
export interface ClearCartApiResponse {
  error: boolean;
  message: string;
  data: CartData | null;
  code: number;
}

/**
 * Clear all items from the authenticated user's cart.
 * Sends a POST request with empty body and authorization headers.
 */
export const clearCart = async (
): Promise<ClearCartApiResponse | null> => {

  try {
    
    const response = await axiosClient.post<ClearCartApiResponse>(clearCartApiRoute);

    // Always return the backend payload so the caller can handle success or error flags.
    return response.data;
  } catch (error) {
    // Normalize axios errors so UI hooks can show backend-provided messages.
    const axiosError = error as {
        response?: { data?: ClearCartApiResponse };
    };
    console.log("Error in clearCart:", axiosError?.response?.data);

    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // Network or unexpected failures return null so callers can show generic fallback.
    return null;
  }
};

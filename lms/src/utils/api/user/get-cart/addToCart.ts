import axiosClient from "../../axiosClient";
import { cartAddApiRoute } from "@/utils/apiRoutes";

// Add to cart API response interface
export interface AddToCartApiResponse {
  error: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  code: number;
}

/**
 * Add course to user's cart
 * @param courseId - ID of the course to add to cart
 * @returns Promise with add to cart API response or null
 */
export const addToCart = async (
  courseId: number,
  promoCodeId?: number,
  promoCode?: string

): Promise<AddToCartApiResponse | null> => {
  try {
    // Create FormData for the request
    const apiFormData = new FormData();
    apiFormData.append("course_id", courseId.toString());
    apiFormData.append("promo_code_id", promoCodeId?.toString() || "");
    apiFormData.append("promo_code", promoCode || "");

    // Send the POST request to the backend API
    const response = await axiosClient.post<AddToCartApiResponse>(
      cartAddApiRoute,
      apiFormData,
    );

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as {
      response?: { data?: AddToCartApiResponse };
    };
    console.log("Error in addToCart:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

import axiosClient from "../../axiosClient";
import { cartRemoveApiRoute } from "@/utils/apiRoutes";

// Remove from cart API response interface
export interface RemoveFromCartApiResponse {
  error: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  code: number;
}

/**
 * Remove course from user's cart
 * @param courseId - ID of the course to remove from cart
 * @returns Promise with remove from cart API response or null
 */
export const removeFromCart = async (
  courseId: number
): Promise<RemoveFromCartApiResponse | null> => {
  try {
    // Create FormData for the request
    const apiFormData = new FormData();
    apiFormData.append("course_id", courseId.toString());

    // Send the POST request to the backend API
    const response = await axiosClient.post<RemoveFromCartApiResponse>(
      cartRemoveApiRoute,
      apiFormData,
    );

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as {
      response?: { data?: RemoveFromCartApiResponse };
    };
    console.log("Error in removeFromCart:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

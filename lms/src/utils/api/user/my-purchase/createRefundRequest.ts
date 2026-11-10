import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { refundRequestApiRoute } from "@/utils/apiRoutes";

// Interface for refund request response data
export interface RefundRequestResponseData {
  error?: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type RefundRequestResponse = ApiResponse<RefundRequestResponseData>;

// Interface for API parameters (matches the API documentation)
export interface RefundRequestParams {
  course_id: number | string;
  reason: string;
  user_media?: File; // Optional file upload for refund request
}

/**
 * Create a refund request for a course
 * @param params - Parameters for the refund request
 * @returns Promise with refund request data or null if error
 */
export const createRefundRequest = async (
  params: RefundRequestParams
): Promise<RefundRequestResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();
    
    // Add required parameters to FormData
    formData.append('course_id', params.course_id.toString());
    formData.append('reason', params.reason);

    // Add optional file upload if provided
    // The API expects user_media as a file upload
    if (params.user_media) {
      formData.append('user_media', params.user_media);
    }

    // Send the POST request to the backend API with FormData
    // Endpoint matches the API documentation: refundRequestApiRoute
    const response = await axiosClient.post<RefundRequestResponse>(refundRequestApiRoute, formData, {
      timeout: 30000, // Increased timeout for file uploads
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: RefundRequestResponse } };
    console.log("Error in createRefundRequest:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};
import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { changePasswordApiRoute } from "@/utils/apiRoutes";

// Interface for change password response data
export interface ChangePasswordResponseData {
  message?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type ChangePasswordResponse = ApiResponse<ChangePasswordResponseData>;

// Interface for API parameters (matches the API documentation)
export interface ChangePasswordParams {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Change password from the API
 * @param params - Parameters for the change password request
 * @returns Promise with change password response data or null if error
 */
export const changePassword = async (
  params: ChangePasswordParams
): Promise<ChangePasswordResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData
    formData.append('old_password', params.old_password);
    formData.append('new_password', params.new_password);
    formData.append('new_password_confirmation', params.new_password_confirmation);

    // Send the POST request to the backend API with FormData
    const response = await axiosClient.post<ChangePasswordResponse>(changePasswordApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: ChangePasswordResponse } };
    console.log("Error in changePassword:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

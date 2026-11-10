import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { deleteAccountApiRoute } from "@/utils/apiRoutes";

// Interface for delete account response data
// The response structure will match the API response format
export interface DeleteAccountResponseData {
  message?: string;
  // Add other response fields as needed based on API documentation
}

// Use the common ApiResponse interface for consistent response handling
export type DeleteAccountResponse = ApiResponse<DeleteAccountResponseData>;

// Interface for API parameters (matches the API documentation)
// Based on the API request: password and confirm_deletion are required
export interface DeleteAccountParams {
  password: string; // User's password for verification
  confirm_deletion: string | number; // Confirmation flag (typically "1" to confirm deletion)
  firebase_token: string;
}

/**
 * Delete user account from the API
 * @param params - Parameters for the delete account request (password and confirm_deletion)
 * @returns Promise with delete account response data or null if error
 */
export const deleteAccount = async (
  params: DeleteAccountParams
): Promise<DeleteAccountResponse | null> => {
  try {
    const formData = new FormData();
    formData.append('password', params.password);
    formData.append('confirm_deletion', params.confirm_deletion.toString());
    if (params.firebase_token) {
      formData.append('firebase_token', params.firebase_token);
    }


    // Send the POST request to the backend API with FormData
    const response = await axiosClient.post<DeleteAccountResponse>(deleteAccountApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: DeleteAccountResponse } };
    console.log("Error in deleteAccount:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

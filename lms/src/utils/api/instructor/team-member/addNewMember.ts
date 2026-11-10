import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { addTeamMemberApiRoute } from "@/utils/apiRoutes";

// Interface for add member response data
export interface AddMemberResponseData {
  message?: string;
  data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type AddNewMemberResponse = ApiResponse<AddMemberResponseData>;

// Interface for API parameters (matches the API documentation)
export interface AddNewMemberParams {
  member_email: string;
}

/**
 * Add team member to the backend API
 * @param params - Parameters for the add member request
 * @returns Promise with add member data or null if error
 */
export const addNewMember = async (
  params: AddNewMemberParams
): Promise<AddNewMemberResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData
    formData.append('member_email', params.member_email);

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.post<AddNewMemberResponse>(addTeamMemberApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AddNewMemberResponse } };
    console.log("Error in addNewMember:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

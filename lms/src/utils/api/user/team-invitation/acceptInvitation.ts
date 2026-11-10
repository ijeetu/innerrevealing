import axiosClient from "../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { acceptTeamInvitationApiRoute } from "@/utils/apiRoutes";

// Interface for accept team invitation response data
// Response typically contains success message and status information
export interface AcceptInvitationResponseData {
  message?: string;
  [key: string]: unknown; // Allow for additional response fields
}

// Use the common ApiResponse interface for consistent response handling
export type AcceptInvitationResponse = ApiResponse<AcceptInvitationResponseData>;

// Interface for API parameters (matches the API documentation)
export interface AcceptInvitationParams {
  action: "accept" | "reject"; // Action can be accept or reject
  invitation_token: string; // Token received in the team invitation notification
}

/**
 * Accept or reject a team invitation from the API
 * @param params - Parameters for the accept invitation request (action and invitation_token)
 * @returns Promise with acceptance response data or null if error
 */
export const acceptInvitation = async (
  params: AcceptInvitationParams
): Promise<AcceptInvitationResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();
    
    // Add required parameters to FormData (as shown in API curl command)
    formData.append('action', params.action);
    formData.append('invitation_token', params.invitation_token);

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API: acceptTeamInvitationApiRoute
    const response = await axiosClient.post<AcceptInvitationResponse>(
      acceptTeamInvitationApiRoute,
      formData
    );

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AcceptInvitationResponse } };
    console.log("Error in acceptInvitation:", axiosError?.response?.data);
    
    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    
    // If it's a network error (no response), return null
    return null;
  }
};

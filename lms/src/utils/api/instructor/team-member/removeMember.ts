
import axiosClient from "@/utils/api/axiosClient";
import { removeTeamMemberApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for team member form data structure
export interface TeamMemberFormData {
  member_email: string;
  user_id: number;
}

// Interface for team member submission response structure
export interface TeamMemberSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Interface for the API response structure
export interface TeamMemberApiResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Remove team member from the backend API
 * @param formData - FormData object containing team member email and user_id
 * @returns Promise with standardized API response structure
 */
export const removeMember = async (
  formData: FormData,
): Promise<ApiResponse<TeamMemberSubmissionResponse>> => {
  try {

    // Get API URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;

    if (!baseURL || !endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        message: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        code: 500
      };
    }

    // Create the API URL for removing team member
    const apiUrl = removeTeamMemberApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add the member email field
    const memberEmail = formData.get('member_email');
    if (memberEmail) {
      apiFormData.append('member_email', memberEmail);
    } else {
      return {
        success: false,
        data: null,
        error: "Member email is required",
        message: "Member email is required",
        code: 400
      };
    }

    // Add the user_id as query parameter
    const userId = formData.get('user_id');
    if (!userId) {
      return {
        success: false,
        data: null,
        error: "User ID is required",
        message: "User ID is required",
        code: 400
      };
    }

    // Construct the API URL with user_id query parameter
    const apiUrlWithParams = `${apiUrl}?user_id=${userId}`;

    // Send the DELETE request to the backend API
    const response = await axiosClient.delete(apiUrlWithParams, { data: apiFormData });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Failed to remove team member",
        message: response.data.message || "Failed to remove team member",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Team member removed successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Remove Team Member API request failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to remove team member",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param teamMemberData - Object containing team member email and user_id
 * @returns Promise with standardized API response structure
 */
export const removeMemberWithData = async (
  teamMemberData: TeamMemberFormData,
): Promise<ApiResponse<TeamMemberSubmissionResponse>> => {
  try {
    // Create FormData from the provided team member data
    const formData = new FormData();

    // Add member email
    formData.append("member_email", teamMemberData.member_email);

    // Add user_id
    formData.append("user_id", teamMemberData.user_id.toString());

    // Use the main submission function
    return await removeMember(formData);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to remove team member",
      code: errorCode
    };
  }
}

import axiosClient from "@/utils/api/axiosClient";
import { setAuthToken } from "../../../cookies";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { userSignupApiRoute } from "@/utils/apiRoutes";

// Interface for user signup request data structure
export interface UserSignupParams {
  name?: string;
  email?: string;
  mobile?: string;
  country_calling_code?: string;
  country_name?: string;
  fcm_id?: string;
  firebase_id?: string;
  type?: string;
  profile?: File;
  firebase_token?: string;
  password?: string;
  confirm_password?: string;
}

// Interface for user signup response data structure
export interface UserSignupResponse {
  id: number;
  name: string;
  email: string | null;
  mobile: string | null;
  country_calling_code: string | null;
  profile: string | null;
  type: string;
  is_active: boolean;
  email_verified_at: string | null;
  mobile_verified_at: string | null;
  created_at: string;
  updated_at: string;
  token?: string;
  message?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type UserSignupApiResponse = ApiResponse<UserSignupResponse>;

/**
 * Register a new user with the API
 * This follows the same simple pattern as replyDiscussion.ts
 * @param params - User signup data including form fields and optional profile file
 * @returns Promise with user signup API response or null if error
 */
export const userSignup = async (
  params: UserSignupParams
): Promise<UserSignupApiResponse | null> => {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add required fields
    if (params.name) formData.append('name', params.name);

    // Add optional fields only if they exist
    if (params.email) formData.append('email', params.email);
    if (params.mobile) formData.append('mobile', params.mobile);
    if (params.country_calling_code) formData.append('country_calling_code', params.country_calling_code);
    if (params.country_name) formData.append('country_name', params.country_name);
    if (params.fcm_id) formData.append('fcm_id', params.fcm_id);
    if (params.firebase_id) formData.append('firebase_id', params.firebase_id);
    if (params.type) formData.append('type', params.type);
    if (params.firebase_token) formData.append('firebase_token', params.firebase_token);
    if (params.password) formData.append('password', params.password);
    if (params.confirm_password) formData.append('confirm_password', params.confirm_password);

    // Handle profile file upload
    if (params.profile) {
      formData.append('profile', params.profile);
    }

    // Send the POST request to the backend API with FormData
    const response = await axiosClient.post<UserSignupApiResponse>(userSignupApiRoute, formData);

    // Store token in cookies if it exists in the response
    // This is done asynchronously and doesn't block the response
    if (response.data?.data?.token) {
      setAuthToken(response.data.data.token).catch((error) => {
        console.error("Error storing auth token:", error);
      });
    }

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: UserSignupApiResponse } };
    console.log("Error in userSignup:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};
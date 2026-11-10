import axiosClient from "@/utils/api/axiosClient";
import { setAuthToken } from "../../../cookies";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { mobileRegistrationApiRoute } from "@/utils/apiRoutes";

// Interface for mobile registration request data structure
export interface MobileRegistrationRequest {
  name: string;
  mobile: string;
  email: string;
  country_calling_code: string;
  country_name: string;
  password: string;
  confirm_password: string;
  fcm_id?: string;
  firebase_token?: string;
}

// Interface for mobile registration response data structure
export interface MobileRegistrationResponse {
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

// Use the shared ApiResponse wrapper for consistent handling
export type MobileRegistrationApiResponse = ApiResponse<MobileRegistrationResponse>;

/**
 * Register a new user with mobile number (mirrors userSignup pattern)
 * @param registrationData - Form values collected from the signup form
 */
export const mobileRegistration = async (
  registrationData: MobileRegistrationRequest
): Promise<MobileRegistrationApiResponse | null> => {
  try {
    // Create FormData payload so the backend can read multipart fields
    const formData = new FormData();
    formData.append("name", registrationData.name);
    formData.append("country_calling_code", registrationData.country_calling_code);
    formData.append("mobile", registrationData.mobile);
    formData.append("email", registrationData.email);
    formData.append("password", registrationData.password);
    formData.append("confirm_password", registrationData.confirm_password);

    // Optional notification identifiers are appended only when available
    if (registrationData.fcm_id) {
      formData.append("fcm_id", registrationData.fcm_id);
    }

    if (registrationData.firebase_token) {
      formData.append("firebase_token", registrationData.firebase_token);
    }

    // Post to /mobile-registration using the shared axios client
    const response = await axiosClient.post<MobileRegistrationApiResponse>(mobileRegistrationApiRoute, formData);

    // Persist auth token if backend issues one for immediate login
    if (response.data?.data?.token) {
      setAuthToken(response.data.data.token).catch((error) => {
        console.error("Error storing auth token:", error);
      });
    }

    // Always return backend payload to let UI decide on success or error
    return response.data;
  } catch (error) {
    // Normalize axios errors so components can surface clear messages
    const axiosError = error as { response?: { data?: MobileRegistrationApiResponse } };
    console.log("Error in mobileRegistration:", axiosError?.response?.data);

    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // Network failure or unexpected error
    return null;
  }
};
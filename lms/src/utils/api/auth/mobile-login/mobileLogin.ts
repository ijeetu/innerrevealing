import axiosClient from "../../axiosClient";
import { setAuthToken } from "../../../cookies";
import { mobileLoginApiRoute } from '@/utils/apiRoutes';


// Interface for mobile login request data structure
export interface MobileLoginRequest {
  country_calling_code: string;
  mobile: string;
  password: string;
  fcm_id?: string;
}

// Interface for mobile login response data structure
export interface MobileLoginResponse {
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

// Interface for the actual API response structure
export interface MobileLoginApiResponse {
  error: boolean;
  message: string;
  data: MobileLoginResponse;
  code: number;
}

// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

/**
 * Login user with mobile number and password
 * @param loginData - Mobile login data including country code, mobile, password and optional fcm_id
 * @returns Promise with standardized API response structure containing login result
 */
export const mobileLogin = async (loginData: MobileLoginRequest): Promise<ApiResponse<MobileLoginApiResponse>> => {
  try {
    // Get API URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;

    if (!baseURL || !endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        message: "Configuration error",
        code: 500
      };
    }

    // Validate required fields
    if (!loginData.country_calling_code) {
      return {
        success: false,
        data: null,
        error: "Country code is required",
        message: "Country code field is required",
        code: 400
      };
    }

    if (!loginData.mobile) {
      return {
        success: false,
        data: null,
        error: "Mobile number is required",
        message: "Mobile number field is required",
        code: 400
      };
    }

    if (!loginData.password) {
      return {
        success: false,
        data: null,
        error: "Password is required",
        message: "Password field is required",
        code: 400
      };
    }

    // Build the API URL for mobile login
    const apiUrl = mobileLoginApiRoute;

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add required fields
    formData.append('country_calling_code', loginData.country_calling_code);
    formData.append('mobile', loginData.mobile);
    formData.append('password', loginData.password);

    // Add optional fields only if they exist
    if (loginData.fcm_id) {
      formData.append('fcm_id', loginData.fcm_id);
    }

    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: formData,
      timeout: 10000, // 10 second timeout for login requests
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: response.data,
        error: response.data.message || "API returned an error",
        message: response.data.message,
        code: response.data.code
      };
    }

    // Store token in cookies if it exists in the response
    if (response.data.data?.token) {
      console.log("Mobile login successful, storing token:", response.data.data.token);
      await setAuthToken(response.data.data.token);
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message,
      code: response.data.code
    };

  } catch (error: unknown) {
    // Type cast error to access properties
    const err = error as {
      message: string;
      response?: {
        data: unknown;
        status: number;
      };
      config?: {
        url: string;
        method: string;
        timeout: number;
      };
    };

    // Improved error logging
    console.error("Mobile Login API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        timeout: err.config?.timeout,
      },
    });

    // Return standardized error response
    return {
      success: false,
      data: null,
      error: err.message || "An unexpected error occurred",
      message: (err.response?.data as { message?: string })?.message || "Failed to login with mobile",
      code: err.response?.status || 500
    };
  }
}
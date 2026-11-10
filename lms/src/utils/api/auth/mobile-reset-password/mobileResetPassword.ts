import axiosClient from "../../axiosClient";
import { mobileResetPasswordApiRoute } from '@/utils/apiRoutes';


// Interface for mobile reset password request data structure
export interface MobileResetPasswordRequest {
  firebase_token: string;
  password: string;
  confirm_password: string;
}

// Interface for mobile reset password response data structure
export interface MobileResetPasswordResponse {
  message: string;
  success: boolean;
}

// Interface for the actual API response structure
export interface MobileResetPasswordApiResponse {
  error: boolean;
  message: string;
  data: MobileResetPasswordResponse;
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
 * Reset password using mobile number and firebase token
 * @param resetData - Mobile reset password data including firebase token, password and confirm password
 * @returns Promise with standardized API response structure containing reset result
 */
export const mobileResetPassword = async (resetData: MobileResetPasswordRequest): Promise<ApiResponse<MobileResetPasswordApiResponse>> => {
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
    if (!resetData.firebase_token) {
      return {
        success: false,
        data: null,
        error: "Firebase token is required",
        message: "Firebase token field is required",
        code: 400
      };
    }

    if (!resetData.password) {
      return {
        success: false,
        data: null,
        error: "Password is required",
        message: "Password field is required",
        code: 400
      };
    }

    if (!resetData.confirm_password) {
      return {
        success: false,
        data: null,
        error: "Confirm password is required",
        message: "Confirm password field is required",
        code: 400
      };
    }

    // Validate password match
    if (resetData.password !== resetData.confirm_password) {
      return {
        success: false,
        data: null,
        error: "Passwords do not match",
        message: "Password and confirm password must match",
        code: 400
      };
    }

    // Validate password strength
    if (resetData.password.length < 6) {
      return {
        success: false,
        data: null,
        error: "Password is too short",
        message: "Password must be at least 6 characters long",
        code: 400
      };
    }

    // Build the API URL for mobile reset password
    const apiUrl = mobileResetPasswordApiRoute;

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add required fields
    formData.append('firebase_token', resetData.firebase_token);
    formData.append('password', resetData.password);
    formData.append('confirm_password', resetData.confirm_password);

    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: formData,
      timeout: 10000, // 10 second timeout for reset password requests
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
    console.error("Mobile Reset Password API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to reset password",
      code: err.response?.status || 500
    };
  }
}
import axiosClient from "../../axiosClient";
import { userExistsApiRoute } from '@/utils/apiRoutes';


// Interface for user exists request data structure
export interface UserExistsRequest {
  email?: string;
  mobile?: string;
  country_calling_code?: string;
}

// Interface for user exists response data structure
export interface UserExistsResponse {
  is_new_user: boolean;
}

// Interface for the actual API response structure
export interface UserExistsApiResponse {
  error: boolean;
  message: string;
  data: UserExistsResponse;
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


export const userExists = async (existsData: UserExistsRequest): Promise<ApiResponse<UserExistsApiResponse>> => {
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

    // Validate that either email or mobile is provided
    if (!existsData.email && !existsData.mobile) {
      return {
        success: false,
        data: null,
        error: "Either email or mobile is required",
        message: "Please provide either email or mobile number",
        code: 400
      };
    }

    // Validate email format if provided
    if (existsData.email && !isValidEmail(existsData.email)) {
      return {
        success: false,
        data: null,
        error: "Invalid email format",
        message: "Please provide a valid email address",
        code: 400
      };
    }

    // Validate mobile format if provided
    if (existsData.mobile && !isValidMobile(existsData.mobile)) {
      return {
        success: false,
        data: null,
        error: "Invalid mobile format",
        message: "Please provide a valid mobile number",
        code: 400
      };
    }

    // Build the API URL for user exists check
    const apiUrl = userExistsApiRoute;

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add fields only if they exist
    if (existsData.email) formData.append('email', existsData.email);
    if (existsData.mobile) formData.append('mobile', existsData.mobile);
    if (existsData.country_calling_code) formData.append('country_calling_code', existsData.country_calling_code);

    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: formData,
      timeout: 10000,
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
    console.error("User Exists API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to check user existence",
      code: err.response?.status || 500
    };
  }
}

/**
 * Helper function to validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to validate mobile number format
 * @param mobile - Mobile number string to validate
 * @returns Boolean indicating if mobile number is valid
 */
export const isValidMobile = (mobile: string): boolean => {
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
};
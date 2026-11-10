import axiosClient from "../axiosClient";
import { contactUsApiRoute } from "@/utils/apiRoutes";
// Interface for contact us data structure - matches the API request
export interface ContactUsData {
  first_name: string;
  email: string;
  message: string;
}

// Interface for the API response data structure
export interface ContactUsResponseData {
  id: number;
  first_name: string;
  email: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// Interface for the actual API response structure
export interface ContactUsApiResponse {
  error: boolean;
  message: string;
  data: ContactUsResponseData;
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


export const contactUs = async (
  contactData: ContactUsData,
): Promise<ApiResponse<ContactUsApiResponse>> => {
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
    if (!contactData.first_name) {
      return {
        success: false,
        data: null,
        error: "First name is required",
        message: "First name field is required",
        code: 400
      };
    }

    if (!contactData.email) {
      return {
        success: false,
        data: null,
        error: "Email is required",
        message: "Email field is required",
        code: 400
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      return {
        success: false,
        data: null,
        error: "Invalid email format",
        message: "Please enter a valid email address",
        code: 400
      };
    }

    if (!contactData.message) {
      return {
        success: false,
        data: null,
        error: "Message is required",
        message: "Message field is required",
        code: 400
      };
    }

    // Build the API URL for contact us
    const apiUrl = contactUsApiRoute;

    // Prepare the request data
    const requestData = {
      first_name: contactData.first_name,
      email: contactData.email,
      message: contactData.message
    };

    // Send the POST request to the backend API
    const response = await axiosClient(apiUrl, {
      method: 'POST',
      data: requestData,
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
    console.error("Contact Us API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to submit contact form",
      code: err.response?.status || 500
    };
  }
}

import axiosClient from "../axiosClient";
import { placeOrderApiRoute } from '@/utils/apiRoutes';


// Interface for place order request data
export interface PlaceOrderData {
  payment_method: string;
  course_id: string | number;
  buy_now: string | number;
  promo_code_id?: string | number;
  type: "web" | "app";
}

// Interface for cart checkout request data (no course_id needed)
export interface CartCheckoutData {
  payment_method: string;
  promo_code_ids?: (string | number)[];
}

// Interface for the API response data structure
export interface PlaceOrderResponseData {
  error: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  code: number;
}

// Standardized API response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string;
  code?: number;
}


// Cart checkout function (no course_id required)
export const cartCheckout = async (
  checkoutData: CartCheckoutData,
): Promise<ApiResponse<PlaceOrderResponseData>> => {
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
    if (!checkoutData.payment_method) {
      return {
        success: false,
        data: null,
        error: "Payment method is required",
        message: "Payment method field is required",
        code: 400
      };
    }


    // Create FormData for the request
    const formData = new FormData();
    formData.append('payment_method', checkoutData.payment_method);

    // Add promo code IDs if provided
    if (checkoutData.promo_code_ids && checkoutData.promo_code_ids.length > 0) {
      checkoutData.promo_code_ids.forEach((promoCodeId) => {
        formData.append('promo_code_ids[]', promoCodeId.toString());
      });
    }

    // Build the API URL for cart checkout
    const apiUrl = placeOrderApiRoute;

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

    console.error("Cart Checkout API Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        timeout: err.config?.timeout,
      },
    });

    return {
      success: false,
      data: null,
      error: err.message || "An unexpected error occurred",
      message: (err.response?.data as { message?: string })?.message || "Failed to checkout cart",
      code: err.response?.status || 500
    };
  }
};

export const placeOrder = async (
  orderData: PlaceOrderData,
): Promise<ApiResponse<PlaceOrderResponseData>> => {
  try {

    // Validate required fields
    // Allow empty string for free courses (payment_method can be empty string for free enrollment)
    // Only validate if payment_method is undefined or null
    if (orderData.payment_method === undefined || orderData.payment_method === null) {
      return {
        success: false,
        data: null,
        error: "Payment method is required",
        message: "Payment method field is required",
        code: 400
      };
    }

    if (!orderData.course_id) {
      return {
        success: false,
        data: null,
        error: "Course ID is required",
        message: "Course ID field is required",
        code: 400
      };
    }

    if (!orderData.buy_now) {
      return {
        success: false,
        data: null,
        error: "Buy now flag is required",
        message: "Buy now field is required",
        code: 400
      };
    }

    // Create FormData for the request (as per the API requirement)
    const formData = new FormData();
    formData.append('payment_method', orderData.payment_method);
    formData.append('course_id', orderData.course_id.toString());
    formData.append('buy_now', orderData.buy_now.toString());
    formData.append('type', "web");

    // Add promo code ID if provided
    if (orderData.promo_code_id) {
      formData.append('promo_code_id', orderData.promo_code_id.toString());
    }


    const response = await axiosClient.post<PlaceOrderResponseData>(
      placeOrderApiRoute,
      formData,
    );

    console.log('API response received:', response.data);

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
    console.error("Place Order API Error:", {
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
      message: (err.response?.data as { message?: string })?.message || "Failed to place order",
      code: err.response?.status || 500
    };
  }
}

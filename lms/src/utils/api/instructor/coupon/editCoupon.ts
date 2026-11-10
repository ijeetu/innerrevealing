import axiosClient from "../../axiosClient";
import { promoCodeApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for coupon edit form data structure (all fields optional for partial updates)
export interface CouponCreationFormData {
  promo_code?: string;
  message?: string;
  start_date?: string;
  end_date?: string;
  total_usage_limit?: number;
  no_of_repeat_usage?: number;
  minimum_order_amount?: number;
  discount?: number;
  discount_type?: 'percentage' | 'amount';
  course_ids?: number[];
  total_usage_per_user_limit?: number;
}

// Interface for coupon creation submission response structure
export interface CouponCreationSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Interface for the API response structure
export interface CouponCreationApiResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Edit coupon form data to the backend API
 * @param formData - FormData object containing coupon edit details
 * @param couponId - The ID of the coupon to edit
 * @returns Promise with standardized API response structure
 */
export const editCoupon = async (
  formData: FormData,
  couponId: number
): Promise<ApiResponse<CouponCreationSubmissionResponse>> => {
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

    // Create the API URL for coupon editing with all parameters as query params
    let apiUrl = promoCodeApiRoute;

    // Add all form data as query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('id', couponId.toString());

    // Add basic coupon fields as query parameters
    const basicFields = [
      'promo_code', 'message', 'start_date', 'end_date',
      'no_of_users', 'minimum_order_amount', 'discount',
      'discount_type', 'repeat_usage', 'max_discount_amount',
      'no_of_repeat_usage', 'total_usage_limit', 'total_usage_per_user_limit'
    ];

    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value) {
        queryParams.append(field, value.toString());
      }
    });

    // Handle course_ids array as query parameters
    const queryEntries = Array.from(formData.entries());
    const queryCourseIdsEntries = queryEntries.filter(([key]) => key.startsWith('course_ids['));
    if (queryCourseIdsEntries.length > 0) {
      queryCourseIdsEntries.forEach(([key, value]) => {
        queryParams.append(key, value.toString());
      });
    }

    // Append query parameters to URL
    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Add all form data to FormData as well (as shown in the curl command)
    apiFormData.append('id', couponId.toString());

    // Add basic coupon fields to FormData
    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value) {
        apiFormData.append(field, value);
      }
    });

    // Handle course_ids array in FormData
    const formEntries = Array.from(formData.entries());
    const formCourseIdsEntries = formEntries.filter(([key]) => key.startsWith('course_ids['));
    if (formCourseIdsEntries.length > 0) {
      formCourseIdsEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Send the form data to the backend API
    const response = await axiosClient.put(apiUrl, apiFormData);

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Coupon edit failed",
        message: response.data.message || "Coupon edit failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Coupon edited successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Edit Coupon API request failed:",
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
      message: "Failed to edit coupon",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param couponData - Object containing coupon edit details
 * @param couponId - The ID of the coupon to edit
 * @returns Promise with standardized API response structure
 */
export const editCouponWithData = async (
  couponData: CouponCreationFormData,
  couponId: number
): Promise<ApiResponse<CouponCreationSubmissionResponse>> => {
  try {
    // Create FormData from the provided coupon data
    const formData = new FormData();

    // Add only provided fields (partial update)
    console.log("couponData", couponData);
    formData.append("id", couponId.toString());
    if (couponData.promo_code !== undefined) formData.append("promo_code", couponData.promo_code);
    if (couponData.message !== undefined) formData.append("message", couponData.message);
    if (couponData.start_date !== undefined) formData.append("start_date", couponData.start_date);
    if (couponData.end_date !== undefined) formData.append("end_date", couponData.end_date);
    if (couponData.discount !== undefined) formData.append("discount", couponData.discount.toString());
    if (couponData.discount_type !== undefined) formData.append("discount_type", couponData.discount_type);
    if (couponData.total_usage_limit !== undefined) formData.append("total_usage_limit", couponData.total_usage_limit.toString());
    if (couponData.minimum_order_amount !== undefined) formData.append("minimum_order_amount", couponData.minimum_order_amount.toString());
    if (couponData.total_usage_per_user_limit !== undefined) formData.append("total_usage_per_user_limit", couponData.total_usage_per_user_limit.toString());
    if (couponData.course_ids && couponData.course_ids.length > 0) {
      couponData.course_ids.forEach((courseId) => {
        formData.append("course_ids[]", courseId.toString());
      });
    }

    console.log("formData", Object.fromEntries(formData.entries()));


    // Use the main submission function
    return await editCoupon(formData, couponId);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to edit coupon",
      code: errorCode
    };
  }
}
import axiosClient from "../axiosClient";
import { applyPromoCodeApiRoute } from "@/utils/apiRoutes";

// Interface for apply promo code request
export interface ApplyPromoCodeRequest {
  promo_code_id: string;
  course_id: string;
  promo_code: string;
}

// Interface for course in the response
export interface CourseWithPromoCode {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  display_price: number;
  display_discount_price: number;
  original_price: number;
  promo_discount: number;
  final_price: number;
  promo_code: {
    id: number;
    code: string;
    message: string;
    discount_type: 'percentage' | 'amount';
    discount_value: number;
    discount_amount: number;
  };
  tax_amount: number;
  total_tax_percentage: string;
  instructor: string;
  is_wishlisted: boolean;
}

// Interface for promo discount item
export interface PromoDiscountItem {
  course_id: number;
  course_title: string;
  promo_code: string;
  discount_amount: number;
}

// Interface for apply promo code response
export interface ApplyPromoCodeResponse {
  error: boolean;
  message: string;
  data?: {
    courses: CourseWithPromoCode[];
    total_display_price: number;
    subtotal_price: number;
    promo_discount: number;
    discount: number;
    total_price: number;
    promo_discounts: PromoDiscountItem[];
  };
  code: number;
}

export interface CalculationSummaryCoupon {
  total_display_price: number;
  subtotal_price: number;
  promo_discount: number;
  discount: number;
  total_price: number;
  original_price?: number;
  course_discount?: number;
  subtotal?: number;
  taxable_amount?: number;
  tax_percentage?: number;
  tax_amount?: number;
  total?: number;
}


// Standardized API response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string;
  code?: number;
}

/**
 * Apply promo code for a course
 * @param courseId - The ID of the course
 * @param promoCodeId - Single promo code ID to apply
 * @param promoCode - Promo code string (can be empty string)
 * @returns Promise with standardized API response structure
 */
export const applyPromoCode = async (
  courseId: number,
  promoCodeId: number,
  promoCode: string,
): Promise<ApiResponse<ApplyPromoCodeResponse['data']>> => {
  try {
    // Validate required parameters
    if (!courseId) {
      return {
        success: false,
        data: null,
        error: "Course ID is required",
        message: "Course ID is required",
        code: 400
      };
    }

    if (!promoCodeId) {
      return {
        success: false,
        data: null,
        error: "Promo code ID is required",
        message: "Promo code ID is required",
        code: 400
      };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('promo_code_id', promoCodeId.toString());
    formData.append('course_id', courseId.toString());
    formData.append('promo_code', promoCode || "");

    // Make API call to apply promo code
    const response = await axiosClient.post<ApplyPromoCodeResponse>(applyPromoCodeApiRoute, formData);

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Failed to apply promo code",
        message: response.data.message,
        code: response.data.code
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data.data || null,
      error: null,
      message: response.data.message || "Promo code applied successfully",
      code: response.data.code
    };

  } catch (error: unknown) {
    // Handle both HTTP errors and network errors
    const axiosError = error as { response?: { data?: ApplyPromoCodeResponse } };
    console.log("Error in applyPromoCode:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return {
        success: false,
        data: null,
        error: axiosError.response.data.message || "Failed to apply promo code",
        message: axiosError.response.data.message,
        code: axiosError.response.data.code
      };
    }

    // If it's a network error (no response), return generic error
    return {
      success: false,
      data: null,
      error: "Network error occurred while applying promo code",
      message: "Network error occurred while applying promo code",
      code: 500
    };
  }
};

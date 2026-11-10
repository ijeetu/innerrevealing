import axiosClient from "../axiosClient";
import { deletePromoCodeApiRoute, getCourseCouponsApiRoute } from "@/utils/apiRoutes";

// Interface for course coupon data structure (updated to match actual API response)
export interface CourseCoupon {
  id: number;
  promo_code: string;
  message: string;
  discount: number;
  discount_type: 'percentage' | 'amount';
  max_discount_amount: number;
  minimum_order_amount: number;
  start_date: string;
  end_date: string;
  created_by: string;
  creator_name?: string;
  instructor_name?: string;
  instructor_email?: string;
  no_of_users: number;
  repeat_usage: boolean;
  no_of_repeat_usage: number;
}

export interface CalculationSummary {
  original_price: string;
  total_discount: number;
  final_price: number;
  discount_percentage: number;
  promo_codes_applied: number;
  savings: number;
  total_display_price?: number;
  discount?: number;
  promo_discount?: number;
  total_price?: number;
}

// Interface for course data in coupon
export interface Course {
  id: number;
  title: string;
  slug: string;
  price: string;
  discount_price: string;
  image: string;
}

// Interface for course data in the response (updated to match new backend structure)
export interface CourseData {
  id: number;
  title: string;
  price: string;
  discount_price: string;
  instructor_name?: string;
}

// Interface for applicable promo codes structure
export interface ApplicablePromoCodes {
  instructor_promo_codes: CourseCoupon[];
  admin_promo_codes: CourseCoupon[];
  total_instructor_codes: number;
  total_admin_codes: number;
  total_all_codes: number;
}

// Interface for usage rules
export interface UsageRules {
  can_use_admin_and_instructor_together: boolean;
  admin_codes_apply_to_all_courses: boolean;
  instructor_codes_apply_only_to_their_courses: boolean;
  note: string;
}

// Interface for the complete API response data (updated to match new backend structure)
export interface CourseCouponsResponseData {
  course: CourseData;
  promo_codes: CourseCoupon[];
  total_codes: number;
}

// Interface for course coupons API response (updated to match actual structure)
export interface CourseCouponsApiResponse {
  error: boolean;
  message: string;
  data: CourseCouponsResponseData;
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

// Parameters for fetching course coupons
export interface GetCourseCouponsParams {
  course_id: number;
}

/**
 * Fetch available coupons for a specific course
 * @param params - Parameters containing course_id
 * @returns Promise with standardized API response structure containing course coupons
 */
export const getCourseCoupons = async (
  params: GetCourseCouponsParams
): Promise<ApiResponse<CourseCoupon[]>> => {
  try {
    const { course_id } = params;

    // Validate required parameters
    if (!course_id) {
      return {
        success: false,
        data: null,
        error: "Course ID is required",
        message: "Course ID is required",
        code: 400
      };
    }

    // Build query parameters
    const queryParams = {
      course_id: course_id
    };

    // Make API call to fetch course coupons
    const response = await axiosClient.get<CourseCouponsApiResponse>(`${deletePromoCodeApiRoute}${getCourseCouponsApiRoute}`, {
      params: queryParams,
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Failed to fetch course coupons",
        message: response.data.message,
        code: response.data.code
      };
    }

    // Return successful response - extract promo codes from the new structure
    const responseData = response.data.data;
    if (!responseData || !responseData.promo_codes || !Array.isArray(responseData.promo_codes)) {
      return {
        success: true,
        data: [],
        error: null,
        message: "No promo codes available for this course",
        code: response.data.code
      };
    }

    // Return promo codes array directly from the new structure
    return {
      success: true,
      data: responseData.promo_codes,
      error: null,
      message: response.data.message || "Course coupons fetched successfully",
      code: response.data.code
    };

  } catch (error: unknown) {
    // Handle both HTTP errors and network errors
    const axiosError = error as { response?: { data?: CourseCouponsApiResponse } };
    console.log("Error in getCourseCoupons:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return {
        success: false,
        data: null,
        error: axiosError.response.data.message || "Failed to fetch course coupons",
        message: axiosError.response.data.message,
        code: axiosError.response.data.code
      };
    }

    // If it's a network error (no response), return generic error
    return {
      success: false,
      data: null,
      error: "Network error occurred while fetching course coupons",
      message: "Network error occurred while fetching course coupons",
      code: 500
    };
  }
};

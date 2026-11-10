import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { promoCodesApiRoute } from "@/utils/apiRoutes";

// Interface for course data structure (nested in promo code)
export interface Course {
  id: number;
  title: string;
  slug: string;
  total_tax_percentage: number;
  display_price: number;
  display_discount_price: number;
  tax_amount: number;
  pivot: {
    promo_code_id: number;
    course_id: number;
  };
  taxes: Record<string, string | number>[];
}

// Interface for promo code data structure (matches actual API response)
export interface PromoCode {
  id: number;
  user_id: number;
  promo_code: string;
  message: string;
  start_date: string;
  end_date: string;
  total_usage_limit: number;
  minimum_order_amount: number;
  discount: number;
  discount_type: 'percentage' | 'amount';
  max_discount_amount: number;
  total_usage_per_user_limit: number;
  repeat_usage: boolean;
  no_of_repeat_usage: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  courses_count: number;
  remaining_count: number;
  courses: Course[];
}

// Use the common PaginatedApiResponse interface with PromoCode
export type PromoCodesResponse = PaginatedApiResponse<PromoCode>;

// Interface for search options
export interface GetPromoCodesParams {
  page?: number;
  per_page?: number;
  id?: number;
}

// fetch promo codes
export const getPromoCodes = async (
  params?: GetPromoCodesParams
): Promise<PromoCodesResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Only add parameters that are not undefined
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<PromoCodesResponse>(promoCodesApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: PromoCodesResponse } };
    console.log("Error in getPromoCodes:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

// Interface for single promo code response
export interface SinglePromoCodeResponse {
  error: boolean;
  message: string;
  data: PromoCode;
  code: number;
}

// fetch single promo code by ID
export const getPromoCodeById = async (
  couponId: number
): Promise<SinglePromoCodeResponse | null> => {
  try {
    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<SinglePromoCodeResponse>(promoCodesApiRoute, { params: { id: couponId } });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: SinglePromoCodeResponse } };
    console.log("Error in getPromoCodeById:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};
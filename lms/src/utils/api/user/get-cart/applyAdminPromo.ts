import axiosClient from "../../axiosClient";
import { cartApplyPromoApiRoute } from "@/utils/apiRoutes";

// Interface for promo code object in course data
export interface PromoCode {
  id: number;
  code: string;
  message: string;
  discount_type: "percentage" | "amount";
  discount_value: number;
  discount_amount: number;
}

// Interface for course object in cart data
export interface CartCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  display_price: number;
  display_discount_price: number;
  original_price: number;
  promo_discount: number;
  final_price: number;
  promo_code: PromoCode;
  tax_amount: number;
  total_tax_percentage: number;
  instructor: string;
  is_wishlisted: boolean;
}

// Interface for promo discount breakdown
export interface PromoDiscount {
  course_id: number;
  course_title: string;
  promo_code: string;
  discount_amount: number;
  created_by?: string;
  creator_name?: string;
}

// Interface for the cart data after applying promo code
export interface ApplyAdminPromoData {
  courses: CartCourse[];
  total_display_price: number;
  subtotal_price: number;
  promo_discount: number;
  discount: number;
  total_price: number;
  promo_discounts: PromoDiscount[];
}

// API response interface for apply admin promo
export interface ApplyAdminPromoApiResponse {
  error: boolean;
  message: string;
  data: ApplyAdminPromoData;
  code: number;
}

/**
 * Apply admin promo code to all courses in cart
 * @param promoCode - The promo code string to apply
 * @param promoCodeId - Optional promo code ID (if available)
 * @returns Promise with apply promo API response or null
 */
export const applyAdminPromo = async (
  promoCode: string,
  promoCodeId?: number
): Promise<ApplyAdminPromoApiResponse | null> => {
  try {
    // Create FormData for the request
    const apiFormData = new FormData();
    apiFormData.append("promo_code", promoCode);
    
    // Add promo_code_id if provided
    if (promoCodeId) {
      apiFormData.append("promo_code_id", promoCodeId.toString());
    }

    // Send the POST request to the backend API
    const response = await axiosClient.post<ApplyAdminPromoApiResponse>(
      cartApplyPromoApiRoute,
      apiFormData,
    );

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as {
      response?: { data?: ApplyAdminPromoApiResponse };
    };
    console.log("Error in applyAdminPromo:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};


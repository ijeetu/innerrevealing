import axiosClient from "../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { deletePromoCodeApiRoute, getCourseCouponsApiRoute } from "@/utils/apiRoutes";

// Interface for admin coupon data structure (matches API response)

export interface CouponResponse {
  course: AdminCoupon[] | null
  promo_codes: AdminCoupon[] | null
}
export interface AdminCoupon {
  id: number;
  user_id: number;
  promo_code: string;
  message: string;
  start_date: string;
  end_date: string;
  no_of_users: number;
  minimum_order_amount: number;
  discount: number;
  discount_type: "percentage" | "amount";
  max_discount_amount: number;
  repeat_usage: boolean;
  no_of_repeat_usage: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  discounted_amount: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetAdminCouponsResponse = ApiResponse<CouponResponse>;

/**
 * Fetch valid admin promo codes from the API
 * @returns Promise with admin coupons response or null
 */
export const getAdminCoupons = async (
): Promise<GetAdminCouponsResponse | null> => {
  try {
    // Make API call to fetch admin coupons
    const response = await axiosClient.get<GetAdminCouponsResponse>(
      `${deletePromoCodeApiRoute}${getCourseCouponsApiRoute}`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetAdminCouponsResponse } };
    console.log("Error in getAdminCoupons:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};


import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { ordersApiRoute } from "@/utils/apiRoutes";

// Interface for course data within an order
export interface OrderCourse {
  course_id: number;
  title: string;
  image: string;
  original_price: number;
  price: number;
  price_without_tax: number;
  discount_amount: number;
  tax_price: number;
  final_price: number;
  price_with_tax: number;
  course_current_price: number;
  course_type: string;
  creator_name: string;
  refund_enabled: boolean;
  refund_period_days: number;
  is_refund_eligible: boolean;
  refund_days_remaining: number;
  has_refund_request: boolean;
  refund_request_status: string | null;
  refund_request_id: number | null;
  refund_admin_notes: string | null;
  purchase_date: string;
}

// Interface for applied promo codes
export interface AppliedPromoCode {
  id: number | null;
  code: string;
  discount_amount: string;
  discount_type: string | null;
  discount_value: number | null;
}

// Interface for a single order
export interface Order {
  order_id: number;
  order_number: string;
  status: string;
  payment_method: string;
  total_price: number;
  tax_price: number;
  total_discount: number;
  final_total: number;
  refund_amount: number;
  transaction_date: string;
  transaction_date_formatted: string;
  transaction_date_human: string;
  courses: OrderCourse[];
  promo_code: AppliedPromoCode | null;
  created_at?: string;
  updated_at?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type GetOrdersResponse = ApiResponse<Order[]>;

/**
 * Fetch user orders from the API
 * @returns Promise with orders response or null
 */
export const getOrders = async (): Promise<GetOrdersResponse | null> => {
  try {
    const response = await axiosClient.get<GetOrdersResponse>(ordersApiRoute);
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetOrdersResponse } };
    console.log("Error in getOrders:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

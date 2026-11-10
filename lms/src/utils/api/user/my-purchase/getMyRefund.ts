import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { myRefundsApiRoute } from "@/utils/apiRoutes";

// Interface for course data within a refund response
export interface RefundCourse {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  thumbnail: string;
  intro_video: string;
  user_id: number;
  level: string;
  course_type: string;
  status: string;
  approval_status: string;
  price: string;
  discount_price: string;
  category_id: number;
  is_active: boolean;
  sequential_access: boolean; 
  certificate_enabled: boolean; 
  certificate_fee: string | null; 
  language_id: number;
  meta_title: string;
  meta_image: string;
  meta_description: string;
  meta_keywords: string | null;
  creator_name: string; 
  created_at: string; 
  updated_at: string; 
  deleted_at: string | null;
  total_tax_percentage: string; 
  display_price: number; 
  display_discount_price: number; 
  tax_amount: number; 
  taxes: unknown[]; 
}

// Interface for order data within a transaction
export interface RefundOrder {
  id: number;
  user_id: number;
  order_number: string; 
  total_price: string; 
  tax_price: string; 
  final_price: string; 
  payment_method: string; 
  promo_code_id: number | null; 
  discount_amount: string; 
  promo_code: string | null; 
  status: string; 
  created_at: string; 
  updated_at: string; 
}

// Interface for transaction data within a refund response
export interface RefundTransaction {
  id: number;
  user_id: number;
  order_id: number;
  transaction_id: string; 
  amount: string; 
  payment_method: string; 
  status: string; 
  message: string; 
  created_at: string; 
  updated_at: string; 
  order: RefundOrder; 
}

// Interface for a single refund request item
export interface RefundItem {
  id: number;
  user_id: number;
  course_id: number;
  transaction_id: number;
  refund_amount: string; 
  status: string; 
  reason: string; 
  admin_notes: string | null; 
  purchase_date: string; 
  request_date: string; 
  processed_at: string | null; 
  processed_by: number | null; 
  created_at: string; 
  updated_at: string; 
  course: RefundCourse; 
  transaction: RefundTransaction; 
  user_media_url: string | null; 
}

// Interface for query parameters when fetching refunds
export interface GetMyRefundParams {
  per_page?: number; 
  page?: number; 
}

// Type for the paginated refund response
export type GetMyRefundResponse = PaginatedApiResponse<RefundItem>;

/**
 * Fetch user refund requests from the API with pagination support
 * @param params - Optional query parameters for pagination (per_page, page)
 * @returns Promise with refunds response or null on error
 */
export const getMyRefund = async (
  params?: GetMyRefundParams
): Promise<GetMyRefundResponse | null> => {
  try {
    // Build query parameters object (only include defined parameters)
    // This ensures only per_page is sent if that's the only parameter provided
    const queryParams: Record<string, number> = {};
    
    // Add per_page parameter if provided
    if (params?.per_page !== undefined) {
      queryParams.per_page = params.per_page;
    }
    
    // Add page parameter if provided (optional, for future pagination support)
    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }

    // Make API request using axios params option (consistent with other API functions)
    const response = await axiosClient.get<GetMyRefundResponse>(myRefundsApiRoute, {
      params: queryParams,
    });
    
    return response.data;
  } catch (error) {
    // Handle errors gracefully
    const axiosError = error as { response?: { data?: GetMyRefundResponse } };
    console.log("Error in getMyRefund:", axiosError?.response?.data);
    
    // Return error response if available, otherwise return null
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { walletHistoryApiRoute } from "@/utils/apiRoutes";

// Interface for course data within a refund reference
export interface RefundReferenceCourse {
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  total_tax_percentage: string;
  display_price: number;
  display_discount_price: number;
  tax_amount: number;
  taxes: unknown[];
}

// Interface for refund request reference data
export interface RefundRequestReference {
  id: number;
  user_id: number;
  course_id: number;
  transaction_id: number;
  refund_amount: string;
  status: string;
  reason: string;
  user_media: string | null;
  admin_notes: string | null;
  admin_receipt: string | null;
  purchase_date: string;
  request_date: string;
  processed_at: string | null;
  processed_by: number | null;
  created_at: string;
  updated_at: string;
  course: RefundReferenceCourse;
}

// Interface for commission reference data
export interface CommissionReference {
  id: number;
  order_id: number;
  course_id: number;
  instructor_id: number;
  instructor_type: string;
  course_price: string;
  discounted_price: string;
  admin_commission_rate: string;
  admin_commission_amount: string;
  instructor_commission_rate: string;
  instructor_commission_amount: string;
  status: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
}

// Interface for payment details in withdrawal requests
export interface WithdrawalPaymentDetails {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  other_details: string;
}

// Interface for withdrawal request reference data
export interface WithdrawalRequestReference {
  id: number;
  user_id: number;
  entry_type: string;
  amount: string;
  status: string;
  payment_method: string;
  payment_details: WithdrawalPaymentDetails;
  notes: string;
  admin_notes: string | null;
  processed_at: string | null;
  processed_by: number | null;
  created_at: string;
  updated_at: string;
}

// Union type for all possible reference types
export type WalletTransactionReference =
  | RefundRequestReference
  | CommissionReference
  | WithdrawalRequestReference;

// Interface for wallet transaction data
export interface WalletTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: "credit" | "debit";
  transaction_type: string;
  order_number: string;
  entry_type: string;
  reference_id: string;
  reference_type: string;
  description: string;
  balance_before: string;
  balance_after: string;
  created_at: string;
  updated_at: string;
  course_name: string | null;
  transaction_id: number | null;
  transaction_date: string;
  status: string | null;
  payment_method: string | null;
  payment_details: WithdrawalPaymentDetails | null;
  type_label: string;
  transaction_type_label: string;
  created_at_formatted: string;
  time_ago: string;
  reference: WalletTransactionReference;
}

export interface WithdrawalRequest {
  is_withdrawal_request_pending: boolean;
}

// Interface for query parameters when fetching wallet history
export interface GetWalletHistoryParams {
  per_page?: number;
  page?: number;
}

// Type for the paginated wallet history response
export type GetWalletHistoryResponse = PaginatedApiResponse<WalletTransaction>;

/**
 * Fetch user wallet transaction history from the API with pagination support
 * @param params - Optional query parameters for pagination (per_page, page)
 * @returns Promise with wallet history response or null on error
 */
export const getWalletHistory = async (
  params?: GetWalletHistoryParams
): Promise<GetWalletHistoryResponse | null> => {
  try {
    // Build query parameters object (only include defined parameters)
    // This ensures only per_page is sent if that's the only parameter provided
    const queryParams: Record<string, number> = {};

    // Add per_page parameter if provided
    if (params?.per_page !== undefined) {
      queryParams.per_page = params.per_page;
    }

    // Add page parameter if provided
    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }

    // Make API request using axios params option (consistent with other API functions)
    const response = await axiosClient.get<GetWalletHistoryResponse>(walletHistoryApiRoute, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle errors gracefully
    const axiosError = error as { response?: { data?: GetWalletHistoryResponse } };
    console.log("Error in getWalletHistory:", axiosError?.response?.data);

    // Return error response if available, otherwise return null
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

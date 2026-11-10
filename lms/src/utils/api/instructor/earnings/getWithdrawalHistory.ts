import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { withdrawalHistoryApiRoute } from "@/utils/apiRoutes";

// TypeScript interfaces for withdrawal history response data structure
export interface BankDetails {
    account_holder_name: string | null;
    account_number: string | null;
    bank_name: string | null;
    routing_number: string | null;
}

export interface WithdrawalItem {
    id: number;
    amount: string;
    formatted_amount: string;
    status: string;
    status_label: string;
    requested_at: string;
    processed_at: string;
    notes: string | null;
    payment_method: string;
    bank_details: BankDetails;
}

export interface PaginationData {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
}

export interface AmountData {
    value: string;
    formatted_value: string;
}

export interface WithdrawalHistoryData {
    withdrawals: WithdrawalItem[];
    available_to_withdraw: AmountData;
    total_withdrawal: AmountData;
    pagination: PaginationData;
}

// Use the common ApiResponse interface for consistent response handling
export type GetWithdrawalHistoryResponse = ApiResponse<WithdrawalHistoryData>;

export interface GetWithdrawalHistoryParams {
    per_page?: number;
    page?: number;
}

/**
 * Fetch instructor withdrawal history from the API
 * @param params - Parameters for fetching withdrawal history ( per_page, page)
 * @returns Promise with withdrawal history response or null
 */
export const getWithdrawalHistory = async (params: GetWithdrawalHistoryParams): Promise<GetWithdrawalHistoryResponse | null> => {
    try {
        const { ...queryParams } = params;

        const queryParamsObj: Record<string, string> = {};

        // Optional parameters - only add if they exist
        if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page.toString();
        if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page.toString();

        // Send GET request to withdrawal-history endpoint
        const response = await axiosClient.get<GetWithdrawalHistoryResponse>(withdrawalHistoryApiRoute, { params: queryParamsObj });

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: GetWithdrawalHistoryResponse } };
        console.log("Error in getWithdrawalHistory:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { walletWithdrawalRequestApiRoute } from "@/utils/apiRoutes";

// Interface for wallet withdrawal request response data
export interface WalletWithdrawalResponseData {
    error?: boolean;
    message: string;
    details?: string;
    code?: number;
    data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type WalletWithdrawalResponse = ApiResponse<WalletWithdrawalResponseData>;

// Interface for payment details (nested structure for bank transfer)
export interface PaymentDetails {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc_code: string;
}

// Interface for API parameters (matches the API documentation)
export interface WalletWithdrawalParams {
    amount: number;
    payment_method: string; // e.g., "bank_transfer"
    payment_details: PaymentDetails;
    entry_type: string; // e.g., "user"
}

/**
 * Create a wallet withdrawal request
 * @param params - Parameters for the withdrawal request
 * @returns Promise with withdrawal request data or null if error
 */
export const createWalletWithdrawalRequest = async (
    params: WalletWithdrawalParams
): Promise<WalletWithdrawalResponse | null> => {
    try {
        // Create FormData object for the POST request
        const formData = new FormData();

        // Add required parameters to FormData
        formData.append('amount', params.amount.toString());
        formData.append('payment_method', params.payment_method);
        formData.append('entry_type', params.entry_type);

        // Add nested payment_details fields
        formData.append('payment_details[account_holder_name]', params.payment_details.account_holder_name);
        formData.append('payment_details[account_number]', params.payment_details.account_number);
        formData.append('payment_details[bank_name]', params.payment_details.bank_name);
        formData.append('payment_details[other_details]', params.payment_details.ifsc_code);

        // Send the POST request to the backend API with FormData
        // Endpoint matches the API documentation: walletWithdrawalRequestApiRoute
        const response = await axiosClient.post<WalletWithdrawalResponse>(walletWithdrawalRequestApiRoute, formData, {
            timeout: 30000, // Increased timeout for file uploads
        });

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: WalletWithdrawalResponse } };
        console.log("Error in createWalletWithdrawalRequest:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};
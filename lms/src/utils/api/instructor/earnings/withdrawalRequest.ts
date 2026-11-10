import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { withdrawalRequestApiRoute } from "@/utils/apiRoutes";

// Interface for withdrawal response data
export interface WithdrawalResponseData {
  withdrawal_request: {
    id: number;
    amount: number;
    payment_method: string;
    payment_details: {
      account_holder_name: string;
      account_number: string;
      bank_name: string;
      ifsc_code: string;
    };
    notes?: string;
    status: string;
    created_at: string;
  };
}

// Use the common ApiResponse interface for consistent response handling
export type WithdrawalRequestResponse = ApiResponse<WithdrawalResponseData>;

// Interface for API parameters (matches the API documentation)
export interface WithdrawalRequestParams {
  amount: number;
  payment_method: string;
  payment_details: {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc_code: string;
  };
  notes?: string;
}

/**
 * Create a withdrawal request from the API
 * @param params - Parameters for the withdrawal request
 * @returns Promise with withdrawal request data or null if error
 */
export const createWithdrawalRequest = async (
  params: WithdrawalRequestParams
): Promise<WithdrawalRequestResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData
    formData.append('amount', params.amount.toString());
    formData.append('payment_method', params.payment_method);

    // Add payment details to FormData
    formData.append('payment_details[account_holder_name]', params.payment_details.account_holder_name);
    formData.append('payment_details[account_number]', params.payment_details.account_number);
    formData.append('payment_details[bank_name]', params.payment_details.bank_name);
    formData.append('payment_details[ifsc_code]', params.payment_details.ifsc_code);

    // Add optional notes if provided
    if (params.notes) {
      formData.append('notes', params.notes);
    }

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.post<WithdrawalRequestResponse>(withdrawalRequestApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: WithdrawalRequestResponse } };
    console.log("Error in createWithdrawalRequest:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

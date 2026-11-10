import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { billingDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for billing details response data
export interface BillingDetailsResponseData {
    error?: boolean;
    message: string;
    details?: string;
    code?: number;
    data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type BillingDetailsResponse = ApiResponse<BillingDetailsResponseData>;

// Interface for API parameters (matches the API documentation)
export interface BillingDetailsParams {
    first_name: string;
    last_name: string;
    country_code: string;
    address: string;
    city: string;
    state: string;
    postal_code?: string;
    tax_id?: string;
}

/**
 * Edit billing details
 * @param params - Parameters for the billing details
 * @returns Promise with billing details response data or null if error
 */
export const editBillingDetails = async (
    params: BillingDetailsParams
): Promise<BillingDetailsResponse | null> => {
    try {
        // Create FormData object for the PATCH request
        const formData = new FormData();

        // Add required parameters to FormData
        formData.append('first_name', params.first_name);
        formData.append('last_name', params.last_name);
        formData.append('country_code', params.country_code);
        formData.append('address', params.address);
        formData.append('city', params.city);
        formData.append('state', params.state);
        formData.append('postal_code', params.postal_code || "");
        formData.append('tax_id', params.tax_id || "");

        // Send the PATCH request to the backend API with FormData
        // Endpoint matches the API documentation: billingDetailsApiRoute
        const response = await axiosClient.patch<BillingDetailsResponse>(billingDetailsApiRoute, formData, {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: BillingDetailsResponse } };
        console.log("Error in editBillingDetails:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};
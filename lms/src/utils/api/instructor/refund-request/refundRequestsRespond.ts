import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { refundRequestsApiRoute } from "@/utils/apiRoutes";

// Interface for refund request respond response data
export interface RefundRequestRespondData {
    // Define specific response properties if known, or leave generic
    // Based on other APIs, it might verify success
}

// Use the common ApiResponse interface for consistent response handling
export type RefundRequestRespondResponse = ApiResponse<RefundRequestRespondData>;

// Interface for API parameters
export interface RefundRequestRespondParams {
    id: string | number;
    recommendation: "approve" | "reject" | string;
    comment?: string;
    media?: File | string | null;
}

/**
 * Respond to a refund request
 * @param params - Parameters for the refund request response
 * @returns Promise with response data or null if error
 */
export const respondToRefundRequest = async (
    params: RefundRequestRespondParams
): Promise<RefundRequestRespondResponse | null> => {
    try {
        // Create FormData object for the POST request
        const formData = new FormData();

        // Add required parameters to FormData
        formData.append('recommendation', params.recommendation);

        if (params.comment) {
            formData.append('comment', params.comment);
        } else {
            formData.append('comment', "");
        }

        if (params.media) {
            formData.append('media', params.media);
        } else {
            formData.append('media', "");
        }

        // Send the POST request to the backend API with FormData
        const response = await axiosClient.post<RefundRequestRespondResponse>(
            `${refundRequestsApiRoute}/${params.id}/respond`,
            formData
        );

        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: RefundRequestRespondResponse } };
        console.log("Error in respondToRefundRequest:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

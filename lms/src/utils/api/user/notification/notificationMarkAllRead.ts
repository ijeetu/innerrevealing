import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { notificationsMarkAllReadApiRoute } from "@/utils/apiRoutes";

// Interface for mark all read response data
export interface MarkAllReadResponseData {
    message?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type MarkAllReadResponse = ApiResponse<MarkAllReadResponseData>;

/**
 * Mark all notifications as read
 * @returns Promise with response data or null if error
 */
export const MarkAllNotificationsAsRead = async (
): Promise<MarkAllReadResponse | null> => {
    try {
        // Create FormData object for the POST request
        const formData = new FormData();

        // No parameters needed for this endpoint, but we use FormData for consistency
        // with other API calls in the same pattern

        // Send the POST request to the backend API with FormData
        // Using the correct endpoint from the API documentation
        const response = await axiosClient.post<MarkAllReadResponse>(notificationsMarkAllReadApiRoute, formData);

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: MarkAllReadResponse } };
        console.log("Error in markAllNotificationsAsRead:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

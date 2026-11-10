import axiosClient from "../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { notificationsMarkReadApiRoute } from "@/utils/apiRoutes";

// Interface for notification mark read response data
export interface NotificationMarkReadData {
    message: string;
    data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type NotificationMarkReadResponse = ApiResponse<NotificationMarkReadData>;

/**
 * Mark single or multiple notifications as read
 * @param notificationIds - Single notification ID (string) or array of notification IDs
 * @returns Promise with notification mark read response or null if error
 */
export const markNotificationsAsRead = async (
    notificationIds: string | string[]
): Promise<NotificationMarkReadResponse | null> => {
    try {
        // Create FormData for the backend API
        const formData = new FormData();

        // Handle both single notification ID and array of notification IDs
        if (Array.isArray(notificationIds)) {
            // Multiple notification IDs - append each as an array element
            notificationIds.forEach((id, index) => {
                formData.append(`notification_id[${index}]`, id);
            });
        } else {
            // Single notification ID
            formData.append("notification_id", notificationIds);
        }

        // Send the form data to the backend API
        const response = await axiosClient.post<NotificationMarkReadResponse>(
            notificationsMarkReadApiRoute,
            formData
        );

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: NotificationMarkReadResponse } };
        console.log("Error in markNotificationsAsRead:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

/**
 * Mark a single notification as read
 * @param notificationId - Single notification ID
 * @returns Promise with notification mark read response or null if error
 */
export const markNotificationAsRead = async (
    notificationId: string
): Promise<NotificationMarkReadResponse | null> => {
    return markNotificationsAsRead(notificationId);
};

/**
 * Mark all notifications as read
 * @param allNotificationIds - Array of all notification IDs to mark as read
 * @returns Promise with notification mark read response or null if error
 */
export const markAllNotificationsAsRead = async (
    allNotificationIds: string[]
): Promise<NotificationMarkReadResponse | null> => {
    return markNotificationsAsRead(allNotificationIds);
};

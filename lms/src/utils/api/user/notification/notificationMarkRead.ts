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
        const response = await axiosClient.post<NotificationMarkReadResponse>(notificationsMarkReadApiRoute, { notification_id: notificationIds });

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

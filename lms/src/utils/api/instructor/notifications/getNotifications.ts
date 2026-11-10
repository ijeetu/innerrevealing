import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse, PaginationLink } from "@/types/instructorTypes/instructorTypes";
import { notificationsApiRoute } from "@/utils/apiRoutes";

// TypeScript interfaces for notifications response data structure
export interface NotificationItem {
    id: string;
    type: "global" | "personal";
    title: string;
    message: string;
    notification_type: "url" | "instructor" | "course" | "default" | "team_invitation";
    type_id: string | null;
    type_link: string | null;
    image: string | null;
    date_sent: string;
    date_sent_formatted: string;
    time_ago: string;
    is_read: boolean;
    read_at: string | null;
    slug: string | null;
    invitation_status: string | null;
}


export interface NotificationsPagination {
    current_page: number;
    data: NotificationItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
    unread_count: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetNotificationsResponse = ApiResponse<NotificationsPagination>;

export interface GetNotificationsParams {
    team_user_slug?: string;
    per_page?: number;
    page?: number;
}

/**
 * Fetch instructor notifications from the API
 * @param params - Parameters for fetching notifications (team_user_slug, per_page, page)
 * @returns Promise with notifications response or null
 */
export const getNotifications = async (params: GetNotificationsParams): Promise<GetNotificationsResponse | null> => {
    try {
        // query parameters
        const { ...queryParams } = params;

        const queryParamsObj: Record<string, string> = {};

        // Optional parameters - only add if they exist
        if (queryParams?.team_user_slug !== undefined) queryParamsObj.team_user_slug = queryParams.team_user_slug;
        if (queryParams?.per_page !== undefined) queryParamsObj.per_page = queryParams.per_page.toString();
        if (queryParams?.page !== undefined) queryParamsObj.page = queryParams.page.toString();

        // Send GET request to notifications endpoint
        const response = await axiosClient.get<GetNotificationsResponse>(notificationsApiRoute, { params: queryParamsObj });

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: GetNotificationsResponse } };
        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

import axiosClient from "../../axiosClient";
import { ApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { notificationsApiRoute } from "@/utils/apiRoutes";

// Interface for instructor details in team invitation notifications
// Based on actual API response - only includes fields that are returned
export interface InstructorDetails {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  profile: string;
}

// Interface for team member in team invitation notifications
// team_members is now a single object (not an array) containing invitation details
export interface TeamMember {
  id: number;
  instructor_id: number;
  user_id: number;
  status: string;
  invitation_token: string;
  created_at: string;
  updated_at: string;
}

// Interface for notification data structure based on actual API response
export interface Notification {
  id: string;
  type: "global" | "personal";
  title: string;
  message: string;
  notification_type: "url" | "instructor" | "course" | "default" | "team_invitation";
  type_id: number | string | null;
  type_link: string | null;
  slug: string | null;
  image: string | null;
  date_sent: string;
  date_sent_formatted: string;
  time_ago: string;
  is_read: boolean;
  read_at: string | null;
  invitation_status: string | null;
  // Optional fields for personal notifications (team invitations)
  instructor_details?: InstructorDetails | null;
  // team_members can be a single object, an empty array, or null
  team_members?: TeamMember | null;
}

// Interface for query parameters
export interface GetNotificationParams {
  page?: number;
  per_page?: number;
}

// Extended pagination data for notifications that includes unread_count
export interface NotificationPaginatedData extends PaginatedData<Notification> {
  unread_count: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetNotificationResponse = ApiResponse<NotificationPaginatedData>;

/**
 * Fetch notifications from the API with optional filtering parameters
 * @param params - Optional query parameters for filtering notifications
 * @returns Promise with notification response or null
 */
export const getNotification = async (params: GetNotificationParams = {}): Promise<GetNotificationResponse | null> => {
  try {
    const { ...queryParams } = params;

    const response = await axiosClient.get<GetNotificationResponse>(notificationsApiRoute, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetNotificationResponse } };
    console.log("Error in getNotification:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

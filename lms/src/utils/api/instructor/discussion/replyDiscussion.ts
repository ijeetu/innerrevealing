import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { replyDiscussionApiRoute } from "@/utils/apiRoutes";
import { DiscussionDataType } from "./getDiscussion";

// Interface for reply response data
export interface ReplyResponseData {
  reply: DiscussionDataType;
}

// Use the common ApiResponse interface for consistent response handling
export type ReplyDiscussionResponse = ApiResponse<ReplyResponseData>;

// Interface for API parameters (matches the API documentation)
export interface ReplyDiscussionParams {
  discussion_id: number;
  message: string;
}

/**
 * Reply to a discussion from the API
 * @param params - Parameters for the reply request
 * @returns Promise with reply data or null if error
 */
export const replyDiscussion = async (
  params: ReplyDiscussionParams
): Promise<ReplyDiscussionResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData
    formData.append('discussion_id', params.discussion_id.toString());
    formData.append('message', params.message);

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.post<ReplyDiscussionResponse>(replyDiscussionApiRoute, formData,);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: ReplyDiscussionResponse } };
    console.log("Error in replyDiscussion:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

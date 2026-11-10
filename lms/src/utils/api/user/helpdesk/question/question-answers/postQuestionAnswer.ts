import axiosClient from "@/utils/api/axiosClient";
import { helpdeskQuestionReplyApiRoute } from "@/utils/apiRoutes";

// Interface for question answer response data structure
export interface PostQuestionAnswerResponseData {
  id: number;
  question_id: number;
  user_id: number;
  reply: string;
  created_at: string;
  updated_at: string;
}

// Interface for the API response structure
export interface PostQuestionAnswerApiResponse {
  error: boolean;
  message: string;
  data: PostQuestionAnswerResponseData;
  code: number;
}

// Interface for API parameters (matches the API request)
export interface PostQuestionAnswerData {
  question_id: number;
  reply: string;
}

/**
 * Post a question answer/reply to the helpdesk API
 * @param answerData - Parameters for the answer request (question_id and reply)
 * @returns Promise with reply data or null if error
 */
export const postQuestionAnswer = async (
  answerData: PostQuestionAnswerData
): Promise<PostQuestionAnswerApiResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData
    formData.append('question_id', answerData.question_id.toString());
    formData.append('reply', answerData.reply);

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.post<PostQuestionAnswerApiResponse>(helpdeskQuestionReplyApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: PostQuestionAnswerApiResponse } };
    console.log("Error in postQuestionAnswer:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};
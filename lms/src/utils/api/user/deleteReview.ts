import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { ratingDeleteApiRoute } from "@/utils/apiRoutes";

// Interface for the API response structure
export interface DeleteReviewApiResponse {
  error: boolean;
  message: string;
  data: Record<string, unknown>;
  code: number;
}

/**
 * Delete a review/rating from the API
 * @param ratingId - ID of the rating/review to delete
 * @returns Promise with delete review response or null
 */
export const deleteReview = async (
  ratingId: number,
): Promise<ApiResponse<DeleteReviewApiResponse> | null> => {
  try {

    // Validate rating ID
    if (!ratingId) {
      console.log("Error in deleteReview: Rating ID is required");
      return null;
    }

    // Send the DELETE request to the backend API
    // The API expects rating_id as a query parameter
    const response = await axiosClient.delete<DeleteReviewApiResponse>(
      `${ratingDeleteApiRoute}?rating_id=${ratingId}`,
    );

    return {
      data: response.data,
      error: response.data.error ? response.data.message : null,
      message: response.data.message,
      code: response.data.code,
    };
  } catch (error) {
    const axiosError = error as { response?: { data?: DeleteReviewApiResponse } };
    console.log("Error in deleteReview:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return {
        data: axiosError.response.data,
        error: axiosError.response.data.error
          ? axiosError.response.data.message
          : null,
        message: axiosError.response.data.message,
        code: axiosError.response.data.code,
      };
    }
    return null;
  }
};

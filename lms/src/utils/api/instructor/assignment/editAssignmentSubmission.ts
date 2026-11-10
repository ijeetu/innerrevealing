import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { editAssignmentSubmissionApiRoute } from "@/utils/apiRoutes";

// Interface for edit assignment submission parameters (matches API documentation)
export interface EditAssignmentSubmissionParams {
  submission_id: number;
  status: 'accepted' | 'rejected';
  points: number;
  feedback: string;
}

// Use the generic API response interface from instructor types
export type EditAssignmentSubmissionResponse = ApiResponse<Record<string, string | number>>;

/**
 * Update assignment submission status and points
 * @param params - Parameters for updating the assignment submission
 * @returns Promise with update response or null if error
 */
export const editAssignmentSubmission = async (
  params: EditAssignmentSubmissionParams
): Promise<EditAssignmentSubmissionResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    // Add required parameters
    queryParams.submission_id = params.submission_id;
    queryParams.status = params.status;

    // Add optional parameters if provided
    if (params.points !== undefined && params.points !== null) {
      queryParams.points = params.points;
    }

    if (params.feedback !== undefined && params.feedback !== null) {
      queryParams.feedback = params.feedback;
    }

    // Send the PUT request to the backend API with query parameters
    const response = await axiosClient.put<EditAssignmentSubmissionResponse>(editAssignmentSubmissionApiRoute, null, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: EditAssignmentSubmissionResponse } };
    console.log("Error in editAssignmentSubmission:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;    
  }
};

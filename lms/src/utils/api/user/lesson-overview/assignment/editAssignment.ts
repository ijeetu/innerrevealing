import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { assignmentSubmissionApiRoute } from "@/utils/apiRoutes";

// Interface for edit assignment submission response data
export interface EditAssignmentSubmissionResponseData {
  message: string;
  submission_id?: number;
  status?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type EditAssignmentSubmissionResponse = ApiResponse<EditAssignmentSubmissionResponseData>;

// Interface for edit assignment submission parameters (matches the API documentation)
export interface EditAssignmentSubmissionParams {
  id: number; // Required: submission ID to edit
  files?: File[]; // Optional: Array of files to upload
  comment?: string; // Optional: Updated comment for the submission
}

/**
 * Edit/update an existing assignment submission
 * @param params - Parameters for editing the assignment submission
 * @returns Promise with updated submission data or null if error
 */
export const editAssignmentSubmission = async (
  params: EditAssignmentSubmissionParams
): Promise<EditAssignmentSubmissionResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required id parameter (submission ID to edit)
    formData.append('id', params.id.toString());

    // Add optional comment if provided
    if (params.comment) {
      formData.append('comment', params.comment);
    }

    // Add optional files if provided
    if (params.files && params.files.length > 0) {
      params.files.forEach((file) => {
        formData.append('files[]', file);
      });
    }

    // Send the POST request to the backend API with FormData
    // Endpoint: assignmentSubmissionApiRoute (as per API documentation)
    const response = await axiosClient.post<EditAssignmentSubmissionResponse>(assignmentSubmissionApiRoute, formData);

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

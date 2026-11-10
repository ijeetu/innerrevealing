import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { assignmentSubmitApiRoute } from "@/utils/apiRoutes";

// Interface for assignment submission response data
export interface AssignmentSubmissionResponseData {
  message: string;
  submission_id?: number;
  status?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type AssignmentSubmissionResponse = ApiResponse<AssignmentSubmissionResponseData>;

// Interface for assignment submission parameters (matches the API documentation)
export interface AssignmentSubmissionParams {
  assignment_id: number;
  files?: File[]; // Array of files to upload
  comment?: string; // Optional comment for the submission
  urls?: string[]; // Optional array of URLs
}

/**
 * Submit an assignment to the API
 * @param params - Parameters for the assignment submission
 * @returns Promise with submission data or null if error
 */
export const submitAssignment = async (
  params: AssignmentSubmissionParams
): Promise<AssignmentSubmissionResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required assignment_id parameter
    formData.append('assignment_id', params.assignment_id.toString());

    // Add optional files if provided
    if (params.files && params.files.length > 0) {
      params.files.forEach((file) => {
        formData.append('files[]', file);
      });
    }

    // Add optional comment if provided
    if (params.comment) {
      formData.append('comment', params.comment);
    }

    // Add optional URLs if provided
    if (params.urls && params.urls.length > 0) {
      params.urls.forEach((url) => {
        formData.append('urls[]', url);
      });
    }

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation
    const response = await axiosClient.post<AssignmentSubmissionResponse>(assignmentSubmitApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: AssignmentSubmissionResponse } };
    console.log("Error in submitAssignment:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

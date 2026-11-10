import axiosClient from "@/utils/api/axiosClient";
import { courseChaptersCurriculumDestroyApiRoute } from "@/utils/apiRoutes";

// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for curriculum deletion request data
export interface CurriculumDeletionData {
  id: number;
  type: 'lecture' | 'quiz' | 'assignment' | 'document';
}

// Interface for curriculum deletion response structure
export interface CurriculumDeletionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Delete curriculum item from the backend API
 * @param deletionData - Object containing curriculum deletion details
 * @returns Promise with standardized API response structure
 */
export const deleteCurriculumItem = async (
  deletionData: CurriculumDeletionData,
): Promise<ApiResponse<CurriculumDeletionResponse>> => {
  try {

    // Validate required fields
    if (!deletionData.id) {
      return {
        success: false,
        data: null,
        error: "Curriculum item ID is required",
        message: "Curriculum item ID is required",
        code: 400
      };
    }

    if (!deletionData.type) {
      return {
        success: false,
        data: null,
        error: "Curriculum item type is required",
        message: "Curriculum item type is required",
        code: 400
      };
    }

    // Get endpoint from environment variables
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;

    if (!endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_END_POINT",
        message: "API configuration missing: NEXT_PUBLIC_END_POINT",
        code: 500
      };
    }

    // Create the API endpoint path with query parameters
    const apiEndpoint = `${courseChaptersCurriculumDestroyApiRoute}?id=${deletionData.id}&type=${deletionData.type}`;

    // Create FormData for the request body (as shown in the image)
    const formData = new FormData();
    formData.append('id', deletionData.id.toString());
    formData.append('type', deletionData.type);

    // Send the DELETE request to the backend API
    const response = await axiosClient.delete(apiEndpoint, {
      data: formData
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Curriculum item deletion failed",
        message: response.data.message || "Curriculum item deletion failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Curriculum item deleted successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Delete Curriculum Item API request failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to delete curriculum item",
      code: errorCode
    };
  }
}

/**
 * Helper function to delete curriculum item with individual parameters
 * @param id - Curriculum item ID
 * @param type - Curriculum item type (lecture, quiz, assignment, document)
 * @returns Promise with standardized API response structure
 */
export const deleteCurriculumItemById = async (
  id: number,
  type: 'lecture' | 'quiz' | 'assignment' | 'document'
): Promise<ApiResponse<CurriculumDeletionResponse>> => {
  const deletionData: CurriculumDeletionData = {
    id,
    type
  };

  return await deleteCurriculumItem(deletionData);
}

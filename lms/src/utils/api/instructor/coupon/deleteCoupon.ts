
import axiosClient from "../../axiosClient";
import { deletePromoCodeApiRoute } from "@/utils/apiRoutes";

// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for coupon deletion data structure
export interface CouponDeletionData {
  id: number;
}

// Interface for coupon deletion submission response structure
export interface CouponDeletionSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Interface for the API response structure
export interface CouponDeletionApiResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Delete coupon from the backend API
 * @param couponId - ID of the coupon to delete
 * @returns Promise with standardized API response structure
 */
export const deleteCoupon = async (
  couponId: number,
): Promise<ApiResponse<CouponDeletionSubmissionResponse>> => {
  try {

    // Get API URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = process.env.NEXT_PUBLIC_END_POINT;
    
    if (!baseURL || !endpoint) {
      return {
        success: false,
        data: null,
        error: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        message: "API configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_END_POINT",
        code: 500
      };
    }

    // Create the API URL for deleting coupon
    const apiUrl = `${deletePromoCodeApiRoute}?id=${couponId}`;

    // Send the DELETE request to the backend API
    const response = await axiosClient.delete(apiUrl);

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Failed to delete coupon",
        message: response.data.message || "Failed to delete coupon",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Coupon deleted successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Delete Coupon API request failed:",
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
      message: "Failed to delete coupon",
      code: errorCode
    };
  }
}

/**
 * Alternative function that accepts coupon deletion data object
 * @param couponData - Object containing coupon ID to delete
 * @returns Promise with standardized API response structure
 */
export const deleteCouponWithData = async (
  couponData: CouponDeletionData,
): Promise<ApiResponse<CouponDeletionSubmissionResponse>> => {
  try {
    // Use the main deletion function
    return await deleteCoupon(couponData.id,);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to delete coupon",
      code: errorCode
    };
  }
}

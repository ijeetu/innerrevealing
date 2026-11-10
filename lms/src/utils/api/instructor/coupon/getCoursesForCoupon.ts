import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCoursesForCouponApiRoute } from "@/utils/apiRoutes";

// Interface for instructor course data structure (matches API response)
export interface InstructorCourse {
  id: number;
  name: string;
}

// Use the common ApiResponse interface with InstructorCourse array
export type GetCoursesForCouponResponse = ApiResponse<InstructorCourse[]>;

/**
 * Get instructor courses for coupon creation from the backend API
 * This endpoint fetches all courses created by the instructor for use in coupon creation
 * @returns Promise with API response structure containing instructor courses
 */
export const getCoursesForCoupon = async (
): Promise<GetCoursesForCouponResponse | null> => {
  try {
    // Send the GET request to the backend API
    const response = await axiosClient.get<GetCoursesForCouponResponse>(getCoursesForCouponApiRoute);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: GetCoursesForCouponResponse } };
    console.log("Error in getCoursesForCoupon:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
}
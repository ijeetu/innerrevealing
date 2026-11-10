import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCountsApiRoute } from "@/utils/apiRoutes";

// Interface for counts data structure
// Contains course and instructor count information
export interface CountsData {
    course_count: number;
    instructor_count: number;
    student_enroll_count: number;
    positive_feedback_count: number;

}

// Use the common ApiResponse interface for consistent response handling
// Note: The API returns data as a single object with course_count and instructor_count
export type GetCountsResponse = ApiResponse<CountsData>;

/**
 * Fetch counts from the API
 * This endpoint returns course and instructor counts
 * @returns Promise with counts response or null
 */
export const getCounts = async (): Promise<GetCountsResponse | null> => {
    try {
        const response = await axiosClient.get<GetCountsResponse>(getCountsApiRoute);
        return response.data;
    } catch (error) {
        const axiosError = error as { response?: { data?: GetCountsResponse } };
        console.log("Error in getCounts:", axiosError?.response?.data);
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};


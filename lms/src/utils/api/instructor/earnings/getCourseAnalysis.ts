import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { courseAnalysisApiRoute } from "@/utils/apiRoutes";
// Import shared interfaces from getEarnings.ts
import {
    RevenueChart,
    EarningsChart,
    SummaryCardType
} from "./getEarnings";

// TypeScript interfaces for course analysis response data structure

// Course information interface
export interface CourseInfo {
    slug: string;
    title: string;
    short_description: string;
    thumbnail: string;
    average_rating: number;
    total_ratings_count: number;
    price: number;
    discount_price: number | null;
}

// Main course analysis data interface
export interface CourseAnalysisData {
    course_info: CourseInfo;
    summary_cards: SummaryCardType;
    revenue_chart: RevenueChart;
    earnings_chart: EarningsChart;
}

// Use the common ApiResponse interface for consistent response handling
export type GetCourseAnalysisResponse = ApiResponse<CourseAnalysisData>;

// Parameters interface for course analysis API call
export interface GetCourseAnalysisParams {
    course_id?: number;
    course_slug: string;
}

/**
 * Fetch course analysis data from the API
 * @param params - Parameters for fetching course analysis data ( course_id, course_slug)
 * @returns Promise with course analysis response or null
 */
export const getCourseAnalysis = async (params: GetCourseAnalysisParams): Promise<GetCourseAnalysisResponse | null> => {
    try {
        // query parameters
        const { course_id, course_slug } = params;

        const queryParamsObj: Record<string, string | number> = {
            course_slug,
        };

        // Add course_id if provided
        if (course_id !== undefined) {
            queryParamsObj.course_id = course_id;
        }

        const response = await axiosClient.get<GetCourseAnalysisResponse>(courseAnalysisApiRoute, { params: queryParamsObj });

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: GetCourseAnalysisResponse } };
        console.log("Error in getCourseAnalysis:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

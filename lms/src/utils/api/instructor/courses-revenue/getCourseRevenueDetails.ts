import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCourseRevenueDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for individual Course Revenue Detail item
export interface CourseRevenueDetailItem {
    student_name: string;
    student_email: string;
    student_profile: string;
    enrollment_date: string;
    formatted_enrollment_date: string;
    transaction_type: string;
    amount: number;
    formatted_amount: string;
    status: string;
    raw_status: string;
    row_number: number;
}

// Interface for Course Revenue Detail Summary
export interface CourseRevenueDetailSummary {
    total_transactions: number;
    total_purchased: number;
    formatted_total_purchased: string;
    total_pending: number;
    formatted_total_pending: string;
    total_refunded: number;
    formatted_total_refunded: string;
}

// Interface for Course information in details
export interface CourseRevenueDetailCourse {
    id: number;
    slug: string;
    title: string;
    thumbnail: string;
    category: {
        id: number;
        name: string;
    };
}

// Main Response interface for get-course-revenue-details
export interface GetCourseRevenueDetailsResponse extends PaginatedApiResponse<CourseRevenueDetailItem> {
    course: CourseRevenueDetailCourse;
    summary: CourseRevenueDetailSummary;
    status_options: string[];
    filters: {
        search: string | null;
        transaction_type: string;
        status: string;
    };
}

/**
 * Interface for query parameters for get-course-revenue-details
 */
export interface GetCourseRevenueDetailsParams {
    course_slug: string;        // Course slug (required)
    transaction_type?: string;  // Transaction type filter (e.g., 'all', 'Purchased')
    status?: string;           // Status filter (e.g., 'Received', 'Pending', 'Approved', 'Refunded')
    search?: string;           // Search query
    per_page?: number;         // Number of items per page
    page?: number;             // Page number
}

/**
 * Fetch Course Revenue Details from the API
 * @param params - Parameters including course_slug, transaction_type, status, etc.
 * @returns Promise with course revenue details response or null
 */
export const getCourseRevenueDetails = async (params: GetCourseRevenueDetailsParams): Promise<GetCourseRevenueDetailsResponse | null> => {
    try {
        // Build query parameters object
        const queryParams: Record<string, number | string> = {
            course_slug: params.course_slug
        };

        if (params.transaction_type) queryParams.transaction_type = params.transaction_type;
        if (params.status) queryParams.status = params.status;
        if (params.search) queryParams.search = params.search;
        if (params.per_page) queryParams.per_page = params.per_page;
        if (params.page) queryParams.page = params.page;

        const response = await axiosClient.get<GetCourseRevenueDetailsResponse>(getCourseRevenueDetailsApiRoute, {
            params: queryParams,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as { response?: { data?: GetCourseRevenueDetailsResponse } };
        console.error("Error in getCourseRevenueDetails:", axiosError?.response?.data || error);
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};

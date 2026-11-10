import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCourseRevenueApiRoute } from "@/utils/apiRoutes";

// Interface for Category in Course Revenue Item
export interface CourseRevenueCategory {
    id: number;
    name: string;
    slug: string;
}

// Interface for individual Course Revenue item
export interface CourseRevenueItem {
    row_number: number;
    course_id: number;
    slug: string;
    title: string;
    thumbnail: string;
    category: CourseRevenueCategory;
    enrolled_students: number;
    pending_amount: number;
    formatted_pending_amount: string;
    total_revenue: number;
    formatted_total_revenue: string;
    paid_amount: number;
    formatted_paid_amount: string;
}

// Interface for Course Revenue Summary
export interface CourseRevenueSummary {
    total_courses: number;
    total_purchases: number;
    total_revenue: number;
    formatted_total_revenue: string;
    total_paid: number;
    formatted_total_paid: string;
    total_pending_clearance: number;
    formatted_total_pending_clearance: string;
}

// Interface for Filter Categories
export interface CourseRevenueFilterCategory {
    id: number;
    name: string;
    slug: string;
    has_subcategory: boolean;
    has_parent_category: boolean;
}

// Main Response interface
export interface GetCourseRevenueResponse extends PaginatedApiResponse<CourseRevenueItem> {
    summary: CourseRevenueSummary;
    categories: CourseRevenueFilterCategory[];
    filters: {
        search: string;
        category_id: number | null;
    };
}

/**
 * Interface for query parameters
 */
export interface GetCourseRevenueParams {
    page?: number;      // Page number to fetch (default: 1)
    per_page?: number;  // Number of items per page
    search?: string;    // Search query
    category_id?: number | string; // Category filter
}

/**
 * Fetch Course Revenue data from the API with pagination and filter support
 * @param params - Optional parameters (page, per_page, search, category_id)
 * @returns Promise with course revenue response or null
 */
export const getCourseRevenue = async (params?: GetCourseRevenueParams): Promise<GetCourseRevenueResponse | null> => {
    try {
        // Build query parameters object
        const queryParams: Record<string, number | string> = {};

        if (params?.page) queryParams.page = params.page;
        if (params?.per_page) queryParams.per_page = params.per_page;
        if (params?.search) queryParams.search = params.search;
        if (params?.category_id) queryParams.category_id = params.category_id;

        const response = await axiosClient.get<GetCourseRevenueResponse>(getCourseRevenueApiRoute, {
            params: queryParams,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as { response?: { data?: GetCourseRevenueResponse } };
        console.error("Error in getCourseRevenue:", axiosError?.response?.data || error);
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};

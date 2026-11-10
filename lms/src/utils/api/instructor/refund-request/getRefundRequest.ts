import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { refundRequestsApiRoute } from "@/utils/apiRoutes";
// Interface for Refund Course
export interface RefundCourse {
    id: number;
    title: string;
    thumbnail: string;
}

// Interface for Refund Student
export interface RefundStudent {
    id: number;
    name: string;
    profile: string | null;
    email: string;
    enrollment_date: string;
    course_progress: {
        percentage: number;
        completed_chapters: number;
        total_chapters: number;
    };
}

// Interface for Instructor Response
export interface InstructorResponse {
    status: string;
    recommendation: string | null;
    comment: string | null;
    media: string | null;
    responded_at: string | null;
    deadline: string | null;
}

// Interface for Refund Request Data
export interface RefundRequestData {
    id: number;
    status: string;
    refund_amount: string;
    reason: string;
    user_media: string | null;
    created_at: string;
    course: RefundCourse;
    student: RefundStudent;
    instructor_response: InstructorResponse;
}

// Response type wrapper
export type GetRefundRequestResponse = PaginatedApiResponse<RefundRequestData>;

/**
 * Interface for pagination parameters
 */
export interface GetRefundRequestParams {
    page?: number;      // Page number to fetch (default: 1)
    per_page?: number;  // Number of items per page
    status?: "pending" | "approved" | "rejected";
    course_id?: number | string;
}

/**
 * Fetch Refund Requests from the API with pagination support
 * @param params - Optional pagination parameters (page, per_page)
 * @returns Promise with paginated refund requests response or null
 */
export const getRefundRequests = async (params?: GetRefundRequestParams): Promise<GetRefundRequestResponse | null> => {
    try {
        // Build query parameters object
        const queryParams: Record<string, number | string> = {};

        if (params?.page) queryParams.page = params.page;
        if (params?.per_page) queryParams.per_page = params.per_page;
        if (params?.status) queryParams.status = params.status;
        if (params?.course_id) queryParams.course_id = params.course_id;

        const response = await axiosClient.get<GetRefundRequestResponse>(refundRequestsApiRoute, {
            params: queryParams,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as { response?: { data?: GetRefundRequestResponse } };
        console.log("Error in getRefundRequests:", axiosError?.response?.data);
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};

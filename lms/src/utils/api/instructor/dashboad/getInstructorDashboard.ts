import axiosClient from "@/utils/api/axiosClient";
import { SalesChartData } from "../course/getCourseDetails";
import { getInstructorDashboardApiRoute } from "@/utils/apiRoutes";


export interface ProfileCompletion {
  percentage: number;
  completed_fields: number;
  total_fields: number;
  missing_fields: string[];
  is_complete: boolean;
  completion_status: string;
}

// Interface for overview statistics data structure
export interface OverviewStat {
  value: string | number;
  label: string;
  icon: string;
}

// Interface for overview stats collection
export interface OverviewStats {
  total_courses: OverviewStat;
  enrolled_students: OverviewStat;
  courses_sold: OverviewStat;
  total_earnings: OverviewStat;
  positive_feedback: OverviewStat;
}

// Interface for most selling course
export interface MostSellingCourse {
  id: number;
  title: string;
  price: string;
  sales_count: number;
  status: string;
  thumbnail: string;
  slug: string;
}

// Interface for instructor dashboard data
export interface InstructorDashboardData {
  profile_completion: ProfileCompletion;
  overview_stats: OverviewStats;
  sales_statistics: SalesChartData;
}

// Interface for instructor dashboard API response
export interface InstructorDashboardResponse {
  error: boolean;
  message: string;
  data: InstructorDashboardData;
  code: number;
}

// Interface for API parameters
export interface GetInstructorDashboardParams {
  id?: number;
  page?: number;
  per_page?: number;
}

/**
 * Fetch instructor dashboard data from the API
 * @param params - Optional parameters for the API request
 * @returns Promise with instructor dashboard data or null if error
 */
export const getInstructorDashboard = async (
  params?: GetInstructorDashboardParams
): Promise<InstructorDashboardResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Only add parameters that are not undefined
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<InstructorDashboardResponse>(getInstructorDashboardApiRoute, {
      params: queryParams,
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: InstructorDashboardResponse } };
    console.log("Error in getInstructorDashboard:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};
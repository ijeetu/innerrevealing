import axiosClient from "@/utils/api/axiosClient";
import { getMostSellingCoursesApiRoute } from "@/utils/apiRoutes";

// Interface for category data structure
export interface CategoryDataType {
  id: number;
  name: string;
}

// Interface for time-based sales data
export interface TimeBasedSalesDataType {
  sales_count: number;
  revenue: number;
  profit: number;
}

// Interface for most selling course data structure (matches actual API response)
export interface MostSellingCourseDataType {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  category: CategoryDataType;
  price: string | null;
  discount_price: string | null;
  total_sales: number;
  total_revenue: number;
  profit: number;
  average_rating: number;
  rating_count: number;
  status: string;
  is_active: boolean;
  created_at: string;
  time_based_sales: TimeBasedSalesDataType;
}

// Interface for summary data
export interface SummaryDataType {
  total_courses: number;
  total_sales: number;
  total_revenue: number;
  total_profit: number;
}

// Interface for the complete most selling courses response data
export interface MostSellingCoursesData {
  current_page: number;
  data: MostSellingCourseDataType[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  filter_applied: string;
  summary: SummaryDataType;
}

// Use the common ApiResponse interface for the response structure
export interface MostSellingCoursesResponse {
  error: boolean;
  message: string;
  data: MostSellingCoursesData;
  code: number;
}

// Interface for filter and search options
export interface MostSellingCoursesOptions {
  filter?: 'yearly' | 'monthly' | 'weekly' | 'price_high_to_low' | 'price_low_to_high';
  search?: string;
  page?: number;
  per_page?: number;
}

/**
 * Fetch most selling courses from the API
 * @param options - Optional filter and search parameters
 * @returns Promise with most selling courses response or null
 */
export const getMostSellingCourses = async (
  options?: MostSellingCoursesOptions
): Promise<MostSellingCoursesResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        // Only add parameters that are not undefined
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<MostSellingCoursesResponse>(getMostSellingCoursesApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: MostSellingCoursesResponse } };
    console.log("Error in getMostSellingCourses:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

import axiosClient from "../axiosClient";
import { ApiResponse, PaginatedData } from "@/types/instructorTypes/instructorTypes";
import { Course } from "@/types";
import { getCoursesApiRoute } from "@/utils/apiRoutes";

// Interface for get courses request parameters
export interface GetCoursesParams {
  id?: number;
  level?: string;
  search?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_order?: string;
  course_type?: string;
  slug?: string;
  category_id?: string;
  category_slug?: string;
  post_filter?: string;
  duration_filter?: string;
  instructor_slug?: string;
  language_id?: string | number; // Support comma-separated language IDs as string
  rating_filter?: string; // Add rating filter parameter
  feature_section?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type GetCoursesResponse = ApiResponse<PaginatedData<Course>>;

/**
 * Fetch courses from the API with optional filtering and pagination
 * @param params - Optional parameters for filtering and pagination
 * @returns Promise with courses response or null
 */
export const getCourses = async (params?: GetCoursesParams): Promise<GetCoursesResponse | null> => {
  try {

    const { ...queryParams } = params || {};

    const queryParamsObj: Record<string, string | number> = {};

    if (queryParams?.id) queryParamsObj.id = queryParams.id;
    if (queryParams?.level) queryParamsObj.level = queryParams.level;
    if (queryParams?.search) queryParamsObj.search = queryParams.search;
    if (queryParams?.per_page) queryParamsObj.per_page = queryParams.per_page;
    if (queryParams?.page) queryParamsObj.page = queryParams.page;
    if (queryParams?.sort_by) queryParamsObj.sort_by = queryParams.sort_by;
    if (queryParams?.sort_order) queryParamsObj.sort_order = queryParams.sort_order;
    if (queryParams?.course_type) queryParamsObj.course_type = queryParams.course_type;
    if (queryParams?.slug) queryParamsObj.slug = queryParams.slug;
    if (queryParams?.category_id) queryParamsObj.category_id = queryParams.category_id;
    if (queryParams?.category_slug) queryParamsObj.category_slug = queryParams.category_slug;
    if (queryParams?.post_filter) queryParamsObj.post_filter = queryParams.post_filter;
    if (queryParams?.instructor_slug) queryParamsObj.instructor_slug = queryParams.instructor_slug;
    if (queryParams?.rating_filter) queryParamsObj.rating_filter = queryParams.rating_filter;
    if (queryParams?.duration_filter) queryParamsObj.duration_filter = queryParams.duration_filter;
    if (queryParams?.language_id) queryParamsObj.language_id = queryParams.language_id;
    if (queryParams?.feature_section) queryParamsObj.feature_section = queryParams.feature_section;

    const response = await axiosClient.get<GetCoursesResponse>(getCoursesApiRoute, {
      params: queryParamsObj,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetCoursesResponse } };
    console.log("Error in getCourses:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
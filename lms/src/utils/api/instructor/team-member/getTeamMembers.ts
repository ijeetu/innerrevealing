import axiosClient from "@/utils/api/axiosClient";
import { PaginatedApiResponse } from "@/types/instructorTypes/instructorTypes";
import { teamMembersApiRoute } from "@/utils/apiRoutes";

// Interface for course data structure (matches API response)
export interface TeamMemberCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  price: string | null;
  discount_price: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  user_id: number;
}

export interface TeamMemberUser {
  id: number;
  name: string;
  email: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  instructor_status: string;
  profile: string;
}

// Interface for team member data structure (matches actual API response)
export interface TeamMemberDataType {
  id: number;
  instructor_id: number;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: TeamMemberUser;
  courses: TeamMemberCourse[];
  total_courses: number;
}

// Use the common PaginatedApiResponse interface with TeamMemberDataType
export type TeamMembersResponse = PaginatedApiResponse<TeamMemberDataType>;

// Interface for search options
export interface SearchOptions {
  search?: string;
  page?: number;
  per_page?: number;
}

// fetch team members
export const getTeamMembers = async (
  searchOptions?: SearchOptions
): Promise<TeamMembersResponse | null> => {
  try {
    // Build query parameters object, filtering out undefined values
    const queryParams: Record<string, string | number> = {};

    if (searchOptions) {
      Object.entries(searchOptions).forEach(([key, value]) => {
        // Only add parameters that are not undefined
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<TeamMembersResponse>(teamMembersApiRoute, { params: queryParams });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: TeamMembersResponse } };
    console.log("Error in getTeamMembers:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

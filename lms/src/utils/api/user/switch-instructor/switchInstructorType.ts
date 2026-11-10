import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { switchInstructorTypeApiRoute } from "@/utils/apiRoutes";

// Interface for switch instructor type response data
export interface SwitchInstructorTypeData {
    // Define specific response properties if known, or leave generic
    // Based on other APIs, it might verify success
}

// Use the common ApiResponse interface for consistent response handling
export type SwitchInstructorTypeResponse = ApiResponse<SwitchInstructorTypeData>;

// Interface for API parameters
export interface SwitchInstructorTypeParams {
    team_name?: string;
    team_logo?: File | string | null;
}

/**
 * Switch instructor type
 * @param params - Parameters for switching instructor type
 * @returns Promise with response data or null if error
 */
export const switchInstructorType = async (
    params?: SwitchInstructorTypeParams
): Promise<SwitchInstructorTypeResponse | null> => {
    try {
        // Create FormData object for the POST request
        const formData = new FormData();

        // Add parameters to FormData only if they are present
        if (params?.team_name) {
            formData.append('team_name', params.team_name);
        }

        if (params?.team_logo) {
            formData.append('team_logo', params.team_logo);
        }

        // Send the POST request to the backend API with FormData
        const response = await axiosClient.post<SwitchInstructorTypeResponse>(
            switchInstructorTypeApiRoute,
            formData
        );

        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: SwitchInstructorTypeResponse } };
        console.log("Error in switchInstructorType:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

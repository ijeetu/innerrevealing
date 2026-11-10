import axiosClient from "@/utils/api/axiosClient";
import { billingDetailsApiRoute } from "@/utils/apiRoutes";
import { BillingDetailsUser } from "@/components/instructor/courses/types";

// Interface for the get billing details response
export interface GetBillingDetailsResponse {
    error: boolean;
    message: string;
    data: BillingDetailsUser;
    code: number;
}

/**
 * Fetch user billing details from the API
 * @returns Promise with billing details response or null on error
 */
export const getUserBillingDetails = async (): Promise<GetBillingDetailsResponse | null> => {
    try {
        // Make API request to fetch billing details
        // Endpoint matches the API documentation: billingDetailsApiRoute
        const response = await axiosClient.get<GetBillingDetailsResponse>(billingDetailsApiRoute);

        return response.data;
    } catch (error) {
        // Handle errors gracefully
        const axiosError = error as { response?: { data?: GetBillingDetailsResponse } };
        console.log("Error in getBillingDetails:", axiosError?.response?.data);

        // Return error response if available, otherwise return null
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};


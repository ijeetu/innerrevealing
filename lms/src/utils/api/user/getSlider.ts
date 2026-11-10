import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getSliderApiRoute } from "@/utils/apiRoutes";

// Interface for the slider structure 
export interface Slider {
    id: number;
    image: string;
    order: string;
    third_party_link: string | null;
    model_type: string | null;
    model_id: number | null;
    created_at: string;
    updated_at: string;
    type: string;
    value: string;
    slug: string;
}

// Interface for the getsliders request parameters
export interface GetSlidersParams {
    id?: number;
    type?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type GetSlidersResponse = ApiResponse<Slider[]>;

export const getSliders = async (params: GetSlidersParams = {}): Promise<GetSlidersResponse | null> => {
    try {
        const queryParams: Record<string, string | number> = {};
        if (params.id !== undefined) queryParams.id = params.id;
        if (params.type !== undefined) queryParams.type = params.type;

        const response = await axiosClient.get<GetSlidersResponse>(getSliderApiRoute, {
            params: queryParams,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as { response?: { data?: GetSlidersResponse } };
        console.log("Error in getSliders:", axiosError?.response?.data);
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};
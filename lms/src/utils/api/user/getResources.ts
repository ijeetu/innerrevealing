import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getResourcesApiRoute } from "@/utils/apiRoutes";

// Common Resource interface for the Lecture, Chapter, and CurrentLecture Resources.
export interface Resource {
    id?: number; // Optional for chapter resources
    title?: string; // Optional for chapter resources
    type?: "download" | "external_link";
    file_url: string | null;
    external_url: string | null;
    file_extension: string | null;
    file_name?: string | null;
    description?: string;
    resource_type?: "chapter" | "lecture"; // optional type flag
    chapter_id?: number | null;
    chapter_title?: string | null;
    lecture_title?: string | null;
    created_at?: string; // Optional for chapter resources
}

// Interface for chapter with nested resources
export interface ChapterWithResources {
    chapter_id: number;
    chapter_title: string;
    resources: Resource[];
}

// Interface for lecture with nested resources
export interface LectureWithResources {
    id?: number;
    title: string;
    chapter_id?: number;
    chapter_title: string;
    lecture_order: number | null;
    resources: Resource[];
}

// Interface for all resources container
export interface AllResources {
    chapters: ChapterWithResources[];
    lectures: LectureWithResources[];
}

// Interface for resources data structure
export interface ResourcesData {
    all_resources: AllResources;
    current_lecture_resources: LectureWithResources[];
}

// Interface for get resources request parameters
export interface GetResourcesParams {
    id?: number;
    slug?: string;
    lecture_id?: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetResourcesResponse = ApiResponse<ResourcesData>;

/**
 * Fetch resources from the API by course ID, slug, or lecture ID
 * @param params - Parameters for fetching resources (id, slug, or lecture_id)
 * @returns Promise with resources response or null
 */
export const getResources = async (params?: GetResourcesParams): Promise<GetResourcesResponse | null> => {
    try {
        // Extract query parameters
        const { ...queryParams } = params || {};

        // Build query parameters object
        const queryParamsObj: Record<string, string | number> = {};

        if (queryParams?.id) queryParamsObj.id = queryParams.id;
        if (queryParams?.slug) queryParamsObj.slug = queryParams.slug;
        if (queryParams?.lecture_id) queryParamsObj.lecture_id = queryParams.lecture_id;

        const response = await axiosClient.get<GetResourcesResponse>(getResourcesApiRoute, {
            params: queryParamsObj,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as { response?: { data?: GetResourcesResponse } };
        console.log("Error in getResources:", axiosError?.response?.data);
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }
        return null;
    }
};

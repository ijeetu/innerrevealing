import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCustomFieldsApiRoute } from "@/utils/apiRoutes";

// Interface for custom field option structure
// Options are used for dropdown and radio field types
export interface CustomFieldOption {
  id: number;
  custom_form_field_id: number;
  option: string;
}

// Interface for custom form field data structure based on actual API response
// Each field can have different types: text, dropdown, radio, file, etc.
export interface CustomField {
  id: number;
  name: string;
  type: string; // e.g., "dropdown", "text", "radio", "file"
  is_required: number; // 0 or 1, indicating if the field is required
  sort_order: number; // Order in which fields should be displayed
  options: CustomFieldOption[]; // Array of options for dropdown/radio fields, empty for text/file fields
}

// Use the common ApiResponse interface for consistent response handling
// Note: The API returns data as an array of custom form fields
export type GetCustomFieldsResponse = ApiResponse<CustomField[]>;

/**
 * Fetch custom form fields from the API
 * This endpoint returns all custom form fields that can be used in forms
 * Fields are returned sorted by their sort_order
 * @returns Promise with custom fields response or null
 */
export const getCustomFields = async (): Promise<GetCustomFieldsResponse | null> => {
  try {

    // Send the GET request to the backend API
    // Endpoint: getCustomFieldsApiRoute
    const response = await axiosClient.get<GetCustomFieldsResponse>(getCustomFieldsApiRoute);

    return response.data;
  } catch (error) {
    // Handle error using the standard pattern - return response data if available, otherwise null
    const axiosError = error as { response?: { data?: GetCustomFieldsResponse } };
    console.log("Error in getCustomFields:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

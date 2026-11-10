import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { updateInstructorDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for instructor details form data structure
export interface InstructorDetailsFormData {
  user_id: string;
  instructor_type: string;
  qualification: string;
  years_of_experience: string;
  skills: string;
  bank_account_number: string;
  bank_name?: string;
  bank_account_holder_name?: string;
  bank_ifsc_code?: string;
  team_name: string;
  about_me: string;
  team_logo?: File;
  id_proof?: File;
  preview_video?: File;
  social_media?: Array<{ title: string; url: string }>;
  other_details?: Array<{ id: number; option_id?: number; value: string; file?: File }>;
}

// Interface for instructor details response data
export interface InstructorDetailsResponseData {
  message?: string;
  data?: Record<string, string | number>;
}

// Use the common ApiResponse interface for consistent response handling
export type UpdateInstructorDetailsResponse = ApiResponse<InstructorDetailsResponseData>;

/**
 * Update instructor details from the API
 * @param params - Parameters for the update instructor details request
 * @returns Promise with instructor details response data or null if error
 */
export const updateInstructorDetails = async (
  params: InstructorDetailsFormData
): Promise<UpdateInstructorDetailsResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add basic required parameters to FormData
    formData.append('user_id', params.user_id);
    formData.append('instructor_type', params.instructor_type);
    formData.append('qualification', params.qualification);
    // years_of_experience is optional
    if (params.years_of_experience) {
      formData.append('years_of_experience', params.years_of_experience);
    }
    formData.append('skills', params.skills);
    formData.append('bank_account_number', params.bank_account_number);

    // Add bank details if provided
    if (params.bank_name) {
      formData.append('bank_name', params.bank_name);
    }
    if (params.bank_account_holder_name) {
      formData.append('bank_account_holder_name', params.bank_account_holder_name);
    }
    if (params.bank_ifsc_code) {
      formData.append('bank_ifsc_code', params.bank_ifsc_code);
    }

    formData.append('team_name', params.team_name);
    formData.append('about_me', params.about_me);

    // Handle file uploads if provided
    if (params.team_logo) {
      formData.append('team_logo', params.team_logo);
    }
    if (params.id_proof) {
      formData.append('id_proof', params.id_proof);
    }
    if (params.preview_video) {
      formData.append('preview_video', params.preview_video);
    }

    // Handle social media arrays if provided
    // Format: social_media[0][title] and social_media[0][url]
    if (params.social_media && params.social_media.length > 0) {
      params.social_media.forEach((social, index) => {
        formData.append(`social_medias[${index}][title]`, social.title);
        formData.append(`social_medias[${index}][url]`, social.url);
      });
    }

    // Handle other details arrays if provided
    // Format: other_details[0][id], other_details[0][option_id], other_details[0][value], other_details[0][file]
    if (params.other_details && params.other_details.length > 0) {
      params.other_details.forEach((detail, index) => {
        formData.append(`other_details[${index}][id]`, detail.id.toString());

        // Add option_id if provided
        if (detail.option_id !== undefined) {
          formData.append(`other_details[${index}][option_id]`, detail.option_id.toString());
        }

        // Add value (string)
        formData.append(`other_details[${index}][value]`, detail.value);

        // Add file if provided
        if (detail.file) {
          formData.append(`other_details[${index}][file]`, detail.file);
        }
      });
    }

    // Send the POST request to the backend API with FormData
    const response = await axiosClient.post<UpdateInstructorDetailsResponse>(updateInstructorDetailsApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: UpdateInstructorDetailsResponse } };
    console.log("Error in updateInstructorDetails:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};


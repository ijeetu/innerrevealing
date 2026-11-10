import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { updateProfileApiRoute } from "@/utils/apiRoutes";

// Interface for social media entry (matches API format: social_medias[0][id] and social_medias[0][url])
export interface SocialMediaEntry {
  url: string; // URL of the social media profile
  title: string; // Title of the social media platform
}

// Interface for other details entry (matches API format)
export interface OtherDetailEntry {
  id: number; // ID of custom form field
  option_id?: number; // ID of custom form field's option (optional)
  value: string; // String value for the field
  file?: File; // Optional file upload for this detail
}

// Interface for update profile response data
export interface UpdateProfileResponseData {
  message?: string;
  data?: Record<string, unknown>;
}

// Use the common ApiResponse interface for consistent response handling
export type UpdateProfileResponse = ApiResponse<UpdateProfileResponseData>;

// Interface for API parameters (matches the API documentation from the images)
export interface UpdateProfileParams {
  // Basic user information fields (required)
  name: string;
  email: string;
  mobile: string;
  country_calling_code?: string; // Optional, can be extracted from mobile number
  country_code?: string; // ISO 3166-1 alpha-2 short code (e.g., "IN", "US")

  // Profile picture (file upload)
  profile?: File;

  // Instructor type and basic fields
  instructor_type?: "individual" | "team"; // Required if instructor
  qualification?: string; // Not required
  years_of_experience?: number; // Not required, can be decimal (e.g., 5.5)
  skills?: string; // Not required
  bank_account_number?: string; // Not required

  // Team-related fields (required if instructor_type is "team")
  team_name?: string; // Required if instructor_type is "team"
  team_logo?: File; // Required if instructor_type is "team", max 2MB, formats: jpeg, png, jpg, gif, svg

  // About me field
  about_me?: string; // Required if instructor_type is "team"

  // File uploads
  preview_video?: File; // Not required, max 10MB, formats: mp4, mov, avi, wmv, flv, mpeg, mpg, m4v, webm
  id_proof?: File; // Not required, max 5MB, formats: jpeg, png, jpg, gif, svg, pdf, doc, docx

  // Bank details
  bank_name?: string;
  bank_account_holder_name?: string;
  bank_ifsc_code?: string;

  // Social media array (matches API format: social_medias[0][id], social_medias[0][url])
  social_medias?: SocialMediaEntry[];

  // Other details array (matches API format: other_details[0][id], other_details[0][option_id], other_details[0][value], other_details[0][file])
  other_details?: OtherDetailEntry[];
}

/**
 * Helper function to get file extension from MIME type
 */
const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/x-ms-wmv': 'wmv',
    'video/x-flv': 'flv',
    'video/mpeg': 'mpeg',
    'video/mpg': 'mpg',
    'video/x-m4v': 'm4v', // M4V format MIME type
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };

  return extensions[mimeType] || 'bin';
};

/**
 * Update user profile from the API
 * @param params - Parameters for the update profile request
 * @returns Promise with update profile response data or null if error
 */
export const updateProfile = async (
  params: UpdateProfileParams
): Promise<UpdateProfileResponse | null> => {
  try {
    // Validate required fields
    // if (!params.name || !params.email || !params.mobile) {
    //   console.error("Missing required fields: name, email, mobile");
    //   return null;
    // }

    // Create FormData object for the POST request
    // The API expects formdata format as shown in the documentation
    const formData = new FormData();

    // Add basic required parameters to FormData
    formData.append('name', params.name);
    formData.append('mobile', params.mobile);
    formData.append('platform', 'web');

    // Add email if provided (not required)
    if (params.email) {
      formData.append('email', params.email);
    }

    if (params.country_calling_code) {
      formData.append('country_calling_code', params.country_calling_code);
    }

    if (params.country_code) {
      formData.append('country_code', params.country_code);
    }

    // Add profile picture file if provided
    if (params.profile) {
      const fileName = params.profile.name || `profile.${getFileExtension(params.profile.type)}`;
      formData.append('profile', params.profile, fileName);
    }

    // Add instructor type if provided
    if (params.instructor_type) {
      formData.append('instructor_type', params.instructor_type);
    }

    // Add qualification if provided (not required)
    if (params.qualification) {
      formData.append('qualification', params.qualification);
    }

    // Add years of experience if provided (can be decimal, not required)
    if (params.years_of_experience !== undefined) {
      formData.append('years_of_experience', params.years_of_experience.toString());
    }

    // Add skills if provided (not required)
    if (params.skills) {
      formData.append('skills', params.skills);
    }

    // Add bank account number if provided (not required)
    if (params.bank_account_number) {
      formData.append('bank_account_number', params.bank_account_number);
    }

    // Add team name if provided (required if instructor_type is "team")
    if (params.team_name) {
      formData.append('team_name', params.team_name);
    }

    // Add team logo file if provided (required if instructor_type is "team")
    // Allowed types: jpeg, png, jpg, gif, svg, max 2MB
    if (params.team_logo) {
      const fileName = params.team_logo.name || `team_logo.${getFileExtension(params.team_logo.type)}`;
      formData.append('team_logo', params.team_logo, fileName);
    }

    // Add about_me if provided (required if instructor_type is "team")
    if (params.about_me) {
      formData.append('about_me', params.about_me);
    }

    // Add preview video file if provided (not required)
    // Allowed types: mp4, mov, avi, wmv, flv, mpeg, mpg, m4v, webm, max 10MB
    if (params.preview_video) {
      const fileName = params.preview_video.name || `preview_video.${getFileExtension(params.preview_video.type)}`;
      formData.append('preview_video', params.preview_video, fileName);
    }

    // Add ID proof file if provided (not required)
    // Allowed types: jpeg, png, jpg, gif, svg, pdf, doc, docx, max 5MB
    if (params.id_proof) {
      const fileName = params.id_proof.name || `id_proof.${getFileExtension(params.id_proof.type)}`;
      formData.append('id_proof', params.id_proof, fileName);
    }

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

    if (params.social_medias && params.social_medias.length > 0) {
      params.social_medias.forEach((social, index) => {
        formData.append(`social_medias[${index}][title]`, social.title);
        formData.append(`social_medias[${index}][url]`, social.url);
      });
    }

    // Handle other_details array (matches API format)
    if (params.other_details && params.other_details.length > 0) {
      params.other_details.forEach((detail, index) => {
        // Add ID (required - ID should be of custom form field)
        formData.append(`other_details[${index}][id]`, detail.id.toString());

        // Add option_id if provided (required - ID should be of custom form field's option)
        if (detail.option_id !== undefined) {
          formData.append(`other_details[${index}][option_id]`, detail.option_id.toString());
        }

        // Add value (required - string value)
        if (detail.value) {
          formData.append(`other_details[${index}][value]`, detail.value);
        }

        // Add file if provided (not required)
        // Allowed types: jpeg, png, jpg, gif, svg, pdf, doc, docx, mp4, mov, avi, wmv, flv, mpeg, mpg, m4v, webm, max 5MB
        if (detail.file) {
          const fileName = detail.file.name || `other_detail_file_${index}.${getFileExtension(detail.file.type)}`;
          formData.append(`other_details[${index}][file]`, detail.file, fileName);
        }
      });
    }

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation: updateProfileApiRoute
    const response = await axiosClient.post<UpdateProfileResponse>(updateProfileApiRoute, formData, {
      timeout: 30000, // Increased timeout for file uploads
    });

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: UpdateProfileResponse } };
    console.log("Error in updateProfile:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};
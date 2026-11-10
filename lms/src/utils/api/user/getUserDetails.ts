import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getUserDetailsApiRoute } from "@/utils/apiRoutes";

// Interface for custom form field option
export interface CustomFormFieldOption {
  id: number;
  custom_form_field_id: number;
  option: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for custom form field
export interface CustomFormField {
  id: number;
  name: string;
  type: string;
  is_required: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for other details in instructor details
export interface OtherDetail {
  id: number;
  instructor_id: number;
  custom_form_field_id: number;
  custom_form_field_option_id: number | null;
  value: string | null;
  original_value: string | null;
  extension: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // API can return null when field metadata is not loaded
  custom_form_field: CustomFormField | null;
  custom_form_field_option: CustomFormFieldOption | null;
}

// Interface for social media object
export interface SocialMedia {
  id: number;
  name: string;
  icon: string;
  icon_extension: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for social media items in instructor details
export interface SocialMediaItem {
  id: number;
  instructor_id: number;
  social_media_id: number;
  url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // API can return null for embedded social_media object
  social_media: SocialMedia | null;
  title: string;
}

// Interface for personal details in instructor details
export interface PersonalDetails {
  id: number;
  instructor_id: number;
  qualification: string;
  // API returns a numeric string like "0.00"
  years_of_experience: string | number;
  skills: string;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_account_holder_name: string | null;
  bank_ifsc_code: string | null;
  team_name: string | null;
  team_logo: string | null;
  team_logo_extension: string | null;
  about_me: string | null;
  id_proof: string;
  id_proof_extension: string | null;
  preview_video: string;
  preview_video_extension: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for instructor details
export interface InstructorDetails {
  id: number;
  user_id: number;
  type: 'individual' | 'team';
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  personal_details: PersonalDetails;
  social_medias: SocialMediaItem[];
  other_details: OtherDetail[];
  individual_commision_rate: string;
  team_commision_rate: string;
}

// Interface for role pivot
export interface RolePivot {
  model_type: string;
  model_id: number;
  role_id: number;
}

// Interface for user roles
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  custom_role: number;
  created_at: string;
  updated_at: string;
  pivot: RolePivot;
}

// Interface for user details data structure
export interface UserDetails {
  id: number;
  name: string;
  slug: string;
  email: string;
  mobile: string | null;
  // API uses `country_calling_code` (example: "91")
  country_calling_code: string | null;
  country_code: string | null;
  type: string | null;
  email_verified_at: string | null;
  profile: string;
  is_active: number;
  // API returns a numeric string like "11257.40"
  wallet_balance: string | number | null;
  total_balance: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_instructor: boolean;
  instructor_process_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  instructor_details: InstructorDetails | null;
  roles: Role[];

  // NOTE: Need to add this from backend side
  country_name?: string;
}

// Use the common ApiResponse interface for consistent response handling
export type GetUserDetailsResponse = ApiResponse<UserDetails>;

/**
 * Fetch user details from the API
 * @returns Promise with user details response or null
 */
export const getUserDetails = async (): Promise<GetUserDetailsResponse | null> => {
  try {
    const response = await axiosClient.get<GetUserDetailsResponse>(getUserDetailsApiRoute);
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetUserDetailsResponse } };
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
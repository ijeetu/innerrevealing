import axiosClient from "@/utils/api/axiosClient";
import { invitorsApiRoute } from "@/utils/apiRoutes";

export interface InstructorInfo {
  id: number;
  name: string;
  email: string;
  slug: string;
  profile: string | null;
  is_active: number;
  created_at: string;
  instructor_status: string;
  instructor_type: string;
}

export interface Invitor {
  id: number;
  instructor_id: number;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  instructor: InstructorInfo;
}

export interface InvitorsResponse {
  error: boolean;
  message: string;
  data: Invitor[];
  code: number;
}

// fetch invitors
export const getInvitors = async (): Promise<InvitorsResponse | null> => {
  try {
    const response = await axiosClient.get<InvitorsResponse>(invitorsApiRoute);

    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: InvitorsResponse } };
    console.error("Error in getInvitors:", axiosError?.response?.data);

    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    return null;
  }
};

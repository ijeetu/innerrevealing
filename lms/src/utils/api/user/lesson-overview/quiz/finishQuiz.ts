import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { quizFinishApiRoute } from "@/utils/apiRoutes";

// Response data for finish quiz endpoint
export interface FinishQuizResponseData {
  score: number;
  total_questions: number;
  correct_answers: number;
}

// Common API response wrapper
export type FinishQuizResponse = ApiResponse<FinishQuizResponseData>;

// Params required by the finish quiz endpoint
export interface FinishQuizParams {
  attempt_id: number;
  time_taken?: number;
}

/**
 * Finish an ongoing quiz attempt.
 * Expects form-data with attempt_id and time_taken, and returns the score summary.
 */
export const finishQuiz = async (
  params: FinishQuizParams
): Promise<FinishQuizResponse | null> => {
  try {
    const formData = new FormData();
    formData.append("attempt_id", params.attempt_id.toString());
    if (params.time_taken) {
      formData.append("time_taken", params.time_taken.toString());
    }

    const response = await axiosClient.post<FinishQuizResponse>(quizFinishApiRoute, formData);

    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: FinishQuizResponse } };
    console.log("Error in finishQuiz:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};

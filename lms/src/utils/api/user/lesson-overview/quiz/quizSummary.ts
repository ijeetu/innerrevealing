import axiosClient from "../../../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { quizSummaryApiRoute } from "@/utils/apiRoutes";

// Interface for individual quiz question in summary
export interface QuizSummaryQuestion {
    question_number: string;
    question_id: number;
    question: string;
    your_answer: string | null;
    correct_answer: string;
    is_correct: boolean;
    points: string;
}

// Interface for quiz summary data structure
export interface QuizSummaryData {
    quiz_id: number;
    quiz_title: string;
    attempt_id: number;
    total_points: number;
    earned_points: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    time_taken: number;
    attempted_at: string;
    questions: QuizSummaryQuestion[];
}

// Interface for get quiz summary request parameters
export interface GetQuizSummaryParams {
    course_chapter_quiz_id: number;
}

// Use the common ApiResponse interface for consistent response handling
export type GetQuizSummaryResponse = ApiResponse<QuizSummaryData>;

/**
 * Fetch quiz summary from the API
 * @param params - Parameters for fetching quiz summary (attempt_id)
 * @returns Promise with quiz summary response or null
 */
export const getQuizSummary = async (params: GetQuizSummaryParams): Promise<GetQuizSummaryResponse | null> => {
    try {
        const { course_chapter_quiz_id } = params;

        // Build query parameters object
        const queryParamsObj: Record<string, string | number> = {
            course_chapter_quiz_id: course_chapter_quiz_id,
        };

        const response = await axiosClient.get<GetQuizSummaryResponse>(quizSummaryApiRoute, {
            params: queryParamsObj,
        });

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: GetQuizSummaryResponse } };
        console.log("Error in getQuizSummary:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};

import { ApiResponse, PostQuestionApiResponse } from './postQuestion';

/**
 * Helper function to extract question data from API response
 * @param response - The API response from postQuestion
 * @returns Question data or null if error
 */
export const extractQuestionData = (response: ApiResponse<PostQuestionApiResponse>): PostQuestionApiResponse['data'] | null => {
    if (response.success && response.data?.data) {
        return response.data.data;
    }
    return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from postQuestion
 * @returns Error message string
 */
export const extractErrorMessage = (response: ApiResponse<PostQuestionApiResponse>): string => {
    return response.message || response.data?.message || 'Something went wrong';
};

/**
 * Helper function to check if API response is successful
 * @param response - The API response from postQuestion
 * @returns Boolean indicating if response is successful
 */
export const isPostQuestionResponseSuccess = (response: ApiResponse<PostQuestionApiResponse>): boolean => {
    return response.success && !!response.data;
};

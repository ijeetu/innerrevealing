import { ApiResponse, UserExistsApiResponse, UserExistsResponse, UserExistsRequest } from './userExistsApi';

/**
 * Helper function to extract user exists data from API response
 * @param response - The API response from userExists
 * @returns User exists data object or null if error
 */
export const extractUserExistsData = (response: ApiResponse<UserExistsApiResponse>): UserExistsResponse | null => {
    if (response.success && response.data?.data) {
        return response.data.data;
    }
    return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from userExists
 * @returns Error message string
 */
export const extractErrorMessage = (response: ApiResponse<UserExistsApiResponse>): string => {
    return response.message || response.data?.message || 'Something went wrong';
};

/**
 * Helper function to check if API response is successful
 * @param response - The API response from userExists
 * @returns Boolean indicating if response is successful
 */
export const isUserExistsResponseSuccess = (response: ApiResponse<UserExistsApiResponse>): boolean => {
    return response.success && !!response.data;
};

/**
 * Helper function to check if user is new (doesn't exist)
 * @param response - The API response from userExists
 * @returns Boolean indicating if user is new
 */
export const isNewUser = (response: ApiResponse<UserExistsApiResponse>): boolean => {
    if (isUserExistsResponseSuccess(response) && response.data?.data) {
        return response.data.data.is_new_user;
    }
    return false;
};

/**
 * Helper function to check if user exists (is not new)
 * @param response - The API response from userExists
 * @returns Boolean indicating if user exists
 */
export const doesUserExist = (response: ApiResponse<UserExistsApiResponse>): boolean => {
    if (isUserExistsResponseSuccess(response) && response.data?.data) {
        return !response.data.data.is_new_user;
    }
    return false;
};

/**
 * Helper function to get specific user exists value safely
 * @param response - The API response from userExists
 * @param key - The user exists key to extract
 * @returns The user exists value or null if not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserExistsValue = (response: ApiResponse<UserExistsApiResponse>, key: keyof UserExistsResponse): any => {
    if (isUserExistsResponseSuccess(response) && response.data?.data) {
        return response.data.data[key];
    }
    return null;
};

/**
 * Helper function to validate user exists request data
 * @param existsData - The user exists request data
 * @returns Object with validation result and error message
 */
export const validateUserExistsData = (existsData: UserExistsRequest) => {
    const errors: string[] = [];

    // Check if either email or mobile is provided
    if (!existsData.email && !existsData.mobile) {
        errors.push('Either email or mobile number is required');
    }

    // Validate email format if provided
    if (existsData.email && !isValidEmail(existsData.email)) {
        errors.push('Please provide a valid email address');
    }

    // Validate mobile format if provided
    if (existsData.mobile && !isValidMobile(existsData.mobile)) {
        errors.push('Please provide a valid mobile number');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        errorMessage: errors.join(', ')
    };
};

/**
 * Helper function to validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Helper function to validate mobile number format
 * @param mobile - Mobile number string to validate
 * @returns Boolean indicating if mobile number is valid
 */
export const isValidMobile = (mobile: string): boolean => {
    const mobileRegex = /^[0-9]{10,15}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ''));
};


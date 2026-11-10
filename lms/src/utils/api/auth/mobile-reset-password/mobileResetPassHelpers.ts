import { ApiResponse, MobileResetPasswordApiResponse, MobileResetPasswordResponse, MobileResetPasswordRequest } from './mobileResetPassword';

/**
 * Helper function to extract reset password data from API response
 * @param response - The API response from mobileResetPassword
 * @returns Reset password data object or null if error
 */
export const extractResetPasswordData = (response: ApiResponse<MobileResetPasswordApiResponse>): MobileResetPasswordResponse | null => {
    if (response.success && response.data?.data) {
        return response.data.data;
    }
    return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from mobileResetPassword
 * @returns Error message string
 */
export const extractErrorMessage = (response: ApiResponse<MobileResetPasswordApiResponse>): string => {
    return response.message || response.data?.message || 'Password reset failed. Please try again.';
};

/**
 * Helper function to check if API response is successful
 * @param response - The API response from mobileResetPassword
 * @returns Boolean indicating if response is successful
 */
export const isMobileResetPasswordResponseSuccess = (response: ApiResponse<MobileResetPasswordApiResponse>): boolean => {
    return response.success && !!response.data;
};

/**
 * Helper function to get specific reset password value safely
 * @param response - The API response from mobileResetPassword
 * @param key - The reset password key to extract
 * @returns The reset password value or null if not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getResetPasswordValue = (response: ApiResponse<MobileResetPasswordApiResponse>, key: keyof MobileResetPasswordResponse): any => {
    if (isMobileResetPasswordResponseSuccess(response) && response.data?.data) {
        return response.data.data[key];
    }
    return null;
};

/**
 * Helper function to check if password reset was successful
 * @param response - The API response from mobileResetPassword
 * @returns Boolean indicating if password reset was successful
 */
export const isPasswordResetSuccessful = (response: ApiResponse<MobileResetPasswordApiResponse>): boolean => {
    return getResetPasswordValue(response, 'success') === true;
};

/**
 * Helper function to get reset password message
 * @param response - The API response from mobileResetPassword
 * @returns Reset password message or null if not found
 */
export const getResetPasswordMessage = (response: ApiResponse<MobileResetPasswordApiResponse>): string | null => {
    return getResetPasswordValue(response, 'message') || null;
};

/**
 * Helper function to validate mobile reset password request data
 * @param resetData - The mobile reset password request data
 * @returns Object with validation result and error message
 */
export const validateMobileResetPasswordData = (resetData: MobileResetPasswordRequest) => {
    const errors: string[] = [];

    // Check required fields
    if (!resetData.firebase_token || resetData.firebase_token.trim() === '') {
        errors.push('Firebase token is required');
    }

    if (!resetData.password || resetData.password.trim() === '') {
        errors.push('Password is required');
    }

    if (!resetData.confirm_password || resetData.confirm_password.trim() === '') {
        errors.push('Confirm password is required');
    }

    // Validate password strength
    if (resetData.password && !isValidPassword(resetData.password)) {
        errors.push('Password must be at least 6 characters long');
    }

    // Validate password match
    if (resetData.password && resetData.confirm_password && resetData.password !== resetData.confirm_password) {
        errors.push('Password and confirm password must match');
    }

    // Validate firebase token format (basic validation)
    if (resetData.firebase_token && !isValidFirebaseToken(resetData.firebase_token)) {
        errors.push('Please provide a valid firebase token');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        errorMessage: errors.join(', ')
    };
};

/**
 * Helper function to validate firebase token format
 * @param token - Firebase token string to validate
 * @returns Boolean indicating if firebase token is valid
 */
export const isValidFirebaseToken = (token: string): boolean => {
    // Basic validation for firebase token (should be a non-empty string)
    return token.length > 0 && token.trim() !== '';
};

/**
 * Helper function to validate password strength
 * @param password - Password string to validate
 * @returns Boolean indicating if password is valid
 */
export const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

/**
 * Helper function to validate password strength with additional criteria
 * @param password - Password string to validate
 * @returns Object with validation result and suggestions
 */
export const validatePasswordStrength = (password: string) => {
    const criteria = {
        length: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(criteria).filter(Boolean).length;
    let strength = 'weak';
    let suggestions: string[] = [];

    if (score < 3) {
        strength = 'weak';
        suggestions = [
            'Use at least 6 characters',
            'Include uppercase letters',
            'Include lowercase letters',
            'Include numbers',
            'Include special characters'
        ];
    } else if (score < 4) {
        strength = 'medium';
        suggestions = [
            'Include numbers',
            'Include special characters'
        ];
    } else {
        strength = 'strong';
    }

    return {
        isValid: criteria.length,
        strength,
        score,
        criteria,
        suggestions
    };
};

/**
 * Helper function to check if passwords match
 * @param password - Password string
 * @param confirmPassword - Confirm password string
 * @returns Boolean indicating if passwords match
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
};

/**
 * Helper function to check if reset password can proceed
 * @param response - The API response from mobileResetPassword
 * @returns Object with reset status and any blocking issues
 */
export const checkResetPasswordStatus = (response: ApiResponse<MobileResetPasswordApiResponse>) => {
    if (!isMobileResetPasswordResponseSuccess(response)) {
        return {
            canProceed: false,
            reason: 'Reset password failed',
            message: extractErrorMessage(response)
        };
    }

    const resetData = extractResetPasswordData(response);
    if (!resetData) {
        return {
            canProceed: false,
            reason: 'No reset data received',
            message: 'Reset password response is invalid'
        };
    }

    if (!isPasswordResetSuccessful(response)) {
        return {
            canProceed: false,
            reason: 'Reset unsuccessful',
            message: getResetPasswordMessage(response) || 'Password reset was not successful'
        };
    }

    return {
        canProceed: true,
        reason: 'Reset successful',
        message: getResetPasswordMessage(response) || 'Password reset successful'
    };
};

/**
 * Helper function to generate password strength indicator
 * @param password - Password string to analyze
 * @returns Object with strength indicator and color
 */
export const getPasswordStrengthIndicator = (password: string) => {
    const strength = validatePasswordStrength(password);
    
    const indicators = {
        weak: { color: 'red', text: 'Weak' },
        medium: { color: 'orange', text: 'Medium' },
        strong: { color: 'green', text: 'Strong' }
    };

    return {
        ...indicators[strength.strength as keyof typeof indicators],
        score: strength.score,
        maxScore: 5
    };
};


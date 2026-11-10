import { ApiResponse, MobileLoginApiResponse, MobileLoginResponse, MobileLoginRequest } from './mobileLogin';

/**
 * Helper function to extract user login data from API response
 * @param response - The API response from mobileLogin
 * @returns User login data object or null if error
 */
export const extractUserLoginData = (response: ApiResponse<MobileLoginApiResponse>): MobileLoginResponse | null => {
  if (response.success && response.data?.data) {
    return response.data.data;
  }
  return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from mobileLogin
 * @returns Error message string
 */
export const extractErrorMessage = (response: ApiResponse<MobileLoginApiResponse>): string => {
  return response.message || response.data?.message || 'Login failed. Please try again.';
};

/**
 * Helper function to check if API response is successful
 * @param response - The API response from mobileLogin
 * @returns Boolean indicating if response is successful
 */
export const isMobileLoginResponseSuccess = (response: ApiResponse<MobileLoginApiResponse>): boolean => {
  return response.success && !!response.data;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserLoginValue = (response: ApiResponse<MobileLoginApiResponse>, key: keyof MobileLoginResponse): any => {
  if (isMobileLoginResponseSuccess(response) && response.data?.data) {
    return response.data.data[key];
  }
  return null;
};


export const isUserActive = (response: ApiResponse<MobileLoginApiResponse>): boolean => {
  return getUserLoginValue(response, 'is_active') === true;
};

export const isEmailVerified = (response: ApiResponse<MobileLoginApiResponse>): boolean => {
  return getUserLoginValue(response, 'email_verified_at') !== null;
};


export const isMobileVerified = (response: ApiResponse<MobileLoginApiResponse>): boolean => {
  return getUserLoginValue(response, 'mobile_verified_at') !== null;
};


export const getAuthToken = (response: ApiResponse<MobileLoginApiResponse>): string | null => {
  return getUserLoginValue(response, 'token') || null;
};

export const getUserBasicInfo = (response: ApiResponse<MobileLoginApiResponse>) => {
  if (isMobileLoginResponseSuccess(response) && response.data?.data) {
    const user = response.data.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      country_calling_code: user.country_calling_code,
      profile: user.profile,
      type: user.type,
    };
  }
  return null;
};


export const getUserVerificationStatus = (response: ApiResponse<MobileLoginApiResponse>) => {
  if (isMobileLoginResponseSuccess(response) && response.data?.data) {
    const user = response.data.data;
    return {
      email_verified: user.email_verified_at !== null,
      mobile_verified: user.mobile_verified_at !== null,
      email_verified_at: user.email_verified_at,
      mobile_verified_at: user.mobile_verified_at,
    };
  }
  return null;
};

export const validateMobileLoginData = (loginData: MobileLoginRequest) => {
  const errors: string[] = [];

  // Check required fields
  if (!loginData.country_calling_code || loginData.country_calling_code.trim() === '') {
    errors.push('Country code is required');
  }

  if (!loginData.mobile || loginData.mobile.trim() === '' || loginData.mobile.trim().length < 5) {
    errors.push('Mobile number is required');
  }

  if (!loginData.password || loginData.password.trim() === '') {
    errors.push('Password is required');
  }

  // Validate country code format
  if (loginData.country_calling_code && !isValidCountryCode(loginData.country_calling_code)) {
    errors.push('Please provide a valid country code (e.g., +1, +44, +91)');
  }

  // Validate mobile format if provided
  if (loginData.mobile && !isValidMobile(loginData.mobile)) {
    errors.push('Please provide a valid mobile number');
  }

  // Validate password strength
  if (loginData.password && !isValidPassword(loginData.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    errorMessage: errors.join(', ')
  };
};

export const isValidCountryCode = (countryCode: string): boolean => {
  const countryCodeRegex = /^\+[1-9]\d{0,3}$/;
  return countryCodeRegex.test(countryCode);
};


export const isValidMobile = (mobile: string): boolean => {
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
};


export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};


export const formatMobileNumber = (mobile: string, countryCode: string): string => {
  return `${countryCode} ${mobile}`;
};


export const checkLoginStatus = (response: ApiResponse<MobileLoginApiResponse>) => {
  if (!isMobileLoginResponseSuccess(response)) {
    return {
      canProceed: false,
      reason: 'Login failed',
      message: extractErrorMessage(response)
    };
  }

  const userData = extractUserLoginData(response);
  if (!userData) {
    return {
      canProceed: false,
      reason: 'No user data received',
      message: 'Login response is invalid'
    };
  }

  if (!isUserActive(response)) {
    return {
      canProceed: false,
      reason: 'Account inactive',
      message: 'Your account is not active. Please contact support.'
    };
  }

  return {
    canProceed: true,
    reason: 'Login successful',
    message: 'Login successful'
  };
};

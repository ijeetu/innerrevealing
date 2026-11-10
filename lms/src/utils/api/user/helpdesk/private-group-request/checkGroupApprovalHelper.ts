import { ApiResponse, CheckGroupApprovalResponse, CheckGroupApprovalData } from './checkGroupApproval';

/**
 * Helper function to extract group approval data from API response
 * @param response - The API response from checkGroupApproval
 * @returns Group approval data or null if error
 */
export const extractData = (response: ApiResponse<CheckGroupApprovalResponse>): CheckGroupApprovalData | null => {
    if (response.success && response.data?.data) {
        return response.data.data;
    }
    return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from checkGroupApproval
 * @returns Error message string
 */
export const extractErrorMessage = (response: ApiResponse<CheckGroupApprovalResponse>): string => {
    return response.message || response.data?.message || 'Something went wrong';
};

import { ApiResponse, GroupsResponse, GroupItem } from './groups';

/**
 * Helper function to extract groups data from API response
 * @param response - The API response from getGroups
 * @returns Groups data array or null if error
 */
export const extractGroupsData = (response: ApiResponse<GroupsResponse>): GroupItem[] | null => {
    if (response.success && response.data?.data) {
        return response.data.data;
    }
    return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from getGroups
 * @returns Error message string
 */
export const extractErrorMessage = (response: ApiResponse<GroupsResponse>): string => {
    return response.message || response.data?.message || 'Something went wrong';
};

/**
 * Helper function to check if API response is successful
 * @param response - The API response from getGroups
 * @returns Boolean indicating if response is successful
 */
export const isGroupsResponseSuccess = (response: ApiResponse<GroupsResponse>): boolean => {
    return response.success && !!response.data;
};

/**
 * Helper function to filter active groups only
 * @param groups - Array of group items
 * @returns Array of active groups only
 */
export const filterActiveGroups = (groups: GroupItem[]): GroupItem[] => {
    return groups.filter(group => group.is_active === 1);
};

/**
 * Helper function to filter public groups only
 * @param groups - Array of group items
 * @returns Array of public groups only
 */
export const filterPublicGroups = (groups: GroupItem[]): GroupItem[] => {
    return groups.filter(group => group.is_private === 0);
};

/**
 * Helper function to sort groups by row order
 * @param groups - Array of group items
 * @returns Array of groups sorted by row_order
 */
export const sortGroupsByOrder = (groups: GroupItem[]): GroupItem[] => {
    return [...groups].sort((a, b) => a.row_order - b.row_order);
};

/**
 * Helper function to search groups by name or description
 * @param groups - Array of group items
 * @param searchTerm - Search term to filter by
 * @returns Array of groups matching search term
 */
export const searchGroups = (groups: GroupItem[], searchTerm: string): GroupItem[] => {
    const term = searchTerm.toLowerCase();
    return groups.filter(group => 
        group.name.toLowerCase().includes(term) || 
        group.description.toLowerCase().includes(term)
    );
};

/**
 * Helper function to get group by ID
 * @param groups - Array of group items
 * @param id - Group ID to find
 * @returns Group item or null if not found
 */
export const getGroupById = (groups: GroupItem[], id: number): GroupItem | null => {
    return groups.find(group => group.id === id) || null;
};

/**
 * Helper function to format group creation date
 * @param group - Group item
 * @returns Formatted date string
 */
export const formatGroupCreatedDate = (group: GroupItem): string => {
    const date = new Date(group.created_at);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Helper function to check if group is active
 * @param group - Group item
 * @returns Boolean indicating if group is active
 */
export const isGroupActive = (group: GroupItem): boolean => {
    return group.is_active === 1;
};

/**
 * Helper function to check if group is private
 * @param group - Group item
 * @returns Boolean indicating if group is private
 */
export const isGroupPrivate = (group: GroupItem): boolean => {
    return group.is_private === 1;
};
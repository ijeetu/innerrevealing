import { headers } from 'next/headers';
import { getAuthToken } from './cookies';


export const getTokenFromHeader = async (): Promise<string | null> => {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract token from "Bearer <token>"
    return authorization.substring(7);
  } catch (error) {
    console.error('Error getting token from header:', error);
    return null;
  }
};


export const getAuthTokenFromAnySource = async (): Promise<string | null> => {
  // First try to get from header (middleware sets this)
  const headerToken = await getTokenFromHeader();
  if (headerToken) {
    return headerToken;
  }
  
  // Fallback to cookies (client-side)
  return getAuthToken();
};

/**
 * Validate if the request has a valid authentication token
 * @returns Promise<boolean> - True if valid token exists
 */
export const isRequestAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthTokenFromAnySource();
  return token !== null && token.length > 0;
};

/**
 * Get user authentication context for API routes
 * @returns Promise<{ isAuthenticated: boolean; token: string | null }>
 */
export const getAuthContext = async (): Promise<{
  isAuthenticated: boolean;
  token: string | null;
}> => {
  const token = await getAuthTokenFromAnySource();
  return {
    isAuthenticated: token !== null && token.length > 0,
    token
  };
};

/**
 * Require authentication - throws error if not authenticated
 * @returns Promise<string> - The authentication token
 * @throws Error if not authenticated
 */
export const requireAuth = async (): Promise<string> => {
  const token = await getAuthTokenFromAnySource();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return token;
}; 
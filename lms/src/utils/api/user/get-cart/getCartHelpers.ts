import { CartApiResponse, CartData } from "./getCart";

/**
 * Helper function to extract cart items data from API response
 * @param response - The API response from getCartItems
 * @returns Cart items data object or null if error
 */
export const extractCartItemsData = (
  response: CartApiResponse | null
): CartData | null => {
  if (response && !response.error && response.data) {
    return response.data;
  }
  return null;
};

/**
 * Helper function to extract error message from API response
 * @param response - The API response from getCartItems
 * @returns Error message string
 */
export const extractErrorMessage = (
  response: CartApiResponse | null
): string => {
  if (response && response.error) {
    return response.message || "Something went wrong";
  }
  return "Something went wrong";
};

/**
 * Helper function to check if API response is successful
 * @param response - The API response from getCartItems
 * @returns Boolean indicating if response is successful
 */
export const isCartItemsResponseSuccess = (
  response: CartApiResponse | null
): boolean => {
  return response !== null && !response.error && !!response.data;
};

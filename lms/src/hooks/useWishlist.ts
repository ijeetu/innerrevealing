'use client'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { addToWishlist } from '@/utils/api/user/wishlist/addWishlist';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import { setIsLoginModalOpen } from '@/redux/reducers/helpersReducer';
import { useTranslation } from './useTranslation';

/**
 * Custom hook for managing wishlist functionality
 * Handles adding and removing courses from wishlist with proper error handling and user feedback
 */
export const useWishlist = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const isLogin = useSelector(isLoginSelector);

  /**
   * Toggle course in wishlist (add if not in wishlist, remove if already in wishlist)
   * @param courseId - The ID of the course to toggle in wishlist
   * @param isCurrentlyInWishlist - Current wishlist status of the course
   * @returns Promise<boolean> - Returns true if successful, false otherwise
   */
  const toggleWishlist = async (courseId: string | number, isCurrentlyInWishlist: boolean): Promise<boolean> => {
    // Check if user is authenticated
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return false;
    }

    // Prevent multiple simultaneous requests   
    if (isLoading) {
      return false;
    }

    try {
      setIsLoading(true);

      // Determine status: "1" to add, "0" to remove
      const status = isCurrentlyInWishlist ? 0 : 1;

      // Call the wishlist API with params
      const response = await addToWishlist({
        course_id: courseId,
        status: status,
      });

      // Handle response - check if it's null (network error) or has error
      if (!response) {
        toast.error('Network error. Please try again.');
        return false;
      }

      // Check if API returned an error
      if (response.error) {
        const action = isCurrentlyInWishlist ? 'remove from' : 'add to';
        toast.error(response.message || response.error || `Failed to ${action} wishlist`);
        return false;
      }

      // Success - show success message
      const action = isCurrentlyInWishlist ? 'removed from' : 'added to';
      toast.success(response.message || `Course ${action} wishlist`);
      return true;

    } catch (error) {
      // Handle unexpected errors
      console.error('Wishlist error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleWishlist,
    isLoading,
    isAuthenticated: isLogin
  };
};
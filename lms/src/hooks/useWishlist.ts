'use client'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { webRequest } from '@/utils/webApi';
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

      await webRequest(`/api/learning/wishlist/${Number(courseId)}`, { method: 'POST', body: { saved: !isCurrentlyInWishlist } });

      // Success - show success message
      const action = isCurrentlyInWishlist ? 'removed from' : 'added to';
      toast.success(`Course ${action} wishlist`);
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
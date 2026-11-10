import { useSelector } from "react-redux";
import { isRTLSelector } from "@/redux/reducers/languageSlice";
import { useEffect } from "react";

/**
 * Custom hook for RTL (Right-to-Left) functionality
 * Manages RTL state and applies RTL styles to the document
 * 
 * @returns {Object} Object containing isRTL state and RTL utility functions
 */
export const useRTL = () => {
  // Get RTL state from Redux
  const isRTL = useSelector(isRTLSelector);

  // Apply RTL styles to document when RTL state changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isRTL) {
      // Apply RTL styles
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.classList.add('rtl');
      htmlElement.classList.remove('ltr');
    } else {
      // Apply LTR styles
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.classList.add('ltr');
      htmlElement.classList.remove('rtl');
    }

    // Cleanup function to reset when component unmounts
    return () => {
      htmlElement.removeAttribute('dir');
      htmlElement.classList.remove('rtl', 'ltr');
    };
  }, [isRTL]);

  /**
   * Get RTL-aware class names
   * @param {string} ltrClass - Class for LTR direction
   * @param {string} rtlClass - Class for RTL direction
   * @returns {string} Appropriate class based on RTL state
   */
  const getRTLClass = (ltrClass: string, rtlClass: string): string => {
    return isRTL ? rtlClass : ltrClass;
  };

  /**
   * Get RTL-aware margin/padding classes
   * @param {string} leftClass - Left margin/padding class
   * @param {string} rightClass - Right margin/padding class
   * @returns {string} Appropriate class based on RTL state
   */
  const getRTLMargin = (leftClass: string, rightClass: string): string => {
    return isRTL ? rightClass : leftClass;
  };

  /**
   * Get RTL-aware text alignment
   * @returns {string} 'text-right' for RTL, 'text-left' for LTR
   */
  const getRTLTextAlign = (): string => {
    return isRTL ? 'text-right' : 'text-left';
  };

  /**
   * Get RTL-aware flex direction
   * @returns {string} 'flex-row-reverse' for RTL, 'flex-row' for LTR
   */
  const getRTLFlexDirection = (): string => {
    return isRTL ? 'flex-row-reverse' : 'flex-row';
  };

  return {
    isRTL,
    getRTLClass,
    getRTLMargin,
    getRTLTextAlign,
    getRTLFlexDirection,
  };
};


"use client";
import React, { useState, useEffect } from "react";
import ImagePlaceholder from "../../../assets/images/placeholderImage.svg";
import { useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";

// Type definitions for the component props
interface CustomImageTagProps {
  src: string | { src: string } | null | undefined;
  alt: string;
  className?: string;
  loadingBuilder?: () => React.ReactNode;
  fadeInDuration?: number;
}

const CustomImageTag: React.FC<CustomImageTagProps> = ({
  src,
  alt,
  className = "",
  loadingBuilder = null,
  fadeInDuration = 300,
}) => {
  const settings = useSelector(settingsSelector);
  
  // Get placeholder - prefer settings placeholder, fallback to local
  const settingsPlaceholder = settings?.data?.placeholder_image;
  const localPlaceholder = ImagePlaceholder.src;
  const placeholder = settingsPlaceholder || localPlaceholder;

  // Extract actual source URL
  const actualSrc: string | null = 
    typeof src === "object" && src?.src 
      ? src.src 
      : typeof src === 'string' 
        ? src 
        : null;

  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Update image source when actualSrc changes
  useEffect(() => {
    if (!actualSrc) {
      // No source provided, use placeholder
      setImageSrc(placeholder);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Data URL - use directly
    if (actualSrc.startsWith('data:')) {
      setImageSrc(actualSrc);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Regular image URL - start loading
    setIsLoading(true);
    setHasError(false);
    setImageSrc(actualSrc);
  }, [actualSrc, placeholder]);

  // Handle image load success
  const handleLoad = (): void => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image error - fallback to placeholder
  const handleError = (): void => {
    // If already showing local placeholder, don't retry (prevents infinite loop)
    if (imageSrc === localPlaceholder) {
      return;
    }

    // If settings placeholder failed, use local placeholder
    if (imageSrc === settingsPlaceholder && settingsPlaceholder) {
      setImageSrc(localPlaceholder);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // For any other error, use placeholder
    setImageSrc(placeholder);
    setIsLoading(false);
    setHasError(true);
  };

  // Loading state component
  const defaultLoadingState: React.ReactNode = (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
      <img
        src={placeholder}
        alt="loading"
        className="w-full h-full object-contain"
      />
    </div>
  );

  // Fade-in style for loaded images
  const fadeInStyle: React.CSSProperties = {
    opacity: isLoading ? 0 : 1,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Show loading state */}
      {isLoading && actualSrc && !hasError && (
        loadingBuilder ? loadingBuilder() : defaultLoadingState
      )}

      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} w-full h-full`}
        style={actualSrc && !isLoading ? fadeInStyle : { opacity: 1 }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

export default CustomImageTag;

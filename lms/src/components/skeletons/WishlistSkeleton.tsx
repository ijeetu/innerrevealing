import React from 'react';

/**
 * WishlistSkeleton Component
 * 
 * This component provides a skeleton loading state for wishlist items.
 * It matches the structure of the actual wishlist items to provide
 * a smooth loading experience.
 * 
 * Features:
 * - Animated skeleton placeholders for image, rating, title, author, and price
 * - Responsive design that matches the actual wishlist layout
 * - Multiple skeleton items to simulate a realistic loading state
 */
const WishlistSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Render 4 skeleton items to match typical wishlist loading */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-[5px] shadow-sm bg-white items-center relative animate-pulse"
        >
          {/* Action Buttons Skeleton - Positioned like actual buttons */}
          <div className="flex items-center gap-2 w-full justify-start xl:absolute xl:top-4 xl:right-4 xl:w-auto order-last mt-4 lg:mt-0">
            {/* Remove button skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <div className="w-12 h-4 bg-gray-300 rounded"></div>
            </div>
            {/* Add to Cart button skeleton */}
            <div className="w-20 h-8 bg-gray-300 rounded-[5px]"></div>
          </div>

          {/* Image Skeleton */}
          <div className="col-span-4 lg:col-span-3 xl:col-span-2 h-[84px] sm:h-24 bg-gray-300 rounded-[5px]"></div>

          {/* Content Skeleton */}
          <div className="col-span-8 lg:col-span-9 xl:col-span-10 space-y-2 lg:text-left">
            {/* Rating skeleton */}
            <div className="flex items-center justify-center lg:justify-start gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <div className="w-6 h-4 bg-gray-300 rounded"></div>
              <div className="w-8 h-4 bg-gray-300 rounded"></div>
            </div>
            
            {/* Title skeleton */}
            <div className="w-3/4 h-5 bg-gray-300 rounded"></div>
            
            {/* Author skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
            
            {/* Price skeleton */}
            <div className="flex gap-2">
              <div className="w-12 h-4 bg-gray-300 rounded"></div>
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistSkeleton;

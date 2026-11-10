"use client";
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaStar, FaTrashAlt } from "react-icons/fa";
import { getWishlist, WishlistCourse } from "@/utils/api/user/wishlist/getWishlist";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import WishlistSkeleton from "@/components/skeletons/WishlistSkeleton";
import { useWishlist } from "@/hooks/useWishlist";
import DataNotFound from "@/components/commonComp/DataNotFound";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { addToCart } from "@/utils/api/user/get-cart/addToCart";
import { cartStateSelector, setCartData } from "@/redux/reducers/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { isLoginSelector, userDataSelector } from "@/redux/reducers/userSlice";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import PurchaseCourseNegativeWalletBalanceModal from "@/components/commonComp/PurchaseCourseNegativeWalletBalanceModal";
import { removeFromCart } from "@/utils/api/user/get-cart/removeFromCart";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "react-hot-toast";


export default function Wishlist() {

  // State management for wishlist data
  const [wishlistData, setWishlistData] = useState<WishlistCourse[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  // const [pagination, setPagination] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // state for adding to cart
  const [loadingCartId, setLoadingCartId] = useState<number | null>(null);
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading: wishlistToggleLoading } = useWishlist();

  const cartData = useSelector(cartStateSelector);
  const isLogin = useSelector(isLoginSelector);
  const userData = useSelector(userDataSelector) as UserDetails;

  const [showNegativeBalanceModal, setShowNegativeBalanceModal] = useState(false);

  const { t } = useTranslation();
  // Function to fetch wishlist data from API
  const fetchWishlist = async (page: number = 1, append: boolean = false): Promise<boolean> => {
    // Prevent multiple simultaneous requests
    if (wishlistLoading) {
      return false;
    }

    try {
      setWishlistLoading(true);

      // Call the get wishlist API
      const response = await getWishlist({
        page,
        per_page: 4,
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            const courses = response.data.data;

            // Update state based on whether we're appending or replacing data
            if (append && page > 1) {
              // Append new courses to existing data
              setWishlistData(prev => [...prev, ...courses]);
            } else {
              // Replace existing data
              setWishlistData(courses);
            }
          } else {
            console.log('No wishlist data found in response');
            if (!append) {
              setWishlistData([]);
            }
          }

          // Set pagination data directly from response
          if (response.data) {
            // setPagination(response.data);
            setHasMorePages(response.data.current_page < response.data.last_page);
          } else {
            // setPagination(null);
            setHasMorePages(false);
          }

          // Mark that we've completed initial load
          if (!append) {
            setHasInitiallyLoaded(true);
          }
          return true;
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch wishlist");

          // Clear data on error if not appending
          if (!append) {
            setWishlistData([]);
            setHasInitiallyLoaded(true); // Mark as loaded even on error
          }
          setHasMorePages(false);
          return false;
        }
      } else {
        console.log("response is null in component", response);

        // Clear data on error if not appending
        if (!append) {
          setWishlistData([]);
          setHasInitiallyLoaded(true); // Mark as loaded even on error
        }
        setHasMorePages(false);
        return false;
      }

    } catch (error) {
      extractErrorMessage(error);

      // Clear data on error if not appending
      if (!append) {
        setWishlistData([]);
        setHasInitiallyLoaded(true); // Mark as loaded even on error
      }
      setHasMorePages(false);
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  // Function to load more wishlist items (pagination)
  const loadMoreWishlist = async () => {
    if (hasMorePages && !wishlistLoading && !loadingMore) {
      const nextPage = currentPage + 1;
      setLoadingMore(true);
      const success = await fetchWishlist(nextPage, true);
      if (success) {
        setCurrentPage(nextPage);
      }
      setLoadingMore(false);
    }
  };

  // Function to add or remove item from cart
  // Checks if course is already in cart and toggles accordingly
  const handleAddToCart = async (courseId: number, InCart?: boolean) => {
    if (!isLogin) {
      toast.error(t("login_first"));
      return;
    }

    if (!InCart && userData?.total_balance !== undefined && userData?.total_balance !== null && userData.total_balance < 0) {
      setShowNegativeBalanceModal(true);
      return;
    }

    try {
      setLoadingCartId(courseId);
      let response;

      // If course is in cart, remove it; otherwise add it
      if (InCart) {
        response = await removeFromCart(courseId);
      } else {
        response = await addToCart(courseId);
      }

      // Handle successful response
      if (response && !response.error) {
        dispatch(setCartData(response.data));
        toast.success(response.message || (InCart ? "Removed from cart" : "Added to cart"));
      } else {
        // Handle error response
        toast.error(response?.message || `Failed to ${InCart ? "remove from" : "add to"} cart`);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(`An unexpected error occurred while ${InCart ? "removing from" : "adding to"} cart`);
    } finally {
      setLoadingCartId(null);
    }
  };

  // Load wishlist data when component mounts
  useEffect(() => {
    setHasInitiallyLoaded(false); // Reset initial load state
    fetchWishlist(1, false);
  }, []);


  // Function to remove item from wishlist using the existing toggle function
  const removeFromWishlist = async (courseId: number) => {
    // Use the existing toggle function with isCurrentlyInWishlist = true (to remove)
    const success = await toggleWishlist(courseId, true);

    if (success) {
      // Remove from local state immediately for better UX
      setWishlistData(prev => prev.filter(course => course.id !== courseId));

      // If this was the last item on the current page, go back to previous page
      if (wishlistData.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        // Optionally refresh the wishlist data
        fetchWishlist(currentPage - 1, false);
      }
    }
  };

  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("my_wishlist")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 inline-flex items-center gap-1 max-w-full flex-wrap">
            <Link href={"/"} className="primaryColor" title="home">
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_wishlist")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar />

            <div className="bg-white flex-1 w-full rounded-[10px]">
              <h2 className="text-lg font-semibold text-gray-800 py-4 px-3 sm:px-6 border-b border-gray-200 mb-0">
                {t("my_wishlist")}
              </h2>

              <div className="p-3 sm:p-6 space-y-6">


                {/* Show skeleton only on initial load when we haven't loaded data yet */}
                {wishlistLoading && !hasInitiallyLoaded && (
                  <WishlistSkeleton />
                )}

                {/* Show empty state only when we've completed initial load and have no data */}
                {hasInitiallyLoaded && !wishlistLoading && wishlistData.length === 0 && (
                  <DataNotFound />
                )}

                {hasInitiallyLoaded && wishlistData.map((item) => {
                  const InCart = cartData?.cartData?.courses?.some((course) => course.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 w-full gap-4 p-4 rounded-[5px] sectionBg items-center relative"
                    >
                      {/* Action Buttons - Only positioned absolutely on large screens (1300px+) */}
                      <div className="flex w-full flex-wrap items-center gap-2 justify-end  xl:absolute xl:top-4 ltr:xl:right-4 rtl:xl:left-4 xl:w-auto order-last  mt-4 lg:mt-0">
                        <button onClick={() => removeFromWishlist(item.id)} disabled={wishlistToggleLoading} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          <FaTrashAlt />
                          {t("remove")}
                        </button>
                        {item.course_type === "paid" && !item.is_enrolled && (
                          <button
                            onClick={() => handleAddToCart(item.id, InCart)}
                            disabled={loadingCartId === item.id}
                            className={`px-4 py-2 rounded-[5px] text-sm font-light transition-colors whitespace-nowrap
                        ${InCart ? "bg-red-400  text-white" : "primaryBg text-white hover:primaryBg"}`}
                          >
                            {loadingCartId === item.id
                              ? (InCart ? t("removing_from_cart") : t("adding_to_cart"))
                              : InCart
                                ? t("remove_from_cart")
                                : t("add_to_cart")}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-5 max-[400px]:flex-wrap">
                        <div className="shrink-0 w-[148px] h-[110px] sm:h-24 bg-gray-200 rounded-[5px] ">
                          {/* If using Next/Image - Ensure you have a valid image path */}
                          {item.thumbnail && (
                            <CustomImageTag src={item.thumbnail} alt={item.title} className="shrink-0 rounded-md w-full h-full object-contain" />
                          )}
                        </div>

                        <div className="col-span-8 lg:col-span-9 xl:col-span-10 space-y-1 lg:text-left">
                          <div className="flex items-center justify-start gap-1 text-sm text-gray-600">
                            <FaStar className="text-yellow-400" />
                            <span className="font-semibold">
                              {item.average_rating.toFixed(1)}
                            </span>
                            <span>({item.ratings?.toLocaleString()})</span>
                          </div>
                          <Link href={`/course-details/${item.slug}`} className="font-semibold text-gray-800 text-md line-clamp-2">
                            {item.title}
                          </Link>
                          <p className="text-sm text-gray-900 font-medium">
                            {t("by")} <span className="underline">{item.author_name}</span>
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {item.is_enrolled ? <div className="flex items-center justify-between">
                              <span className="text-md  font-semibold text-[#83B807]">
                                {t("enrolled")}
                              </span>
                            </div> : item.original_price === 0 && item.course_discount === 0 ? (
                              <span className="font-semibold text-md text-gray-900">
                                {t("free")}
                              </span>
                            ) : item.course_discount > 0 ? (
                              <>
                                <span className="font-semibold text-md text-gray-900">
                                  {getCurrencySymbol()}{item.subtotal.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  {getCurrencySymbol()}{item.original_price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold text-md text-gray-900">
                                {getCurrencySymbol()}{item.original_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Show skeleton for load more - 4 skeleton items */}
                {loadingMore && (
                  <WishlistSkeleton />
                )}

                {/* Show Load More button only if there are more pages and we have data */}
                {hasMorePages && wishlistData.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreWishlist}
                      disabled={wishlistLoading}
                      className="commonBtn w-full md:w-max disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {wishlistLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {t("loading")}
                        </div>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showNegativeBalanceModal && (
        <PurchaseCourseNegativeWalletBalanceModal
          forceOpen={showNegativeBalanceModal}
          onClose={() => setShowNegativeBalanceModal(false)}
        />
      )}
    </Layout>
  );
}

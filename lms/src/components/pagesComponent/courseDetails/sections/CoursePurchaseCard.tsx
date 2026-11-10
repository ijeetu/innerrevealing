"use client";
import React, { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiGlobe,
  FiAward,
  FiLock,
  FiTag,
  FiClock,
  FiTrash2,
} from "react-icons/fi";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLink,
  FaPlay,
  FaRegPlayCircle,
  FaRegBookmark,
  FaBookmark,
  FaCheckCircle,
} from "react-icons/fa";
import { Course, PreviewVideo } from "@/utils/api/user/getCourse";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";
import CoursePreviewModal from "@/components/modals/CoursePreviewModal";
import CheckoutDialog from "@/components/pagesComponent/cart/CheckoutDialog";
import CouponDialog from "@/components/pagesComponent/cart/CouponDialog";
import { Dialog } from "@/components/ui/dialog";
import { useSelector, useDispatch } from "react-redux";
import { placeOrder, PlaceOrderData } from "@/utils/api/user/placeOrder";
import { isLoginSelector, userDataSelector } from "@/redux/reducers/userSlice";
import { addToCart } from "@/utils/api/user/get-cart/addToCart";
import { removeFromCart } from "@/utils/api/user/get-cart/removeFromCart";
import {
  getCartData,
  removeCourseFromCart,
  setCartData,
  updateCartFromResponse,
} from "@/redux/reducers/cartSlice";
import { getAppliedCouponForCourse, removeCoupon, applyCoupon as applyCouponAction, clearAllCoupons } from "@/redux/reducers/couponSlice";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { CartData } from "@/utils/api/user/get-cart/getCart";
import { getCourseCoupons, CourseCoupon } from "@/utils/api/user/getCourseCoupons";
import { applyPromoCode } from "@/utils/api/user/applyCoupon";
import { useTranslation } from "@/hooks/useTranslation";
import { RootState } from "@/redux/store";
import { getCurrencySymbol, getDurationLabel } from "@/utils/helpers";
import { isCartPromoAppliedSelector, setEnrollingCourseSlug, setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import { TwitterShareButton, FacebookShareButton, XIcon, XShareButton } from "react-share";
import PurchaseCourseNegativeWalletBalanceModal from "@/components/commonComp/PurchaseCourseNegativeWalletBalanceModal";

interface CoursePurchaseCardProps {
  isSticky: boolean;
  courseData: Course;
}

const CoursePurchaseCard: React.FC<CoursePurchaseCardProps> = ({
  isSticky,
  courseData,
}) => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [previewVideos, setPreviewVideos] = useState<PreviewVideo[]>([]);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const refundPolicySettings = useSelector(settingsSelector);

  // Checkout dialog states
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  // Coupon dialog states
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [shouldFetchCoupons, setShouldFetchCoupons] = useState(false);
  const [showNegativeBalanceModal, setShowNegativeBalanceModal] = useState(false);

  // Stripe payment modal states

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // State for available coupons and loading
  const [availableCoupons, setAvailableCoupons] = useState<CourseCoupon[]>([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  const appliedCoupon = useSelector((state: RootState) => getAppliedCouponForCourse(state, courseData.id as number));
  const couponSummary = appliedCoupon?.summary;




  const {
    toggleWishlist,
    isLoading: wishlistLoading,
    isAuthenticated,
  } = useWishlist();

  // Get user and settings from Redux store
  const user = useSelector(userDataSelector) as UserDetails;
  const isLogin = useSelector(isLoginSelector);
  const settings = useSelector(settingsSelector);
  const cartData = useSelector(getCartData);
  const adminPromoCode = useSelector(isCartPromoAppliedSelector);
  const dispatch = useDispatch();
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const { t } = useTranslation();

  const appliedCoupons = useSelector((state: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    state.coupon.appliedCoupons.filter((applied: any) => applied.courseId === courseData.id)
  );

  // Check if course is in cart - only after component mounts to prevent hydration mismatch
  const isCourseInCart = () => {
    if (!isMounted || !cartData || !cartData.courses) return false;
    return cartData.courses.some((course) => course.id === courseData.id);
  };
  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging to help troubleshoot token issues
  useEffect(() => { }, [isLogin, user, settings, isAuthenticated]);

  // Filter preview videos to include both intro videos and free preview videos
  const previewVideosToShow =
    courseData.preview_videos?.filter(
      (video: PreviewVideo) =>
        video.type === "intro" || video.free_preview === true
    ) || [];

  // set preview videos to the state
  useEffect(() => {
    setPreviewVideos(previewVideosToShow);
  }, [courseData.preview_videos]);

  useEffect(() => {
    // Keep the wishlist button state in sync with auth changes.
    // When user logs out, we reset wishlist state to avoid showing stale active icon.
    if (!isAuthenticated) {
      setIsWishlisted(false);
      return;
    }

    setIsWishlisted(courseData.is_wishlist || false);
  }, [courseData.is_wishlist, isAuthenticated]);

  // Handle wishlist toggle with proper API integration
  const handleWishlistToggle = async () => {

    const success = await toggleWishlist(
      courseData.id.toString(),
      isWishlisted
    );
    // Update local state only if API call was successful
    if (success) {
      const newStatus = !isWishlisted;
      setIsWishlisted(newStatus);
    }
  };

  // Function to handle applying coupon from the input field (similar to CouponDialog)
  const handleApplyCoupon = async (): Promise<void> => {
    // Validate coupon code is not empty
    if (!couponCode.trim()) {
      toast.error("Please enter a valid coupon code");
      return;
    }

    // Set loading state
    setIsApplyingCoupon(true);

    try {
      // First, fetch available coupons if we don't have them yet
      let couponsToSearch = availableCoupons;

      if (couponsToSearch.length === 0) {
        // Fetch available coupons for this course
        const couponsResponse = await getCourseCoupons({
          course_id: courseData.id,
        });

        if (couponsResponse.success && couponsResponse.data) {
          const couponsData = Array.isArray(couponsResponse.data) ? couponsResponse.data : [];
          setAvailableCoupons(couponsData);
          couponsToSearch = couponsData;
        } else {
          toast.error(couponsResponse.error || "Failed to fetch available coupons");
          setIsApplyingCoupon(false);
          return;
        }
      }

      // Find the coupon in available coupons by code (case-insensitive)
      const couponToApply = couponsToSearch.find(
        (coupon) => coupon.promo_code.toLowerCase() === couponCode.trim().toLowerCase()
      );

      // Check if coupon was found
      if (!couponToApply) {
        toast.error("Invalid coupon code. Please check and try again.");
        setIsApplyingCoupon(false);
        return;
      }

      // Call the API to calculate discount with the coupon (single promo code)
      const response = await applyPromoCode(courseData.id, couponToApply.id, couponCode.trim());

      // Check if API call was successful
      if (response.success && response.data) {
        // Store the coupon code for success message before clearing
        const appliedCouponCode = couponCode.trim();

        // Apply the coupon to Redux state (same as CouponDialog)
        dispatch(applyCouponAction({
          courseId: courseData.id,
          coupon: couponToApply,
          summary: response.data
        }));

        // Update discount data state
        // Add to cart api only call if the course in the alreday in the cart and coupon id not applied yet
        if (cartData && cartData.courses.find((course) => course.id === courseData.id)) {
          const responseAddToCart = await addToCart(courseData.id, couponToApply.id, appliedCouponCode);
          if (responseAddToCart && !responseAddToCart.error) {
            dispatch(setCartData(responseAddToCart.data as unknown as CartData));
          }
        }
        // Clear the input field after successful application
        setCouponCode("");

        // Show success message
        toast.success(`Coupon "${appliedCouponCode}" applied successfully!`);
      } else {
        // Handle API error response
        console.error("Failed to apply coupon:", response.error);
        toast.error(response.error || "Failed to apply coupon");
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      // Reset loading state
      setIsApplyingCoupon(false);
    }
  };

  // Handle removing applied coupon
  const handleRemoveCoupon = async (couponId?: number): Promise<void> => {
    if (couponId) {
      // Remove specific coupon
      dispatch(removeCoupon(courseData.id));
      setCouponCode("");

      // IMPORTANT: Also update cart if this course is in the cart
      if (cartData && cartData.courses.find((course) => course.id === courseData.id)) {
        try {
          // Call addToCart with empty/null coupon to remove it from cart item
          const responseAddToCart = await addToCart(
            courseData.id,
            undefined,  // No coupon ID
            undefined   // No promo code
          );

          if (responseAddToCart && !responseAddToCart.error) {
            // Update Redux cart state with new response (without coupon)
            dispatch(setCartData(responseAddToCart.data as unknown as CartData));
            toast.success("Coupon removed successfully!");
          } else {
            toast.error(responseAddToCart?.message || "Failed to update cart");
          }
        } catch (error) {
          console.error("Error updating cart:", error);
          toast.error("Failed to update cart after removing coupon");
        }
      } else {
        // Course not in cart, just show success
        toast.success("Coupon removed successfully!");
      }
    } else if (appliedCoupons.length > 0) {
      // Remove all coupons for this course
      appliedCoupons.forEach(() => {
        dispatch(removeCoupon(courseData.id));
      });
      setCouponCode("");
    }
  };

  // Handle applying coupon with discount data (without opening payment modal)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  const handleApplyCouponWithDiscount = (): void => {
    // console.log("handleApplyCouponWithDiscount called with discountData:", discountData);
    // Just store the discount data, don't open payment modal
  };

  // Handle enrollment for paid courses - opens checkout dialog first
  // Handle enrollment for free courses - calls API directly
  const handleEnrollNow = async (): Promise<void> => {
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }

    if (user?.total_balance !== undefined && user?.total_balance !== null && user.total_balance < 0) {
      setShowNegativeBalanceModal(true);
      return;
    }

    // For free courses, handle enrollment directly via API
    if (isFree) {
      try {
        // TODO: Implement free course enrollment API call
        toast.success("Successfully enrolled in the free course!");
        // console.log("Enrolling in free course:", courseData.id);
        // Set loading state for free enrollment
        setIsProcessingPayment(true);

        // Prepare order data for free course enrollment
        // For free courses, payment_method should be empty string
        const orderData: PlaceOrderData = {
          payment_method: "", // Empty string for free courses
          course_id: courseData.id,
          buy_now: 1, // Direct purchase
          type: "web",
        };

        // Call the place_order API for free enrollment
        const response = await placeOrder(orderData);

        if (response.success) {
          // Check if the API response indicates success
          if (response.data && !response.data.error) {
            // Show success message from API
            toast.success(response.data.message || "Free course enrolled successfully!");

            // Refresh the page or update course status if needed
            // You might want to redirect to the course learning page or refresh course data
            if (response.data.data?.is_free) {
              // Free course enrolled successfully
              // Optionally redirect to course or refresh the page after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          } else {
            // Handle API error response
            const errorMessage =
              response.data?.message ||
              response.message ||
              "Failed to enroll in free course";
            toast.error(errorMessage);

            // If user already purchased the course, show specific message
            if (response.data?.code === 422) {
              toast.error("You have already enrolled in this course.");
            }
          }
        } else {
          // Handle API call failure
          toast.error(
            response.message || "Failed to enroll in free course. Please try again."
          );
        }
      } catch (error) {
        console.error("Free enrollment error:", error);
        toast.error("Failed to enroll in the course. Please try again.");
      } finally {
        // Reset loading state
        setIsProcessingPayment(false);
      }
      return;
    }

    // For paid courses, open checkout dialog first
    setShowCheckoutDialog(true);
    dispatch(setEnrollingCourseSlug(courseData.slug));
  };

  const handleAddToCart = async () => {
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }
    if (user?.total_balance !== undefined && user?.total_balance !== null && user.total_balance < 0) {
      setShowNegativeBalanceModal(true);
      return;
    }
    try {
      setIsLoadingCart(true);
      const response = await addToCart(courseData.id, appliedCoupon?.coupon?.id, appliedCoupon?.coupon?.promo_code);
      if (response && !response.error) {
        toast.success(response.message || "Item added to cart");

        // Update cart with the full cart response from API
        if (response.data) {
          dispatch(updateCartFromResponse(response.data as unknown as CartData));
        }
        // console.log("Cart updated with response:", response.data);
      } else {
        toast.error(response?.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("An unexpected error occurred while adding item to cart");
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Add this function to handle remove from cart
  const handleRemoveFromCart = async () => {
    try {
      setIsLoadingCart(true);
      const response = await removeFromCart(courseData.id);

      if (response && !response.error) {
        toast.success(response.message || "Item removed from cart");
        dispatch(removeCoupon(courseData.id));
        // Update cart state by removing the course
        dispatch(removeCourseFromCart(courseData.id));
      } else {
        toast.error(response?.message || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("An unexpected error occurred while removing item from cart");
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Handle proceed to checkout from checkout dialog
  const handleProceedToCheckout = async (
    paymentMethod: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    discountData?: any
  ): Promise<void> => {
    console.log(
      "handleProceedToCheckout called with paymentMethod:",
      paymentMethod
    );

    // Validate payment method
    const validMethods = ["wallet", "stripe", "flutterwave", "razorpay", "paypal"];
    if (!validMethods.includes(paymentMethod)) {
      toast.error(`Invalid payment method. Supported methods: ${validMethods.join(', ')}`);
      return;
    }

    // Check if user is authenticated (using static token for testing)
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }

    // Initiate payment process
    setIsProcessingPayment(true);
    try {
      // Prepare order data for the API
      const orderData: PlaceOrderData = {
        payment_method: paymentMethod,
        course_id: courseData.id,
        buy_now: 1, // Direct purchase
        // Add promo code ID if coupon is applied (use discountData if available, otherwise fallback to appliedCoupons)
        ...((discountData?.applied_promo_code?.id || appliedCoupons.length > 0) && {
          promo_code_id: discountData?.applied_promo_code?.id || appliedCoupons[0]?.coupon.id
        }),
      };

      const response = await placeOrder(orderData);

      if (response.success) {
        // Check if the API response indicates success
        if (response.data && !response.data.error) {
          // Close checkout dialog on success
          setShowCheckoutDialog(false);

          if (appliedCoupon) {
            dispatch(clearAllCoupons());
          }

          if (paymentMethod === "wallet") {
            toast.success(response.data.message || "Order placed successfully!");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }

          // Extract payment details from the response
          const paymentData = response.data.data?.payment as unknown as { provider: string; url: string } | undefined;

          if (paymentData && paymentData.provider) {
            // Show loading message and redirect to payment gateway
            toast.success(`Redirecting to secure ${paymentData.provider} payment page...`);

            // Small delay to show the toast message before redirect
            setTimeout(() => {
              window.location.href = paymentData.url;
            }, 1000);
          } else {
            // Handle unsupported payment methods or missing payment data
            toast.error("Payment method not supported or payment data missing");
            console.error(
              "Payment data missing or unsupported provider:",
              paymentData
            );
          }
        } else {
          // Handle API error response
          const errorMessage =
            response.data?.message ||
            response.message ||
            "Failed to place order";
          toast.error(errorMessage);

          // If user already purchased the course, show specific message
          if (response.data?.code === 422) {
            toast.error("You have already purchased this course.");
          }
        }
      } else {
        // Handle API call failure
        toast.error(
          response.message || "Failed to place order. Please try again."
        );

      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };



  const isFree =
    courseData.course_type === "free";

  const courseUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/course-details/${courseData.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(courseUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast.error("Failed to copy link");
    }
  };


  return (
    <div
      className={`max-1199:relative max-1199:top-4  ${isSticky ? "sticky top-4" : "max-1199:mt-0 -mt-72"}`}
    >
      <div
        className={`
          max-1199:w-full
          between-1200-1399:max-w-full max-w-md mx-auto bg-white rounded-2xl shadow-[0px_7px_28px_2px_#ADB3B83D] 
          overflow-hidden border border-gray-200 p-5 space-y-5
          transition-all duration-300 ease-in-out `}
      >
        {/* Video Preview Section */}
        <div className="relative bg-gray-300 w-full aspect-video rounded-[8px] overflow-hidden max-1199:hidden ">
          {courseData.image ? (
            <CustomImageTag
              src={courseData.image}
              alt={courseData.title}
              className="object-cover max-h-[278px] w-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-300"></div>
          )}
          {/* Video Preview Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            >
              <FaPlay className="primaryColor text-xl ml-1" />
            </button>
            {/* Preview Modal */}
            <CoursePreviewModal
              previewVideos={previewVideos}
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>

        <div className="relative bg-gray-300 w-full aspect-video rounded-[8px] overflow-hidden max-1199:block hidden">
          {courseData.image ? (
            <CustomImageTag
              src={courseData.image}
              alt={courseData.title}
              className="object-cover max-h-[278px] w-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-300"></div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            >
              <FaPlay className="primaryColor text-xl ml-1" />
            </button>
            {/* Preview Modal */}
            <CoursePreviewModal
              previewVideos={previewVideos}
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>

        {/* Price Section */}
        <div className="">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center flex-wrap">
              {isFree ? (
                <span className="text-2xl font-bold text-green-600">Free</span>
              ) : courseData?.discount_percentage && courseData?.discount_percentage > 0 && courseData?.discount_percentage < 100 ? (
                <>
                  <span className="text-2xl font-bold text-gray-800">
                    {getCurrencySymbol()}{courseData?.subtotal?.toFixed(2)}
                  </span>
                  <span className="text-gray-500 line-through ltr:ml-2 rtl:mr-2">
                    {getCurrencySymbol()}{courseData?.original_price?.toFixed(2)}
                  </span>
                  {courseData?.discount_percentage > 0 && (
                    <span className="ltr:ml-2 rtl:mr-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                      {courseData?.discount_percentage}% {t("off")}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-800">
                  {getCurrencySymbol()}{courseData?.original_price?.toFixed(2) || "0.00"}
                </span>
              )}
            </div>
            {/* Update this button to use the wishlist functionality */}
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`bg-white rounded-full border ${isWishlisted && "primaryBorder"
                } !border-black p-2 group/bookmark hover:primaryBorder transition-all duration-300 z-10 ${wishlistLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
                }`}
            >
              {isWishlisted ? (
                <FaBookmark className="primaryColor" size={18} />
              ) : (
                <FaRegBookmark
                  className="group-hover/bookmark:primaryColor transition-all duration-300"
                  size={18}
                />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-2">
            <button className="commonBtn !w-full lg:!text-xl"
              onClick={handleEnrollNow}
              disabled={isProcessingPayment}
            >
              {isFree ? t("enroll_for_free") : t("enroll_now")}
            </button>
            {!isFree && (
              // Show loading state until component is mounted to prevent hydration mismatch
              !isMounted ? (
                <button
                  className="w-full py-2 px-4 border borderPrimary primaryColor rounded-[4px] font-medium disabled:opacity-50 disabled:cursor-not-allowed lg:!text-xl"
                  disabled={true}
                >
                  {t("loading")}
                </button>
              ) : isCourseInCart() ? (
                <button
                  className="w-full py-2 px-4 border borderPrimary primaryColor rounded-[4px] font-medium disabled:opacity-50 disabled:cursor-not-allowed lg:!text-xl"
                  onClick={handleRemoveFromCart}
                  disabled={isLoadingCart}
                >
                  {isLoadingCart ? t("removing") : t("remove_from_cart")}
                </button>
              ) : (
                <button
                  className="w-full py-2 px-4 border borderPrimary primaryColor rounded-[4px] font-medium disabled:opacity-50 disabled:cursor-not-allowed lg:!text-xl"
                  onClick={handleAddToCart}
                  disabled={isLoadingCart}
                >
                  {isLoadingCart ? t("adding") : t("add_to_cart")}
                </button>
              )
            )}

          </div>


          {/* Course Details */}
          <div className="py-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              {t("course_includes")}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <FiBookOpen className="ltr:mr-3 rtl:ml-3" />
                <span>{courseData.chapter_count || 0} {courseData.chapter_count <= 1 ? t("chapter") : t("chapters")}</span>
              </div>
              <div className="flex items-center">
                <FaRegPlayCircle className="ltr:mr-3 rtl:ml-3" />
                <span>{courseData.lecture_count || 0} {courseData.lecture_count <= 1 ? t("lecture") : t("lectures")}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="ltr:mr-3 rtl:ml-3" />
                <span>{getDurationLabel(courseData.total_duration)}</span>
              </div>
              <div className="flex items-center">
                <FiAward className="ltr:mr-3 rtl:ml-3" />
                <span className="capitalize">
                  {t("skill_level")} {courseData.level}
                </span>
              </div>
              <div className="flex items-center">
                <FiGlobe className="ltr:mr-3 rtl:ml-3" />
                <span>{t("taught_in")} {courseData?.language || "English"}</span>
              </div>
              <div className="flex items-center">
                <FiLock className="ltr:mr-3 rtl:ml-3" />
                <span>{t("lifetime_access")}</span>
              </div>
              <div className="flex items-center">
                <FiAward className="ltr:mr-3 rtl:ml-3" />
                <span>{t("certification_of_completion")}</span>
              </div>
              <div className="flex items-center">
                <FiTag className="ltr:mr-3 rtl:ml-3" />
                <span>
                  {t("category")}: {courseData?.category_name || "Uncategorized"}
                </span>
              </div>
            </div>
          </div>


          {/* Coupon Section - Only show for paid courses */}
          {!isFree && isLogin && !adminPromoCode && (
            <div className="py-4 mb-4 border-t borderColor">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FiTag className="ltr:mr-2 rtl:ml-2" />
                  <span className="text-gray-800 font-semibold">
                    {t("apply_coupon")}
                  </span>
                </div>
                {!appliedCoupon && (
                  <button
                    className="primaryColor underline text-sm font-medium"
                    onClick={() => {
                      setShowCouponDialog(true);
                      setShouldFetchCoupons(true);
                    }}
                  >
                    {t("view_coupons")}
                  </button>
                )}
              </div>

              {/* Show applied coupons if any exist */}
              {appliedCoupons.length > 0 ? (
                <div className="text-sm tertiaryColor space-y-1 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-medium">
                      <FaCheckCircle />
                      <p>
                        {t("coupon_code_applied")}
                        <span className="font-bold">&quot;{appliedCoupon?.coupon?.promo_code || ""}&quot;</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveCoupon(appliedCoupon?.coupon?.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove Coupon"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-black pl-5">
                    {t("instructor_coupon_by")}
                    <span className="font-semibold primaryColor underline cursor-pointer">
                      {appliedCoupon?.coupon?.instructor_name}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex border borderColor rounded-[8px] px-3 py-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t("enter_code")}
                    className="w-full focus:outline-none"
                    disabled={isApplyingCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="commonBtn !py-1 lg:!text-base"
                    disabled={isApplyingCoupon}
                  >
                    {isApplyingCoupon ? t("applying") : t("apply")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Share Section */}
          <div className="border-t borderColor py-4">
            <div className="flex items-center">
              <span className="text-gray-800 font-medium mr-3">{t("share_on")} :</span>
              <div className="flex space-x-3">
                <button
                  className="transition-all duration-300 cursor-pointer hover:primaryColor"
                  title="Share on Instagram"
                >
                  <FaInstagram size={18} />
                </button>
                <FacebookShareButton
                  url={decodeURI(courseUrl)}
                  className="transition-all duration-300 cursor-pointer hover:primaryColor"
                  title="Share on Facebook"
                >
                  <FaFacebook size={18} />
                </FacebookShareButton>
                <XShareButton
                  url={decodeURI(courseUrl)}
                  className="transition-all duration-300 cursor-pointer hover:primaryColor"
                  title="Share on Twitter"
                >
                  <XIcon size={18} />
                </XShareButton>
                <button
                  onClick={handleCopyLink}
                  className="transition-all duration-300 cursor-pointer hover:primaryColor"
                  title="Share on Link"
                >
                  <FaLink size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        cartItems={[
          {
            id: courseData.id,
            title: courseData.title,
            author:
              courseData.author_name ||
              courseData.instructor?.name ||
              "Unknown Instructor",
            price: courseData?.original_price || 0,
            subtotal: courseData?.subtotal || 0,
            discountPrice: courseData?.course_discount || 0,
            imageUrl: courseData.image,
          },
        ]}
        billing={{
          original_price: couponSummary?.original_price ?? courseData.original_price ?? 0,
          course_discount: couponSummary?.course_discount ?? courseData.course_discount ?? 0,
          subtotal: couponSummary?.subtotal ?? courseData?.subtotal ?? 0,
          promo_discount: couponSummary?.promo_discount ?? courseData?.promo_discount ?? 0,
          taxable_amount: couponSummary?.taxable_amount ?? courseData?.taxable_amount ?? 0,
          tax_percentage: couponSummary?.tax_percentage ?? courseData?.tax_percentage ?? 0,
          tax_amount: couponSummary?.tax_amount ?? courseData?.tax_amount ?? 0,
          total: couponSummary?.total ?? courseData?.total ?? 0,
        }}
        isOpen={showCheckoutDialog}
        onClose={() => {
          setShowCheckoutDialog(false);
          dispatch(setEnrollingCourseSlug(null));
        }}
        onProceedToCheckout={handleProceedToCheckout}
        courseId={courseData.id}
        isProcessing={isProcessingPayment}
      />

      {/* Stripe Payment Modal - Removed as component doesn't exist */}
      {/* Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={(open) => {
        setShowCouponDialog(open);
        if (!open) {
          setShouldFetchCoupons(false);
        }
      }}>
        <CouponDialog
          courseId={courseData.id}
          // onApplyCoupon={handleCouponFromDialog}
          onClose={() => {
            setShowCouponDialog(false);
            setShouldFetchCoupons(false);
          }}
          onApplyCouponWithDiscount={handleApplyCouponWithDiscount}
          shouldFetchCoupons={shouldFetchCoupons}
        />
      </Dialog>
      {showNegativeBalanceModal && (
        <PurchaseCourseNegativeWalletBalanceModal
          forceOpen={showNegativeBalanceModal}
          onClose={() => setShowNegativeBalanceModal(false)}
        />
      )}
    </div>
  );
};

export default CoursePurchaseCard;
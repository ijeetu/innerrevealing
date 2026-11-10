"use client";
import React, { useEffect, useState } from "react";
import { GoTag } from "react-icons/go";
import { FiTrash2 } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
// Import Loader icon for spinner
import { Loader2 } from "lucide-react";

// Import Shadcn Dialog component (no trigger needed now)
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CheckoutDialog from "./CheckoutDialog";
import CouponDialog from "./CouponDialog";
import { useTranslation } from '@/hooks/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { getCartData, updateCartFromResponse } from '@/redux/reducers/cartSlice';
import toast from 'react-hot-toast';
import { cartCheckout, CartCheckoutData } from '@/utils/api/user/placeOrder';
import { clearAllCoupons, getAppliedCoupons, applyCoupon } from "@/redux/reducers/couponSlice";
import { removePromo } from '@/utils/api/user/get-cart/removeCoupon';
import { setIsCartPromoApplied, setIsLoginModalOpen, setEnrollingCourseSlug } from "@/redux/reducers/helpersReducer";
import { getCurrencySymbol } from "@/utils/helpers";
import { applyAdminPromo } from '@/utils/api/user/get-cart/applyAdminPromo';
import { getAdminCoupons, AdminCoupon } from '@/utils/api/user/get-cart/getAdminCoupon';
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { isLoginSelector } from "@/redux/reducers/userSlice";

export interface BillingDetails {
  original_price?: number;
  course_discount?: number;
  promo_discount?: number;
  taxable_amount?: number;
  tax_percentage?: number;
  tax_amount?: number;
  subtotal?: number;
  total: number;

  // now this all are add for fix issue 
  discount?: number;
  couponDiscount?: number;
  taxes?: number;
}

export default function BillingDetails() {

  const dispatch = useDispatch();

  // Get cart data from Redux store
  const cartData = useSelector(getCartData);
  const { t } = useTranslation();

  const settings = useSelector(settingsSelector);
  const isLogin = useSelector(isLoginSelector);
  // const taxType = settings.data.tax_type;

  // State to manage the coupon code input
  const [couponCode, setCouponCode] = useState("");
  // State for loading and dialog visibility
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  // State for applying coupon loading
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  // State to cache available admin coupons
  const [availableCoupons, setAvailableCoupons] = useState<AdminCoupon[]>([]);

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    original_price: cartData?.original_price || 0,
    course_discount: cartData?.course_discount || 0,
    subtotal: cartData?.subtotal || 0,
    promo_discount: cartData?.promo_discount || 0,
    taxable_amount: cartData?.taxable_amount || 0,
    tax_percentage: cartData?.tax_percentage || 0,
    tax_amount: cartData?.tax_amount || 0,
    total: cartData?.total || 0,
  });


  const appliedCoupons = useSelector(getAppliedCoupons);
  const appliedCouponDetails = appliedCoupons?.[0];

  useEffect(() => {
    setBillingDetails({
      original_price: cartData?.original_price || 0,
      course_discount: cartData?.course_discount || 0,
      subtotal: cartData?.subtotal || 0,
      promo_discount: cartData?.promo_discount || 0,
      taxable_amount: cartData?.taxable_amount || 0,
      tax_percentage: cartData?.tax_percentage || 0,
      tax_amount: cartData?.tax_amount || 0,
      total: cartData?.total || 0,
    });
  }, [cartData]);

  // Convert cart data to format expected by CheckoutDialog
  const cartItemsData = cartData?.courses?.map(course => ({
    id: course.id,
    title: course.title,
    author: course.instructor,
    price: course.original_price,
    subtotal: course.subtotal,
    discountPrice: course.course_discount,
    imageUrl: course.thumbnail,
  })) || [];


  // Function to handle applying coupon from input field
  // This follows the same pattern as hanldeReedemAdminCoupon in CouponDialog.tsx
  const handleApplyCoupon = async () => {
    // Validate coupon code is not empty
    if (!couponCode.trim()) {
      toast.error(t("please_enter_coupon_code"));
      return;
    }

    // Check if user is authenticated
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }

    // Set loading state
    setIsApplyingCoupon(true);
    try {
      // First, fetch available admin coupons if we don't have them yet
      let couponsToSearch = availableCoupons;
      if (couponsToSearch.length === 0) {
        // Fetch available admin coupons
        const couponsResponse = await getAdminCoupons();
        if (couponsResponse && couponsResponse.data && Array.isArray(couponsResponse.data)) {
          setAvailableCoupons(couponsResponse.data);
          couponsToSearch = couponsResponse.data;
        } else {
          // If API returns error, we can still try to apply the code directly
          // The API might validate it anyway
          console.log("Could not fetch available coupons, trying to apply code directly");
        }
      }

      // Find the coupon in available coupons by code (case-insensitive)
      // If we have coupons, find the matching one
      const couponToApply = couponsToSearch.length > 0
        ? couponsToSearch.find(
          (coupon) => coupon.promo_code.toLowerCase() === couponCode.trim().toLowerCase()
        )
        : null;

      // If we found the coupon, use its ID; otherwise, just use the code
      const couponId = couponToApply?.id;
      const codeToApply = couponCode.trim();

      // Call the API to apply admin promo code to cart
      // applyAdminPromo expects: token, promoCode, promoCodeId (optional)
      const response = await applyAdminPromo(
        codeToApply,
        couponId
      );

      if (response) {
        // Check if API returned an error
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || t("failed_to_apply_coupon"));
        } else if (response.data) {
          // Success - transform response data to match CartData format
          // ApplyAdminPromoData might be missing tax_amount and discount_price fields
          // The API response should include these, but we add defaults if missing
          const cartDataResponse = {
            ...response.data,
            // Add missing fields if not present in response
            // These fields might be returned by API but not defined in interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tax_amount: (response.data as any).tax_amount || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            discount_price: (response.data as any).discount_price || response.data.discount || 0,
          };

          // Update cart state from response
          // Cast to CartData since ApplyAdminPromoData structure is compatible
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dispatch(updateCartFromResponse(cartDataResponse as any));

          // If we found the coupon in available coupons, update Redux state
          // Use the first course ID from cart for Redux state (admin coupons apply to all courses)
          // This follows the same pattern as CouponDialog.tsx
          const course = response.data?.courses?.[0];

          if (course?.promo_code && course?.id) {
            dispatch(applyCoupon({
              courseId: course.id,
              coupon: {
                ...couponToApply,
                promo_code: course.promo_code.code,
                created_by: response.data?.promo_discounts?.[0]?.created_by || couponToApply?.created_by || 'admin',
                creator_name: response.data?.promo_discounts?.[0]?.creator_name,
              } as any
            }));
          }

          // Set cart promo applied flag
          dispatch(setIsCartPromoApplied(true));

          // Clear the input field on success
          setCouponCode("");

          // Show success message
          toast.success(t("coupon_applied_successfully").replace("{code}", codeToApply));
        }
      } else {
        console.log("response is null in component", response);
        toast.error(t("failed_to_apply_coupon_try_again"));
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(t("failed_to_apply_coupon_try_again"));
    } finally {
      // Reset loading state
      setIsApplyingCoupon(false);
    }
  };


  // Function to handle removing promo code from cart
  // This follows the same pattern as hanldeReedemAdminCoupon in CouponDialog.tsx
  const handleRemoveCouponApi = async () => {
    try {
      // Call the API to remove promo code from cart
      const response = await removePromo();

      if (response) {
        // Check if API returned an error
        if (response.error) {
          toast.error(response.message || t("failed_to_remove_coupon"));
        } else if (response.data) {
          // Success - transform response data to match CartData format
          // ApplyAdminPromoData might be missing tax_amount and discount_price fields
          // The API response should include these, but we add defaults if missing
          const cartData = {
            ...response.data,
            // Add missing fields if not present in response
            // These fields might be returned by API but not defined in interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tax_amount: (response.data as any).tax_amount || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            discount_price: (response.data as any).discount_price || response.data.discount || 0,
          };

          // Update cart state from response
          // Cast to CartData since ApplyAdminPromoData structure is compatible
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dispatch(updateCartFromResponse(cartData as any));
          dispatch(setIsCartPromoApplied(false));

          // Show success message
          toast.success(response.message || t("coupon_removed_successfully"));
        }
      } else {
        console.log("response is null in component", response);
        toast.error(t("failed_to_remove_coupon_try_again"));
      }
    } catch (error) {
      console.error("Error removing coupon:", error);
      toast.error(t("failed_to_remove_coupon_try_again"));
    }
  };

  // Handle remove coupon - clear from Redux and call API
  const handleRemoveCoupon = async () => {
    // Clear coupons from Redux state immediately
    dispatch(clearAllCoupons());
    dispatch(setIsCartPromoApplied(false));
    // Call API to remove promo code from cart
    await handleRemoveCouponApi();
  };

  useEffect(() => {
  }, [billingDetails]);

  // Function to handle checkout click
  const handleCheckoutClick = () => {
    // If cart has courses, set the first course's slug as enrollingCourseSlug
    if (cartData?.courses && cartData.courses.length > 0) {
      const firstCourseSlug = cartData.courses[0].slug;
      dispatch(setEnrollingCourseSlug(firstCourseSlug));
    }

    setIsLoading(true);
    // Simulate loading delay (e.g., 1500ms)
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(true); // Open the dialog after loading
    }, 1500);
  };

  const handleProceedToCheckout = async (
    paymentMethod: string
  ): Promise<void> => {

    // Validate payment method
    const validMethods = ["wallet", "stripe", "flutterwave", "razorpay", "paypal"];
    if (!validMethods.includes(paymentMethod)) {
      toast.error(t("invalid_payment_method") + validMethods.join(', '));
      return;
    }

    // Check if user is authenticated (using static token for testing)
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }

    setIsProcessingCheckout(true);

    try {
      // Prepare cart checkout data for the API (no course_id needed)
      const checkoutData: CartCheckoutData = {
        payment_method: paymentMethod,

        ...(couponCode && { promo_code_ids: [couponCode] }),
      };

      const response = await cartCheckout(checkoutData);

      if (response.success) {
        // Check if the API response indicates success
        if (response.data && !response.data.error) {
          // Close checkout dialog on success
          setIsDialogOpen(false);
          // Show success message for order creation
          if (paymentMethod === "wallet") {
            toast.success(response.data.message || t("order_placed_successfully"));
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }

          // Extract payment details from the response
          const paymentData = response.data.data?.payment as unknown as { provider: string; url: string } | undefined;

          if (paymentData && paymentData.provider) {
            // Show loading message and redirect to Stripe checkout URL
            toast.success(t("redirecting_to_payment").replace("{provider}", paymentData.provider));

            // Small delay to show the toast message before redirect
            setTimeout(() => {
              window.location.href = paymentData.url;
            }, 1000);
          } else {
            // Handle unsupported payment methods or missing payment data
            toast.error(t("payment_method_not_supported"));
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
            t("failed_to_place_order");
          toast.error(errorMessage);

          // If user already purchased the course, show specific message
          if (response.data?.code === 422) {
            toast.error(t("already_purchased_course"));
          }
        }
      } else {
        // Handle API call failure
        toast.error(
          response.message || t("failed_to_place_order_try_again")
        );
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error(t("failed_to_process_payment"));
    } finally {
      setIsProcessingCheckout(false);
    }
  };


  useEffect(() => {
  }, [availableCoupons])


  return (
    // Control Dialog visibility with state
    <>
      {/* Billing Details Card */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-white lg:mt-11">
        <h2 className="text-md font-semibold pb-3 mb-4 border-b border-[#E8E8EC]">{t('order_summary')}</h2>
        <div className="space-y-4">
          {/* price and discount price */}
          <div className="space-y-4 text-sm border-b border-b-[#E8E8EC]">
            <div className="flex justify-between mb-4">
              <span className="sm:text-[16px] text-[#010211]">{t("course_price_(mrp)")}</span>
              <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{cartData?.original_price}</span>
            </div>
            {(cartData?.course_discount ?? 0) > 0 && (
              <div className="flex justify-between mb-4">
                <span className="sm:text-[16px] text-[#010211]">{t("course_discount")}</span>
                <span className="text-red-500 sm:text-[16px]">
                  -{getCurrencySymbol()}{cartData?.course_discount}
                </span>
              </div>
            )}
          </div>

          {/* subTotal and coupon Discount */}
          <div className="space-y-4 text-sm border-b border-b-[#E8E8EC]">
            <div className="flex justify-between mb-4">
              <span className="sm:text-[16px] text-[#010211]">{t("subtotal")}</span>
              <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{cartData?.subtotal}</span>
            </div>
            {(cartData?.promo_discount ?? 0) > 0 && (
              <div className="flex justify-between mb-4">
                <span className="sm:text-[16px] text-[#010211]">{t("coupon_discount")}</span>
                <span className="text-red-500 sm:text-[16px]">
                  -{getCurrencySymbol()}{cartData?.promo_discount}
                </span>
              </div>
            )}
          </div>

          {/* Taxable Amount And Tax */}
          <div className="space-y-4 text-sm">
            {(cartData?.tax_amount ?? 0) > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="sm:text-[16px] text-[#010211]">{t("taxable_amount")}</span>
                  <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{cartData?.taxable_amount}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="sm:text-[16px] text-[#010211]">{t("Taxes")} ({cartData?.tax_percentage}%)</span>
                  <span className="text-[#010211] sm:text-[16px]">
                    {getCurrencySymbol()}{cartData?.tax_amount}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between">
          <span className="font-semibold text-md">{t('total')}</span>
          <span className="font-semibold text-md">{getCurrencySymbol()}{cartData?.total}</span>
        </div>

        {/* Apply Coupon Section - Only show if no coupons are applied */}
        <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
          {/* Coupon Section */}
          {
            !appliedCouponDetails &&
            <div className="space-y-3 flex justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <GoTag className="bg-transparent" />
                {t('apply_coupon')}
              </h3>
              <Dialog
                open={isCouponDialogOpen}
                onOpenChange={setIsCouponDialogOpen}
              >
                <DialogTrigger asChild>
                  <p className="text-xs primaryColor cursor-pointer underline">
                    {t('view_coupons')}
                  </p>
                </DialogTrigger>
                <CouponDialog
                  courseId={cartData?.courses?.[0]?.id || 0}
                  onClose={() => setIsCouponDialogOpen(false)}
                  cartPage={true}
                />
              </Dialog>
            </div>
          }

          {/* Display applied coupon if present */}
          {appliedCouponDetails && (
            <div className="text-sm tertiaryColor space-y-1 mb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-medium">
                  <FaCheckCircle />
                  <div>
                    <p>
                      {t('coupon_code_applied')}{" "}
                      <span className="font-bold">
                        "{appliedCouponDetails?.coupon?.promo_code}"
                      </span>
                    </p>

                    {appliedCouponDetails?.coupon?.created_by === 'instructor' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('instructor_coupon_by')} {appliedCouponDetails?.coupon?.creator_name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  title={t('remove_coupon')}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Coupon input form - Always render this */}
          {
            !appliedCouponDetails &&
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t('enter_code')}
                className="flex-grow border border-gray-300 rounded-[5px] h-12 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:primaryColor"
              />
              <Button
                onClick={handleApplyCoupon}
                className="absolute cursor-pointer top-1.5 bottom-1.5 primaryBg text-white px-4 rounded-[5px] text-sm font-medium hover:primaryColor transition-colors disabled:opacity-50 h-auto right-1.5 rtl:right-auto rtl:left-1.5"
                disabled={!couponCode || isApplyingCoupon}
              >
                {isApplyingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('apply')
                )}
              </Button>
            </div>
          }
        </div>

        {/* Checkout Button - No longer a trigger, handles click directly */}
        <Button
          onClick={handleCheckoutClick}
          disabled={isLoading} // Disable button while loading
          className="w-full primaryBg text-white cursor-pointer py-3 rounded-[5px] font-semibold transition-colors mt-6 h-auto flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" /> // Show spinner when loading
          ) : (
            t('checkout') // Show text otherwise
          )}
        </Button>
      </div >

      {/* Checkout Dialog - handles its own dialog state */}
      <CheckoutDialog
        cartItems={cartItemsData}
        billing={billingDetails}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          dispatch(setEnrollingCourseSlug(null));
        }}
        onProceedToCheckout={handleProceedToCheckout}
        isProcessing={isProcessingCheckout}
      />
    </>
  );
}

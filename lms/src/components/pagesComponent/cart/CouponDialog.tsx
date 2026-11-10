import React, { useEffect, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseCoupon, getCourseCoupons } from "@/utils/api/user/getCourseCoupons";
import { applyPromoCode } from "@/utils/api/user/applyCoupon";
import { useSelector, useDispatch } from "react-redux";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import { applyCoupon, getAppliedCouponForCourse } from "@/redux/reducers/couponSlice";
import toast from "react-hot-toast";
import { AdminCoupon, getAdminCoupons } from "@/utils/api/user/get-cart/getAdminCoupon";
import { getCartData, setCartData, updateCartFromResponse } from "@/redux/reducers/cartSlice";
import { applyAdminPromo } from "@/utils/api/user/get-cart/applyAdminPromo";
import { setIsCartPromoApplied } from "@/redux/reducers/helpersReducer";
import { useTranslation } from "@/hooks/useTranslation";
import { addToCart } from "@/utils/api/user/get-cart/addToCart";
import { CartData } from "@/utils/api/user/get-cart/getCart";

// Define props for coupon dialog
export interface CouponDialogProps {
  onClose?: () => void; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  onApplyCouponWithDiscount?: (discountData: any) => void; 
  courseId: number;
  shouldFetchCoupons?: boolean; 
  cartPage?: boolean; 
}

const CouponDialog: React.FC<CouponDialogProps> = ({
  onClose, 
  onApplyCouponWithDiscount,
  courseId,
  shouldFetchCoupons = false,
  cartPage = false,
}) => {

  const [internalCouponCode, setInternalCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<(AdminCoupon | CourseCoupon)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCouponIds, setAppliedCouponIds] = useState<number[]>([]);

  const dispatch = useDispatch();

  const isLogin = useSelector(isLoginSelector);
  const cartData = useSelector(getCartData);
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appliedCoupon = useSelector((state: any) =>
    getAppliedCouponForCourse(state, courseId as number)
  );

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.coupon) {
      setAppliedCouponIds([appliedCoupon.coupon.id]);
    } else {
      setAppliedCouponIds([]);
    }
  }, [appliedCoupon, courseId]);

  const fetchCourseCoupons = async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const response = await getCourseCoupons({
        course_id: courseId
      });

      if (response.success && response.data) {
        // Ensure data is an array before setting it
        const couponsData = Array.isArray(response.data) ? response.data : [];
        setAvailableCoupons(couponsData);
      } else {
        console.error("Failed to fetch course coupons:", response.error);
        toast.error(response.error || t("failed_to_fetch_available_coupons"));
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching course coupons:", error);
      toast.error(t("failed_to_fetch_available_coupons"));
      setAvailableCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminCoupons();
      if (response && response.data) {
        console.log("response", response.data)
        const adminCoupons = Array.isArray(response.data.promo_codes) ? response.data.promo_codes : [];
        setAvailableCoupons(adminCoupons);
      }
      else {
        console.error("Failed to fetch admin coupons:", response?.error);
        toast.error(response?.error || t("failed_to_fetch_admin_coupons"));
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching admin coupons:", error);
      toast.error(t("failed_to_fetch_admin_coupons"));
      setAvailableCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      setAvailableCoupons([]);
      return;
    }

    if (shouldFetchCoupons && courseId && !cartPage) {
      fetchCourseCoupons();
    } else {
      fetchAdminCoupons();
    }

  }, [shouldFetchCoupons, courseId, cartPage, isLogin]);

  const handleApplyFromInput = async () => {
    const couponToApply = availableCoupons.find(
      (coupon) => coupon.promo_code.toLowerCase() === internalCouponCode.toLowerCase()
    );

    if (!couponToApply) {
      toast.error(t("invalid_coupon_code_try_again"));
      return;
    }

    // If on cart page, use admin coupon function
    if (cartPage) {
      hanldeReedemAdminCoupon(couponToApply.promo_code, couponToApply.id);
      // Clear the input after applying
      setInternalCouponCode("");
      return;
    }

    try {
      const response = await applyPromoCode(courseId, couponToApply.id, couponToApply.promo_code);

      if (response.success && response.data) {
        const appliedCouponCode = internalCouponCode;

        dispatch(applyCoupon({ courseId, coupon: couponToApply, summary: response.data }));

        setAppliedCouponIds(prev => [...prev, couponToApply.id]);
        if (cartData && cartData.courses.find((course) => course.id === courseId)) {
          const responseAddToCart = await addToCart(courseId, couponToApply.id, appliedCouponCode);
          if (responseAddToCart && !responseAddToCart.error) {
            dispatch(setCartData(responseAddToCart.data as unknown as CartData));
          }
        }
        onApplyCouponWithDiscount?.(response.data);

        setInternalCouponCode("");

        toast.success(t("coupon_applied_successfully").replace("{code}", appliedCouponCode));

        onClose?.();
      } else {
        console.error("Failed to apply coupon:", response.error);
        toast.error(response.error || t("failed_to_apply_coupon"));
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(t("failed_to_apply_coupon_try_again"));
    }
  };

  const hanldeReedemAdminCoupon = async (code: string, couponId: number) => {
    
    const couponToApply = availableCoupons.find(
      (coupon) => coupon.id === couponId
    );

    if (!couponToApply) {
      toast.error("Coupon not found. Please try again.");
      return;
    }

    try {
      const response = await applyAdminPromo(
        code,
        couponId
      );

      if (response) {
        // Check if API returned an error
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || t("failed_to_apply_coupon"));
        } else if (response.data) {

          const cartData = {
            ...response.data,

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tax_amount: (response.data as any).tax_amount || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            discount_price: (response.data as any).discount_price || response.data.discount || 0,
          };
          dispatch(applyCoupon({ courseId, coupon: couponToApply }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dispatch(updateCartFromResponse(cartData as any));

          // Add to applied coupons list
          setAppliedCouponIds(prev => [...prev, couponId]);
          // Show success message
          toast.success(t("coupon_applied_successfully").replace("{code}", code));
          dispatch(setIsCartPromoApplied(true));
          // Close the dialog after successfully applying the coupon
          onClose?.();
        }
      } else {
        console.log("response is null in component", response);
        toast.error(t("failed_to_apply_coupon_try_again"));
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(t("failed_to_apply_coupon_try_again"));
    }
  };

  // Function to handle redeeming a specific coupon card
  const handleRedeemCoupon = async (code: string, couponId: number) => {

    if (cartPage) {
      hanldeReedemAdminCoupon(code, couponId);
      return;
    }

    // Find the coupon in available coupons
    const couponToApply = availableCoupons.find(
      (coupon) => coupon.id === couponId
    );

    if (!couponToApply) {
      toast.error("Coupon not found. Please try again.");
      return;
    }

    try {
      // Call the API to calculate discount with the coupon (single promo code)
      const response = await applyPromoCode(courseId, couponId, couponToApply.promo_code);

      if (response.success && response.data) {
        // Apply the coupon to Redux state
        dispatch(applyCoupon({ courseId, coupon: couponToApply, summary: response.data }));

        // Add to applied coupons list
        setAppliedCouponIds(prev => [...prev, couponId]);

        // Apply coupon with discount data
        onApplyCouponWithDiscount?.(response.data);
        // Show success message
        toast.success(t("coupon_applied_successfully").replace("{code}", code));
        if (cartData && cartData.courses.find((course) => course.id === courseId)) {
          const responseAddToCart = await addToCart(courseId, couponId, code);
          if (responseAddToCart && !responseAddToCart.error) {
            dispatch(setCartData(responseAddToCart.data as unknown as CartData));
          }
        }
        // Close the dialog after successfully applying the coupon
        onClose?.();
      } else {
        console.error("Failed to redeem coupon:", response.error);
        toast.error(response.error || t("failed_to_apply_coupon"));
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(t("failed_to_apply_coupon_try_again"));
    }
  };


  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("coupon_copied_to_clipboard").replace("{code}", code));
      console.log("Copied to clipboard:", code);
    } catch (err) {
      console.error("Failed to copy code: ", err);
      toast.error(t("failed_to_copy_coupon_code"));
    }
  };

  return (
    // DialogContent is the part that renders inside the modal overlay
    <DialogContent className="sm:max-w-[550px] p-6 bg-white rounded-lg shadow-xl">
      <DialogHeader className="flex flex-row justify-between items-center mb-4">
        <DialogTitle className="text-xl font-semibold text-gray-800">
          {t("have_a_coupon")}
        </DialogTitle>
      </DialogHeader>

      {/* Top section: Input and Apply Button */}
      <div className="flex gap-2 mb-5">
        <Input
          type="text"
          value={internalCouponCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInternalCouponCode(e.target.value)
          }
          placeholder={t("enter_code")}
          className="flex-grow border border-gray-300 bg-[#F8F8F9] rounded-[5px] h-11 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <Button
          onClick={handleApplyFromInput}
          className="primaryBg text-white px-6 rounded-[5px] text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 h-11"
          disabled={!internalCouponCode}
        >
          {t("apply")}
        </Button>
      </div>

      {/* Instructions Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {t("instructions")} :
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-2">
          <li>{t("enter_your_coupon_code_in_the_box_provided")}</li>
          <li>{t("or_browse_and_select_a_default_coupon_from_the_list_below")}</li>
        </ul>
      </div>

      {/* Coupon List Section */}
      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("loading_available_coupons")}</div>
          </div>
        ) : !Array.isArray(availableCoupons) || availableCoupons.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("no_coupons_available_for_this_course")}</div>
          </div>
        ) : (
          // Map over coupons - availableCoupons is guaranteed to be an array at this point
          availableCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="sectionBg rounded-[5px] flex overflow-hidden"
            >
              {/* Vertical Coupon Tab */}
              <div className="bg-gray-900 text-white flex items-center relative justify-center writing-mode-vertical-rl transform rotate-180">
                {/* Apply rotation to make text vertical */}
                <span className="text-sm font-semibold tracking-wider transform rotate-90">
                  {t("coupon")}
                </span>
                <span className="absolute mx-auto left-auto right-[-10px] items-center justify-center rounded-full content-[''] w-[20px] h-[20px] bg-white"></span>
              </div>
              {/* Coupon Details */}
              <div className="p-4 flex-grow flex flex-col justify-between relative">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {coupon.message}
                  </h4>
                  <div className="bg-[#F8F8F9] border border-gray-200 rounded p-2 flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 tracking-wide">
                      {coupon.promo_code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.promo_code)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Copy code"
                    >
                      {/* Add copy icon here */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-gray-500">
                    {t("expires_on")} <br />
                    <span className="font-medium text-gray-600">
                      {new Date(coupon.end_date).toLocaleDateString()}
                    </span>
                  </p>
                  <Button
                    onClick={() => handleRedeemCoupon(coupon.promo_code, coupon.id)}
                    variant="secondary" // Using secondary variant for black button
                    // Check both local state and Redux state to determine if coupon is applied
                    // Redux state is the source of truth, so prioritize it
                    className={`px-4 py-1.5 rounded text-xs font-medium h-auto ${(appliedCoupon?.coupon?.id === coupon.id || appliedCouponIds.includes(coupon.id))
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    disabled={appliedCoupon?.coupon?.id === coupon.id || appliedCouponIds.includes(coupon.id)}
                  >
                    {(appliedCoupon?.coupon?.id === coupon.id || appliedCouponIds.includes(coupon.id)) ? t("applied") : t("redeem")}
                  </Button>
                </div>
                <span className="absolute mx-auto left-auto right-[-10px] top-[50%] items-center justify-center rounded-full content-[''] w-[20px] h-[20px] bg-white"></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add DialogFooter if needed for overall actions */}
    </DialogContent>
  );
};

export default CouponDialog;

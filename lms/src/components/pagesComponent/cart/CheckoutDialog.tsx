"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { applyPromoCode } from "@/utils/api/user/applyCoupon";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { BillingDetails } from "./BillingDetails";
import { useTranslation } from "@/hooks/useTranslation";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { userDataSelector } from "@/redux/reducers/userSlice";
import { UserDetails, getUserDetails } from '@/utils/api/user/getUserDetails';
import { fetchUserDeatilsSelector, setFetchUserDeatils } from "@/redux/reducers/helpersReducer";
import { PiCaretRightBold } from "react-icons/pi";
import BillngDeatilsModal from "./BillngDeatilsModal";
import { PiPencilLineBold } from "react-icons/pi";
import { BillingDetailsUser } from "@/components/instructor/courses/types";
import { getUserBillingDetails } from "@/utils/api/user/billing-details/getBillingDeatils";
import { UserBillingDetailsSkeleton } from "@/components/skeletons/UserBilliingDeatilsSkeleton";
import { setBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { setUserData, setUserLastFetch } from "@/redux/reducers/userSlice";
import { getAppliedCouponForCourse } from "@/redux/reducers/couponSlice";
import { RootState } from "@/redux/store";


// Define CartItem type (assuming similar structure)
interface CartItem {
  id: string | number;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
  discountPrice?: number;
  subtotal?: number;
}

// Props interface
interface CheckoutDialogProps {
  cartItems: CartItem[];
  billing: BillingDetails;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  onProceedToCheckout: (paymentMethod: string, discountData?: any) => void;
  courseId?: number; // Add courseId for discount calculation
  certificatePage?: boolean;
  isProcessing?: boolean;
}


// Reusable OrderItem component
const OrderItem = ({ item }: { item: CartItem }) => (
  <div className="flex gap-3 border border-gray-200 rounded-lg p-3 bg-white mb-2">
    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover rounded"
          width={64}
          height={64}
        />
      )}
    </div>
    <div className="flex-grow text-sm">
      <h4 className="font-medium mb-1 sm:text-[16px]">{item.title}</h4>
      <p className="text-[14px] text-gray-500 mb-1">By <span className="primaryColor text-[14px]">{item.author}</span></p>
    </div>
    <div className="max-[400px]:flex-col max-[400px]:gap-1 flex items-baseline gap-2 pt-1">
      <span className="text-lg font-semibold">
        {item?.discountPrice && item.discountPrice > 0 ? (
          <div className="flex flex-wrap justify-end gap-0.5">
            <span>{getCurrencySymbol()}{item?.subtotal?.toFixed(2)}</span>
            <span className="line-through text-gray-600">{getCurrencySymbol()}{item?.price?.toFixed(2)}</span>
          </div>
        ) : (
          <p>{getCurrencySymbol()}{item.price.toFixed(2)}</p>
        )}
      </span>
    </div>
  </div >
);

export default function CheckoutDialog({
  cartItems,
  billing,
  isOpen,
  onClose,
  onProceedToCheckout,
  courseId,
  certificatePage,
  isProcessing,
}: CheckoutDialogProps) {
  const settings = useSelector(settingsSelector);
  const userData = useSelector(userDataSelector) as UserDetails;
  const dispatch = useDispatch();
  const taxType = settings.data.tax_type;
  // State for selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('');
  const [isCalculatingDiscount, setIsCalculatingDiscount] = React.useState(false);


  // Select first payment gateway which exsist
  useEffect(() => {
    if (settings?.data?.active_payment_settings?.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(settings.data.active_payment_settings[0].payment_gateway);
    }
  }, [settings, selectedPaymentMethod]);
  const fetchUserDeatils = useSelector(fetchUserDeatilsSelector);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingModalTitle, setBillingModalTitle] = useState<string>("");

  const appliedCoupon = useSelector((state: RootState) => getAppliedCouponForCourse(state, courseId as number));
  const couponSummary = appliedCoupon?.summary;

  // useState for the get-billing-details api
  const [userBillingDetailsData, setUserBillingDetailsData] = useState<BillingDetailsUser | null>(null);
  const [isLoadingBillingDetails, setIsLoadingBillingDetails] = useState<boolean>(false);

  const fetchUserData = async () => {
    try {
      const response = await getUserDetails();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            const data: UserDetails = response.data;
            // Update user data in Redux store
            dispatch(setUserData(data));
            dispatch(setUserLastFetch(Date.now()));
          } else {
            console.log('No user details data found in response');
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || t("failed_to_fetch_user_details"));
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);

    }
  };

  const fetchUserBillingDetails = async () => {
    try {
      setIsLoadingBillingDetails(true);
      const response = await getUserBillingDetails();
      if (response) {
        if (!response.error) {
          if (response && !response.error && response.data && Object.keys(response.data).length > 0) {
            setUserBillingDetailsData(response.data);
            dispatch(setBillingDetails(response.data));
          } else {
            setUserBillingDetailsData(null);
            dispatch(setBillingDetails(null));
          }
        } else {
          console.error("API error fetching billing details:", response.message);
          toast.error(response.message || t("failed_to_fetch_billing_details"));
          setUserBillingDetailsData(null);
        }
      } else {
        console.log("Response is null in component", response);
        setUserBillingDetailsData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setUserBillingDetailsData(null);
    } finally {
      setIsLoadingBillingDetails(false);
    }
  };

  // Handle opening billing modal - close checkout dialog first
  const handleOpenBillingModal = (title: string) => {
    setBillingModalTitle(title);
    setIsBillingOpen(true); // Open billing modal
  };

  useEffect(() => {
    if (isOpen) {
      // dispatch(setFetchUserDeatils(true));
      fetchUserBillingDetails();
      fetchUserData();
    }
  }, [isOpen, dispatch, isBillingOpen]);

  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  const appliedCoupons = useSelector((state: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    courseId ? state.coupon.appliedCoupons.filter((applied: any) => applied.courseId === courseId) : []
  );
  // Use passed cartItems or default placeholders
  const displayItems = cartItems?.length ? cartItems : [];

  // Handle proceed to checkout button click
  const handleProceedClick = async () => {
    // when the 100% coupon are apply on the course then in the payload wallet are pass
    const effectivePaymentMethod = couponSummary?.total === 0 || billing?.total === 0 ? 'wallet' : selectedPaymentMethod;
    // If there are applied coupons and courseId, calculate discount first
    if (appliedCoupons.length > 0 && courseId) {
      setIsCalculatingDiscount(true);

      try {
        // Get the first (and only) applied coupon for single course
        const appliedCoupon = appliedCoupons[0];
        const response = await applyPromoCode(courseId, appliedCoupon.coupon.id, appliedCoupon.promo_code);

        if (response.success && response.data) {
          // Pass the discount data to the parent component
          onProceedToCheckout(effectivePaymentMethod, response.data);
        } else {
          toast.error(response.error || t("failed_to_calculate_discount"));
          // Proceed without discount data
          onProceedToCheckout(effectivePaymentMethod);
        }
      } catch (error) {
        console.error("Error calculating discount:", error);
        toast.error(t("failed_to_calculate_discount_proceeding"));
        // Proceed without discount data
        onProceedToCheckout(effectivePaymentMethod);
      } finally {
        setIsCalculatingDiscount(false);
      }
    } else {
      // No coupon applied, proceed normally
      onProceedToCheckout(effectivePaymentMethod);
    }
  };


  return (
    <>
      <Dialog open={isOpen && !isBillingOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-[430px]:p-2 p-6 bg-white rounded-lg shadow-xl overflow-y-auto max-h-[calc(100vh-10px)] customScrollbar">
          <DialogHeader>
            <DialogTitle className="sr-only">{t("checkout")}</DialogTitle>
          </DialogHeader>

          {/* Modal Content matches the image layout */}
          <div className="flex flex-col gap-6">
            {/* Payment Methods Section */}
            {((couponSummary?.total ?? 0) > 0 || (billing?.total ?? 0) > 0) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t("payment_methods")}</h3>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-3"
                >
                  {/* Static Wallet Option - Always Available */}
                  {userData?.wallet_balance !== null && Number(userData?.wallet_balance) >= billing?.total && (
                    <Label
                      htmlFor="wallet"
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <div className="flex items-center gap-1">
                          <span className="capitalize">{t("wallet")} </span>
                          {fetchUserDeatils ? (
                            <span className="w-12 h-4 bg-gray-200 rounded animate-pulse inline-block"></span>
                          ) : (
                            <span>
                              ({getCurrencySymbol()}
                              {userData?.total_balance})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold capitalize italic text-orange-600">{t("wallet")}</span>
                    </Label>
                  )}
                  {
                    settings?.data?.active_payment_settings?.map((gateway, index) => (
                      <Label
                        key={index}
                        htmlFor={gateway.payment_gateway}
                        className="flex items-center justify-between border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={gateway.payment_gateway} id={gateway.payment_gateway} />
                          <span className="capitalize">{gateway.payment_gateway}</span>
                        </div>
                        <span className={`font-bold capitalize italic ${gateway.payment_gateway === 'stripe' ? 'text-purple-600' : gateway.payment_gateway === 'razorpay' ? 'text-blue-600' : 'text-green-600'}`}>{gateway.payment_gateway}</span>
                      </Label>
                    ))
                  }
                </RadioGroup>
              </div>
            )}


            {/* Order Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("order_details")}</h3>
              {displayItems.map((item, index) => (
                <OrderItem key={item.id || index} item={item} />
              ))}
            </div>

            {/* Billing Details Logic */}
            {isLoadingBillingDetails ? (
              <UserBillingDetailsSkeleton />
            ) : !userBillingDetailsData ? (
              /* Show this part if no data exists */
              <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-center justify-between">
                <h3 className="text-md font-semibold">{t("billing_details")}</h3>
                <button
                  onClick={() => handleOpenBillingModal(t("billing_details"))}
                  className="border border-[#010211] rounded-[4px] p-2"
                >
                  <PiCaretRightBold />
                </button>
              </div>
            ) : (
              /* Show this part if data exists */
              <div className="border border-gray-200 rounded-xl bg-white p-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-[16px] font-semibold text-gray-900">
                    {t("billing_details")}
                  </h3>

                  <button
                    onClick={() => handleOpenBillingModal(t("edit_billing_details"))}
                    className="flex items-center gap-2 bg-black text-white text-sm px-3 py-1 rounded-md hover:opacity-90 transition"
                  >
                    <PiPencilLineBold className="w-4 h-4" />
                    <span className="text-[#FFFFFF] text-[14px] font-normal">{t("edit_details")}</span>
                  </button>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#010211] text-normal sm:text-[16px]">{t("user_name")}</span>
                    <span className="font-normal text-[#010211] sm:text-[16px]">
                      {`${userBillingDetailsData.first_name} ${userBillingDetailsData.last_name}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#010211] text-normal sm:text-[16px]">{t("address")}</span>
                    <span className="font-normal text-[#010211] text-right max-w-[60%]">
                      {userBillingDetailsData.address}
                    </span>
                  </div>

                  <div className="flex justify-between text-normal">
                    <span className="text-[#010211] sm:text-[16px]">{t("city_state_zip")}</span>
                    <span className="font-normal text-[#010211] sm:text-[16px]">
                      {`${userBillingDetailsData.city}, ${userBillingDetailsData.state}${userBillingDetailsData.postal_code ? `, ${userBillingDetailsData.postal_code}` : ""}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-normal">
                    <span className="text-[#010211] sm:text-[16px]">{t("country")}</span>
                    <span className="font-normal text-[#010211] sm:text-[16px]">
                      {userBillingDetailsData.country_name}
                    </span>
                  </div>

                  {userBillingDetailsData?.tax_id && (
                    <div className="flex justify-between text-normal">
                      <span className="text-[#010211] sm:text-[16px]">{t("gstin")}</span>
                      <span className="font-normal text-[#010211] tracking-wider">
                        {userBillingDetailsData?.tax_id || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Details Section */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-4">
              <h3 className="text-md font-semibold pb-2 border-b border-b-[#E8E8EC]">{t("order_summary")}</h3>
              {/* price and discount price */}
              {!certificatePage && (
                <>
                  <div className="space-y-4 text-sm border-b border-b-[#E8E8EC]">
                    <div className="flex justify-between mb-4">
                      <span className="sm:text-[16px] text-[#010211]">{t("course_price_(mrp)")}</span>
                      <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{billing?.original_price?.toFixed(2)}</span>
                    </div>
                    {(billing?.course_discount ?? 0) > 0 && (
                      <div className="flex justify-between mb-4">
                        <span className="sm:text-[16px] text-[#010211]">{t("course_discount")}</span>
                        <span className="text-red-500 sm:text-[16px]">
                          -{getCurrencySymbol()}{billing?.course_discount?.toFixed(2)}
                        </span>
                      </div>
                    )}

                  </div>
                  <div className="space-y-4 text-sm border-b border-b-[#E8E8EC]">
                    <div className="flex justify-between mb-4">
                      <span className="sm:text-[16px] text-[#010211]">{t("subtotal")}</span>
                      <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{billing?.subtotal?.toFixed(2)}</span>
                    </div>
                    {(billing?.promo_discount ?? 0) > 0 && (
                      <div className="flex justify-between mb-4">
                        <span className="sm:text-[16px] text-[#010211]">{t("coupon_discount")}</span>
                        <span className="text-red-500 sm:text-[16px]">
                          -{getCurrencySymbol()}{billing?.promo_discount?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-sm">
                    {(billing?.tax_amount ?? 0) > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="sm:text-[16px] text-[#010211]">{t("taxable_amount")}</span>
                          <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{billing?.taxable_amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4 ">
                          <span className="sm:text-[16px] text-[#010211]">{t("Taxes")} ({billing?.tax_percentage}%)</span>
                          <span className="text-[#010211] sm:text-[16px]">
                            {getCurrencySymbol()}{billing?.tax_amount?.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {certificatePage && (
                <>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="sm:text-[16px] text-[#010211]">{t("course_price_(mrp)")}</span>
                      <span className="sm:text-[16px] text-[#010211]">{getCurrencySymbol()}{billing?.original_price?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between mb-4">
                      <span className="sm:text-[16px] text-[#010211]">{t("Taxes")} ({billing?.tax_percentage}%)</span>
                      <span className="sm:text-[16px]">
                        {getCurrencySymbol()}{billing?.tax_amount?.toFixed(2)}
                      </span>
                    </div>
                  </div></>
              )}

              {!certificatePage ? (
                <div className="flex justify-between">
                  <span className="font-semibold text-[14px] sm:text-[16px]">{t("total_pay")}</span>
                  <span className="font-semibold text-[14px] sm:text-[16px]">
                    {getCurrencySymbol()}{billing?.total?.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="font-semibold text-[14px] sm:text-[16px]">{t("total_pay")}</span>
                  <span className="font-semibold text-[14px] sm:text-[16px]">
                    {getCurrencySymbol()}{billing?.subtotal?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Proceed Button */}
            <button
              className="commonBtn w-full"
              onClick={handleProceedClick}
              disabled={isCalculatingDiscount || isProcessing}
            >
              {isCalculatingDiscount ? t("calculating_discount") : isProcessing ? t("processing") : t("proceed_to_checkout")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* BILLING DETAILS MODAL */}
      <BillngDeatilsModal
        open={isBillingOpen}
        onOpneChange={setIsBillingOpen}
        editUserBillingDetails={billingModalTitle}
      />
    </>
  );
}

"use client";
import React, { useState } from 'react';
import img from '../../../../assets/images/courseCertificate.png';
import { useTranslation } from '@/hooks/useTranslation';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import { Course } from "@/utils/api/user/getCourse";
import { useSelector, useDispatch } from "react-redux";
import { isLoginSelector, userDataSelector } from "@/redux/reducers/userSlice";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import toast from "react-hot-toast";
import { placeOrder, PlaceOrderData } from "@/utils/api/user/placeOrder";
import CheckoutDialog from "@/components/pagesComponent/cart/CheckoutDialog";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { getAppliedCouponForCourse } from "@/redux/reducers/couponSlice";
import { RootState } from "@/redux/store";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import PurchaseCourseNegativeWalletBalanceModal from "@/components/commonComp/PurchaseCourseNegativeWalletBalanceModal";

interface CourseCertificateProps {
    courseData: Course;
}

const CourseCertificate: React.FC<CourseCertificateProps> = ({ courseData }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isLogin = useSelector(isLoginSelector);
    const settings = useSelector(settingsSelector);
    const taxType = settings.data.tax_type;

    // States
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showNegativeBalanceModal, setShowNegativeBalanceModal] = useState(false);

    const userData = useSelector(userDataSelector) as UserDetails;

    // Get applied coupon
    const appliedCoupon = useSelector((state: RootState) => getAppliedCouponForCourse(state, courseData?.id as number));
    const couponSummary = appliedCoupon?.summary;

    // Get all applied coupons for promo code ID reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    const appliedCoupons = useSelector((state: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        state.coupon.appliedCoupons.filter((applied: any) => applied.courseId === courseData?.id)
    );

    // Helper functions for pricing
    const formatPrice = (price: string | number | null) => {
        if (!price) return null;
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        return isNaN(numPrice) ? null : numPrice;
    };

    const taxPrice = formatPrice(courseData?.tax_amount);
    const originalPrice = formatPrice(courseData?.original_price);
    const discountPrice = formatPrice(courseData?.course_discount);
    const isFree = courseData?.course_type === "free" || (!originalPrice && !discountPrice);
    const hasDiscount = originalPrice && discountPrice && originalPrice > discountPrice;


    // Calculate the tax amount based on coupon discount and tax type
    const calculateTaxAmount = () => {
        const basePrice = discountPrice || originalPrice || 0;
        const couponDiscount = couponSummary?.promo_discount || 0;
        const priceAfterCoupon = basePrice - couponDiscount;

        if (taxType === "exclusive") {
            if (couponDiscount > 0) {
                const taxRate = taxPrice && basePrice ? taxPrice / basePrice : 0;
                return priceAfterCoupon * taxRate;
            } else {
                return taxPrice || 0;
            }
        }
        return 0;
    };

    const calculateFinalPrice = () => {
        const basePrice = discountPrice || originalPrice || 0;
        const couponDiscount = couponSummary?.promo_discount || 0;
        const priceAfterCoupon = basePrice - couponDiscount;

        let finalPrice = priceAfterCoupon;

        if (taxType === "exclusive") {
            const tax = calculateTaxAmount();
            finalPrice = priceAfterCoupon + tax;
        }

        return finalPrice;
    };

    const finalPriceWithTax = calculateFinalPrice();
    const calculatedTaxAmount = calculateTaxAmount();

    const normalizedFinalPrice =
        finalPriceWithTax ??
        originalPrice ??
        0;

    const handleEnrollNow = async () => {
        if (!isLogin) {
            dispatch(setIsLoginModalOpen(true));
            toast.error(t("login_first"));
            return;
        }

        if (userData?.total_balance !== undefined && userData?.total_balance !== null && userData.total_balance < 0) {
            setShowNegativeBalanceModal(true);
            return;
        }

        // For free courses, handle enrollment directly
        if (isFree) {
            try {
                setIsProcessingPayment(true);
                const orderData: PlaceOrderData = {
                    payment_method: "",
                    course_id: courseData.id,
                    buy_now: 1,
                    type: "web",
                };

                const response = await placeOrder(orderData);

                if (response.success) {
                    if (response.data && !response.data.error) {
                        toast.success(response.data.message || "Free course enrolled successfully!");
                        if (response.data.data?.is_free) {
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    } else {
                        const errorMessage = response.data?.message || response.message || "Failed to enroll in free course";
                        toast.error(errorMessage);
                        if (response.data?.code === 422) {
                            toast.error("You have already enrolled in this course.");
                        }
                    }
                } else {
                    toast.error(response.message || "Failed to enroll in free course. Please try again.");
                }
            } catch (error) {
                console.error("Free enrollment error:", error);
                toast.error("Failed to enroll in the course. Please try again.");
            } finally {
                setIsProcessingPayment(false);
            }
            return;
        }

        // For paid courses, open checkout dialog
        setShowCheckoutDialog(true);
    };

    const handleProceedToCheckout = async (
        paymentMethod: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        discountData?: any
    ): Promise<void> => {
        const validMethods = ["wallet", "stripe", "flutterwave", "razorpay", "paypal"];
        if (!validMethods.includes(paymentMethod)) {
            toast.error(`Invalid payment method. Supported methods: ${validMethods.join(', ')}`);
            return;
        }

        if (!isLogin) {
            dispatch(setIsLoginModalOpen(true));
            toast.error(t("login_first"));
            return;
        }

        setIsProcessingPayment(true);

        try {
            const orderData: PlaceOrderData = {
                payment_method: paymentMethod,
                course_id: courseData.id,
                buy_now: 1,
                ...((discountData?.applied_promo_code?.id || appliedCoupons.length > 0) && {
                    promo_code_id: discountData?.applied_promo_code?.id || appliedCoupons[0]?.coupon.id
                }),
            };

            const response = await placeOrder(orderData);

            if (response.success) {
                if (response.data && !response.data.error) {
                    setShowCheckoutDialog(false);
                    if (paymentMethod === "wallet") {
                        toast.success(response.data.message || "Order placed successfully!");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                        return;
                    }

                    const paymentData = response.data.data?.payment as unknown as { provider: string; url: string } | undefined;

                    if (paymentData && paymentData.provider) {
                        toast.success(`${response.data.message || "Order placed successfully!"} - Redirecting to secure ${paymentData.provider} payment page...`);
                        setTimeout(() => {
                            window.location.href = paymentData.url;
                        }, 1000);
                    } else {
                        toast.error("Payment method not supported or payment data missing");
                    }
                } else {
                    const errorMessage = response.data?.message || response.message || "Failed to place order";
                    toast.error(errorMessage);
                    if (response.data?.code === 422) {
                        toast.error("You have already purchased this course.");
                    }
                }
            } else {
                toast.error(response.message || "Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Payment processing error:", error);
            toast.error("Failed to process payment. Please try again.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <>
            <div className="primaryBg text-white p-4 md:p-8 between-1200-1399:p-4 rounded-2xl grid grid-cols-1 min-[1200px]:grid-cols-2 relative gap-y-6 min-[1200px]:gap-y-0 min-[1200px]:h-[304px] min-[1200px]:gap-6 overflow-visible">
                {/* Image: on <1200px stacked on top with -mt-16; on ≥1200px absolutely centered, overflowing top & bottom */}
                <div className="flex justify-center order-1 min-[1200px]:order-2">
                    <div className="bg-white p-2 rounded-2xl shadow-[0px_14px_36px_3px_#ADB3B852] -mt-16 min-[1200px]:mt-0 min-[1200px]:absolute min-[1200px]:-top-4 min-[1200px]:-bottom-4 min-[1200px]:h-max min-[1200px]:w-max min-[1200px]:m-auto min-[1200px]:end-0">
                        <CustomImageTag
                            src={img}
                            alt="course-certificate"
                            className="rounded-2xl w-full max-w-[410px] min-[1200px]:w-[520px] between-1200-1399:w-[400px] min-[1200px]:h-[318px] between-1200-1399:h-[275px]"
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-3 order-2 min-[1200px]:order-1'>
                    <h2 className="sectionTitle mb-2">{t("earn_your_certificate")}</h2>
                    <p className="sectionPara opacity-[76%] mb-4 min-[1200px]:w-[90%] 2xl:w-full">
                        {t("cirtificate_description")}
                    </p>
                    <button
                        onClick={handleEnrollNow}
                        disabled={isProcessingPayment}
                        className="bg-white primaryColor font-semibold py-2 px-6 rounded-[4px] w-max disabled:opacity-70 disabled:cursor-not-allowed">
                        {isProcessingPayment ? t("processing") : t("enroll_now")}
                    </button>
                </div>
            </div>

            {/* Checkout Dialog */}
            {courseData && (
                <CheckoutDialog
                    cartItems={[
                        {
                            id: courseData.id,
                            title: courseData.title,
                            author: courseData.author_name || courseData.instructor?.name || "Unknown Instructor",
                            price: originalPrice || 0,
                            discountPrice: discountPrice || 0,
                            imageUrl: courseData.image,
                        },
                    ]}
                    billing={{
                        subtotal: originalPrice || 0,
                        discount: hasDiscount ? (originalPrice! - discountPrice!) : 0,
                        couponDiscount: couponSummary?.promo_discount || 0,
                        taxes: calculatedTaxAmount,
                        total: normalizedFinalPrice,
                    }}
                    isOpen={showCheckoutDialog}
                    onClose={() => setShowCheckoutDialog(false)}
                    onProceedToCheckout={handleProceedToCheckout}
                    courseId={courseData.id}
                    isProcessing={isProcessingPayment}
                />
            )}
            {showNegativeBalanceModal && (
                <PurchaseCourseNegativeWalletBalanceModal
                    forceOpen={showNegativeBalanceModal}
                    onClose={() => setShowNegativeBalanceModal(false)}
                />
            )}
        </>
    );
};

export default CourseCertificate;
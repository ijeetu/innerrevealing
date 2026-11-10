"use client";
import { useTranslation } from "@/hooks/useTranslation";
import { enrollingCourseSlugSelector } from "@/redux/reducers/helpersReducer";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { clearCart } from "@/utils/api/user/clearCart";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaHome
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import FormSubmitLoader from "../Loaders/FormSubmitLoader";
import { useRouter } from "next/navigation";
import { setCartData, getCartData } from "@/redux/reducers/cartSlice";

// Payment status types
export type PaymentStatus = "completed" | "pending" | "incomplete" | "failed" | "cancelled";

// Props interface
interface PaymentStatusCardProps {
  status: PaymentStatus;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  courses: Array<{
    id: number;
    title: string;
    price: number;
  }>;
  onDownloadInvoice?: () => void;
  onRetryPayment?: () => void;
  onViewCourses?: () => void;
}

const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  status,
}) => {

  const { t } = useTranslation();
  const cartData = useSelector(getCartData);

  const router = useRouter()
  const dispatch = useDispatch();
  const enrollingCourseSlug = useSelector(enrollingCourseSlugSelector);
  const currentLanguageCode = useSelector(currentLanguageSelector);
  // Status configuration
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: FaCheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          bgGradient: 'from-green-50 to-emerald-50',
          iconBg: 'bg-green-100',
          title: t('payment_successful'),
          subtitle: t('your_payment_has_been_processed_successfully'),
          description: t("you_can_now_access_your_courses_and_start_learning_immediately"),
          message: t("you_can_now_access_your_courses_and_start_learning_immediately"),
          buttonText: t("start_learning"),
          showDownload: true,
          showRetry: false
        };
      case 'pending':
        return {
          icon: FaClock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          bgGradient: 'from-yellow-50 to-amber-50',
          iconBg: 'bg-yellow-100',
          title: t("payment_pending"),
          subtitle: t("your_payment_is_being_processed"),
          description: t("please_wait_while_we_verify_your_payment"),
          message: t("please_wait_while_we_verify_your_payment_this_usually_takes_a_few_minutes"),
          buttonText: t("check_status"),
          buttonLink: '/transaction-history',
          showDownload: false,
          showRetry: false
        };
      case 'incomplete':
      case 'failed':
      case 'cancelled':
        return {
          icon: FaTimesCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          bgGradient: 'from-red-50 to-rose-50',
          iconBg: 'bg-red-100',
          title: t("payment_failed"),
          subtitle: t("we_couldnt_process_your_payment"),
          description: t("try_again_or_contact_support_if_the_problem_persists"),
          message: t("try_again_or_contact_support_if_the_problem_persists"),
          buttonText: t("try_again"),
          buttonLink: '/cart',
          showDownload: false,
          showRetry: true
        };
      default:
        return {
          icon: FaCheckCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          bgGradient: 'from-gray-50 to-slate-50',
          iconBg: 'bg-gray-100',
          title: t("payment_status"),
          subtitle: t("check_your_payment_status"),
          description: t("please_check_your_transaction_history_for_more_details"),
          message: t("please_check_your_transaction_history_for_more_details"),
          buttonText: t("view_history"),
          buttonLink: '/transaction-history',
          showDownload: false,
          showRetry: false
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const handleClearCart = async () => {
    const response = await clearCart();
    if (response && response.error) {
      console.log(response?.message || "Failed to clear cart");
    }
  };

  useEffect(() => {
    if (status === 'completed') {
      if (cartData && cartData.courses.length > 1) {
        // Redirect to my-learnings if there are multiple courses
        router.push(`/my-learnings?lang=${currentLanguageCode}`)
      } else if (enrollingCourseSlug) {
        // Redirect to single course details
        router.push(`/course-details/${enrollingCourseSlug}?lang=${currentLanguageCode}`)
      }
      handleClearCart()
      dispatch(setCartData(null));
    }
    // console.log("status", status);
  }, [status, enrollingCourseSlug, currentLanguageCode]);

  return (
    status === 'completed' && enrollingCourseSlug ?
      <div className="flexCenter gap-2 flex-wrap">
        {/* Animated text: smooth color transition on the message itself. */}
        {/* No extra dots. Simple and easy to read. */}
        <span className="capitalize ps-animated-text text-lg sm:text-2xl">
          {t('redirectToCourse')}
        </span>
        <div className="hidden sm:block">
          <FormSubmitLoader />
        </div>

        {/* Local animation styles. */}
        {/* Keeping this here avoids touching global CSS or Tailwind config. */}
        <style jsx>{`
          .ps-animated-text {
            /* Keep font readable but give it life. */
            animation: psTextColorShift 2.5s ease-in-out infinite;
          }

          @keyframes psTextColorShift {
            0% {
              color: #2563eb; /* blue-600 */
            }
            25% {
              color: #4f46e5; /* indigo-600 */
            }
            50% {
              color: #16a34a; /* green-600 */
            }
            75% {
              color: #7c3aed; /* violet-600 */
            }
            100% {
              color: #2563eb; /* back to blue-600 */
            }
          }
        `}
        </style>
      </div>
      :
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-2xl">
          <div className={`bg-gradient-to-br ${statusConfig.bgGradient} rounded-3xl shadow-2xl border-2 ${statusConfig.borderColor} overflow-hidden`}>
            {/* Main Content */}
            <div className="p-8 md:p-12 text-center">
              {/* Status Icon */}
              <div className="mb-8 flex justify-center">
                <div className={`${statusConfig.iconBg} rounded-full p-6 inline-block shadow-lg`}>
                  <StatusIcon className={`text-6xl ${statusConfig.color}`} />
                </div>
              </div>

              {/* Status Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {statusConfig.title}
              </h1>

              {/* Status Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 font-medium">
                {statusConfig.subtitle}
              </p>



              {/* Status Description */}
              <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                {statusConfig.description}
              </p>

              <Link
                href={'/'}
                className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                <FaHome className="text-xl  transition-transform duration-300" />
                {t("home")}
              </Link>
            </div>

            {/* Decorative Footer */}
            <div className={`h-2 bg-gradient-to-r ${status === 'pending' ? 'from-amber-400 via-yellow-400 to-amber-400' :
              'from-rose-400 via-red-400 to-rose-400'
              }`}></div>
          </div>


        </div>
      </div>
  );
};

export default PaymentStatusCard;

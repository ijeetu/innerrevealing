'use client'

import React, { useState, useEffect } from 'react'
import { FaCheck, FaLock } from 'react-icons/fa'
import certificate from '@/assets/images/lesson-overview/certificateTabImg.jpg'
import { MdOutlineCloudDownload } from "react-icons/md";
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import { getCourseCompletion, CourseCompletionData, GetCourseCompletionParams } from '@/utils/api/user/lesson-overview/courseCompletion';
import toast from 'react-hot-toast';
import { extractErrorMessage, getCurrencySymbol } from '@/utils/helpers';
import { Course } from '@/utils/api/user/getCourse';
import { useTranslation } from '@/hooks/useTranslation'
import CheckoutDialog from '@/components/pagesComponent/cart/CheckoutDialog'
import { purchaseCertificate, CertificatePurchaseParams } from '@/utils/api/user/lesson-overview/certificate/certificatePurchase';
import { useRouter } from 'next/navigation'
import { downloadAndSaveCertificate } from '@/utils/api/user/lesson-overview/certificate/certificateDownload'
import { BiLock } from "react-icons/bi";

// Props interface for CertificateTabContent component
interface CertificateTabContentProps {
  courseData: Course;
}

const CertificateTabContent: React.FC<CertificateTabContentProps> = ({ courseData }) => {

  const { t } = useTranslation();
  const router = useRouter();

  // State for course completion data
  const [courseCompletionData, setCourseCompletionData] = useState<CourseCompletionData | null>(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Fetch course completion function
  const fetchCourseCompletion = async () => {
    try {
      // Build API parameters
      const apiParams: GetCourseCompletionParams = {
        course_id: courseData.id,
      };

      // Fetch course completion with API parameters
      const response = await getCourseCompletion(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setCourseCompletionData(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch course completion status");
          setCourseCompletionData(null);
        }
      } else {
        console.log("response is null in component", response);
        setCourseCompletionData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setCourseCompletionData(null);
    }
  };

  // Fetch course completion on component mount
  useEffect(() => {
    if (courseData?.id) {
      fetchCourseCompletion();
    }
  }, [courseData?.id]);


  // Handle proceed to checkout from checkout dialog
  // Follows the same pattern as handleStartQuiz for consistency
  const handleProceedToCheckout = async (
    paymentMethod: string,
  ): Promise<void> => {
    try {
      // Validate payment method
      const validMethods: ("wallet" | "stripe" | "flutterwave" | "razorpay")[] = ["wallet", "stripe", "flutterwave", "razorpay"];
      if (!validMethods.includes(paymentMethod as "wallet" | "stripe" | "flutterwave" | "razorpay")) {
        toast.error(`Invalid payment method. Supported methods: ${validMethods.join(', ')}`);
        return;
      }

      setIsProcessingCheckout(true);

      // Prepare certificate purchase parameters (matches API documentation)
      const purchaseParams: CertificatePurchaseParams = {
        course_id: courseData.id,
        payment_method: paymentMethod as "wallet" | "stripe" | "flutterwave" | "razorpay",
        type: "web",
      };

      // Call the certificate purchase API
      const response = await purchaseCertificate(purchaseParams);

      if (response) {
        // Check if API returned an error (matches handleStartQuiz pattern)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to purchase certificate");
        } else {
          // Close checkout dialog on success
          setShowCheckoutDialog(false);

          // Handle wallet payment separately (no redirect needed)
          if (paymentMethod === "wallet") {
            toast.success(response.message || "Certificate purchased successfully using wallet");
            // Reload page after 1 second to refresh certificate status
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }

          // For other payment methods, show success and redirect to payment page
          toast.success(response.message || "Certificate purchase order created successfully!");
          // toast.success(`Redirecting to secure ${paymentData.provider} payment page...`);

          // Access payment_url from response.data
          const paymentUrl = response.data?.payment_url;
          if (paymentUrl) {
            router.push(paymentUrl);
          } else {
            console.log("Payment URL not found in response");
            toast.error("Payment URL not available");
          }
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Handle certificate download (follows the same pattern as handleDownloadInvoice in TransactionHistory)
  const handleDownloadCertificate = async () => {
    try {
      // Set downloading state
      setIsDownloadingCertificate(true);

      // Download the certificate with course title for filename
      const success = await downloadAndSaveCertificate(
        courseData.id,
        courseData.title
      );

      if (success) {
        toast.success('Certificate downloaded successfully!');
      } else {
        toast.error('Failed to download certificate. Please try again.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error downloading certificate:', error);

      // Show user-friendly error message (matches TransactionHistory pattern)
      if (error?.message) {
        if (error.message === 'CERTIFICATE_NOT_FOUND') {
          toast.error('Certificate not found: This certificate does not exist in our system.');
        } else if (error.message === 'NO_PERMISSION') {
          toast.error('Access denied: You do not have permission to download this certificate.');
        } else if (error.message.includes('HTML error page')) {
          toast.error('Server error: The certificate service is currently unavailable. Please try again later or contact support.');
        } else if (error.message.includes('authentication') || error.message.includes('token')) {
          toast.error('Authentication error: Please log in again and try downloading the certificate.');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          toast.error('Certificate not found: This certificate may not exist or you may not have permission to download it.');
        } else if (error.message.startsWith('API_ERROR:')) {
          // Extract the actual error message from API_ERROR: prefix
          const actualMessage = error.message.replace('API_ERROR: ', '');
          toast.error(`Server error: ${actualMessage}`);
        } else {
          toast.error(`Download failed: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while downloading the certificate.');
      }
    } finally {
      // Remove downloading state
      setIsDownloadingCertificate(false);
    }
  };

  const certificateFee = courseCompletionData?.certificate_fee ? courseCompletionData?.certificate_fee : 0;

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="p-5">
        <h2 className="text-xl font-medium mb-2">{t("certificate")}</h2>
        <p className="text-gray-600">
          {t("certificate_description")}
        </p>
      </div>

      <div className='flexCenter'>
        <div className="sectionBg rounded-2xl p-4 md:p-4 lg:p-12">
          {/* Steps section */}
          <div className="bg-white rounded-2xl p-4 my-4">
            <div className="flex flex-col md:flex-row justify-between max-w-2xl mx-auto">
              {/* Step 1 */}
              <div className="flex items-start mb-4 md:mb-0">
                <div className="shrink-0 mr-3">
                  <div className={`w-10 h-10 rounded-full ${courseCompletionData?.all_curriculum_completed ? 'primaryBg text-white' : 'bg-white border borderColor text-gray-300'} flexCenter`}>
                    <FaCheck />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("step_1")}</p>
                  <p className={`font-medium ${courseCompletionData?.all_curriculum_completed ? 'primaryColor' : ''}`}>{t("complete_all_chapters")}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start mb-4 md:mb-0">
                <div className="shrink-0 mr-3">
                  <div className={`w-10 h-10 rounded-full ${courseCompletionData?.all_curriculum_completed && courseCompletionData?.all_assignments_submitted ? 'primaryBg text-white' : 'bg-white border borderColor text-gray-300'} flexCenter`}>
                    <FaCheck />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("step_2")}</p>
                  <p className={`font-medium ${courseCompletionData?.all_curriculum_completed && courseCompletionData?.all_assignments_submitted ? 'primaryColor' : ''}`}>{t("submit_a_assignment")}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="shrink-0 mr-3">
                  <div className={`w-10 h-10 rounded-full ${courseCompletionData?.all_curriculum_completed && courseCompletionData?.all_assignments_submitted && (courseCompletionData?.certificate === "free" || courseCompletionData?.certificate_fee_paid) ? 'primaryBg text-white' : 'bg-white border borderColor text-gray-300'} flexCenter`}>
                    <FaCheck />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("step_3")}</p>
                  <p className={`font-medium ${courseCompletionData?.all_curriculum_completed && courseCompletionData?.all_assignments_submitted && (courseCompletionData?.certificate === "free" || courseCompletionData?.certificate_fee_paid) ? 'primaryColor' : ''}`}>{t("earn_a_certificate")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate preview section */}
          <div className="p-4">
            <div className="max-w-2xl mx-auto relative">
              {/* Certificate image */}
              <div className="border-[10px] border-white rounded-2xl overflow-hidden">
                <CustomImageTag
                  src={certificate.src}
                  alt="Certificate Preview"
                  className="md:w-[800px] w-[300px] h-[252px] md:h-[548px] max-321:w-[200px] max-321:h-[200px] max-376:w-[250px] max-376:h-[252px] object-cover"
                />
              </div>

              {/* Lock overlay */}
              {courseCompletionData?.all_assignments_submitted === false && courseCompletionData?.all_curriculum_completed === false && (
                <div className="absolute inset-0 bg-[#010211CC] bg-opacity-40 flex items-center justify-center border-[10px] border-white rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <BiLock className="text-gray-800 text-xl" size={24} />
                  </div>
                </div>
              )}
            </div>

            {/* Congratulations section */}
            {
              courseCompletionData?.all_curriculum_completed && courseCompletionData?.all_assignments_submitted &&
              <div>

                {
                  courseCompletionData?.certificate === "free" || courseCompletionData?.certificate_fee_paid || certificateFee < 1 ?
                    <div className="max-w-2xl mx-auto mt-8 text-cente bg-white rounded-2xl md:p-4 p-2 flex-wrap lg:flex-nowrap flex items-center justify-between">
                      <div className='md:pr-3'>
                        <h3 className="text-xl font-bold mb-2">{t("congratulations_achievement")}</h3>
                        <p className="text-gray-600 mb-4">
                          {t("congratulations_achievement_description")}
                        </p>
                      </div>
                      <button
                        className={`bg-black text-white px-4 py-2 rounded-[4px] flex items-center justify-center mx-auto w-full md:w-max transition-colors ${isDownloadingCertificate
                          ? 'bg-gray-500 cursor-not-allowed opacity-70'
                          : 'hover:bg-gray-800'
                          }`}
                        onClick={handleDownloadCertificate}
                        disabled={isDownloadingCertificate}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        title={(courseCompletionData as any)?.certificate_id ? 'Download certificate' : 'Certificate not available'}
                      >
                        {
                          !isDownloadingCertificate &&
                          < MdOutlineCloudDownload
                            className={`mr-2 ${isDownloadingCertificate ? 'animate-pulse' : ''}`}
                          />
                        }
                        <span className="text-sm whitespace-nowrap">
                          {isDownloadingCertificate ? (
                            <span className="flex items-center gap-0.5">
                              <span>{t('downloading')}</span>
                              <span className="flex">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                              </span>
                            </span>
                          ) : (
                            t("download")
                          )}
                        </span>
                      </button>
                    </div>
                    :
                    <div className="max-w-2xl mx-auto mt-8 text-cente bg-white rounded-2xl md:p-4 p-2 flex-wrap flex items-center justify-between">
                      <div className='md:pr-4'>
                        <h3 className="text-xl font-semibold mb-4"> {t("certificate_fee_description")}</h3>
                      </div>

                      <button className="primaryBg hover:hoverBgColor text-white px-4 py-2 rounded-[4px] flex items-center justify-center mx-auto hover:bg-gray-800 w-full md:w-max"
                        onClick={() => setShowCheckoutDialog(true)}
                      >
                        {t("pay_certificate_fee")} {getCurrencySymbol()}{Number(courseCompletionData?.certificate_fee)?.toFixed(0)}
                      </button>
                    </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
      <CheckoutDialog
        cartItems={[]}
        billing={{
          subtotal: Number(courseCompletionData?.certificate_total),
          original_price: Number(courseCompletionData?.certificate_fee),
          tax_amount: Number(courseCompletionData?.certificate_tax_amount),
          tax_percentage: Number(courseCompletionData?.certificate_tax_percentage),
          discount: 0,
          couponDiscount: 0,
          taxes: 0, // TODO: Calculate taxes
          total: Number(courseCompletionData?.certificate_fee),
        }}
        isOpen={showCheckoutDialog}
        onClose={() => setShowCheckoutDialog(false)}
        onProceedToCheckout={handleProceedToCheckout}
        courseId={courseData.id}
        certificatePage={true}
        isProcessing={isProcessingCheckout}
      />
    </div>
  )
}

export default CertificateTabContent

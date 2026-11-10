"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { FaHome, FaSpinner, FaTimesCircle } from "react-icons/fa";
import PaymentStatusCard from "@/components/payment/PaymentStatusCard";
import { PaymentStatus } from "@/components/payment/PaymentStatusCard";
import FormSubmitLoader from "@/components/Loaders/FormSubmitLoader";

// Payment status types (imported from component)

// Mock order data interface
interface PaymentOrderData {
  orderId: string;
  orderNumber: string;
  status: PaymentStatus;
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  courses: Array<{
    id: number;
    title: string;
    price: number;
  }>;
}

// Component that uses useSearchParams - wrapped in Suspense
const PaymentStatusContent = () => {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<PaymentOrderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get status from URL parameters
  const status = searchParams.get('status') as PaymentStatus || 'completed';
  const orderId = searchParams.get('orderId') || 'ORD-12345';

  // Mock data based on status
  useEffect(() => {
    const mockOrderData: PaymentOrderData = {
      orderId: orderId,
      orderNumber: `ORD-${orderId}`,
      status: status,
      amount: 299.99,
      paymentMethod: 'Credit Card',
      transactionDate: new Date().toISOString(),
      courses: [
        {
          id: 1,
          title: 'Complete Web Development Course',
          price: 199.99
        },
        {
          id: 2,
          title: 'Advanced JavaScript Masterclass',
          price: 99.99
        }
      ]
    };

    // Simulate API loading
    setTimeout(() => {
      setOrderData(mockOrderData);
      setLoading(false);
    }, 1500);
  }, [status, orderId]);

  // Handle actions
  const handleDownloadInvoice = () => {
    // console.log('Downloading invoice for order:', orderData?.orderNumber);
    // Implement invoice download logic here
  };

  const handleRetryPayment = () => {
    // console.log('Retrying payment for order:', orderData?.orderNumber);
    // Implement payment retry logic here
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading payment status...</p>
          </div>
        </div>
      </>
    );
  }

  if (!orderData) {
    return (

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaHome />
              Go Home
            </Link>
          </div>
        </div>
     
    );
  }

  return (
   <>
      {/* Main Content */}
      <div className="min-h-screen sectionBg py-8 md:py-12 flex items-center justify-center">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Payment Status Card */}
            <PaymentStatusCard
              status={status}
              orderNumber={orderData.orderNumber}
              amount={orderData.amount}
              paymentMethod={orderData.paymentMethod}
              transactionDate={orderData.transactionDate}
              courses={orderData.courses}
              onDownloadInvoice={handleDownloadInvoice}
              onRetryPayment={handleRetryPayment}
            />
          </div>
        </div>
      </div>
  </>
  );
};

// Main page component with Suspense boundary
const PaymentStatusPage = () => {
  return (
    <Suspense fallback={
     <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FormSubmitLoader primaryBorder={true} />
            <p className="text-gray-600 mt-4">Loading payment status...</p>
          </div>
        </div>
      </>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
};

export default PaymentStatusPage;

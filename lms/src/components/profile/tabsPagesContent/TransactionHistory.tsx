"use client";
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { getOrders, Order } from "@/utils/api/user/getOrders";
import { downloadAndSaveInvoice } from "@/utils/api/user/downloadInvoice";
import toast from "react-hot-toast";
import Purchases from "./Purchases";
import RefundDetails from "./RefundDetails";
import { setShouldRefetchOrders, shouldRefetchOrdersSelector } from "@/redux/reducers/helpersReducer";
import { useDispatch, useSelector } from "react-redux";
import withBalanceCheck from "@/components/hoc/withBalanceCheck";


function TransactionHistory() {
  const { t } = useTranslation();

  // State management for active tab
  const [activeTab, setActiveTab] = useState<"purchases" | "refundDetails">("purchases");

  // State management for orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [visibleTransactions, setVisibleTransactions] = useState(10); // Show 10 transactions initially
  const [downloadingInvoices, setDownloadingInvoices] = useState<Set<number>>(new Set()); // Track which invoices are being downloaded

  const dispatch = useDispatch();
  const shouldRefetchOrders = useSelector(shouldRefetchOrdersSelector);

  // Fetch orders data on component mount
  useEffect(() => {
    if (activeTab === "purchases" || shouldRefetchOrders === true) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch orders from API
          const response = await getOrders();

          if (response && !response.error && response.data) {
            setOrders(response.data);
            setVisibleTransactions(10);
          } else {
            const errorMessage = response?.message || response?.error || "Failed to fetch orders";
            console.log("error : ", error);
            setError(errorMessage);
            toast.error(errorMessage);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          const errorMessage = err?.message || err?.response?.data?.message || "An error occurred while fetching orders";
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
          dispatch(setShouldRefetchOrders(false));
        }
      };

      fetchOrders();
    }
  }, [activeTab, shouldRefetchOrders]);


  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Toggle expanded state for grouped transactions
  const toggleExpanded = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Load more transactions
  const handleLoadMore = () => {
    setVisibleTransactions(prev => prev + 10);
  };

  // Get visible transactions
  const visibleOrders = orders.slice(0, visibleTransactions);
  const hasMoreTransactions = orders.length > visibleTransactions;

  // Handle invoice download
  const handleDownloadInvoice = async (orderId: number, orderNumber: string) => {

    try {
      // Add to downloading set
      setDownloadingInvoices(prev => new Set(prev).add(orderId));

      // Download the invoice
      const success = await downloadAndSaveInvoice(orderId, orderNumber);

      if (success) {
        console.log('Invoice downloaded successfully');
        // You could add a success toast notification here
      } else {
        console.error('Failed to download invoice');
        toast.error('Failed to download invoice. beacuse your trasction not completed yet.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error downloading invoice:', error);

      // Show user-friendly error message
      if (error?.message) {
        if (error.message === 'ORDER_NOT_COMPLETED') {
          toast.error('Cannot download invoice: This order is not completed yet. Please complete your payment first.');
        } else if (error.message === 'ORDER_NOT_FOUND') {
          toast.error('Order not found: This order does not exist in our system.');
        } else if (error.message === 'NO_PERMISSION') {
          toast.error('Access denied: You do not have permission to download this invoice.');
        } else if (error.message.includes('HTML error page')) {
          toast.error('Server error: The invoice service is currently unavailable. Please try again later or contact support.');
        } else if (error.message.includes('authentication') || error.message.includes('token')) {
          toast.error('Authentication error: Please log in again and try downloading the invoice.');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          toast.error('Invoice not found: This invoice may not exist or you may not have permission to download it.');
        } else if (error.message.startsWith('API_ERROR:')) {
          // Extract the actual error message from API_ERROR: prefix
          const actualMessage = error.message.replace('API_ERROR: ', '');
          toast.error(`Server error: ${actualMessage}`);
        } else {
          toast.error(`Download failed: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while downloading the invoice.');
      }
    } finally {
      // Remove from downloading set
      setDownloadingInvoices(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };


  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("my_purchases")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 inline-flex items-center gap-1 max-w-full flex-wrap">
            <Link href={"/"} className="primaryColor" title={t("home")}>
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_purchases")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar />

            {/* Main Container */}
            <div className="bg-white w-full md:overflow-x-auto rounded-[12px]">
              {/* Header Section */}
              <div className=" border-b" style={{ borderBottomColor: "#D8E0E6" }}>
                <h2
                  className="text-lg font-semibold text-[#010211] p-4 sm:p-6"

                >
                  {t("my_purchases")}
                </h2>
              </div>

              {/* Transaction Details Table*/}
              <div className="flex flex-col pb-0 p-4 sm:p-6 gap-4 sm:pb-0">
                <div className="flex gap-4 border-b" style={{ borderBottomColor: "#D8E0E6" }}>
                  <button
                    onClick={() => setActiveTab("purchases")}
                    className={`font-medium text-[16px] py-2 px-4 transition-colors cursor-pointer ${activeTab === "purchases"
                      ? "text-[#5A5BB5] border-b-2 border-[#5A5BB5]"
                      : "text-[#010211]"
                      }`}
                  >
                    {t("my_purchases")}
                  </button>
                  <button
                    onClick={() => setActiveTab("refundDetails")}
                    className={`font-medium text-[16px] py-2 px-4 transition-colors cursor-pointer ${activeTab === "refundDetails"
                      ? "text-[#5A5BB5] border-b-2 border-[#5A5BB5]"
                      : "text-[#010211]"
                      }`}
                  >
                    {t("refund_details")}
                  </button>
                </div>
              </div>

              {/* Conditionally render components based on active tab */}
              <div className="p-4 sm:p-6">
                {activeTab === "purchases" ? (
                  <Purchases
                    orders={orders}
                    visibleOrders={visibleOrders}
                    hasMoreTransactions={hasMoreTransactions}
                    expandedOrders={expandedOrders}
                    downloadingInvoices={downloadingInvoices}
                    toggleExpanded={toggleExpanded}
                    handleLoadMore={handleLoadMore}
                    handleDownloadInvoice={handleDownloadInvoice}
                    formatDate={formatDate}
                    loading={loading}
                  />
                ) : (
                  <RefundDetails />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
}

export default withBalanceCheck(TransactionHistory);

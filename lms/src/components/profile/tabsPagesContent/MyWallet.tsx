"use client";
import React, { useEffect, useState } from 'react'
import Layout from "@/components/layout/Layout";
import { useTranslation } from '@/hooks/useTranslation';
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from 'next/link';
import ProfileSidebar from '../ProfileSidebar';
import WithdrawalRequestModal from './WithdrawalRequestModal';
import WithdrawalDetailsModal from './WithdrawalDetailsModal';
import { useDispatch, useSelector } from 'react-redux';
import { userDataSelector } from '@/redux/reducers/userSlice';
import { extractErrorMessage, formatDate, getCurrencySymbol } from '@/utils/helpers';
import { getWalletHistory, WalletTransaction, WithdrawalRequest } from '@/utils/api/user/wallet/getWalletHistory';
import { toast } from 'react-hot-toast';
import WalletHistorySkeleton from '@/components/skeletons/WalletHistorySkeleton';
import DataNotFound from '@/components/commonComp/DataNotFound';
import RefundDetailsSkeletonMobile from '@/components/skeletons/RefundDetailsSkeletonMobile';
import { UserDetails } from '@/utils/api/user/getUserDetails';
import { fetchUserDeatilsSelector, setFetchUserDeatils } from '@/redux/reducers/helpersReducer';
import { HiOutlineInformationCircle } from 'react-icons/hi';

const MyWallet = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Helper function to get badge color classes based on status
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case "approved":
      case "paid":
      case "completed":
        return "bg-[#83B8071F] text-[#83B807]";
      case "pending":
        return "bg-[#0186D81F] text-[#0186D8]";
      case "rejected":
        return "bg-[#DB3D261F] text-[#DB3D26]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const userData = useSelector(userDataSelector) as UserDetails;

  const [walletHistoryData, setWalletHistoryData] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [withDrawalRequest, setWithDrawalRequest] = useState<boolean | null>();

  const fetchUserWalletBalance = useSelector(fetchUserDeatilsSelector);

  // Fetch wallet history data with pagination support
  const fetchWalletHistory = async (loadMore: boolean = false) => {
    try {
      // Use loadingMore state when loading more, otherwise use loading state
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      // If loading more, fetch the next page, otherwise start from page 1
      const pageToFetch = loadMore ? currentPage + 1 : 1;

      // Fetch wallet history data with pagination parameters
      const response = await getWalletHistory({ page: pageToFetch, per_page: 5 });

      if (response) {
        if (!response.error) {
          if (response.data && response.data.data && response.data.data.length > 0) {
            const data = response.data.data;
            // If loading more, append new data to existing data
            // Otherwise, replace existing data with new data
            if (loadMore) {
              setWalletHistoryData(prevData => [...prevData, ...data]);

            } else {
              setWalletHistoryData(data);
            }

            // Update pagination state from API response
            // Check if there are more pages available
            const currentPageNum = response.data.current_page;
            const lastPageNum = response.data.last_page;
            const hasMorePages = currentPageNum < lastPageNum;

            setHasMore(hasMorePages);
            setCurrentPage(pageToFetch);
            setWithDrawalRequest(response?.data?.is_withdrawal_request_pending);
          } else {
            // No data found
            setWalletHistoryData([]);
            setHasMore(false);
          }
        } else {
          toast.error(response.message || "Failed to fetch wallet history");
          setWalletHistoryData([]);
          setHasMore(false);
        }
      } else {
        toast.error("Failed to fetch wallet history");
        setWalletHistoryData([]);
      }
    } catch (error) {
      extractErrorMessage(error);
      setWalletHistoryData([]);
    } finally {
      setLoadingMore(false);
      setLoading(false);
    }
  }

  // Handler for load more button click
  // Only loads more if there are more pages and not already loading
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchWalletHistory(true);
    }
  }

  useEffect(() => {
    fetchWalletHistory();
    dispatch(setFetchUserDeatils(true));
  }, []);




  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("my_wallet")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 w-max flexCenter gap-1">
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
            <span>{t("my_wallet")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start overflow-hidden">
            <ProfileSidebar />

            {/* Wallet Container */}
            <div className="bg-white flex-1 w-full rounded-[10px] md:overflow-x-auto">
              <div className="p-4 sm:p-6 border-b border-[#D8E0E6]">
                <h2 className="text-lg font-semibold text-[#010211]">
                  {t("my_wallet")}
                </h2>
              </div>
              {/* wallet balance table */}

              <div className='container p-3 sm:p-6 space-y-6'>
                {/* Withdrawal Pending Request */}
                {withDrawalRequest && (
                  <div className='border border-[#D8E0E6] flex items-start gap-2 p-2 rounded-[10px] bg-[#F9F9F9]'>
                    <HiOutlineInformationCircle className='w-6 h-6 primaryColor shrink-0' />
                    <p className='text-[16px] font-normal primaryColor break-all'>{t("you_have_a_pending_withdrawal_request")}</p>
                  </div>
                )}

                {/* Current Balance && avaliable total balance */}
                <div className={`grid grid-cols-1 gap-4 ${userData.total_balance !== userData.wallet_balance ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
                  {/* current balance */}
                  <div className='bg-[#5A5BB5] p-4 rounded-[12px] space-y-4 items-start sm:space-y-0 min-[460px]:flex justify-between md:items-center flex-wrap'>
                    <div>
                      <p className='text-white text-[16px] font-normal'>{t("current_balance")}</p>
                      <div className='text-white text-[20px] font-semibold'>
                        {fetchUserWalletBalance === true ? (
                          <p className="w-20 h-6 bg-gray-300/30 animate-pulse rounded-md"></p>
                        ) : (
                          <>
                            {getCurrencySymbol()}{userData.total_balance}
                          </>
                        )}
                      </div>
                    </div>
                    {(userData.total_balance == userData.wallet_balance) && userData?.wallet_balance !== null && Number(userData.wallet_balance) > 0 && (
                      <WithdrawalRequestModal
                        withDrawalRequest={withDrawalRequest || null}
                        onSuccess={() => fetchWalletHistory(false)} />
                    )}

                  </div>
                  {userData.total_balance != userData.wallet_balance &&
                    <div className='bg-[#5A5BB5] p-4 rounded-[12px] space-y-4 items-start sm:space-y-0 min-[460px]:flex justify-between md:items-center flex-wrap'>
                      <div>
                        <p className='text-white text-[16px] font-normal'>{t("withdraw_money")}</p>
                        <div className='text-white text-[20px] font-semibold'>
                          {fetchUserWalletBalance === true ? (
                            <p className="w-20 h-6 bg-gray-300/30 animate-pulse rounded-md"></p>
                          ) : (
                            <>
                              {getCurrencySymbol()}{userData.wallet_balance}
                            </>
                          )}
                        </div>
                      </div>
                      {userData?.wallet_balance !== null && Number(userData.wallet_balance) > 0 && (
                        <WithdrawalRequestModal
                          withDrawalRequest={withDrawalRequest || null}
                          onSuccess={() => fetchWalletHistory(false)} />
                      )}
                    </div>}

                </div>

                {/* wallet history Desktop View*/}
                <div className="border border-[#D8E0E6] rounded-[10px] overflow-hidden hidden sm:block">
                  <div className='overflow-x-auto w-full'>
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-[#F2F5F7] text-left">
                        <tr>
                          {/* <th className="p-4 font-semibold text-[14px]">{t("course_name")}</th> */}
                          <th className="p-4 font-semibold text-[14px]">{t("order_id")}</th>
                          <th className="p-4 font-semibold text-[14px]">{t("transaction_type")}</th>
                          <th className="p-4 font-semibold text-[14px]">{t("transaction_date")}</th>
                          <th className="p-4 font-semibold text-[14px]">{t("amount")}</th>
                          <th className="p-4 font-semibold text-[14px]">{t("status")}</th>
                          <th className="p-4 font-semibold text-[14px]">{t("action")}</th>
                        </tr>
                      </thead>

                      {loading ? (
                        <WalletHistorySkeleton />
                      ) : walletHistoryData.length > 0 ? (
                        <tbody>
                          {walletHistoryData.map((walletHistory, index) => (
                            <tr
                              key={index}
                              className="border-t border-[#D8E0E6]"
                            >
                              {/* {walletHistory?.course_name ? (
                                <td className="p-4 text-[14px] font-normal text-[#010211]">{walletHistory.course_name?.substring(0, 20)}...</td>
                              ) : (
                                <td className="p-4 text-[14px] font-normal text-[#010211]">-</td>
                              )} */}
                              <td className="p-4 text-[14px] font-normal text-[#010211]">
                                {walletHistory?.order_number ? (
                                  <p className="text-[#010211] cursor-pointer break-all">{walletHistory.order_number}</p>
                                ) : (
                                  <p className="text-[#010211]">-</p>
                                )}
                              </td>
                              <td className="p-4 text-[14px] font-normal text-[#010211] capitalize">{walletHistory.transaction_type}</td>
                              <td className="p-4 text-[14px] font-normal text-[#010211]">{formatDate(walletHistory?.transaction_date)}</td>

                              {/* Amount + or - with color */}

                              <td
                                className={`p-4 text-[14px] font-medium ${walletHistory?.transaction_type === "withdrawal" || walletHistory?.transaction_type === "certificate" || walletHistory?.transaction_type === "order"
                                  ? "text-red-500"
                                  : "text-[#83B807]"
                                  }`}
                              >
                                {walletHistory?.transaction_type === "withdrawal" || walletHistory?.transaction_type === "certificate" || walletHistory?.transaction_type === "order" || walletHistory?.transaction_type === "purchase" ? (
                                  <div className='flex items-center gap-1'>
                                    <span className='text-[#DB3D26]'>
                                      -
                                    </span>
                                    <span className='text-[#DB3D26]'> {getCurrencySymbol()}{walletHistory?.amount} </span>

                                  </div>
                                ) : (
                                  <div className='flex items-center gap-1'>
                                    <span>
                                      +
                                    </span>
                                    <span> {getCurrencySymbol()}{walletHistory?.amount} </span>
                                  </div>
                                )}
                              </td>

                              {/* Status badge */}
                              <td className="p-4">
                                {walletHistory?.transaction_type === "refund" || walletHistory?.transaction_type === "withdrawal" ? (
                                  <span
                                    className={`px-3 py-1 rounded-[4px] text-[14px] font-normal capitalize ${getStatusBadgeClasses(walletHistory?.status || "")}`}
                                  >
                                    {walletHistory.status}
                                  </span>
                                ) : (
                                  <span
                                    className={`px-3 py-1 rounded-[4px] text-[14px] font-normal capitalize ${getStatusBadgeClasses(walletHistory?.reference?.status || "")}`}
                                  >
                                    {walletHistory?.reference?.status}
                                  </span>
                                )}
                              </td>

                              {/* View Details button */}
                              <td className="p-4">
                                {/* <button className="flex items-center gap-1 border px-3 py-1 rounded-[6px] text-sm w-max"> */}
                                <WithdrawalDetailsModal
                                  PaymentDetails={walletHistory?.payment_details || undefined}
                                  transactionType={walletHistory?.transaction_type || ""}
                                  amount={walletHistory?.amount}
                                  withdrawalStatus={walletHistory?.reference}
                                />
                                {/* </button> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <tbody>
                          <tr>
                            <td colSpan={7} className="text-center py-8 px-6">
                              <DataNotFound />
                            </td>
                          </tr>
                        </tbody>
                      )}

                      {/* Show loading skeleton when loading more data */}
                      {loadingMore && (
                        <WalletHistorySkeleton />
                      )}

                    </table>
                  </div>
                </div>

                {/* wallet history Mobile View*/}
                <div className="sm:hidden flex flex-col gap-4 mt-4">
                  {loading ? (
                    <>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <RefundDetailsSkeletonMobile key={index} />
                      ))}
                    </>
                  ) : walletHistoryData.length > 0 ? (
                    <>
                      {walletHistoryData.map((walletHistory, index) => (
                        <div
                          key={index}
                          className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E5E9F2] flex flex-col gap-3.5"
                        >
                          {/* Top: Course Thumbnail + Name */}
                          <div className="flex gap-3">
                            <div className="flex items-center justify-between w-full">
                              {walletHistory?.course_name ? (
                                <p className="text-[#010211] ont-normal text-[14px] cursor-pointer break-all">{walletHistory?.course_name?.substring(0, 20)}...</p>
                              ) : (
                                <p className="text-[#010211] cursor-pointer break-all">-</p>
                              )}
                              <WithdrawalDetailsModal
                                PaymentDetails={walletHistory?.payment_details || undefined}
                                mobileView={true}
                                transactionType={walletHistory?.transaction_type || ""}
                                amount={walletHistory?.amount}
                                withdrawalStatus={walletHistory?.reference}
                              />
                            </div>
                          </div>

                          {/* Divider */}
                          < div className="border-b my-0 border-[#D8E0E6]" />

                          {/* Reject Reason */}
                          < div className="flex justify-between mb-0 items-center" >
                            <p className="font-semibold text-[#010211] text-[14px] min-[375px]:text-[16px]">{t("order_id")} :</p>
                            <div className="text-right text-sm text-[#010211] max-w-[160px]">
                              {walletHistory?.transaction_id ? (
                                <p className="text-[#010211] cursor-pointer break-all">{walletHistory?.transaction_id}</p>
                              ) : (
                                <p className="text-[#010211]">-</p>
                              )}
                            </div>
                          </div>

                          <div className="border-b mb-0 border-[#D8E0E6]" />

                          {/* Attached File */}
                          <div className="flex justify-between mb-0 items-center">
                            <p className="font-semibold text-[#010211] text-[14px] min-[375px]:text-[16px]">{t("transaction_type")} :</p>
                            <p className="text-sm text-[#010211] max-w-[160px] truncate capitalize">
                              {walletHistory?.transaction_type}
                            </p>
                          </div>

                          <div className="border-b mb-0 border-[#D8E0E6]" />

                          {/* Amount */}
                          <div className="flex justify-between mb-0 items-center">
                            <p className="font-semibold text-[#010211] text-[14px] min-[375px]:text-[16px]">{t("transaction_date")} :</p>
                            <p className="text-sm text-[#010211]">{formatDate(walletHistory?.transaction_date)}</p>
                          </div>

                          <div className="border-b mb-0 border-[#D8E0E6]" />

                          {/* Amount */}
                          <div className="flex justify-between mb-0 items-center">
                            <p className="font-semibold text-[#010211] text-[14px] min-[375px]:text-[16px]">{t("amount")} :</p>
                            <p className={`text-sm ${walletHistory?.transaction_type === "withdrawal" || walletHistory?.transaction_type === "certificate" || walletHistory?.transaction_type === "order"
                              ? "text-red-500" : "text-[#83B807]"}`}>
                              {walletHistory?.transaction_type === "withdrawal" || walletHistory?.transaction_type === "certificate" || walletHistory?.transaction_type === "order" ? (
                                <>-{getCurrencySymbol()}{walletHistory?.amount}</>
                              ) : (
                                <>+{getCurrencySymbol()}{walletHistory?.amount}</>
                              )}
                            </p>
                          </div>

                          <div className="border-b mb-0 border-[#D8E0E6]" />

                          {/* Status */}
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-[#010211] text-[14px] min-[375px]:text-[16px]">{t("status")} :</p>
                            {walletHistory?.transaction_type === "refund" || walletHistory?.transaction_type === "withdrawal" ? (
                              <span
                                className={`px-3 py-1 rounded-[4px] text-[14px] font-normal capitalize ${getStatusBadgeClasses(walletHistory?.status || "")}`}
                              >
                                {walletHistory?.status}
                              </span>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-[4px] text-[14px] font-normal capitalize ${getStatusBadgeClasses(walletHistory?.reference?.status || "")}`}
                              >
                                {walletHistory?.reference?.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className='text-center py-8 px-6'>
                      <DataNotFound />
                    </div>
                  )}

                  {/* Show loading skeleton when loading more data in mobile view */}
                  {loadingMore && (
                    <>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <RefundDetailsSkeletonMobile key={index} />
                      ))}
                    </>
                  )}
                </div>


                {/* Load More Button */}
                {/* Only show load more button if there are more items to load */}
                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      className="commonBtn w-full sm:w-max disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleLoadMore}
                      disabled={loadingMore || loading}
                    >
                      {loadingMore ? t("loading") || "Loading..." : t("load_more")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div >
    </Layout >
  )
}

export default MyWallet

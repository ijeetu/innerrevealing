"use client";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import { useSelector } from "react-redux";
import { instructorWithdrawalDetailsSelector } from "@/redux/reducers/helpersReducer";
import { userDataSelector } from "@/redux/reducers/userSlice";
import WithdrawalHistory from "@/components/instructor/earnings/WithdrawalHistory";
import { createWithdrawalRequest, WithdrawalRequestParams } from "@/utils/api/instructor/earnings/withdrawalRequest";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import { useTranslation } from "@/hooks/useTranslation";
import { UserDetails } from "@/utils/api/user/getUserDetails";

export default function WithdrawalDetailsPage() {
  // Redux selectors
  const instructorWithdrawalDetails = useSelector(instructorWithdrawalDetailsSelector);
  const userDetails = useSelector(userDataSelector) as UserDetails;

  // Add state for form inputs
  const bankAccountNumber = userDetails?.instructor_details?.personal_details?.bank_account_number || "";
  const accountHolderName = userDetails?.instructor_details?.personal_details?.bank_account_holder_name || "";
  const accountNumber = userDetails?.instructor_details?.personal_details?.bank_account_number || "";
  const bankName = userDetails?.instructor_details?.personal_details?.bank_name || "";
  const ifscCode = userDetails?.instructor_details?.personal_details?.bank_ifsc_code || "";

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  // Send withdrawal request function (following the same pattern as fetchAddedCourses)
  const sendWithdrawalRequest = async () => {
    // Validate amount input
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t("valid_amount_required"));
      return;
    }

    setIsLoading(true);

    try {
      // Prepare withdrawal request parameters
      const withdrawalParams = {
        amount: parseFloat(amount),
        payment_method: "bank_transfer",
        payment_details: {
          account_holder_name: accountHolderName,
          account_number: accountNumber,
          bank_name: bankName,
          ifsc_code: ifscCode,
        },
        notes: `Withdrawal request for ${getCurrencySymbol()}${amount}`,
      };

      if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
        toast.error(t("update_bank_details"));
        return;
      }

      // Send the withdrawal request to the backend API
      const response = await createWithdrawalRequest(withdrawalParams as WithdrawalRequestParams);

      if (response) {
        if (!response.error) {
          toast.success(response.message || "Withdrawal request submitted successfully!");
          setAmount("");
        } else {
          // API returned an error response
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to submit withdrawal request");
        }
      } else {
        // Network error or null response
        console.log("Response is null", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const canWithdraw = Number(instructorWithdrawalDetails?.availableToWithdrawal) <= 0;


  return (
    <div className="w-full">
      <DashboardBreadcrumb title={t("earnings")} firstElement={t("earnings")} firstElementLink="/instructor/earnings" secondElement={t("withdrawal_details")} />

      {/* Back button */}
      <Link href="/instructor/earnings" className="mb-6 inline-block">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 text-white" />
        </div>
      </Link>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
              <div className="w-8 h-8 bg-black rounded-sm"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("total_withdrawal")}</p>
              <p className="text-2xl font-semibold">{getCurrencySymbol()}{instructorWithdrawalDetails?.totalwithdrawal || "-"}</p>
            </div>
          </div>
        </div>

        <div className="bg-black rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            </div>
            <div className="text-white">
              <p className="text-sm">{t("available_to_withdraw")}</p>
              <p className="text-2xl font-semibold">{getCurrencySymbol()}{instructorWithdrawalDetails?.availableToWithdrawal || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw form */}
      <div className="bg-white mb-6 rounded-2xl border borderColor">
        <h2 className="font-semibold py-4 px-6 border-b borderColor">{t("withdraw")}</h2>
        <div className="grid grid-cols-12 gap-4 p-4 sm:p-6">
          <div className="col-span-12 md:col-span-10 min-2xl:col-span-11 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Account Number */}
            <div className="">
              <label htmlFor="amount" className="block mb-2">
                {t("bank_account")}
              </label>
              <Input
                id="bankAccountNumber"
                placeholder=""
                className="sectionBg"
                value={bankAccountNumber}
                readOnly
                disabled
              />
            </div>
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block mb-2">
                {t("amount")}
              </label>
              <Input
                id="amount"
                placeholder={`${getCurrencySymbol()}500`}
                className="sectionBg"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={canWithdraw}
              />
            </div>
          </div>
          <div className="flex items-end justify-center col-span-12 md:col-span-2 min-2xl:col-span-1">
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-800 w-full"
              onClick={sendWithdrawalRequest}
              disabled={isLoading || canWithdraw}
            >
              {isLoading ? t("processing") : t("withdraw")}
            </Button>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <WithdrawalHistory />
    </div>
  );
}

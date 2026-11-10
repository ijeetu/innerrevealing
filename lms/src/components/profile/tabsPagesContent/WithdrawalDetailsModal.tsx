"use client";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { EyeIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { WithdrawalPaymentDetails, WalletTransactionReference } from "@/utils/api/user/wallet/getWalletHistory";
import { getCurrencySymbol } from "@/utils/helpers";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";


const WithdrawalDetailsModal = ({
    PaymentDetails,
    transactionType,
    mobileView,
    amount,
    withdrawalStatus,
}: {
    PaymentDetails?: WithdrawalPaymentDetails;
    transactionType?: string;
    mobileView?: boolean;
    amount?: number;
    withdrawalStatus?: WalletTransactionReference;
}) => {


    const isRefund = transactionType === "refund" || transactionType === "commission" || transactionType === "certificate" || transactionType === "order" || transactionType === "purchase" || transactionType === "iap-purchase";
    const { t } = useTranslation();


    const getStatusClass = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-[#83B8071F] text-[#83B807]";
            case "rejected":
                return "bg-[#FF00001F] text-[#FF0000]";
            case "pending":
                return "bg-[#0186D81F] text-[#0186D8]";
            default:
                return "";
        }
    };

    const [popoverAlign, setPopoverAlign] = useState<"center" | "end">("end");

    useEffect(() => {
        const handleResize = () => {
            setPopoverAlign(window.innerWidth <= 450 ? "center" : "end");
        };

        handleResize(); // set on mount
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <Dialog>
            <DialogTrigger
                disabled={isRefund}
                className={`flex items-center gap-1 px-3 py-1 rounded-[6px] text-sm w-max ${mobileView ? "border-0" : "border"} ${isRefund ? "opacity-50 cursor-not-allowed" : ""}`}>
                {mobileView ? (
                    <div className="w-[24px] h-[24px] flexCenter border border-[#010211] rounded-[4px] shrink-0">
                        <EyeIcon className='w-4 h-4 shrink-0' />
                    </div>
                ) : (
                    <>
                        <EyeIcon className='w-4 h-4' />
                        {t("view_details")}
                    </>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 rounded-xl overflow-hidden gap-0">

                {/* HEADER */}
                <DialogHeader className="flex flex-row justify-between px-6 py-4 border-b border-[#D8E0E6] ltr:text-left rtl:text-right">
                    <div>
                        <DialogTitle className="text-xl font-semibold text-[#010211]">
                            {t("view_withdrawal_details")}
                        </DialogTitle>
                        <p className="font-normal text-[14px] text-[#010211]">
                            {t("check_your_withdrawal_amount_and_linked_bank_details_for_this_transaction")}
                        </p>
                    </div>

                    <DialogClose className="p-1">
                    </DialogClose>
                </DialogHeader>

                {/* BODY */}
                <div className="p-6 max-h-[calc(100vh-150px)] overflow-y-auto customScrollbar">
                    <div className="border border-[#D8E0E6] rounded-lg bg-[#F9FBFC] p-5">

                        <p className="font-semibold text-[16px] text-[#010211] mb-4">
                            {t("account_details")}
                        </p>
                        {/* Account Details */}
                        <div className="space-y-4 min-[455px]:space-y-2">
                            <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">{t("amount")}</span>
                                <span className="break-all min-[455px]:text-right flex-1 min-w-0 min-[455px]:pl-4">{getCurrencySymbol()} {amount}</span>
                            </div>
                            <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">{t("account_holder_name")}</span>
                                <span className="break-all min-[455px]:text-right flex-1 min-w-0 min-[455px]:pl-4">{PaymentDetails?.account_holder_name}</span>
                            </div>
                            <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">{t("account_number")}</span>
                                <span className="break-all min-[455px]:text-right flex-1 min-w-0 min-[455px]:pl-4">{PaymentDetails?.account_number}</span>
                            </div>
                            <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">{t("bank_name")}</span>
                                <span className="break-all min-[455px]:text-right flex-1 min-w-0 min-[455px]:pl-4">{PaymentDetails?.bank_name}</span>
                            </div>
                            <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">{t("other_details")}</span>
                                <span className="break-all min-[455px]:text-right flex-1 min-w-0 min-[455px]:pl-4">{PaymentDetails?.other_details}</span>
                            </div>
                            <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">{t("status")}</span>
                                {withdrawalStatus ? (
                                    <span className={`${getStatusClass(withdrawalStatus?.status)} capitalize px-2 rounded-[6px] w-max`}>{withdrawalStatus?.status}</span>
                                ) : (
                                    <span className={`${getStatusClass("pending")} capitalize px-2 rounded-[6px] w-max`}>{t("pending")}</span>
                                )}
                            </div>
                            {withdrawalStatus && (
                                <div className="flex flex-col min-[455px]:flex-row justify-between text-[15px] text-[#010211]">
                                    <span className="max-[455px]:text-[14px] max-[455px]:font-semibold">
                                        {t("note")}
                                    </span>

                                    {withdrawalStatus.admin_notes ? (
                                        <div className="text-left max-w-[224px]">
                                            {withdrawalStatus.admin_notes.substring(0, 20)}
                                            {withdrawalStatus.admin_notes.length > 20 && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="text-[#5A5BB5] cursor-pointer mt-1 underline focus-visible:outline-none"
                                                        >
                                                            {t("View")}
                                                        </button>
                                                    </PopoverTrigger>

                                                    <PopoverContent
                                                        side="top"
                                                        align={popoverAlign}
                                                        className="max-w-xs bg-[#5A5BB5] text-center p-3 text-[16px] text-white break-all border-none">
                                                        {withdrawalStatus.admin_notes}
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default WithdrawalDetailsModal;

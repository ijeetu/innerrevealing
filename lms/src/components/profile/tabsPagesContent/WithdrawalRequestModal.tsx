"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import z from "zod";
import { createWalletWithdrawalRequest } from "@/utils/api/user/wallet/createWalletWithdrawalRequest";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { useDispatch } from "react-redux";
import { setFetchUserDeatils } from "@/redux/reducers/helpersReducer";

const WithdrawalRequestModal = ({ onSuccess, withDrawalRequest }: { onSuccess: () => void, withDrawalRequest: boolean | null }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        amount: "",
        bankname: "",
        bankHolderName: "",
        bankAccountNumber: "",
        otherCode: "",
    });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = z.object({
        amount: z.number().min(1, t("amount_is_required")),
        bankname: z.string().min(1, t("bank_name_is_required")),
        bankHolderName: z.string().min(1, t("bank_account_holder_name_is_required")),
        // Bank Account Number validation: digits only (supports international formats)
        bankAccountNumber: z
            .string()
            .min(1, t("bank_account_number_is_required"))
            .regex(/^\d+$/, t("bank_account_number_must_contain_only_digits")),
        // IFSC/SWIFT/BIC/IBAN Code validation: alphanumeric format (supports international bank codes)
        otherCode: z
            .string()
            .min(1, t("ifsc_swift_bic_iban_etc_is_required"))
            .regex(/^[A-Z0-9]+$/, t("bank_ifsc_code_invalid_format")),
    })

    // Handle bank account number input - only allow digits
    const handleBankAccountNumberChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        // Remove any non-digit characters
        const digitsOnly = value.replace(/\D/g, '');

        // Update form data
        setFormData((prev) => ({ ...prev, [name]: digitsOnly }));

        // Remove error for this field if it exists
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Handle IFSC/SWIFT/BIC/IBAN code input - auto-convert to uppercase and restrict format
    const handleOtherCodeChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        // Convert to uppercase and remove any spaces
        const upperValue = value.toUpperCase().replace(/\s/g, '');
        // Only allow alphanumeric characters
        const alphanumericOnly = upperValue.replace(/[^A-Z0-9]/g, '');

        // Update form data
        setFormData((prev) => ({ ...prev, [name]: alphanumericOnly }));

        // Remove error for this field if it exists
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Handle other input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        // Update form data
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Remove error for this field if it exists
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };


    const validateForm = () => {
        try {
            // Convert string values to proper types before validation
            const dataToValidate = {
                amount: formData.amount ? parseFloat(formData.amount) : 0,
                bankname: formData.bankname,
                bankHolderName: formData.bankHolderName,
                bankAccountNumber: formData.bankAccountNumber,
                otherCode: formData.otherCode,
            };
            schema.parse(dataToValidate);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.errors.forEach((error) => {
                    const fieldName = error.path[0] as string;
                    newErrors[fieldName] = error.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    // withdrawal-request api 

    const sendWithdrawalRequest = async () => {
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            const response = await createWalletWithdrawalRequest({
                amount: parseFloat(formData.amount),
                payment_method: "bank_transfer",
                payment_details: {
                    account_holder_name: formData.bankHolderName,
                    account_number: formData.bankAccountNumber,
                    bank_name: formData.bankname,
                    ifsc_code: formData.otherCode,
                },
                entry_type: "user",
            });
            if (response) {
                if (response.error) {
                    console.log("API error : ", response.message);
                    toast.error(response.message || "Failed to create withdrawal request");
                } else {
                    toast.success(response.message || "Withdrawal request created successfully");
                    setFormData({
                        amount: "",
                        bankname: "",
                        bankHolderName: "",
                        bankAccountNumber: "",
                        otherCode: "",
                    });
                    dispatch(setFetchUserDeatils(true));
                    setErrors({});
                    setIsOpen(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            } else {
                console.log("response is null in component", response);
            }

        } catch (error) {
            extractErrorMessage(error);
        } finally {
            setLoading(false);
            setErrors({});
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (withDrawalRequest === true
                    && open
                ) {
                    return;
                }
                setIsOpen(open);
                if (!open) {
                    // Reset form and errors when modal closes
                    setFormData({
                        amount: "",
                        bankname: "",
                        bankHolderName: "",
                        bankAccountNumber: "",
                        otherCode: "",
                    });
                    setErrors({});
                    setLoading(false); // optional
                }
            }}
        >
            <DialogTrigger className={`bg-white text-[#5A5BB5] font-normal text-[16px] max-[460px]:w-full py-2 px-3 rounded-[4px]  ${withDrawalRequest ? "cursor-not-allowed opacity-50" : ""}`}>
                {t("withdrawal_request")}
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl p-0  rounded-xl overflow-hidden gap-0">

                {/* HEADER */}
                <DialogHeader className="flex flex-row justify-between px-3 sm:px-6 py-4 border-b border-[#D8E0E6] ltr:text-left rtl:text-right">
                    <div>
                        <DialogTitle className="text-xl font-semibold text-[#010211]">
                            {t("withdrawal_request")}
                        </DialogTitle>
                        <p className="font-normal text-[14px] text-[#010211]">
                            {t("enter_your_bank_details_and_withdrawal_amount_to_submit_your_request")}
                        </p>
                    </div>

                    {/* Close Button */}
                    <DialogClose className="p-1">
                    </DialogClose>
                </DialogHeader>

                {/* BODY */}
                <div className="p-3 space-y-4 sm:space-y-6 sm:p-6 max-h-[calc(100vh-300px)] overflow-y-auto customScrollbar">

                    {/* AMOUNT */}
                    <div>
                        <p className="font-normal text-[16px] text-[#010211] mb-2">
                            {t("amount")} <span className="text-[#DB3D26]">*</span>
                        </p>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={handleInputChange}
                            name="amount"
                            className={`w-full border rounded-md p-3 bg-[#F9F9F9] text-[14px] ${errors.amount ? "border-red-500" : "border-[#D8E0E6]"}`}
                            placeholder="177.00"
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>

                    {/* Bank Name */}
                    <div>
                        <p className="font-normal text-[16px] text-[#010211] mb-2">
                            {t("bank_name")} <span className="text-[#DB3D26]">*</span>
                        </p>
                        <input
                            type="text"
                            value={formData.bankname}
                            onChange={handleInputChange}
                            name="bankname"
                            className={`w-full border rounded-md p-3 bg-[#F9F9F9] text-[14px] ${errors.bankname ? "border-red-500" : "border-[#D8E0E6]"}`}
                            placeholder={t("enter_your_bank_name")}
                        />
                        {errors.bankname && <p className="text-red-500 text-sm mt-1">{errors.bankname}</p>}
                    </div>

                    {/* ACCOUNT HOLDER NAME */}
                    <div>
                        <p className="font-normal text-[16px] text-[#010211] mb-2">
                            {t("account_holder_name")} <span className="text-[#DB3D26]">*</span>
                        </p>
                        <input
                            type="text"
                            value={formData.bankHolderName}
                            onChange={handleInputChange}
                            name="bankHolderName"
                            className={`w-full border rounded-md p-3 bg-[#F9F9F9] text-[14px] ${errors.bankHolderName ? "border-red-500" : "border-[#D8E0E6]"}`}
                            placeholder={`${t("ABXYZ")}`}
                        />
                        {errors.bankHolderName && <p className="text-red-500 text-sm mt-1">{errors.bankHolderName}</p>}
                    </div>

                    {/* ACCOUNT NUMBER */}
                    <div>
                        <p className="font-normal text-[16px] text-[#010211] mb-2">
                            {t("account_number")} <span className="text-[#DB3D26]">*</span>
                        </p>
                        <input
                            type="text"
                            value={formData.bankAccountNumber}
                            onChange={handleBankAccountNumberChange}
                            name="bankAccountNumber"
                            className={`w-full border rounded-md p-3 bg-[#F9F9F9] text-[14px] ${errors.bankAccountNumber ? "border-red-500" : "border-[#D8E0E6]"}`}
                            placeholder="123457896548712"
                        />
                        {errors.bankAccountNumber && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>}
                    </div>

                    {/* IFSC CODE */}
                    <div>
                        <p className="font-normal text-[16px] text-[#010211] mb-2">
                            {t("enter_other_details")} <span className="text-[#DB3D26]">*</span>
                        </p>
                        <textarea
                            value={formData.otherCode}
                            onChange={handleOtherCodeChange}
                            name="otherCode"
                            className={`w-full border rounded-md p-3 bg-[#F9F9F9] text-[14px] ${errors.otherCode ? "border-red-500" : "border-[#D8E0E6]"}`}
                            placeholder={t("ifsc_swift_bic_iban")}
                            rows={4}
                        />
                        {errors.otherCode && <p className="text-red-500 text-sm mt-1">{errors.otherCode}</p>}
                    </div>

                </div>

                {/* FOOTER BUTTONS */}
                <div className="border-t border-[#D8E0E6] flex flex-col sm:flex-row gap-3 justify-between px-3 sm:px-6 py-4">

                    <button
                        disabled={loading}
                        onClick={sendWithdrawalRequest}
                        className={`w-full bg-[#5A5BB5] text-white border border-[#5A5BB5] py-2.5 px-4 rounded-md text-[16px] font-medium ${loading && "opacity-50 cursor-not-allowed"}`}>
                        {loading ? t("sending") + "..." : t("send_request")}
                    </button>

                    <DialogClose className="w-full border border-[#010211] py-2.5 px-4 rounded-md text-[16px] font-medium">
                        {t("cancel_button")}
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WithdrawalRequestModal;

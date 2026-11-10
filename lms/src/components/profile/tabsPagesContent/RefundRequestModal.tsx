"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Upload, InfoIcon } from "lucide-react";
import { OrderCourse } from "@/utils/api/user/getOrders";
import { useTranslation } from "@/hooks/useTranslation";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { z } from "zod";
import { createRefundRequest } from "@/utils/api/user/my-purchase/createRefundRequest";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setShouldRefetchOrders } from "@/redux/reducers/helpersReducer";


export default function RefundRequestModal({ open, setOpen, selectedCourse }: { open: boolean, setOpen: (open: boolean) => void, selectedCourse: OrderCourse | null }) {

    const [file, setFile] = useState<File | null>(null);
    const [reason, setReason] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setErrors] = useState<{ reason?: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    // Reset form fields when modal closes
    useEffect(() => {
        if (!open) {
            setFile(null);
            setReason("");
            setErrors({});
            setLoading(false);
            // Reset file input element to clear selected file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] || null);
    };

    const { t } = useTranslation();

    const schema = z.object({
        reason: z.string().min(1, t("reason_is_required")),
    });

    const validateForm = () => {
        try {
            schema.parse({ reason });
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: { reason?: string } = {};
                error.errors.forEach((err) => {
                    const fieldName = err.path[0] as "reason";
                    newErrors[fieldName] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            const response = await createRefundRequest({
                course_id: selectedCourse?.course_id || "",
                reason: reason,
                user_media: file || undefined,
            });
            if (response) {
                if (response.error) {
                    console.log("API error : ", response.message);
                    toast.error(response.message || "Failed to create refund request");
                } else {
                    toast.success(response.message || "Refund request created successfully");
                    dispatch(setShouldRefetchOrders(true));
                    setOpen(false);
                    setFile(null);
                    setReason("");
                    setErrors({});
                }
            } else {
                console.log("response is null in component", response);
            }
            setErrors({});
        } catch (error) {
            extractErrorMessage(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* MODAL */}
            <DialogContent className="sm:max-w-xl p-0 rounded-xl overflow-hidden gap-0">

                {/* HEADER */}
                <DialogHeader className="flex flex-row justify-between px-3 sm:px-6 py-4 border-b border-[#D8E0E6] text-left">
                    <div>
                        <DialogTitle className="text-xl font-semibold text-[#010211]">
                            {t("submit_your_refund_request")}
                        </DialogTitle>
                        <p className="font-normal text-[14px] text-[#010211]">{t("to_request_a_refund_please_share_your_reason_below")}</p>
                    </div>
                    <DialogClose>

                    </DialogClose>
                </DialogHeader>

                {/* BODY */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto">

                    {/* Refund to wallet info */}

                    <div className="bg-[#EAF4FF] text-[#0A66C2] p-3 rounded-md text-[14px] font-normal flex items-center gap-2">
                        <InfoIcon className="w-4 h-4 text-[#0A66C2] shrink-0" />
                        {t("refund_amount_will_be_credited_to_your_wallet_after_approval")}
                    </div>


                    {/* COURSE CARD */}
                    <div className="border border-[#D8E0E6] rounded-xl p-4 flex flex-col min-[450px]:flex-row justify-between items-start gap-4">
                        <div className="flex gap-3 items-start">
                            <div className="w-14 h-14 bg-gray-300 rounded-md shrink-0">
                                <CustomImageTag
                                    src={selectedCourse?.image}
                                    alt={selectedCourse?.title || ""}
                                    className="w-full h-full object-cover rounded-md shrink-0"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-[16px]">
                                    {/* UI Design Fundamentals */}
                                    {selectedCourse?.title}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {t("by")} <span className="text-[#5A5BB5]">{selectedCourse?.creator_name}</span>
                                </p>
                            </div>
                        </div>

                        <p className="font-semibold text-[16px]">{getCurrencySymbol()}{selectedCourse?.final_price}</p>
                    </div>
                    <div className="space-y-4 sectionBg rounded-xl p-4">
                        {/* REASON INPUT */}
                        <div>
                            <p className="font-normal text-[16px] text-[#010211] mb-2">{t("reason")} <span className="text-[#DB3D26]">*</span></p>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error.reason) {
                                        setErrors({});
                                    }
                                }}
                                className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-white ${error?.reason ? "border-red-500" : ""}`}
                                placeholder={t("type_your_reason_here")}
                            />
                            {error.reason && <p className="text-red-500 text-sm mt-1">{error.reason}</p>}
                        </div>

                        {/* FILE UPLOAD */}
                        <div>
                            <p className="text-[16px] font-normal mb-2 text-[#010211]">{t("attach_media")}</p>

                            <label
                                htmlFor="file"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer bg-white"
                            >
                                <Upload className="w-8 h-8 text-gray-400" />
                                {file ? (
                                    <p className="mt-2 text-sm text-gray-700">{file.name}</p>
                                ) : (
                                    <>
                                        <p className="text-[#010211] mt-3 text-[16px] font-normal">
                                            {t("choose_a_file_or_drag_and_drop_it_here.")}
                                        </p>
                                        <p className="text-[#010211] text-[16px] mt-1">or</p>
                                        <p className="bg-white mt-3 px-4 py-1.5 border border-[#5A5BB5] rounded-md text-sm text-[#5A5BB5]">
                                            {t("choose_file")}
                                        </p>
                                    </>
                                )}

                                <input
                                    id="file"
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx,.txt,.mov"
                                />
                            </label>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className={`commonBtn w-full ${loading && "opacity-50 cursor-not-allowed"}`}
                    >
                        {loading ? t("sending") + "..." : t("send_request")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

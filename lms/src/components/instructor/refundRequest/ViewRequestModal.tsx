"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isRTLSelector } from "@/redux/reducers/languageSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { PiWarningCircleBold, PiFileBold, PiPlayCircleBold } from "react-icons/pi";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { RefundRequestData } from "@/utils/api/instructor/refund-request/getRefundRequest";
import { extractApiErrorMessage, formatDateForLessonsOverview, getCurrencySymbol } from "@/utils/helpers";
import { respondToRefundRequest } from "@/utils/api/instructor/refund-request/refundRequestsRespond";
import toast from "react-hot-toast";
import { dataSelector } from "@/redux/reducers/settingsSlice";

interface ViewRequestModalProps {
    refundRequestData: RefundRequestData;
    onSuccess?: () => void;
}

export default function ViewRequestModal({ refundRequestData, onSuccess }: ViewRequestModalProps) {
    const { t } = useTranslation();
    const isRTL = useSelector(isRTLSelector);
    const [open, setOpen] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const setting = useSelector(dataSelector);

    const handleResponse = async (recommendation: "approve" | "reject") => {
        setLoading(true);
        try {
            const response = await respondToRefundRequest({
                id: refundRequestData?.id,
                comment: note,
                recommendation,
            });

            if (response) {
                if (response?.error) {
                    toast.error(response.message || `Failed to ${recommendation} request`);
                } else {
                    toast.success(response.message || `Request ${recommendation} successfully`);
                    setOpen(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (error) {
            extractApiErrorMessage(error);
        } finally {
            setLoading(false);
        }
    }

    

    const isResponded = refundRequestData.instructor_response.status === "responded";

    const renderMedia = (url: string) => {
        const extension = url.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
        const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];
        const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];

        if (imageExts.includes(extension)) {
            return (
                <div 
                    className="relative group cursor-pointer w-28 h-24 shrink-0 transition-transform hover:scale-105"
                    onClick={() => setPreviewMedia({ url, type: 'image' })}
                >
                    <CustomImageTag
                        src={url}
                        alt="refund media"
                        className="w-full h-full object-cover rounded-lg border border-[#E8E8EC]"
                    />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg transition-all">
                        <span className="text-white text-xs font-medium">{t("preview")}</span>
                    </div>
                </div>
            );
        }

        if (videoExts.includes(extension)) {
            return (
                <div 
                    className="relative group cursor-pointer w-28 h-24 bg-black rounded-lg shrink-0 overflow-hidden transition-transform hover:scale-105"
                    onClick={() => setPreviewMedia({ url, type: 'video' })}
                >
                    <video src={url} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <PiPlayCircleBold className="text-white/80 w-8 h-8 group-hover:hidden" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                        <span className="text-white text-xs font-medium">{t("preview")}</span>
                    </div>
                </div>
            );
        }

        if (audioExts.includes(extension)) {
            return (
                <div className="w-full max-w-[300px]">
                    <audio src={url} controls className="w-full h-10 border border-[#E8E8EC] rounded-lg bg-[#F8F8F9]" />
                </div>
            );
        }

        // Default to document link
        return (
            <a 
                href={url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 border border-[#E8E8EC] px-4 py-3 rounded-lg text-[#010211] hover:bg-[#F8F8F9] transition-all"
            >
                <div className="w-10 h-10 bg-[#E8E8EC] rounded-md flex items-center justify-center shrink-0">
                    <PiFileBold className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium line-clamp-1">{t("document")} {extension && `(${extension.toUpperCase()})`}</span>
                    <span className="text-xs text-blue-600 underline">{t("click_to_view_or_download")}</span>
                </div>
            </a>
        );
    };

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            {isResponded ? (
                <button
                    disabled
                    className="md:text-[14px] font-normal whitespace-nowrap text-white bg-gray-400 cursor-not-allowed rounded-[4px] px-4 py-2"
                >
                    {t("view_request")}
                </button>
            ) : (
                <DialogTrigger asChild>
                    <button className="commonBtn md:text-[14px] font-normal whitespace-nowrap text-white">
                        {t("view_request")}
                    </button>
                </DialogTrigger>
            )}

            <DialogContent dir={isRTL ? "rtl" : "ltr"} className={cn("sm:max-w-xl p-0 overflow-hidden rounded-2xl gap-3", isRTL && "rtl")}>

                {/* Header */}
                <DialogHeader className="px-4 sm:py-5 py-3 border-b border-[#E8E8EC] text-start gap-0.5">
                    <DialogTitle className="max-[550px]:text-[18px] text-xl font-semibold">
                        {t("refund_request_review")}
                    </DialogTitle>

                    <p className="text-sm text-gray-600">
                        {t("check_the_refund_request_details_and_decide_whether_to_approve_or_reject_it")}
                    </p>
                </DialogHeader>

                {/* Body */}
                <div className="px-3 sm:px-4 py-2 space-y-4 sm:space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto customScrollbar">

                    {/* Warning */}
                    <div className="flex items-center gap-3 bg-[#DB93051F] rounded-[6px] p-2">
                        <div className="w-[30px] h-[30px] bg-[#DB9305] rounded-[8px] flexCenter shrink-0">
                            <PiWarningCircleBold className="text-white w-[20px] h-[20px] bg-transparent shrink-0" />
                        </div>
                        <p className="text-[#010211] max-[550px]:text-[14px] text-base font-normal">
                            {`${t("please_review_and_respond_to_this_request_within")} ${setting?.data?.instructor_response_hours} ${t("hours")}`}
                        </p>
                    </div>

                    {/* Course Card */}
                    <div className="border border-[#E8E8EC] rounded-xl p-3 sm:p-4 space-y-4">

                        <div className="flex justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-base text-[#010211] line-clamp-1">
                                    {refundRequestData?.course?.title}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {t("purchased_on")}: <span className="font-normal text-[#010211] text-[14px]">{formatDateForLessonsOverview(refundRequestData?.student?.enrollment_date)}</span>
                                </p>
                            </div>

                            <span className="font-normal">
                                {getCurrencySymbol()}{refundRequestData?.refund_amount}
                            </span>
                        </div>

                        {/* Student */}
                        <div className="bg-[#F2F5F7] rounded-xl p-3 space-y-3 border border-[#D8E0E6]">
                            <div className="flex sm:items-center gap-3">
                                <CustomImageTag src={refundRequestData?.student?.profile}
                                    alt="student"
                                    className="w-10 h-10 rounded-md bg-gray-300 shrink-0" />
                                <div>
                                    <p className="font-medium text-base text-[#010211]">
                                        {refundRequestData?.student?.name}
                                    </p>

                                    <p className="text-[14px] text-[#010211] break-all">
                                        {t("email")} – <span className="primaryColor">{refundRequestData?.student?.email}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-base font-semibold text-[#010211]">{refundRequestData?.student?.course_progress?.percentage}%</span>
                                    <div>
                                        <span className="font-medium text-base text-[#010211]">{refundRequestData?.student?.course_progress?.completed_chapters}</span>/
                                        <span className="font-normal text-base text-[#010211]">{refundRequestData?.student?.course_progress?.total_chapters} {t("chapter")}</span>
                                    </div>
                                </div>

                                <div className="w-full h-2 bg-[#A5B7C45E] rounded-full">
                                    <div
                                        style={{ width: `${refundRequestData?.student?.course_progress?.percentage}%` }}
                                        className="h-2 bg-[#83B807] rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Refund Reason */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {t("refund_reason")}
                            </p>

                            <div className="border border-[#D8E0E6] rounded-lg p-3 text-sm text-gray-700 shadow-none">
                                {refundRequestData?.reason}
                            </div>
                        </div>

                        {/* Attached Media */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {t("attached_media")}
                            </p>

                            <div className="flex gap-3">
                                {refundRequestData.user_media ? (
                                    renderMedia(refundRequestData.user_media)
                                ) : (
                                    <p className="text-sm text-gray-500">{t("no_media_attached")}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            {t("your_note")}
                        </p>

                        <textarea
                            placeholder={t("write_your_message_here")}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border border-[#E8E8EC] rounded-lg p-3 text-sm outline-none resize-none bg-[#F8F8F9]"
                            rows={2}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-4 pb-6">

                    <button
                        onClick={() => handleResponse("approve")}
                        className={`${loading ? "cursor-not-allowed opacity-50" : ""} commonBtn flex-1 shrink-0`}>
                        {t("approve")}
                    </button>

                    <button
                        onClick={() => handleResponse("reject")}
                        disabled={loading}
                        className={`${loading ? "cursor-not-allowed opacity-50" : ""} flex-1 border primaryBorder primaryColor rounded-[4px] py-2 shrink-0 ${loading ? "cursor-not-allowed" : ""}`}>
                        {t("reject")}
                    </button>

                </div>
            </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={!!previewMedia} onOpenChange={(isOpen) => !isOpen && setPreviewMedia(null)}>
            <DialogContent className="sm:max-w-4xl p-2 sm:p-4 bg-transparent border-none shadow-none flex items-center justify-center [&>.closeBtn]:top-0 [&>.closeBtn]:right-0 [&>.closeBtn]:bg-white/10 hover:[&>.closeBtn]:bg-white/20 [&>.closeBtn]:text-white [&>.closeBtn]:border-white/20 [&>.closeBtn_svg]:w-6 [&>.closeBtn_svg]:h-6">
                <div className="w-full flex items-center justify-center mt-8 relative">
                    {previewMedia?.type === 'image' ? (
                        <img src={previewMedia.url} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                    ) : previewMedia?.type === 'video' ? (
                        <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg shadow-lg" />
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
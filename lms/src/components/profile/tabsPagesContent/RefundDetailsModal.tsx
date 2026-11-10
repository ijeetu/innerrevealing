"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import RefundRequestModal from "./RefundRequestModal";
import { useTranslation } from "@/hooks/useTranslation";
import { OrderCourse } from "@/utils/api/user/getOrders";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { EyeIcon } from "lucide-react";
import { getCurrencySymbol } from "@/utils/helpers";

const statusColor: Record<string, string> = {
    "approved": "bg-[#83B8071F] text-[#83B807]",
    "pending": "bg-[#0186D81F] text-[#0186D8]",
    "rejected": "bg-[#DB3D261F] text-[#DB3D26]",
};

export default function RefundDetailsModal({ order }: { order: OrderCourse[] }) {

    const [openDetails, setOpenDetails] = useState(false);
    const [openRequest, setOpenRequest] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<OrderCourse | null>(null);

    const { t } = useTranslation();

    const isRequestable = (course: OrderCourse) => {
        return course.refund_request_status === "approved" || course.refund_request_status === "pending";
    }

    // Add a new helper to check if button should be disabled
    const isButtonDisabled = (course: OrderCourse) => {
        return isRequestable(course) || course.refund_days_remaining === 0;
    }

    return (
        <>
            <Dialog open={openDetails} onOpenChange={setOpenDetails}>
                {/* OPEN BUTTON */}
                <DialogTrigger className="rounded w-full" onClick={() => setOpenDetails(true)}>
                    <div className="flex items-center gap-1 px-3 py-1.5 justify-center border-0 rounded text-sm bg-[#00000014] text-[#010211]">
                        <EyeIcon className="w-4 h-4" />
                        {t("details")}
                    </div>
                </DialogTrigger>

                {/* MODAL */}
                <DialogContent className="sm:max-w-2xl p-0 rounded-xl overflow-hidden gap-0">
                    {/* HEADER */}
                    <DialogHeader className="flex flex-row justify-between px-6 py-4 border-b border-[#D8E0E6]">
                        <DialogTitle className="text-xl font-semibold">
                            {t("view_details")}
                        </DialogTitle>
                        <DialogClose>
                        </DialogClose>
                    </DialogHeader>

                    {/* COURSE LIST SECTION */}
                    <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">

                        {order.map((course) => (
                            <div key={course.course_id} className="border border-[#D8E0E6] rounded-xl p-3">
                                {/* Top Row */}
                                <div className="max-[450px]:flex-col max-[450px]:gap-1.5 flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <CustomImageTag
                                            src={course.image}
                                            alt={course.title}
                                            className="w-14 h-14 bg-gray-300 rounded-md shrink-0" />

                                        <div className="flex flex-col sm:flex-row items-start gap-2">
                                            <div>
                                                <p className="font-semibold text-gray-900 text-[16px]">
                                                    {course.title}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    {t("by")} <span className="text-[#5A5BB5]">{course.creator_name}</span>
                                                </p>
                                            </div>

                                            {/* Status badge */}
                                            <div>
                                                {course.refund_request_status && (
                                                    <span
                                                        className={`text-xs px-3 py-1 rounded inline-block capitalize ${statusColor[course.refund_request_status]
                                                            }`}
                                                    >
                                                        {course.refund_request_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="font-semibold text-[16px]">{getCurrencySymbol()}{course.final_price}</p>
                                </div>

                                {/* Rejection Note */}
                                {course.refund_request_status === "rejected" && course.refund_admin_notes && (
                                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                                        <p className="font-semibold">{t("rejection_note")}</p>
                                        <p className="text-sm mt-1">{course.refund_admin_notes}</p>
                                    </div>
                                )}

                                {/* Request Refund Button */}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        disabled={isButtonDisabled(course)}
                                        className={`px-2 py-1 rounded ${isButtonDisabled(course)
                                            ? "opacity-50 cursor-not-allowed bg-[#D8E0E6] text-black"
                                            : "cursor-pointer bg-black text-white"
                                            }`}
                                        onClick={() => {
                                            setOpenDetails(false);  // close first modal
                                            setOpenRequest(true);   // open second modal
                                            setSelectedCourse(course);
                                        }}
                                    >
                                        {t("request_refund")}
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                </DialogContent>
            </Dialog>
            {/* REFUND REQUEST MODAL */}
            <RefundRequestModal
                open={openRequest}
                setOpen={setOpenRequest}
                selectedCourse={selectedCourse}
            />
        </>
    );
}

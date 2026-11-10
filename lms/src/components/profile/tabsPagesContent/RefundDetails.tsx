"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { getMyRefund, RefundItem } from "@/utils/api/user/my-purchase/getMyRefund";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import { toast } from "react-hot-toast";
import RefundDetailsSkeleton from "@/components/skeletons/RefundDetailsSkeleton";
import RefundDetailsSkeletonMobile from "@/components/skeletons/RefundDetailsSkeletonMobile";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import DataNotFound from "@/components/commonComp/DataNotFound";


// Status styles for refund status badges
const statusStyles: Record<string, string> = {
    approved: "bg-[#83B8071F] text-[#83B807]",
    rejected: "bg-[#DB3D261F] text-[#DB3D26]",
    pending: "bg-[#0186D81F] text-[#0186D8]",
};

export default function RefundDetails() {

    // UseState for refund details
    const [refundDetails, setRefundDetails] = useState<RefundItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch refund details with pagination support
    const fetchRefundDetails = async (loadMore: boolean = false) => {
        try {
            // Use loadingMore state when loading more, otherwise use loading state
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            // Calculate the page number to fetch
            const pageToFetch = loadMore ? page + 1 : 1;

            // Fetch refund data with pagination parameters
            const response = await getMyRefund({ per_page: 5, page: pageToFetch });

            if (response) {
                if (!response.error) {
                    if (response.data && response.data.data && response.data.data.length > 0) {
                        const data = response.data.data;
                        if (loadMore) {
                            setRefundDetails(prevData => [...prevData, ...data]);
                        } else {
                            setRefundDetails(data);
                        }
                        // Update pagination state
                        const currentPage = response.data.current_page;
                        const lastPage = response.data.last_page;
                        const hasMorePages = currentPage < lastPage;

                        setHasMore(hasMorePages);
                        setPage(pageToFetch);
                    }
                } else {
                    toast.error("Failed to fetch refund details");
                    setRefundDetails([]);
                }
            } else {
                toast.error("Failed to fetch refund details");
                setRefundDetails([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setRefundDetails([]);
        } finally {
            setLoadingMore(false);
            setLoading(false);
        }
    }

    // Handler for load more button click
    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            fetchRefundDetails(true);
        }
    }

    useEffect(() => {
        fetchRefundDetails();
    }, []);


    const { t } = useTranslation();
    return (
        <div className="w-full bg-white">
            {/* Horizontal scroll container */}
            <div className="hidden sm:overflow-x-auto  sm:flex-col sm:gap-4 sm:flex">
                {/* TABLE HEADER */}
                <div className="flex gap-4 bg-[#5A5BB5] text-white font-semibold p-4 rounded w-max">
                    <div className="w-[300px] min-w-[280px] text-[16px]">{t("course_name")}</div>
                    <div className="w-[224px] min-w-[224px] text-[16px]">{t("reject_reason")}</div>
                    <div className="w-[224px] min-w-[224px] text-[16px]">{t("attached_file")}</div>
                    <div className="w-[100px] min-w-[100px] text-[16px]">{t("amount")}</div>
                    <div className="w-[140px] min-w-[140px] text-[16px]">{t("status")}</div>
                </div>

                {/* TABLE ROWS */}
                {loading ? (
                    <>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <RefundDetailsSkeleton key={index} />
                        ))}
                    </>
                ) : refundDetails.length > 0 ? (
                    <>
                        {refundDetails.map((refundCourse) => (
                            <div
                                key={refundCourse.id}
                                className="flex items-center gap-4 bg-[#F7F9FC] py-2 px-4 rounded-lg w-max"
                            >
                                {/* Course Info - matches header width */}
                                <div className="flex gap-3 w-[300px] min-w-[280px]">
                                    <CustomImageTag
                                        src={refundCourse?.course?.thumbnail}
                                        alt={refundCourse?.course?.title}
                                        className="w-12 h-12 rounded flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-[#010211] text-[14px]">{refundCourse?.course?.title}</p>
                                        <p className="text-sm text-[#010211]">
                                            {t("by")} <span className="text-[#5A5BB5]">{refundCourse?.course?.creator_name}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Reject Reason - matches header width */}
                                <div className="text-[#010211] text-sm w-[224px] min-w-[224px]">
                                    {refundCourse?.status === "rejected" && refundCourse?.admin_notes ? (
                                        <div>
                                            {refundCourse?.admin_notes?.substring(0, 35)}...
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <p className="text-[#5A5BB5] cursor-pointer mt-1 underline focus-visible:outline-none">
                                                        {t("View")}
                                                    </p>
                                                </PopoverTrigger>
                                                <PopoverContent className="max-w-xs bg-[#5A5BB5] text-white text-center p-3 text-[14px]">
                                                    {refundCourse?.admin_notes}
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ) : <span>-</span>}
                                </div>

                                {/* Attached File - matches header width */}
                                <div className="text-sm text-[#010211] w-[224px] min-w-[224px] line-clamp-1">
                                    {refundCourse?.user_media_url ? <a href={refundCourse?.user_media_url} target="_blank" rel="noopener noreferrer" className="text-[#5A5BB5] underline cursor-pointer focus-visible:outline-none">{refundCourse?.user_media_url}</a> : "-"}
                                </div>

                                {/* Amount - matches header width */}
                                <div className="font-normal text-[#010211] w-[100px] min-w-[100px]">{getCurrencySymbol()}{refundCourse?.refund_amount}</div>

                                {/* Status - matches header width */}
                                <div className="w-[140px] min-w-[140px]">
                                    <span
                                        className={`px-3 py-1 rounded capitalize ${statusStyles[refundCourse?.status as keyof typeof statusStyles]} text-sm`}
                                    >
                                        {refundCourse?.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="text-center py-8 px-6">
                        <DataNotFound />
                    </div>
                )}

                {loadingMore && (
                    <>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <RefundDetailsSkeleton key={index} />
                        ))}
                    </>
                )}

            </div>

            {/* Mobile View */}
            <div className="sm:hidden flex flex-col gap-4 mt-4">
                {loading ? (
                    <>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <RefundDetailsSkeletonMobile key={index} />
                        ))}
                    </>
                ) : refundDetails.length > 0 ? (
                    <>
                        {refundDetails.map((refundCourse) => (
                            <div
                                key={refundCourse.id}
                                className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E5E9F2] flex flex-col gap-3.5"
                            >
                                {/* Top: Course Thumbnail + Name */}
                                <div className="flex gap-3">
                                    <CustomImageTag
                                        src={refundCourse?.course?.thumbnail}
                                        alt={refundCourse?.course?.title}
                                        className="w-12 h-12 rounded flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <p className="font-medium text-[16px] text-[#010211] max-[375px]:text-[14px]">
                                            {refundCourse?.course?.title}
                                        </p>
                                        <p className="text-sm text-[#010211] max-[375px]:text-[14px]">
                                            {t("by")}{" "}
                                            <span className="text-[#5A5BB5] max-[375px]:text-[14px]">{refundCourse?.course?.creator_name}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-b my-0 border-[#D8E0E6]" />

                                {/* Reject Reason */}
                                <div className="flex justify-between mb-0 items-center">
                                    <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("reject_reason")}:</p>
                                    <div className="text-right text-sm text-[#010211] max-w-[160px]">
                                        {refundCourse?.status === "rejected" && refundCourse?.admin_notes ? (
                                            <>
                                                {refundCourse?.admin_notes?.substring(0, 20)}...
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <p className="text-[#5A5BB5] underline cursor-pointer focus-visible:outline-none max-[375px]:text-[14px]">
                                                            {t("View")}
                                                        </p>
                                                    </PopoverTrigger>

                                                    <PopoverContent
                                                        className="w-[250px] bg-[#5A5BB5] text-white text-sm p-3 rounded-md max-[375px]:text-[14px]"
                                                        align="start"
                                                        side="top"
                                                    >
                                                        {refundCourse?.admin_notes}
                                                    </PopoverContent>
                                                </Popover>
                                            </>
                                        ) : <span>-</span>}
                                    </div>
                                </div>

                                <div className="border-b mb-0 border-[#D8E0E6]" />

                                {/* Attached File */}
                                <div className="flex justify-between mb-0 items-center">
                                    <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("attached_file")}:</p>
                                    <p className="text-sm text-[#010211] max-w-[160px] truncate max-[375px]:text-[14px]">
                                        {refundCourse.user_media_url ? <a href={refundCourse.user_media_url} target="_blank" rel="noopener noreferrer" className="text-[#5A5BB5] underline cursor-pointer focus-visible:outline-none">{refundCourse.user_media_url}</a> : "-"}
                                    </p>
                                </div>

                                <div className="border-b mb-0 border-[#D8E0E6]" />

                                {/* Amount */}
                                <div className="flex justify-between mb-0 items-center">
                                    <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("amount")}:</p>
                                    <p className="text-sm text-[#010211] max-[375px]:text-[14px]">{getCurrencySymbol()}{refundCourse.refund_amount}</p>
                                </div>

                                <div className="border-b mb-0 border-[#D8E0E6]" />

                                {/* Status */}
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("status")}:</p>
                                    <span
                                        className={`px-3 py-1 rounded-lg capitalize ${statusStyles[refundCourse.status as keyof typeof statusStyles]} max-[375px]:text-[14px]`}
                                    >
                                        {refundCourse.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                    </>
                ) : (
                    <div className="text-center py-8 px-6">
                        <DataNotFound />
                    </div>
                )}

                {/* LoadMore Skeleton for the mobile view */}
                {loadingMore && (
                    <>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <RefundDetailsSkeletonMobile key={index} />
                        ))}
                    </>
                )}
            </div>

            {/* LOAD MORE BUTTON */}
            {/* Only show load more button if there are more items to load */}
            {
                hasMore && (
                    <div className="flex justify-center mt-4">
                        <button
                            className="commonBtn w-full sm:w-max disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleLoadMore}
                            disabled={loadingMore || loading}
                        >
                            {loadingMore ? t("loading") || "Loading..." : t("load_more")}
                        </button>
                    </div>
                )
            }
        </div >
    );
}

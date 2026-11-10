"use client";
import React from 'react';
import { Order } from "@/utils/api/user/getOrders";
import { useTranslation } from "@/hooks/useTranslation";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { MdOutlineFileDownload } from "react-icons/md";
import { getCurrencySymbol } from "@/utils/helpers";
import RefundDetailsModal from './RefundDetailsModal';
import OrderSkeleton from '@/components/skeletons/OrderSkeleton';

// Props interface for Purchases component
interface PurchasesProps {
    orders: Order[];
    visibleOrders: Order[];
    hasMoreTransactions: boolean;
    expandedOrders: Set<number>;
    downloadingInvoices: Set<number>;
    toggleExpanded: (orderId: number) => void;
    handleLoadMore: () => void;
    handleDownloadInvoice: (orderId: number, orderNumber: string) => Promise<void>;
    formatDate: (dateString?: string) => string;
    loading: boolean;
}

const Purchases: React.FC<PurchasesProps> = ({
    orders,
    visibleOrders,
    hasMoreTransactions,
    expandedOrders,
    downloadingInvoices,
    toggleExpanded,
    handleLoadMore,
    handleDownloadInvoice,
    formatDate,
    loading,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="hidden sm:block overflow-x-auto">
                {/* Table Header - background: #5A5BB5, border-radius: 4px */}
                <div
                    className="min-w-[900px]"
                    style={{
                        height: "51px",
                        padding: "0px 16px",
                        background: "#5A5BB5",
                        borderRadius: "4px",
                        display: "grid",
                        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                        gap: "2rem",
                        alignItems: "center",
                    }}
                >
                    <div className="text-white font-bold text-[16px]">{t("course_name")}</div>
                    <div className="text-white font-bold text-[16px]">{t("order_id")}</div>
                    <div className="text-white font-bold text-[16px]">{t("purchase_date")}</div>
                    <div className="text-white font-bold text-[16px]">{t("amount")}</div>
                    <div className="text-white font-bold text-[16px]">{t("payment_mode")}</div>
                    <div className="text-white font-bold text-[16px]">{t("status")}</div>
                    <div className="text-white font-bold text-[16px] col-span-2">{t("action")}</div>
                </div>

                {/* Transaction History Rows */}
                {loading ? (
                    <>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <OrderSkeleton key={index} />
                        ))}
                    </>
                ) : (
                    <>
                        {orders.length > 0 ? (
                            <div className="space-y-4 mt-4">
                                {visibleOrders.map((order) => {
                                    const isExpanded = expandedOrders.has(order.order_id);
                                    const isMultipleCourses = order.courses.length > 1;

                                    return (
                                        <div key={order.order_id} className="space-y-1">
                                            {/* Main Transaction Row */}
                                            <div
                                                className="min-w-[900px]"
                                                style={{
                                                    height: "42px",
                                                    padding: "0px 16px",
                                                    borderRadius: "4px",
                                                    background: "#F2F5F7",
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                                                    gap: "2rem",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {/* Course Name */}
                                                <div className="text-sm text-gray-900 font-medium truncate">
                                                    {isMultipleCourses ? (
                                                        <div className="flex flex-col">
                                                            <span className="truncate">
                                                                {order.courses.length} {t("items_purchased")}
                                                            </span>
                                                            <span
                                                                className="text-[#5A5BB5] text-xs underline cursor-pointer hover:text-[#4a4b9f]"
                                                                onClick={() =>
                                                                    toggleExpanded(order.order_id)
                                                                }
                                                            >
                                                                {t("view_details")}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="truncate">
                                                            {order.courses.length > 0
                                                                ? order.courses[0].title
                                                                : t("no_courses_found")}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Transaction ID */}
                                                <div className="text-sm text-gray-700 font-mono break-all">
                                                    {order.order_number}
                                                </div>

                                                {/* Purchase Date - using transaction_date from API */}
                                                <div className="text-sm text-gray-700">
                                                    {formatDate(order.transaction_date)}
                                                </div>

                                                {/* Amount */}
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {getCurrencySymbol()}{order.final_total.toFixed(2)}
                                                </div>

                                                {/* Payment Mode */}
                                                <div className="text-sm text-gray-700">
                                                    {order.payment_method || 'N/A'}
                                                </div>

                                                {/* Status */}
                                                <div>
                                                    <span
                                                        className={`inline-block px-3 py-1 text-xs font-medium rounded-sm text-center ${order.status.toLowerCase() === "completed"
                                                            ? "bg-[#83B8071F] text-[#83B807]"
                                                            : order.status.toLowerCase() ===
                                                                "pending"
                                                                ? "bg-[#0186D81F] text-[#0186D8]"
                                                                : order.status.toLowerCase() ===
                                                                    "cancelled" ||
                                                                    order.status.toLowerCase() ===
                                                                    "failed"
                                                                    ? "bg-[#DB3D261F] text-[#DB3D26]"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {order.status.charAt(0).toUpperCase() +
                                                            order.status.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Action */}
                                                <div className="flex gap-2 col-span-2">
                                                    <button
                                                        className={`flex items-center justify-center gap-2 px-3 py-1 border-1 w-full border-black rounded text-sm transition-colors ${downloadingInvoices.has(order.order_id)
                                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                            : order.status.toLowerCase() === 'completed'
                                                                ? 'text-gray-700 hover:bg-gray-50'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-400'
                                                            }`}
                                                        onClick={() => order.status.toLowerCase() === 'completed' && handleDownloadInvoice(order.order_id, order.order_number)}
                                                        disabled={downloadingInvoices.has(order.order_id) || order.status.toLowerCase() !== 'completed'}
                                                        title={order.status.toLowerCase() === 'completed' ? 'Download invoice' : 'Invoice available only for completed orders'}
                                                    >
                                                        <MdOutlineFileDownload
                                                            className={downloadingInvoices.has(order.order_id) ? 'animate-pulse' : ''}
                                                        />
                                                        <span className={`text-sm whitespace-nowrap ${downloadingInvoices.has(order.order_id)
                                                            ? 'text-gray-500'
                                                            : order.status.toLowerCase() === 'completed'
                                                                ? 'text-black'
                                                                : 'text-gray-400'
                                                            }`}>
                                                            {downloadingInvoices.has(order.order_id) ? (
                                                                <span className="flex items-center gap-0.5">
                                                                    <span>{t("downloading")}</span>
                                                                    <span className="flex">
                                                                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                                                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                                                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                                                                    </span>
                                                                </span>
                                                            ) : (
                                                                t("invoice")
                                                            )}
                                                        </span>
                                                    </button>
                                                    {/* Details Button */}

                                                    {order.status === "completed" && order.payment_method !== "free" ? (
                                                        <RefundDetailsModal
                                                            order={order.courses}

                                                        />
                                                    ) : <span className='w-full text-center'>-</span>}
                                                </div>
                                            </div>

                                            {/* Expanded Course Details */}
                                            {isMultipleCourses && isExpanded && (
                                                <div className="space-y-1">
                                                    {order.courses.map((course, index) => (
                                                        <div
                                                            key={index}
                                                            className="min-w-[900px] "
                                                            style={{
                                                                height: "42px",
                                                                padding: "0px 16px",
                                                                background: "#F2F5F7",
                                                                borderRadius: "4px",
                                                                display: "grid",
                                                                gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                                                                gap: "2rem",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            {/* Course Name */}
                                                            <div className="text-sm text-gray-900 font-medium truncate">
                                                                {course.title}
                                                            </div>

                                                            {/* Empty Transaction ID */}
                                                            <div className="text-sm text-gray-400">
                                                                -
                                                            </div>

                                                            {/* Empty Date */}
                                                            <div className="text-sm text-gray-400">
                                                                -
                                                            </div>

                                                            {/* Course Price */}
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {getCurrencySymbol()}{course.final_price.toFixed(2)}
                                                            </div>

                                                            {/* Empty Payment Mode */}
                                                            <div className="text-sm text-gray-400">
                                                                -
                                                            </div>

                                                            {/* Empty Status */}
                                                            <div className="text-sm text-gray-400">
                                                                -
                                                            </div>

                                                            {/* Empty Action */}
                                                            <div className="text-sm text-gray-400">
                                                                -
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-6">
                                <DataNotFound />
                            </div>
                        )}
                    </>
                )}

                {/* Load More Button */}
                {hasMoreTransactions && !loading && (
                    <div className="flex justify-center mt-6">
                        <button
                            className="px-8 py-2 bg-[#5A5BB5] text-white rounded hover:bg-[#4a4b9f] transition-colors"
                            onClick={handleLoadMore}
                        >
                            {t("load_more")}
                        </button>
                    </div>
                )}
            </div >

            {/* Mobile View */}
            <div className="sm:hidden flex flex-col gap-4 mt-4" >
                {
                    visibleOrders.map((order) => {
                        const isMultipleCourses = order.courses.length > 1;
                        const isExpanded = expandedOrders.has(order.order_id);

                        return (
                            <div key={order.order_id}>
                                {loading ? (
                                    <>
                                        {Array.from({ length: 10 }).map((_, index) => (
                                            <OrderSkeleton key={index} />
                                        ))}
                                    </>
                                ) : (
                                    <div
                                        // key={order.order_id}
                                        className="bg-[#F2F5F7] p-3 sm:p-4 rounded-2xl border border-[#E5E9F2] flex flex-col gap-3.5"
                                    >
                                        {/* Course Name + Thumbnail */}
                                        <div className="flex gap-3">
                                            {/* <div className="w-14 h-14 bg-gray-300 rounded" /> */}
                                            <div className="flex flex-col w-full">
                                                <div className='flex justify-between items-center gap-2 w-full'>
                                                    <p className='font-semibold text-[#010211] max-[375px]:text-[14px]'>{t("course_name")}</p>
                                                    <p className="text-sm text-[#010211] max-[375px]:text-[14px] text-end">
                                                        {isMultipleCourses
                                                            ? `${order.courses.length} ${t("items_purchased")}`
                                                            : order.courses[0]?.title}
                                                    </p>
                                                </div>

                                                {/* View Details */}
                                                {isMultipleCourses && (
                                                    <p
                                                        className="text-[#5A5BB5] text-sm underline cursor-pointer"
                                                        onClick={() => toggleExpanded(order.order_id)}
                                                    >
                                                        {t("view_details")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-b border-[#D8E0E6]" />

                                        {/* Transaction ID */}
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("transaction_id")}:</p>
                                            <p className="text-sm text-[#010211] max-[375px]:text-[14px] text-end">{order.order_number}</p>
                                        </div>

                                        <div className="border-b border-[#D8E0E6]" />

                                        {/* Purchase Date */}
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("purchase_date")}:</p>
                                            <p className="text-sm text-[#010211] max-[375px]:text-[14px]">
                                                {formatDate(order.transaction_date)}
                                            </p>
                                        </div>

                                        <div className="border-b border-[#D8E0E6]" />

                                        {/* Amount */}
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("amount")}:</p>
                                            <p className="text-sm text-[#010211] max-[375px]:text-[14px]">
                                                {getCurrencySymbol()}
                                                {order.final_total.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="border-b border-[#D8E0E6]" />

                                        {/* Payment Mode */}
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("payment_mode")}:</p>
                                            <p className="text-sm text-[#010211] max-[375px]:text-[14px]">
                                                {order.payment_method || "N/A"}
                                            </p>
                                        </div>

                                        <div className="border-b border-[#D8E0E6]" />

                                        {/* Status */}
                                        <div className="flex justify-between items-center max-[375px]:text-[14px]">
                                            <p className="font-semibold text-[#010211] max-[375px]:text-[14px]">{t("status")}:</p>

                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs ${order.status.toLowerCase() === "completed"
                                                    ? "bg-[#83B8071F] text-[#83B807]"
                                                    : order.status.toLowerCase() === "pending"
                                                        ? "bg-[#0186D81F] text-[#0186D8]"
                                                        : ["failed", "cancelled"].includes(order.status.toLowerCase())
                                                            ? "bg-[#DB3D261F] text-[#DB3D26]"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="border-b border-[#D8E0E6]" />

                                        {/* Download Invoice */}
                                        <div className="flex justify-between items-center gap-2">
                                            {/* <p className="font-semibold text-[#010211]">{t("invoice")}:</p> */}

                                            <button
                                                className={`flex items-center gap-1 px-3 py-1 rounded border w-full justify-center text-sm ${downloadingInvoices.has(order.order_id)
                                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    : order.status.toLowerCase() === "completed"
                                                        ? "text-[#010211] border-black"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    }`}
                                                disabled={
                                                    downloadingInvoices.has(order.order_id) ||
                                                    order.status.toLowerCase() !== "completed"
                                                }
                                                onClick={() =>
                                                    handleDownloadInvoice(order.order_id, order.order_number)
                                                }
                                            >
                                                <MdOutlineFileDownload
                                                    className={downloadingInvoices.has(order.order_id) ? "animate-pulse" : ""}
                                                />
                                                {downloadingInvoices.has(order.order_id)
                                                    ? <span className="flex items-center gap-0.5">
                                                        <span>{t("downloading")}</span>
                                                        <span className="flex">
                                                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                                            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                                            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                                                        </span>
                                                    </span>
                                                    : t("invoice")}
                                            </button>
                                            {order.status === "completed" && order.payment_method !== "free" ? (
                                                <RefundDetailsModal order={order.courses} />
                                            ) : <span className='w-full text-right'>-</span>}
                                        </div>

                                        {/* Expanded course list (mobile) */}
                                        {isMultipleCourses && isExpanded && (
                                            <div className="mt-3 bg-white p-3 rounded-xl border border-[#E5E9F2] flex flex-col gap-2">
                                                {order.courses.map((course, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="font-medium text-[#010211]">{course.title}</span>
                                                        <span>{getCurrencySymbol()}{course.final_price.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                {hasMoreTransactions && !loading && (
                    <div className="flex justify-center mt-2">
                        <button
                            className="px-8 py-2 bg-[#5A5BB5] text-white rounded hover:bg-[#4a4b9f] transition-colors"
                            onClick={handleLoadMore}
                        >
                            {t("load_more")}
                        </button>
                    </div>
                )}
            </div >

        </>
    );
}

export default Purchases;
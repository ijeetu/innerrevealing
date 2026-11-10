import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import { useTranslation } from "@/hooks/useTranslation";
import { useParams } from "next/navigation";
import { getCourseRevenueDetails, CourseRevenueDetailItem } from "@/utils/api/instructor/courses-revenue/getCourseRevenueDetails";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import { toast } from "react-hot-toast";
import DataNotFound from "@/components/commonComp/DataNotFound";
import RevenueTableSkeleton from "@/components/skeletons/instrutor/RevenueTableSkeleton";
import RevenueMobileSkeleton from "@/components/skeletons/instrutor/RevenueMobileSkeleton";

export default function SingleCourseRevenueTable() {
    const { slug } = useParams<{ slug: string }>();
    const { t } = useTranslation();
    const [revenueData, setRevenueData] = useState<CourseRevenueDetailItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [transactionFilter, setTransactionFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [totalItems, setTotalItems] = useState(0);

    const fetchCourseRevenueDetails = async (page: number, rows: number) => {
        if (!slug) return;
        try {
            setLoading(true);
            const response = await getCourseRevenueDetails({
                course_slug: slug,
                page,
                per_page: rows,
                transaction_type: transactionFilter === "all" ? undefined : transactionFilter,
                status: statusFilter === "all" ? undefined : statusFilter,
            });
            if (response) {
                if (!response.error) {
                    setRevenueData(response.data.data || []);
                    setTotalItems(response.data.total || 0);
                    if (response.data.current_page) {
                        setCurrentPage(response.data.current_page);
                    }
                } else {
                    toast.error(response.message || "Failed to fetch revenue details");
                    setRevenueData([]);
                }
            }
        } catch (error) {
            extractErrorMessage(error);
            setRevenueData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseRevenueDetails(currentPage, rowsPerPage);
    }, [currentPage, rowsPerPage, transactionFilter, statusFilter, slug]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(parseInt(value, 10));
        setCurrentPage(1);
    };

    const handleTransactionChange = (value: string) => {
        setTransactionFilter(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Received":
            case "Approved":
                return "bg-[#F1F8E9] text-[#7CB342]";
            case "Refunded":
                return "bg-[#FFEBEE] text-[#EF5350]";
            case "Pending":
                return "bg-[#E3F2FD] text-[#42A5F5]";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <Card className="bg-white rounded-2xl shadow-sm border border-red-500">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap md:gap-4 gap-2 pb-4 border-b border-[#E8E8EC] md:border-none p-4 md:p-6">
                <h2 className="text-lg font-semibold text-[#010211]">{t("course_revenue")}</h2>
                <div className="flex-wrap max-[768px]:w-full flex max-[530px]:flex-col md:flex md:flex-row items-center gap-4">
                    <Select value={transactionFilter} onValueChange={handleTransactionChange}>
                        <SelectTrigger className="flex flex-1 md:w-[220px] bg-[#F8F9FA] border-gray-100 text-[#010211] h-9">
                            <SelectValue placeholder={t("all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("all")}</SelectItem>
                            <SelectItem value="purchased">{t("purchased")}</SelectItem>
                            <SelectItem value="refund">{t("refund")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="flex flex-1 md:w-[220px] bg-[#F8F9FA] border-gray-100 text-[#010211] h-9">
                            <SelectValue placeholder={t("status")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("status")}</SelectItem>
                            <SelectItem value="Received">{t("received")}</SelectItem>
                            <SelectItem value="Refunded">{t("refunded")}</SelectItem>
                            <SelectItem value="Pending">{t("pending")}</SelectItem>
                            <SelectItem value="Approved">{t("approved")}</SelectItem>
                            <SelectItem value="Rejected">{t("rejected")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader className="sectionBg border-y border-gray-100">
                            <TableRow>
                                <TableHead className="w-[50px] font-semibold text-[#010211] text-base text-start">{t("#")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-start">{t("student_name")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-start">{t("enrollment_date")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-start">{t("transaction_type")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-start">{t("amount")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-start">{t("status")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <RevenueTableSkeleton rows={5} />
                            ) : revenueData.length > 0 ? (
                                revenueData.map((item) => (
                                    <TableRow key={item.row_number} className="hover:bg-gray-50/50">
                                        <TableCell className="text-[#010211] border-b border-[#E8E8EC] text-base font-normal py-4 text-start">
                                            {item.row_number}
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] py-4 text-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden shrink-0">
                                                    <CustomImageTag
                                                        src={item.student_profile}
                                                        alt={item.student_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[#010211] text-base text-start">
                                                        {item.student_name}
                                                    </span>
                                                    <p className="text-sm text-[#010211] text-start">
                                                        {t('email')} - <span className="text-sm primaryColor font-medium">{item.student_email}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[#010211] border-b border-[#E8E8EC] text-base font-normal py-4 text-start">
                                            {item.formatted_enrollment_date}
                                        </TableCell>
                                        <TableCell className="text-[#010211] border-b border-[#E8E8EC] text-base font-normal py-4 text-start">
                                            {item.transaction_type}
                                        </TableCell>
                                        <TableCell className="font-bold text-[#010211] border-b border-[#E8E8EC] text-base py-4 text-start">
                                            {getCurrencySymbol()}{item.amount}
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] py-4 text-start">
                                            <span className={`px-3 py-1 rounded-md text-sm font-normal ${getStatusStyles(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <DataNotFound />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    {loading ? (
                        <RevenueMobileSkeleton rows={3} />
                    ) : revenueData.length > 0 ? (
                        revenueData.map((item) => (
                            <div key={item.row_number} className="p-4 border-b border-[#E8E8EC] space-y-2 mb-4">
                                <div className="flex items-center justify-between border-b border-[#E8E8EC] pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{item.row_number}</span>
                                        <div className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden">
                                            <CustomImageTag
                                                src={item.student_profile}
                                                alt={item.student_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-[#010211] text-base truncate">{item.student_name}</span>
                                            <span className="text-[13px] text-[#71717A] truncate">{item.student_email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("enrollment_date")}:</span>
                                        <span className="text-base font-normal text-[#010211] text-end">{item.formatted_enrollment_date}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("transaction_type")}:</span>
                                        <span className="text-base font-normal text-[#010211]">{item.transaction_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("amount")}:</span>
                                        <span className="text-base font-normal text-[#010211]">{getCurrencySymbol()}{item.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-[#010211]">{t("status")}:</span>
                                        <span className={`px-2 py-1 rounded text-sm font-normal max-[400px]:ml-auto ${getStatusStyles(item.status)}`}>{item.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center">
                            <DataNotFound />
                        </div>
                    )}
                </div>
            </CardContent>
            {totalItems > 0 && (
                <CardFooter className="pt-6">
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalItems / rowsPerPage)}
                        rowsPerPage={rowsPerPage}
                        totalItems={totalItems}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        showResultText={true}
                    />
                </CardFooter>
            )}
        </Card>
    );
}
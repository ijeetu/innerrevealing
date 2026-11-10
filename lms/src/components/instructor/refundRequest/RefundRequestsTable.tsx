"use client";
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
import { Badge } from "@/components/ui/badge";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import CircularProgress from "@/components/ui/circular-progress";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import { useTranslation } from "@/hooks/useTranslation";
import ViewRequestModal from "./ViewRequestModal";
import { getRefundRequests, RefundRequestData } from "@/utils/api/instructor/refund-request/getRefundRequest";
import { extractErrorMessage, formatDateForLessonsOverview } from "@/utils/helpers";
import { toast } from "react-hot-toast";
import DataNotFound from "@/components/commonComp/DataNotFound";
import RefundTableSkeleton from "@/components/skeletons/instrutor/RefundTableSkeleton";
import RefundMobileSkeleton from "@/components/skeletons/instrutor/RefundMobileSkeleton";


export default function RefundRequestsTable() {
    const { t } = useTranslation();
    const [refundRequests, setRefundRequests] = useState<RefundRequestData[]>([]);
    const [allCourses, setAllCourses] = useState<RefundRequestData["course"][]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState<string>("all");
    const [hasMore, setHasMore] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    const fetchRefundRequests = async (page: number, rows: number, loadMore: boolean = false) => {
        try {
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const status = statusFilter === 'all' ? undefined : statusFilter as "pending" | "approved" | "rejected";
            const course_id = courseFilter === 'all' ? undefined : courseFilter;
            const response = await getRefundRequests({ page: page, per_page: rows, status, course_id });

            if (response) {
                if (!response.error) {
                    if (response.data && response.data.data) {
                        const data = response.data.data;

                        // Extract and store unique courses for the filter dropdown
                        setAllCourses((prev) => {
                            const newCourses = data.map((r) => r.course);
                            const combined = [...prev, ...newCourses];
                            return Array.from(new Map(combined.map((c) => [c.id, c])).values());
                        });

                        if (loadMore) {
                            setRefundRequests(prevData => [...prevData, ...data]);
                        } else {
                            setRefundRequests(data);
                        }

                        // const currentPageNum = response.data.current_page;
                        const lastPageNum = response.data.last_page;
                        const hasMorePages = response.data.current_page < lastPageNum;

                        setHasMore(hasMorePages);
                        setTotalItems(response.data.total);
                        // Ensure current page is updated if API returns it
                        if (!loadMore) {
                            setCurrentPage(response.data.current_page);
                        }
                    } else {
                        if (!loadMore) setRefundRequests([]);
                        setHasMore(false);
                    }
                } else {
                    toast.error(response.message || "Failed to fetch refund requests");
                    if (!loadMore) setRefundRequests([]);
                    setHasMore(false);
                }
            } else {
                toast.error("Failed to fetch refund requests");
                if (!loadMore) setRefundRequests([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            if (!loadMore) setRefundRequests([]);
        } finally {
            setLoadingMore(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefundRequests(currentPage, rowsPerPage, false);
    }, [rowsPerPage, statusFilter, courseFilter]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchRefundRequests(page, rowsPerPage, false);
    };

    const handleRowsPerPageChange = (value: string) => {
        const newRows = parseInt(value, 10);
        setRowsPerPage(newRows);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case "approved":
                return (
                    <Badge className="bg-[#83B8071F] text-[#83B807] text-sm border-none px-3 py-1 font-normal rounded-sm">
                        {t("approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-[#DB3D261F] text-[#DB3D26] text-sm border-none px-3 py-1 font-normal rounded-sm">
                        {t("rejected")}
                    </Badge>
                );
            case "pending":
            default:
                return (
                    <Badge className="bg-[#DB93051F] text-[#DB9305] text-sm border-none px-3 py-1 font-normal rounded-sm">
                        {t("pending")}
                    </Badge>
                );
        }
    };

    return (
        <Card className="bg-white rounded-2xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap md:gap-4 gap-2 pb-4 border-b border-[#E8E8EC] md:border-none p-4 md:p-6">
                <h2 className="text-lg font-semibold text-[#010211]">{t("refund_requests_list")}</h2>
                <div className="flex-wrap max-[768px]:w-full flex max-[450px]:flex-col md:flex md:flex-row items-center gap-3 ">
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger className="flex-1 md:w-[180px] bg-[#F8F9FA] border-gray-200">
                            <SelectValue placeholder={t("all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("all")}</SelectItem>
                            {allCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="flex-1 md:w-[120px] bg-[#F8F9FA] border-gray-200">
                            <SelectValue placeholder={t("all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("all")}</SelectItem>
                            <SelectItem value="pending">{t("pending")}</SelectItem>
                            <SelectItem value="approved">{t("approved")}</SelectItem>
                            <SelectItem value="rejected">{t("rejected")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#F2F5F7] border-y border-gray-100">
                            <TableRow>
                                <TableHead className="w-[60px] font-semibold text-[#010211] text-center whitespace-nowrap">#</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base whitespace-nowrap text-start">{t("students_name")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base whitespace-nowrap text-start">{t("course")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base whitespace-nowrap text-start">{t("enrollment_date")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base whitespace-nowrap text-start">{t("student_progress")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base whitespace-nowrap text-start">{t("status")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-center text-base w-[120px] whitespace-nowrap">{t("action")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <RefundTableSkeleton rows={4} />
                            ) : refundRequests.length > 0 ? (
                                refundRequests.map((refundRequestData, index) => (
                                    <TableRow key={refundRequestData.id} className="hover:bg-gray-50/50">
                                        <TableCell className="w-[60px] text-[#010211] border-b border-[#E8E8EC] text-center">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                                        <TableCell className="border-b border-[#E8E8EC]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden shrink-0">
                                                    <CustomImageTag
                                                        src={refundRequestData.student.profile}
                                                        alt={refundRequestData.student.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[#010211] text-base truncate max-w-[150px]" title={refundRequestData.student.name}>{refundRequestData.student.name}</span>
                                                    <p className="text-[14px] text-[#010211]">{t("email")} - <span className="primaryColor text-[14px]">{refundRequestData.student.email}</span></p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC]">
                                            <p className="text-base text-[#010211] max-w-[300px] line-clamp-2 font-normal" title={refundRequestData.course.title}>
                                                {refundRequestData.course.title}
                                            </p>
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] text-base text-[#010211]">
                                            {formatDateForLessonsOverview(refundRequestData.student.enrollment_date)}
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC]">
                                            <div className="flex items-center w-12 h-12">
                                                <CircularProgress
                                                    value={refundRequestData.student.course_progress.percentage}
                                                    size={60}
                                                    strokeWidth={5}
                                                    textClassName="text-[8px] font-bold"
                                                    progressColor="#83B807"
                                                    noCompletedText={true}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC]">{getStatusBadge(refundRequestData.status)}</TableCell>
                                        <TableCell className="w-[120px] border-b border-[#E8E8EC] p-4 text-center">
                                            <ViewRequestModal
                                                refundRequestData={refundRequestData}
                                                onSuccess={() => fetchRefundRequests(currentPage, rowsPerPage)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
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
                        <RefundMobileSkeleton rows={4} />
                    ) : refundRequests.length > 0 ? (
                        refundRequests.map((refundRequestData, index) => (
                            <div key={refundRequestData.id} className="p-4 border-b border-[#E8E8EC] space-y-4">
                                <div className="flex items-start justify-between">
                                    <span className="font-semibold text-gray-900">{(currentPage - 1) * rowsPerPage + index + 1}</span>
                                </div>

                                <div className="flex items-center gap-3 border-b border-[#E8E8EC] pb-4">
                                    <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                                        <CustomImageTag
                                            src={refundRequestData.student.profile || "/assets/images/placeholder-avatar.png"}
                                            alt={refundRequestData.student.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-[#010211] text-base truncate">{refundRequestData.student.name}</span>
                                        <span className="text-[14px] text-[#010211] truncate">{t("email")} - <span className="primaryColor text-[14px] font-medium">{refundRequestData.student.email}</span></span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("course")}:</span>
                                        <span className="text-base text-[#010211] text-right max-w-[60%] line-clamp-2 font-normal">{refundRequestData.course.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("enrollment_date")}:</span>
                                        <span className="text-base text-[#010211] font-normal text-end">{formatDateForLessonsOverview(refundRequestData.student.enrollment_date)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("student_progress")}:</span>
                                        <div className="w-10 h-10">
                                            <CircularProgress
                                                value={refundRequestData.student.course_progress.percentage}
                                                size={40}
                                                strokeWidth={4}
                                                textClassName="text-[12px] font-bold"
                                                progressColor="#83B807"
                                                noCompletedText={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4">
                                        <span className="text-base font-semibold text-[#010211]">{t("status")}:</span>
                                        {getStatusBadge(refundRequestData.status)}
                                    </div>
                                    <div className="">
                                        <ViewRequestModal
                                            refundRequestData={refundRequestData}
                                            onSuccess={() => fetchRefundRequests(currentPage, rowsPerPage)}
                                        />
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
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import { useTranslation } from "@/hooks/useTranslation";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { getCourseRevenue, CourseRevenueItem, CourseRevenueFilterCategory } from "@/utils/api/instructor/courses-revenue/getCourseRevenue";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import { toast } from "react-hot-toast";
import DataNotFound from "@/components/commonComp/DataNotFound";
import RevenueTableSkeleton from "@/components/skeletons/instrutor/RevenueTableSkeleton";
import RevenueMobileSkeleton from "@/components/skeletons/instrutor/RevenueMobileSkeleton";

export default function CourseRevenueTable() {
    const { t } = useTranslation();
    const [revenueData, setRevenueData] = useState<CourseRevenueItem[]>([]);
    const [categories, setCategories] = useState<CourseRevenueFilterCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCourseRevenue = async (page: number, rows: number) => {
        try {
            setLoading(true);
            const category_id = categoryFilter === "all" ? undefined : categoryFilter;
            const response = await getCourseRevenue({
                page,
                per_page: rows,
                search: debouncedSearchQuery || undefined,
                category_id: category_id,
            });

            if (response) {
                if (!response.error) {
                    setRevenueData(response.data.data || []);
                    setTotalItems(response.data.total || 0);
                    setCategories(response.categories || []);
                    if (response.data.current_page) {
                        setCurrentPage(response.data.current_page);
                    }
                } else {
                    toast.error(response.message || "Failed to fetch course revenue");
                    setRevenueData([]);
                }
            } else {
                toast.error("Failed to fetch course revenue data");
                setRevenueData([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setRevenueData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseRevenue(currentPage, rowsPerPage);
    }, [currentPage, rowsPerPage, categoryFilter, debouncedSearchQuery]);

    // Added separate handleSearch for search button and Enter key
    const handleSearch = () => {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(parseInt(value, 10));
        setCurrentPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        setCurrentPage(1);
    };

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    return (
        <Card className="bg-white rounded-2xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap md:gap-4 gap-2 pb-4 border-b border-[#E8E8EC] md:border-none p-4 md:p-6">
                <h2 className="text-base font-semibold text-[#010211]">{t("course_revenue")}</h2>
                <div className="flex-wrap max-[768px]:w-full flex max-[530px]:flex-col md:flex md:flex-row items-center gap-4">
                    <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="flex-1 md:max-w-[150px] bg-[#F8F9FA] border-gray-200 text-[#71717A] overflow-hidden">
                            <div className="truncate w-full text-left">
                                <SelectValue placeholder={t("filter_by_category")} />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-32px)] w-full">
                            <SelectItem value="all">
                                <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
                                    {t("all_categories")}
                                </div>
                            </SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()} title={cat.name}>
                                    <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
                                        {cat.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-1 md:max-w-[454px] items-center gap-0 w-full">
                        <Input
                            placeholder={t("search_for_course")}
                            className="bg-[#F8F9FA] border-gray-200 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                            className="bg-[#010211] hover:bg-[#010211]/90 rounded-l-none px-4 gap-1"
                            onClick={handleSearch}
                        >
                            <span className="mr-1 hidden sm:inline">{t("search")}</span>
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader className="sectionBg border-y border-gray-100">
                            <TableRow>
                                <TableHead className="w-[50px] font-semibold text-[#010211] text-start">#</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-start">{t("course")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-center">{t("enrolled_students")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-base text-center">{t("pending_amount")}</TableHead>
                                <TableHead className="font-semibold text-[#010211] text-center text-base">{t("action")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <RevenueTableSkeleton rows={5} />
                            ) : revenueData.length > 0 ? (
                                revenueData.map((course, index) => (
                                    <TableRow key={course.course_id} className="hover:bg-gray-50/50">
                                        <TableCell className="text-[#010211] border-b border-[#E8E8EC] text-base font-normal text-start">
                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] text-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[80px] h-[45px] rounded bg-gray-200 overflow-hidden shrink-0">
                                                    <CustomImageTag
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[#010211] text-base line-clamp-1" title={course.title}>
                                                        {course.title}
                                                    </span>
                                                    <p className="text-[13px] text-[#71717A]">
                                                        {t("category")} - <span className="primaryColor">{course?.category?.name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-semibold text-[#010211] text-base text-start">{course.enrolled_students}</span>
                                                <span className="text-[12px] text-[#71717A]">{t("total_enrollment")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] text-center font-semibold text-[#010211] text-base">
                                            {getCurrencySymbol()}{course.pending_amount}
                                        </TableCell>
                                        <TableCell className="border-b border-[#E8E8EC] text-center">
                                            <Link href={`/instructor/earnings/${course.slug}?from=revenue-table`} className="pl-2">
                                                <button className="w-[38px] h-[38px] shrink-0 primaryBg p-2 rounded-[4px]">
                                                    <Eye className="w-5 h-5 text-white" />
                                                </button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
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
                        revenueData.map((course, index) => (
                            <div key={course.course_id} className="p-4 border-b border-[#E8E8EC] space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">{(currentPage - 1) * rowsPerPage + index + 1}</span>
                                    <Link href={`/instructor/earnings/${course.slug}?from=revenue-table`}>
                                        <button className="w-[30px] h-[30px] shrink-0 flexCenter primaryBg p-2 rounded-[4px]">
                                            <Eye className="w-[18px] h-[18px] shrink-0 text-white" />
                                        </button>
                                    </Link>
                                </div>

                                <div className="flex md:items-center gap-3 border-b border-[#E8E8EC] pb-4">
                                    <div className="w-[100px] h-[60px] rounded bg-gray-200 overflow-hidden shrink-0">
                                        <CustomImageTag
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-[#010211] text-base line-clamp-2">{course.title}</span>
                                        <span className="text-[13px] text-[#71717A]">
                                            {t("category")} - <span className="primaryColor font-medium">{course?.category?.name}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-4 border-b border-[#E8E8EC]">
                                        <span className="text-base font-semibold text-[#010211]">{t("enrolled_students")}:</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-base font-semibold text-[#010211]">{course.enrolled_students}</span>
                                            <span className="text-[12px] text-[#71717A]">{t("total_enrollment")}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4">
                                        <span className="text-base font-semibold text-[#010211]">{t("pending_amount")}:</span>
                                        <span className="text-base font-semibold text-[#010211]">{getCurrencySymbol()}{course.pending_amount}</span>
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
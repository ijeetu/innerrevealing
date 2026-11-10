"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BiDotsVerticalRounded } from "react-icons/bi";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import { getPromoCodes, PromoCode } from "@/utils/api/instructor/coupon/getCoupons";
import { deleteCoupon } from "@/utils/api/instructor/coupon/deleteCoupon";
import toast from "react-hot-toast";
import Link from "next/link";
import TableCellSkeleton from "@/components/skeletons/instrutor/TableCellSkeleton";
import { extractErrorMessage, formatDate } from "@/utils/helpers";
import { useTranslation } from "@/hooks/useTranslation";
import DataNotFound from "@/components/commonComp/DataNotFound";
import ViewAllCourses from "../addTeamMember/ViewAllCourses";

const AllCoupons: React.FC = () => {

  const { t } = useTranslation();

  // Local state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch promo codes from API
  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);

      const response = await getPromoCodes({
        page: currentPage,
        per_page: rowsPerPage
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            setPromoCodes(response.data.data);
          }
          // Set pagination data directly from response
          if (response.data) {
            setTotalItems(response.data.total);
            setTotalPages(response.data.last_page);
          } else {
            setTotalItems(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch promo codes");
          setPromoCodes([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } else {
        console.log("response is null in component", response);
        setPromoCodes([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setPromoCodes([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get status based on dates and status
  const getCouponStatus = (promoCode: PromoCode): string => {
    const now = new Date();
    const endDate = new Date(promoCode.end_date);

    if (!promoCode.status) {
      return t("inactive");
    }

    if (endDate < now) {
      return t("expired");
    }

    return t("active");
  };

  // Fetch data on component mount and when pagination changes
  useEffect(() => {
    fetchPromoCodes();
  }, [currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (value: string): void => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleDeleteCoupon = async (couponId: number) => {
    try {

      setIsDeleting(couponId);

      const response = await deleteCoupon(couponId);

      if (response.success) {
        toast.success(response.message || "Coupon deleted successfully");

        // Remove the deleted coupon from the local state
        setPromoCodes(prevPromoCodes =>
          prevPromoCodes.filter(coupon => coupon.id !== couponId)
        );

        // Update total items count
        setTotalItems(prevTotal => prevTotal - 1);

        // If current page becomes empty and it's not the first page, go to previous page
        const remainingItems = totalItems - 1;
        const newTotalPages = Math.ceil(remainingItems / rowsPerPage);

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        const errorMessage = response.error || response.message || "Failed to delete coupon";
        toast.error(errorMessage);
        console.error('Delete coupon error:', errorMessage);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error("Failed to delete coupon. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  }

  const handleDropdownMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
  }

  return (
    <>
      <DashboardBreadcrumb title={t("coupon")} firstElement={t("coupon")} firstElementLink="/instructor/coupon" secondElement={t("all_coupons")} />

      <Card className="bg-white border borderColor rounded-lg mt-10 mb-0">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-base font-semibold text-gray-800">
              {t("all_coupons")}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px] font-semibold text-start">#</TableHead>
                  <TableHead className="font-semibold text-start">{t("coupon_code")}</TableHead>
                  <TableHead className="font-semibold text-start">{t("coupon_title")}</TableHead>
                  {/* <TableHead className="font-semibold text-start">{t("courses")}</TableHead> */}
                  <TableHead className="font-semibold text-start">{t("expiry_date")}</TableHead>
                  <TableHead className="font-semibold text-start">{t("discount")} (%)</TableHead>
                  <TableHead className="font-semibold text-start">{t("coupon_usage")}</TableHead>
                  <TableHead className="font-semibold text-start">{t("remain_coupons")}</TableHead>
                  <TableHead className="font-semibold text-start">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-end">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  isLoading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center">
                        <TableCellSkeleton />
                      </TableCell>
                    </TableRow>
                  ) :
                    promoCodes.length > 0 ? (
                      promoCodes.map((promoCode, index) => {
                        return (
                          <TableRow key={promoCode.id} className="hover:bg-gray-50">
                            <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{promoCode.promo_code}</TableCell>
                            <TableCell>{promoCode.message}</TableCell>
                            <TableCell>{formatDate(promoCode.end_date)}</TableCell>
                            <TableCell>
                              {promoCode.discount}%
                            </TableCell>
                            <TableCell>{promoCode.total_usage_limit}</TableCell>
                            <TableCell>{promoCode.remaining_count}</TableCell>
                            <TableCell>
                              <Badge
                                className={`capitalize ${getCouponStatus(promoCode).toLowerCase() === "active"
                                  ? "bg-green-100 text-green-700"
                                  : getCouponStatus(promoCode).toLowerCase() === "expired"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                  } px-2 py-1 text-xs rounded`}
                              >
                                {getCouponStatus(promoCode)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <span className="text-gray-500">...</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-none"
                                  onMouseLeave={(e) => { handleDropdownMouseLeave(e) }}
                                >
                                  <DropdownMenuItem className="hover:sectionBg transition-all duration-300">
                                    <Link href={`/instructor/coupon/edit-coupon/${promoCode.id}`}>
                                      {t("edit_coupon")}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:sectionBg transition-all duration-300"
                                    onClick={() => handleDeleteCoupon(promoCode.id)}
                                    disabled={isDeleting === promoCode.id}
                                  >
                                    {isDeleting === promoCode.id ? t("deleting") + "..." : t("delete_coupon")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          <DataNotFound />
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {
              isLoading ? (
                <div className="text-center">
                  <TableCellSkeleton />
                </div>
              ) :
                promoCodes.length > 0 ? (
                  promoCodes.map((promoCode, index) => {
                    return (
                      <div
                        key={promoCode.id}
                        className="border-b last:border-b-0 bg-white p-4 border-gray-200"
                      >
                        {/* Header with Number and Menu */}
                        <div className="flex justify-between items-start mb-4">
                          {/* Coupon Number */}
                          <div className="text-md font-semibold">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </div>

                          {/* Three-dot Menu */}
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ">
                                  <span className="text-gray-500 bg-gray-100 rounded-md p-1"><BiDotsVerticalRounded size={20} /></span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end"
                                onMouseLeave={(e) => { handleDropdownMouseLeave(e) }}
                              >
                                <DropdownMenuItem>
                                  <Link href={`/instructor/coupon/edit-coupon/${promoCode.id}`}>
                                    {t("edit_coupon")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteCoupon(promoCode.id)}
                                  disabled={isDeleting === promoCode.id}
                                >
                                  {isDeleting === promoCode.id ? t("deleting") + "..." : t("delete_coupon")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Coupon Details - Label: Value pairs */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("coupon_code")}:</span>
                            <span className="text-gray-900 truncate block" title={promoCode.promo_code}>
                              {promoCode.promo_code}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("coupon_title")}:</span>
                            <span className="text-gray-900">{promoCode.message}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("courses")}:</span>
                            {promoCode.courses?.length === 0 ? (
                              <span className="text-gray-500 text-sm">-</span>
                            ) : (
                              <ol className="list-decimal list-inside space-y-1">
                                {promoCode.courses?.slice(0, 4)?.map((course, index) => (
                                  <li key={index} className="text-base text-gray-700">
                                    {course.title}
                                  </li>
                                ))}
                                {promoCode.courses?.length > 4 && (
                                  <ViewAllCourses
                                    courses={promoCode.courses}
                                  />
                                )}
                              </ol>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("expiry_date")}:</span>
                            <span className="text-gray-900">{formatDate(promoCode.end_date)}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("discount")}:</span>
                            <span className="text-gray-900">
                              {promoCode.discount}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("coupon_usage")}:</span>
                            <span className="text-gray-900">{promoCode.total_usage_limit}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2 border-b borderColor">
                            <span className="font-medium text-gray-700">{t("remain_coupons")}:</span>
                            <span className="text-gray-900">{promoCode.remaining_count}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-2">
                            <span className="font-medium text-gray-700">{t("status")}:</span>
                            <div className="flex items-center">
                              <Badge
                                className={`capitalize ${getCouponStatus(promoCode).toLowerCase() === "active"
                                  ? "bg-green-100 text-green-700"
                                  : getCouponStatus(promoCode).toLowerCase() === "expired"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                  } px-3 py-1 text-xs rounded-full font-medium`}
                              >
                                {getCouponStatus(promoCode)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center"><DataNotFound /></div>
                )}
          </div>
        </CardContent>

        {/* Pagination */}
        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-t border-gray-200">
          {totalPages > 0 && (
            <div className="w-full">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default AllCoupons;

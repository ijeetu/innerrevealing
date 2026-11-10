"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMostSellingCourses, MostSellingCourseDataType, MostSellingCoursesOptions } from "@/utils/api/instructor/most-selling-courses/getMostSellingCourses";
import toast from "react-hot-toast";
import { extractErrorMessage, getCurrencySymbol } from "@/utils/helpers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import DataNotFound from "@/components/commonComp/DataNotFound";
import EarningListTable from "../earnings/EarningListTable";
import { CourseDataType } from "@/utils/api/instructor/course/getAddedCourses";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

const MostSellingCourses: React.FC<{ isEarningPage?: boolean }> = ({ isEarningPage = false }) => {

  const { t } = useTranslation();

  // Local state for courses data
  const [courses, setCourses] = useState<MostSellingCourseDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Show 5 items to match the design
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<'yearly' | 'monthly' | 'weekly' | 'price_high_to_low' | 'price_low_to_high'>('yearly');

  // Fetch most selling courses function - following the same pattern as fetchAddedCourses
  const fetchMostSellingCourses = async (params?: {
    page?: number;
    per_page?: number;
    filter?: string;
  }) => {
    setIsLoading(true);

    try {
      // Build API parameters based on current state, using params as overrides
      const apiParams: MostSellingCoursesOptions = {
        per_page: params?.per_page ?? rowsPerPage,
        page: params?.page ?? currentPage,
        filter: (params?.filter ?? filter) as MostSellingCoursesOptions['filter'],
      };

      // Fetch courses with server-side filtering and pagination
      const response = await getMostSellingCourses(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            setCourses(response.data.data);
          }
          // Set pagination data directly from response
          if (response.data) {
            setTotalCourses(response.data.total);
            setTotalPages(response.data.last_page);
          } else {
            setTotalCourses(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          if (response.message !== "Your instructor account has been suspended. Please contact support.") {
            toast.error(response.message || "Failed to fetch most selling courses");
          }
          setCourses([]);
          setTotalCourses(0);
          setTotalPages(0);
        }
      } else {
        console.log("response is null in component", response);
        setCourses([]);
        setTotalCourses(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setCourses([]);
      setTotalCourses(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler functions for pagination and filters
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMostSellingCourses({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    fetchMostSellingCourses({ per_page: perPage, page: 1 });
  };

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as 'yearly' | 'monthly' | 'weekly' | 'price_high_to_low' | 'price_low_to_high');
    setCurrentPage(1); // Reset to first page when filtering
    fetchMostSellingCourses({
      filter: newFilter,
      page: 1
    });
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchMostSellingCourses();
  }, []);


  return (
    isEarningPage ?
      <Card className="">
        <div className="flex justify-between items-center p-4 md:p-6 border-b borderColor">
          <h3 className="font-semibold text-base ">
            {t("most_selling_courses")}
          </h3>
          {/* Sort dropdown */}
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[120px] h-8 text-sm bg-[#F8F8F9]">
              <SelectValue placeholder={t("yearly")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t("this_week")}</SelectItem>
              <SelectItem value="monthly">{t("this_month")}</SelectItem>
              <SelectItem value="yearly">{t("this_year")}</SelectItem>
              <SelectItem value="price_high_to_low">{t("price_high_to_low")}</SelectItem>
              <SelectItem value="price_low_to_high">{t("price_low_to_high")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto p-4">
          <EarningListTable
            data={courses as unknown as CourseDataType[]}
            isLoading={isLoading}
            isEarningsPage={isEarningPage}
          />
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 pt-8 border-t border-gray-200">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={totalCourses}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageSelectChange}
            />
          </div>
        )}
      </Card>
      :
      <Card className="bg-white rounded-2xl ">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b borderColor">
          <CardTitle className="text-lg font-semibold text-gray-700">
            {t("most_selling_courses")}
          </CardTitle>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[120px] h-8 text-sm bg-[#F8F8F9]">
              <SelectValue placeholder={t("yearly")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t("this_week")}</SelectItem>
              <SelectItem value="monthly">{t("this_month")}</SelectItem>
              <SelectItem value="yearly">{t("this_year")}</SelectItem>
              <SelectItem value="price_high_to_low">{t("price_high_to_low")}</SelectItem>
              <SelectItem value="price_low_to_high">{t("price_low_to_high")}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center p-4">
                  <div className="w-10 h-10 rounded-md me-3 bg-gray-200 animate-pulse"></div>
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div>
              {courses.map((course) => (
                <Link href={`/instructor/my-course/${course?.slug}`} key={course.id}>
                  <div key={course.id} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
                    <div className="w-10 h-10 rounded-md me-3 bg-gray-300 flex-shrink-0 overflow-hidden">
                      <CustomImageTag
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium line-clamp-1" title={course.title} >
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="">
                          {course.price === null || course.price === '0' ? (
                            <span className="text-sm font-medium text-green-600 ">{t("free")}</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">
                                {getCurrencySymbol()}
                                {course.discount_price && course.discount_price !== null
                                  ? course.discount_price
                                  : course.price}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-red-500">{course.total_sales} {t("sold")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <DataNotFound />
            </div>
          )}
          {/* Pagination - only show if there are multiple pages */}
          {totalPages > 0 && (
            <div className="p-4 pt-8 border-t border-gray-200">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalItems={totalCourses}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageSelectChange}
                showResultText={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
  );
};

export default MostSellingCourses;

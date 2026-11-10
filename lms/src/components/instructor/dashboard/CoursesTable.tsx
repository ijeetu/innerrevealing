"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { Input } from "@/components/ui/input";
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
  CardTitle,
} from "@/components/ui/card";
import { BiSearchAlt } from "react-icons/bi";
import { LuSearch } from "react-icons/lu";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { BsThreeDotsVertical } from "react-icons/bs";
// Import existing interfaces from the API helpers
import { CourseDataType, CourseStatistics, GetAddedCoursesParams } from "@/utils/api/instructor/course/getAddedCourses";
// Import custom pagination component
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
// Import API functions
import { getAddedCourses } from "@/utils/api/instructor/course/getAddedCourses";
import { deleteCourseChapterById } from "@/utils/api/instructor/course/delete-update-course/deleteCourse";
import toast from "react-hot-toast";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { HiDotsHorizontal } from "react-icons/hi";
import { extractErrorMessage, getCurrencySymbol, getDiscountPercentage, getStatus } from "@/utils/helpers";
import TableCellSkeleton from "@/components/skeletons/instrutor/TableCellSkeleton";
import { FaStar } from "react-icons/fa";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { useTranslation } from "@/hooks/useTranslation";
import { resetCourseRelatedData, setCreatedCourseId } from "@/redux/reducers/helpersReducer";
import { resetAddCourseData } from "@/redux/instructorReducers/AddCourseSlice";
import { resetCurriculamData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import CourseStatusCard from "../courses/CourseStatusCard";
import DeleteConfirmationModal from "./DeleteConfimationModal";



interface CoursesTableProps {
  earningsPage?: boolean;
  teamSlug?: string;
  myCoursesPage?: boolean;
}

const CoursesTable: React.FC<CoursesTableProps> = ({ earningsPage, teamSlug, myCoursesPage }) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Local state for courses data
  const [statistics, setStatistics] = useState<CourseStatistics>({
    total_courses: 0,
    publish: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
    approved: 0,
    active: 0,
  });
  const [courses, setCourses] = useState<CourseDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: number; status: string } | null>(null);

  // Fetch courses function
  const fetchAddedCourses = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    course_type?: string;
    approval_status?: string;
  }) => {
    setIsLoading(true);

    try {
      // Build API parameters based on current filters
      const apiParams: GetAddedCoursesParams = {
        per_page: params?.per_page || rowsPerPage,
        page: params?.page || currentPage,
        team_user_slug: teamSlug,
      };

      // Add search parameter if provided
      if (params?.search !== undefined) {
        apiParams.search = params.search;
      } else if (searchTerm.trim()) {
        apiParams.search = searchTerm.trim();
      }

      // Add status filter
      if (params?.status !== undefined) {
        apiParams.status = params.status as 'draft' | 'pending' | 'publish' | null;
      } else if (statusFilter !== "all") {
        apiParams.status = statusFilter as 'draft' | 'pending' | 'publish' | null;
      }
      else {
        apiParams.status = null;
      }

      // Add course type filter (for price filter)
      if (params?.course_type !== undefined) {
        apiParams.course_type = params.course_type as 'free' | 'paid';
      } else if (priceFilter === "free") {
        apiParams.course_type = 'free';
      } else if (priceFilter === "paid") {
        apiParams.course_type = 'paid';
      }

      // Add approval status filter 
      if (earningsPage) {
        apiParams.approval_status = 'approved';
      } else {
        if (params?.approval_status !== undefined) {
          apiParams.approval_status = params.approval_status as 'pending' | 'approved' | 'rejected' | null;
        }
      }

      // Fetch courses with server-side filtering and pagination
      const response = await getAddedCourses(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.courses?.data) {
            setStatistics(response.data.statistics);
            setCourses(response.data.courses.data);
          } else {
            setCourses([]);
          }
          // Set pagination data directly from response
          if (response.data?.courses) {
            setTotalCourses(response.data.courses.total);
            setTotalPages(response.data.courses.last_page);
          } else {
            setTotalCourses(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          if (response.message !== "No Courses Found") {
            toast.error(response.message || "Failed to fetch courses");
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

  // Handler functions for filters and search
  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
    fetchAddedCourses({
      status: status === "all" ? "" : status,
      page: 1
    });

  };

  const handlePriceFilterChange = (price: string) => {
    setPriceFilter(price);
    setCurrentPage(1); // Reset to first page when filtering
    fetchAddedCourses({
      course_type: price === "all" ? '' : price,
      page: 1
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAddedCourses({ page });

  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    fetchAddedCourses({ per_page: perPage, page: 1 });

  };

  // Fetch courses on component mount
  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchAddedCourses();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchAddedCourses({ search: searchTerm, page: 1 });

      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }

  }, [searchTerm]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    handleSearchChange(event.target.value);
  };

  const handlePriceChange = (value: string): void => {
    handlePriceFilterChange(value);
  };

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  const handleOpenDeleteModal = (id: number, status: string) => {
    setCourseToDelete({ id, status });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      await handleDeleteCourse(courseToDelete.id, courseToDelete.status);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDeleteCourse = async (id: number, status: string) => {
    try {
      // Call the delete course API
      const response = await deleteCourseChapterById(id, id);

      if (response.success) {
        toast.success("Course deleted successfully!");
        setCourses(courses.filter((course) => course?.id !== id));
        switch (status) {
          case "publish":
            setStatistics?.({ ...statistics, publish: statistics?.publish - 1 });
            break;
          case "pending":
            setStatistics?.({ ...statistics, pending: statistics?.pending - 1 });
            break;
          case "rejected":
            setStatistics?.({ ...statistics, rejected: statistics?.rejected - 1 });
            break;
          case "draft":
            setStatistics?.({ ...statistics, draft: statistics?.draft - 1 });
            break;
          default:
            break;
        }
      } else {
        toast.error(response.error || "Failed to delete course");
        console.error("Course deletion failed:", response);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("An unexpected error occurred while deleting the course");
    }
  };


  const tableHeaderPoints = [
    {
      label: t("course"),
      key: "course",
    },
    {
      label: t("chapters"),
      key: "lessons",
    },
    {
      label: t("price"),
      key: "price",
    },
    {
      label: t("discount"),
      key: "discount",
    },
    {
      label: t("enrolled_students"),
      key: "enrolled_students",
    },
    {
      label: t("status"),
      key: "status",
    },
  ];

  const tableHeaderPointsEarnings = [
    {
      label: t("course"),
      key: "course",
    },
    {
      label: t("price"),
      key: "price",
    },
    {
      label: t("ratings"),
      key: "rating",
    },
  ];


  const handleSetCourseIdForEditTeamCourse = (id: number) => {
    dispatch(setCreatedCourseId(id));
  }

  const handleResetAddCourseData = () => {
    dispatch(resetAddCourseData());
    dispatch(resetCourseRelatedData());
    dispatch(resetCurriculamData());
  }

  const handleDropdownMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
  }


  return (
    <>
      {
        myCoursesPage &&
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-0 flex-row flex items-start justify-between flex-wrap md:flex-nowrap gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t("manage_efficiently")}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {t("manage_efficiently_description")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="primaryBg text-white whitespace-nowrap flex-shrink-0" onClick={handleResetAddCourseData}>
                <Link
                  href="/instructor/my-course/add-course"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 me-2" />
                  {t("add_course")}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {isLoading ? (
                // Loading skeleton for statistics cards
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : (
                <>
                  <CourseStatusCard
                    title={t("active_courses")}
                    count={statistics?.publish}
                    status="publish"
                    subtitle={t("courses_live")}
                    className="bg-[#83B8071F]"
                    barColorClass="bg-[#83B807]"
                  />
                  <CourseStatusCard
                    title={t("pending_approval")}
                    count={statistics?.pending}
                    status="pending"
                    subtitle={t("awaiting_review")}
                    className="bg-[#0186D81F]"
                    barColorClass="bg-[#0186D8]"
                  />
                  <CourseStatusCard
                    title={t("rejected_courses")}
                    count={statistics?.rejected}
                    status="rejected"
                    subtitle={t("course_rejected")}
                    className="bg-[#DB3D261F]"
                    barColorClass="bg-[#DB3D26]"
                  />
                  <CourseStatusCard
                    title={t("draft_courses")}
                    count={statistics?.draft}
                    status="draft"
                    subtitle={t("saved_as_draft")}
                    className="bg-[#6F42C11F]"
                    barColorClass="bg-[#6F42C1]"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      }
      <Card className="bg-white rounded-2xl">
        <CardHeader className="border-b borderColor pb-4">
          {
            earningsPage ?
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-md font-semibold text-gray-800 whitespace-nowrap">{t("all_courses")}</h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={priceFilter} onValueChange={handlePriceChange}>
                    <SelectTrigger className="w-full sm:w-[110px] md:w-[150px] text-sm bg-[#F8F8F9]">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("any_price")}</SelectItem>
                      <SelectItem value="free">{t("free")}</SelectItem>
                      <SelectItem value="paid">{t("paid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              :
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  <h1 className="text-md font-semibold text-gray-800 whitespace-nowrap">{t("all_courses")}</h1>
                  {
                    !teamSlug &&
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Select value={priceFilter} onValueChange={handlePriceChange}>
                        <SelectTrigger className="w-full sm:w-[110px] md:w-[150px] text-sm bg-[#F8F8F9]">
                          <SelectValue placeholder="Price" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("any_price")}</SelectItem>
                          <SelectItem value="free">{t("free")}</SelectItem>
                          <SelectItem value="paid">{t("paid")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-full sm:w-[110px] md:w-[150px] text-sm bg-[#F8F8F9]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("all")}</SelectItem>
                          <SelectItem value="publish">{t("active")}</SelectItem>
                          <SelectItem value="pending">{t("pending")}</SelectItem>
                          <SelectItem value="rejected">{t("rejected")}</SelectItem>
                          <SelectItem value="draft">{t("draft")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  }
                </div>
                <div className="flex w-full lg:w-auto items-center rounded-[5px] overflow-hidden border border-input h-10">
                  <Input
                    type="text"
                    placeholder={t("search_for_course")}
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="border-0 rounded-none shadow-none focus-visible:ring-0 sectionBg w-full md:min-w-[200px] lg:min-w-[300px] h-full py-0"
                  />
                  <Button
                    type="submit"
                    variant="default"
                    className="rounded-none bg-black text-white hover:bg-black/90 h-full px-4 flex items-center gap-2 shadow-none flex-shrink-0 py-0"
                  >
                    {t("search")} <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
          }
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table className="border-spacing-y-0">
              <TableHeader className="sectionBg !border-b borderColor">
                <TableRow>
                  <TableHead className="w-6 font-semibold whitespace-nowrap text-start">
                    #
                  </TableHead>
                  {
                    earningsPage ?
                      tableHeaderPointsEarnings.map((header) => (
                        <TableHead key={header.key} className="font-semibold whitespace-nowrap text-start">
                          {header.label}
                        </TableHead>
                      ))
                      :
                      tableHeaderPoints.map((header) => (
                        <TableHead key={header.key} className="font-semibold whitespace-nowrap text-start">
                          {header.label}
                        </TableHead>
                      ))
                  }
                  <TableHead className="font-semibold text-start whitespace-nowrap">
                    {t("action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <TableCellSkeleton />
                    </TableCell>
                  </TableRow>
                ) : courses.length > 0 ? (
                  courses.map((course) => (
                    <TableRow key={course?.id} className="hover:bg-gray-50 border-b borderColor last:border-b-0">
                      <TableCell className="text-start">
                        {course?.id}
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex items-center">
                          <div className="me-3 flex-shrink-0">
                            <CustomImageTag
                              src={course?.thumbnail}
                              alt={course?.title}
                              className="w-10 h-7 rounded object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-semibold max-w-[200px] lg:max-w-xs truncate"
                              title={course?.title}
                            >
                              {course?.title}
                            </div>
                            {
                              !earningsPage &&
                              <div className="text-sm">
                                {t("category")} -{" "}
                                <span className="primaryColor font-medium">
                                  {course?.category.name}
                                </span>
                              </div>
                            }
                          </div>
                        </div>
                      </TableCell>
                      {
                        !earningsPage &&
                        <TableCell className="text-start">
                          <div className="font-semibold">
                            {course?.total_chapter_count}
                          </div>
                          <div className="text-sm">{t("total_chapter")}</div>
                        </TableCell>
                      }
                      <TableCell className="text-start">
                        {course?.price === '0' || course?.price === null ? (
                          <div className="font-medium text-green-600">
                            {t("free")}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {getCurrencySymbol()}{course?.discount_price || course?.price}
                            </span>
                            {course?.discount_price && !earningsPage && (
                              <span className="text-gray-700 text-sm line-through">
                                {getCurrencySymbol()}{course?.price}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      {
                        !earningsPage &&
                        <TableCell className="text-sm text-start">
                          {course?.discount_price ? getDiscountPercentage(course?.price || '', course?.discount_price) + "%" : "-"}
                        </TableCell>
                      }
                      {
                        !earningsPage &&
                        <TableCell className="text-start">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {course?.total_enrolled_students}
                            </span>
                            <span className="text-sm">
                              {t("total_enrollment")}
                            </span>
                          </div>
                        </TableCell>
                      }
                      {
                        !earningsPage &&
                        <TableCell className="text-start">
                          <Badge
                            className={`${course?.status.toLowerCase() === "publish"
                              ? "bg-[#83B8071F] text-[#83B807]"
                              : course?.status.toLowerCase() === "pending"
                                ? "bg-[#0186D81F] text-[#0186D8]"
                                : course?.status.toLowerCase() === "rejected"
                                  ? "bg-[#FF00001F] text-[#FF0000]"
                                  : course?.status.toLowerCase() === "draft"
                                    ? "bg-[#6F42C11F] text-[#6F42C1]"
                                    : "bg-[#0000001F] text-[#000000]"
                              }
                         px-2 py-1 text-sm rounded-[5px] w-full font-medium`}
                          >
                            {getStatus(course?.status)}
                          </Badge>
                        </TableCell>
                      }
                      {
                        earningsPage &&
                        <TableCell className="text-start">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-[#DB9305]" />
                            <span className="font-semibold">{course?.average_rating}</span>
                            <span className="text-sm text-gray-500">
                              ({course?.rating_count})
                            </span>
                          </div>
                        </TableCell>
                      }
                      <TableCell className="text-start">
                        {
                          earningsPage ?
                            <div className="flex justify-start">
                              <Link href={`/instructor/earnings/${course?.slug}`} className="ps-2 rtl:ps-0 rtl:pe-2">
                                <Button
                                  className="h-10 px-6 primaryBg text-white rounded-lg w-fit hover:hoverBgColor transition-all duration-300"
                                >
                                  {t("view_details")}
                                </Button>
                              </Link>
                            </div>
                            :
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 sectionBg flexCenter borderColor">
                                  <HiDotsHorizontal className="text-[#A5B7C4]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end"
                                onMouseLeave={(e) => { handleDropdownMouseLeave(e) }}
                              >
                                <Link href={`${teamSlug ? `/my-teams/${teamSlug}/edit-course/${course?.slug}` : `/instructor/my-course/edit-course/${course?.slug}`}`}>
                                  <DropdownMenuItem className="cursor-pointer hover:sectionBg transition-all duration-300" onClick={() => handleSetCourseIdForEditTeamCourse(course?.id)}>
                                    {t("edit")}
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem asChild className="cursor-pointer hover:sectionBg transition-all duration-300">
                                  <Link href={`${teamSlug ? `/my-teams/${teamSlug}/course/${course?.slug}` : `/instructor/my-course/${course?.slug}`}`}>
                                    {t("view_details")}
                                  </Link>
                                </DropdownMenuItem>
                                {
                                  !teamSlug && course?.total_enrolled_students < 1 &&
                                  <DropdownMenuItem className="text-red-600 cursor-pointer hover:sectionBg transition-all duration-300" onClick={() => handleOpenDeleteModal(course?.id, course?.status)}>
                                    {t("delete")}
                                  </DropdownMenuItem>
                                }
                              </DropdownMenuContent>
                            </DropdownMenu>
                        }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                    >
                      <DataNotFound />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* mobile view  */}
          <div className="block md:hidden">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="p-4">
                  <TableCellSkeleton />
                </div>
              ) : (
                courses.length > 0 ?
                  courses.map((course) => (
                    <div key={course?.id} className="border-b border-gray-200 p-4">
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-4">
                        {/* Left side with index and image */}
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center justify-between w-full">
                            {/* Index Number */}
                            <div className="flex-shrink-0 w-8 font-semibold text-gray-900">
                              {course?.id}
                            </div>
                            {/* Actions Menu */}
                            {
                              earningsPage ?
                                <>
                                  <Link href={`/instructor/earnings/${course?.slug}`} className="ps-2">
                                    <Button
                                      className="h-8 px-2 primaryBg text-white rounded-lg w-fit hover:hoverBgColor transition-all duration-300"
                                    >
                                      {t("view_details")}
                                    </Button>
                                  </Link>
                                </>
                                :
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                      <span className="text-gray-500 text-lg sectionBg border borderColor rounded w-6 h-6 flexCenter">
                                        <BsThreeDotsVertical />
                                      </span>
                                      <span className="sr-only">{t("actions")}</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onMouseLeave={(e) => handleDropdownMouseLeave(e)}>
                                    {/* Corrected Edit Link Structure */}
                                    <DropdownMenuItem asChild className="cursor-pointer hover:sectionBg transition-all duration-300" onClick={() => handleSetCourseIdForEditTeamCourse(course?.id)}>
                                      <Link href={teamSlug ? `/my-teams/${teamSlug}/edit-course/${course?.slug}` : `/instructor/my-course/edit-course/${course?.slug}`}>
                                        {t("edit")}
                                      </Link>
                                    </DropdownMenuItem>

                                    {/* Corrected View Details Link Structure */}
                                    <DropdownMenuItem asChild className="cursor-pointer hover:sectionBg transition-all duration-300">
                                      <Link href={teamSlug ? `/my-teams/${teamSlug}/course/${course?.slug}` : `/instructor/my-course/${course?.slug}`}>
                                        {t("view_details")}
                                      </Link>
                                    </DropdownMenuItem>

                                    {/* Delete Option */}
                                    {!teamSlug && course?.total_enrolled_students < 1 && (
                                      <DropdownMenuItem
                                        className="text-red-600 cursor-pointer hover:sectionBg transition-all duration-300"
                                        onClick={() => handleOpenDeleteModal(course?.id, course?.status)}
                                      >
                                        {t("delete")}
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            }

                          </div>
                          <div className="flex items-center gap-2">
                            {/* Course Image */}
                            <div className="flex-shrink-0 w-[60px] h-[60px] bg-gray-300 rounded overflow-hidden">
                              <CustomImageTag
                                src={course?.thumbnail}
                                alt={course?.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Course Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                                {course?.title}
                              </h3>
                              {
                                !earningsPage &&
                                <p className="text-sm text-gray-600">
                                  {t("category")} - <span className="primaryColor">{course?.category.name}</span>
                                </p>
                              }
                            </div>
                          </div>
                        </div>


                      </div>

                      {/* Course Details - Two Column Layout */}
                      <div className="space-y-2 text-sm">
                        {/* Lessons */}
                        {
                          !earningsPage &&
                          <div className="flex justify-between items-center border-b borderColor pb-2">
                            <span className="font-semibold">{t("chapters")}:</span>
                            <div className="flex w-1/2">
                              <span className="font-medium text-gray-900">{course?.total_chapter_count}</span>
                            </div>
                          </div>
                        }

                        {/* Price */}
                        <div className="flex justify-between items-center border-b borderColor pb-2">
                          <span className="font-semibold">{t("price")}:</span>
                          <div className="flex gap-2 w-1/2 flex-col">
                            {course?.price === '0' || course?.price === null ? (
                              <span className="font-medium text-green-600">{t("free")}</span>
                            ) : (
                              <>
                                <span className="font-medium text-gray-900">
                                  {getCurrencySymbol()}{course?.discount_price || course?.price}
                                </span>
                                {course?.discount_price && !earningsPage && (
                                  <span className="text-gray-400 line-through">
                                    {getCurrencySymbol()}{course?.price}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Discount */}
                        {
                          !earningsPage &&
                          <div className="flex justify-between items-center border-b borderColor pb-2">
                            <span className="font-semibold">{t("discount")}:</span>
                            <div className="flex w-1/2">
                              <span className="font-medium text-gray-900">
                                {course?.discount_price ? getDiscountPercentage(course?.price || '', course?.discount_price) + "%" : "-"}
                              </span>
                            </div>
                          </div>
                        }

                        {/* Total Enrollment */}
                        {
                          !earningsPage &&
                          <div className="flex justify-between items-center border-b borderColor pb-2">
                            <span className="font-semibold">{t("total_enrollment")}:</span>
                            <div className="flex w-1/2">
                              <span className="font-medium text-gray-900">
                                {course?.total_enrolled_students}
                              </span>
                            </div>
                          </div>
                        }

                        {/* Status */}
                        {
                          !earningsPage &&
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{t("status")}:</span>
                            <div className="flex w-1/2">
                              <Badge
                                className={`${course?.status.toLowerCase() === "publish"
                                  ? "bg-[#83B8071F] text-[#83B807]"
                                  : course?.status.toLowerCase() === "pending"
                                    ? "bg-[#0186D81F] text-[#0186D8]"
                                    : course?.status.toLowerCase() === "rejected"
                                      ? "bg-[#FF00001F] text-[#FF0000]"
                                      : course?.status.toLowerCase() === "draft"
                                        ? "bg-[#6F42C11F] text-[#6F42C1]"
                                        : "bg-[#0000001F] text-[#000000]"
                                  } px-3 py-1 text-sm rounded-full font-medium`}
                              >
                                {getStatus(course?.status)}
                              </Badge>
                            </div>
                          </div>
                        }
                        {/* Ratings */}
                        {
                          earningsPage &&
                          <div className="flex justify-between items-center border-b borderColor pb-2">
                            <span className="font-semibold">{t("ratings")}:</span>
                            <div className="flex w-1/2">
                              <div className="flex items-center gap-1">
                                <FaStar className="text-[#DB9305]" />
                                <span className="font-semibold">{course?.average_rating}</span>
                                <span className="text-sm text-gray-500">
                                  ({course?.rating_count})
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  ))
                  :
                  <DataNotFound />
              )}
            </div>
          </div>
        </CardContent>
        {
          totalPages > 0 && (
            <CardFooter className="pt-4 border-t border-gray-200">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalItems={totalCourses}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageSelectChange}
                showResultText={true}
              />
            </CardFooter>
          )
        }
      </Card >

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={() => setIsDeleteModalOpen(true)}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>

  );
};

export default CoursesTable;

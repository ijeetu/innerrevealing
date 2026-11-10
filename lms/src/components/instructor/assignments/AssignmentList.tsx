"use client";
import React, { useState, useEffect } from "react";
import { BiSearchAlt } from "react-icons/bi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AssingmentsListTable from "@/components/instructor/assignments/AssingmentsListTable";
import AssignmentSubmissionView from "@/components/instructor/assignments/AssignmentSubmissionView";
import {
  AssignmentDataType,
  getAssignmentList,
  GetAssignmentListParams,
} from "@/utils/api/instructor/assignment/getAssignmentList";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import { getCoursesForCoupon, InstructorCourse } from "@/utils/api/instructor/coupon/getCoursesForCoupon";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface AssignmentListProps {
  courseSlug?: string;
  teamSlug?: string;
}

export default function AssignmentList({ courseSlug, teamSlug }: AssignmentListProps) {

  const { t } = useTranslation();
  const router = useRouter();

  // Local state for assignments data
  const [assignments, setAssignments] = useState<AssignmentDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Add state to track if submission view is shown and which assignment is selected
  const [showSubmissionView, setShowSubmissionView] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentDataType | null>(null);

  const [availableCourses, setAvailableCourses] = useState<InstructorCourse[]>([]);
  const [selectedCourseId, setselectedCourseId] = useState<string | undefined>(undefined);

  // Fetch assignments function
  const fetchAssignmentsList = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }) => {
    setIsLoading(true);

    try {
      // Build API parameters based on current filters
      const apiParams: GetAssignmentListParams = {
        id: selectedCourseId === 'all' ? "" : selectedCourseId,
        per_page: params?.per_page || rowsPerPage,
        page: params?.page || currentPage,
        slug: courseSlug,
        team_user_slug: teamSlug,
      };

      // Add search parameter if provided
      if (params?.search !== undefined) {
        apiParams.search = params.search;
      } else if (searchQuery.trim()) {
        apiParams.search = searchQuery.trim();
      }

      // Fetch assignments with server-side filtering and pagination
      const response = await getAssignmentList(apiParams);

      if (response) {
        if (!response.error) {
          if (response.data?.data) {
            setAssignments(response.data.data);
          }
          if (response.data) {
            setTotalAssignments(response.data.total);
            setTotalPages(response.data.last_page);
          } else {
            setTotalAssignments(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch assignments");
          setAssignments([]);
          setTotalAssignments(0);
          setTotalPages(0);
        }
      } else {
        console.log("response is null in component", response);
        setAssignments([]);
        setTotalAssignments(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setAssignments([]);
      setTotalAssignments(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // This function loads all courses created by the instructor for use in coupon creation
  const fetchInstructorCourses = async () => {
    try {
      const response = await getCoursesForCoupon();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setAvailableCourses(response.data);
          }
        } else {
          console.error("Error fetching courses:", response.message);
          setAvailableCourses([]);
        }
      } else {
        console.log("response is null in component", response);
        setAvailableCourses([]);
      }
    } catch (error) {
      extractErrorMessage(error);
      setAvailableCourses([]);
    }
  };

  // Load courses when component mounts
  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  // Handler functions for search and pagination
  const handleSearchChange = (searchValue: string) => {
    setSearchQuery(searchValue);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAssignmentsList({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    fetchAssignmentsList({ per_page: perPage, page: 1 });
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    handleSearchChange(event.target.value);
  };

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  // Fetch assignments on component mount
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchAssignmentsList();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssignmentsList();
    }
  }, [selectedCourseId]);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchAssignmentsList({ search: searchQuery, page: 1 });
      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Function to handle viewing submission
  const handleViewSubmission = (assignment: AssignmentDataType) => {
    if (courseSlug) {
      setSelectedAssignment(assignment);
      setShowSubmissionView(true);
    }
    else {
      if (teamSlug) {
        router.push(`/my-teams/${teamSlug}/assignments/${assignment.assignment_slug}`);
      }
      else {
        router.push(`/instructor/assignments/${assignment.assignment_slug}`);
      }
    }
  };

  // Function to handle back button from subscription view
  const handleBack = () => {
    setShowSubmissionView(false);
    setSelectedAssignment(null);
  };

  // If showing submission view, render SubscriptionView component
  if (showSubmissionView && selectedAssignment) {
    return (
      <>
        <AssignmentSubmissionView
          onBack={handleBack}
          assignment={selectedAssignment as AssignmentDataType}
          courseSlug={courseSlug}
        />
      </>
    );
  }

  return (
    <div className="w-full">

      <div className={`bg-white rounded-2xl ${!courseSlug && " border borderColor"} `}>
        {/* Header */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 p-6">
          <h2 className="text-lg font-semibold whitespace-nowrap">{t("assignment_list")}</h2>

          <div className="flex flex-col w-full md:w-auto gap-3">
            {
              !courseSlug &&
              <Select value={selectedCourseId} onValueChange={setselectedCourseId}>
                <SelectTrigger className="w-full h-[38px] md:min-w-[300px]">
                  <SelectValue placeholder={t("filter_by_course")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={'all'} value={'all'}>{t("all")}</SelectItem>
                  {
                    availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            }

            <div className="flex w-full md:w-auto items-center rounded-[5px] overflow-hidden border border-input h-10">
              <input
                type="text"
                placeholder={t("search_assignments")}
                className="w-full border-0 outline-none px-4 py-2 text-sm bg-white md:min-w-[260px] h-full"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button className="bg-black text-white px-4 h-full flex items-center gap-2 text-sm whitespace-nowrap flex-shrink-0">
                {t("search")} <BiSearchAlt size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Table - wrap in div with horizontal scroll for mobile */}
        <AssingmentsListTable
          assignments={assignments}
          handleViewSubmission={handleViewSubmission}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-gray-200">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={totalAssignments}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageSelectChange}
              showResultText={true}
            />
          </div>
        )}
      </div>
    </div >
  );
}


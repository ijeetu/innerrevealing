"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseData } from "../courses/types";
import AssignmentViewTable from "./AssignmentViewTable";
import AssignmentsInfo from "./AssignmentsInfo";
import { AssignmentDataType } from "@/utils/api/instructor/assignment/getAssignmentList";
import CustomPagination from "../commonCommponents/pagination/CustomPagination";
import { getAssignmentSubmissions, AssignmentSubmissionDataType, GetAssignmentSubmissionsParams, AssignmentType } from "@/utils/api/instructor/assignment/getAssignmentSubmissions";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BiSearchAlt } from "react-icons/bi";
import AssignmentInfoSkeleton from "@/components/skeletons/instrutor/AssignmentInfoSkeleton";
import { useTranslation } from "@/hooks/useTranslation";

interface AssignmentSubmissionViewProps {
  course?: CourseData;
  onBack?: () => void;
  assignment?: AssignmentDataType;
  courseSlug?: string;
  assignmentSlug?: string;
}

const AssignmentSubmissionView: React.FC<AssignmentSubmissionViewProps> = ({ onBack, assignment, courseSlug, assignmentSlug }) => {

  const { t } = useTranslation();

  // Local state for assignment submissions data
  const [assignmentDetails, setAssignmentDetails] = useState<AssignmentType | undefined>(undefined);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for filter, search, and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSubmissionUpdated, setIsSubmissionUpdated] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch assignment submissions function
  const fetchAssignmentSubmissions = async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    assignment_id?: number;
    search?: string;
  }) => {
    setIsLoading(true);

    try {
      // Build API parameters based on current filters
      const apiParams: GetAssignmentSubmissionsParams = {
        per_page: params?.per_page || rowsPerPage,
        page: params?.page || currentPage,
        assignment_id: params?.assignment_id || assignment?.id,
        assignment_slug: assignmentSlug,
        search: params?.search || search,
      };

      // Add status filter
      if (params?.status !== undefined) {
        apiParams.status = params.status as 'pending' | 'submitted' | 'accepted' | 'rejected';
      } else if (statusFilter !== "all") {
        apiParams.status = statusFilter as 'pending' | 'submitted' | 'accepted' | 'rejected';
      }

      // Add search filter
      if (params?.search !== undefined) {
        apiParams.search = params?.search;
      }

      // Fetch assignment submissions with server-side filtering and pagination
      const response = await getAssignmentSubmissions(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            setSubmissions(response.data.data);
            setAssignmentDetails(response.data.assignment);
          }
          // Set pagination data directly from response
          if (response.data) {
            setTotalSubmissions(response.data.total);
            setTotalPages(response.data.last_page);
          } else {
            setTotalSubmissions(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch assignment submissions");
          setSubmissions([]);
          setTotalSubmissions(0);
          setTotalPages(0);
        }
      } else {
        console.log("response is null in component", response);
        setSubmissions([]);
        setTotalSubmissions(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setSubmissions([]);
      setTotalSubmissions(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
      setIsSubmissionUpdated(false);
    }
  };

  // Handler functions for filters and pagination
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
    fetchAssignmentSubmissions({
      status: status === "all" ? "" : status,
      page: 1
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAssignmentSubmissions({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    fetchAssignmentSubmissions({ per_page: perPage, page: 1 });
  };

  // Fetch assignment submissions on component mount
  useEffect(() => {
    if ((assignment?.id || assignmentSlug) && search.trim() === "") {
      fetchAssignmentSubmissions();
    }
  }, [assignment?.id, assignmentSlug, search]);

  const handleStatusFilterSelectChange = (value: string): void => {
    handleStatusFilterChange(value);
  };

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  useEffect(() => {
    if (isSubmissionUpdated) {
      fetchAssignmentSubmissions();
    }
  }, [isSubmissionUpdated]);

  useEffect(() => {
    if (search.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchAssignmentSubmissions({ search: search, page: 1 });

      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [search]);

  return (
    <div className={`${courseSlug ? "" : "space-y-6"}`}>
      <div className="space-y-6">
        {
          courseSlug &&
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 border-b borderColor gap-4">
            <div className="filter flex flex-wrap sm:flex-nowrap items-center justify-between w-full lg:w-auto gap-4">
              <span className="font-semibold whitespace-nowrap">{t("assignment_list")}</span>
              <Select value={statusFilter} onValueChange={handleStatusFilterSelectChange}>
                <SelectTrigger className="w-[140px] sm:w-[180px] flex-1 sm:flex-none h-[38px] sectionBg">
                  <SelectValue placeholder={t("all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="submitted">{t("submitted")}</SelectItem>
                  <SelectItem value="accepted">{t("accepted")}</SelectItem>
                  <SelectItem value="rejected">{t("rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center w-full lg:w-auto mt-2 lg:mt-0">
              <div className="relative w-full sm:w-64 lg:w-64 bg-[#F8F8F9] flex-1">
                <Input
                  type="text"
                  placeholder={t("search_student_name")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-2 w-full rounded-bl-[5px] rounded-br-[0px] rounded-tl-[5px] rounded-tr-[0px]"
                />
              </div>
              <Button className="bg-gray-800 hover:bg-gray-700 text-white font-light h-9 rounded-bl-[0px] rounded-br-[5px] rounded-tl-[0px] rounded-tr-[5px]">
                {t("search")} <BiSearchAlt className="ml-2 hidden sm:block" size={18} />
              </Button>
            </div>
          </div>
        }
        {/* Assignment Information */}
        {
          isLoading ?
            <AssignmentInfoSkeleton />
            :
            assignmentDetails &&
            <div className={`p-4 rounded-lg ${courseSlug ? "border mb-6 borderColor m-4" : "bg-white"}`}>
              <AssignmentsInfo onBack={onBack} assignmentDetails={assignmentDetails} />
            </div>
        }
      </div>

      <div className={`overflow-x-auto bg-white w-full ${courseSlug ? "rounded-b-2xl" : "rounded-2xl pt-4 border borderColor"}`}>
        {
          !courseSlug &&
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-4 pb-4 gap-4">
            <div className="title">
              <h2 className="text-lg font-medium whitespace-nowrap">{t("student_list")}</h2>
            </div>

            <div className="filter w-full sm:w-auto flex justify-end">
              <Select value={statusFilter} onValueChange={handleStatusFilterSelectChange}>
                <SelectTrigger className="w-full sm:w-[180px] h-[38px] sectionBg">
                  <SelectValue placeholder={t("all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="submitted">{t("submitted")}</SelectItem>
                  <SelectItem value="accepted">{t("accepted")}</SelectItem>
                  <SelectItem value="rejected">{t("rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }

        {/* Table  */}
        <AssignmentViewTable
          students={submissions}
          isLoading={isLoading}
          assignmentName={assignment?.assignment_name}
          setIsSubmissionUpdated={setIsSubmissionUpdated}
        />

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t borderColor">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={totalSubmissions}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageSelectChange}
              showResultText={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissionView;

"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BiSearchAlt } from "react-icons/bi";
import QuizTable from "./QuizTable";
// Import quiz reports API and types
import { getQuizReports, GetQuizReportsParams, QuizReportDataType } from "@/utils/api/instructor/quiz/getQuizResports";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import { categoryDataSelector } from "@/redux/reducers/categorySlice";
import { CategoryDataType } from "@/types";
import QuizAttemptDetails from "./QuizAttemptDetails";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface QuizReportProps {
  courseSlug?: string;
  teamSlug?: string;
}

const QuizReport: React.FC<QuizReportProps> = ({ courseSlug, teamSlug }) => {

  const { t } = useTranslation();

  const categories = useSelector(categoryDataSelector) as CategoryDataType[];

  const router = useRouter();

  // Local state for quiz reports data
  const [quizzies, setQuizzies] = useState<QuizReportDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalReports, setTotalReports] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State to track if we're viewing quiz attempts detail and which quiz is selected
  const [viewingAttempts, setViewingAttempts] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizReportDataType | null>(null);

  // Fetch quiz reports function
  const fetchReports = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }) => {
    setIsLoading(true);

    try {
      const apiParams: GetQuizReportsParams = {
        per_page: params?.per_page || rowsPerPage,
        page: params?.page || currentPage,
      };

      if (params?.search !== undefined) {
        apiParams.search = params.search;
      } else if (searchTerm.trim()) {
        apiParams.search = searchTerm.trim();
      }

      if (courseSlug) {
        apiParams.slug = courseSlug;
      }
      if (teamSlug) {
        apiParams.team_user_slug = teamSlug;
      }

      if (categoryFilter) {
        apiParams.category_id = categoryFilter === "all" ? "" : categoryFilter;
      }

      const response = await getQuizReports(apiParams);

      if (response) {
        if (!response.error) {
          if (response.data?.data) {
            setQuizzies(response.data.data);
          }
          if (response.data) {
            setTotalReports(response.data.total);
            setTotalPages(response.data.last_page);
          } else {
            setTotalReports(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch quiz reports");
          setQuizzies([]);
          setTotalReports(0);
          setTotalPages(0);
        }
      } else {
        setQuizzies([]);
        setTotalReports(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setQuizzies([]);
      setTotalReports(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReports({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1);
    fetchReports({ per_page: perPage, page: 1 });
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchReports();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchReports({ search: searchTerm, page: 1 });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (categoryFilter) {
      fetchReports();
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    handleSearchChange(event.target.value);
  };

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  const handleViewAttempts = (quiz: QuizReportDataType) => {
    if (courseSlug) {
      setSelectedQuiz(quiz);
      setViewingAttempts(true);
    } else {
      if (teamSlug) {
        router.push(`/my-teams/${teamSlug}/student-quiz-reports/${quiz.quiz_slug}`);
      } else {
        router.push(`/instructor/student-quiz-reports/${quiz.quiz_slug}`);
      }
    }
  };

  const handleBackToQuizzes = () => {
    setViewingAttempts(false);
    setSelectedQuiz(null);
  };

  if (viewingAttempts && selectedQuiz) {
    return (
      <QuizAttemptDetails
        onBackClick={handleBackToQuizzes}
        courseSlug={courseSlug}
        quizSlug={selectedQuiz?.quiz_slug}
      />
    );
  }

  return (
    <div className={`w-full ${!courseSlug ? "bg-white rounded-2xl border borderColor" : ""}`}>

      {/* ── Header: title + filters + search ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 md:p-6 gap-3">

        {/* Left: title */}
        <h1 className="text-sm font-semibold whitespace-nowrap shrink-0">{t("quiz_report")}</h1>

        {/* Right: filters + search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto flex-wrap">

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 border rounded-md sectionBg text-gray-500 text-sm focus:ring-0">
              <SelectValue placeholder={t("filter_by_category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_categories")}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 border rounded-md sectionBg text-gray-500 text-sm focus:ring-0">
              <SelectValue placeholder={t("all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="inactive">{t("inactive")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Search input + button */}
          <div className="flex w-full sm:w-auto">
            <Input
              type="text"
              placeholder={t("search_for_quiz")}
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="rounded-r-none sectionBg focus-visible:ring-0 border-r-0 w-full sm:w-[200px] h-9 text-sm"
            />
            <Button
              type="submit"
              variant="default"
              className="rounded-l-none bg-black text-white hover:bg-black/90 h-9 px-4 flex items-center gap-1 whitespace-nowrap"
            >
              <span className="hidden sm:inline text-sm">{t("search")}</span>
              <BiSearchAlt size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Quiz table ── */}
      <QuizTable
        isLoading={isLoading}
        quizzes={quizzies}
        handleViewAttempts={handleViewAttempts}
      />

      {/* ── Pagination ── */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalReports}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageSelectChange}
            showResultText={true}
          />
        </div>
      )}
    </div>
  );
};

export default QuizReport;

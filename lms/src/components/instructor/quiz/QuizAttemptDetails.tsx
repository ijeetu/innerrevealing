"use client";
import React, { useState, useEffect } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuizInfo from "@/components/instructor/quiz/QuizInfo";
import StudentListTable from "@/components/instructor/quiz/StudentListTable";
import ViewResult from "@/components/instructor/quiz/ViewResult";
import { getQuizReportDetails, GetQuizReportDetailsParams, QuizInfoType, QuizReportDetailsDataType, QuizStatisticsType, StudentPerformanceType } from "@/utils/api/instructor/quiz/getQuizReportDetails";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import SkeletonQuizInfo from "@/components/skeletons/instrutor/QuizInfoSkeleton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface QuizAttemptDetailsProps {
  onBackClick?: () => void;
  quizSlug?: string;
  courseSlug?: string;
  teamSlug?: string;
}

const QuizAttemptDetails: React.FC<QuizAttemptDetailsProps> = ({
  onBackClick,
  quizSlug,
  courseSlug,
  teamSlug,
}) => {

  const { t } = useTranslation();
  const router = useRouter();

  // State to track if we're viewing a specific student's quiz result
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformanceType | null>(
    null
  );

  // State for quiz report details data
  const [quizReportDetails, setQuizReportDetails] = useState<QuizReportDetailsDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // Fetch quiz report details function
  const fetchQuizReportDetails = async () => {
    setIsLoading(true);

    try {
      // Build API parameters
      const apiParams: GetQuizReportDetailsParams = {
        // quiz_id: 25,
        search: search,
        quiz_slug: quizSlug,
        status_filter: statusFilter,
        date_filter: dateRangeFilter === "all" ? undefined : dateRangeFilter,
      };

      // Fetch quiz report details with API parameters
      const response = await getQuizReportDetails(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setQuizReportDetails(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch quiz report details");
          setQuizReportDetails(null);
        }
      } else {
        console.log("response is null in component", response);
        setQuizReportDetails(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setQuizReportDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view result button click
  const handleViewResult = (student: StudentPerformanceType) => {
    if (courseSlug) {
      setSelectedStudent(student);
    }
    else {
      if (teamSlug) {
        router.push(`/my-teams/${teamSlug}/student-quiz-reports/${quizSlug}/${student.attempt_id}`);
      }
      else {
        router.push(`/instructor/student-quiz-reports/${quizSlug}/${student.attempt_id}`);
      }
    }
  };

  // Handle back button click from student quiz result view
  const handleBackToAttempts = () => {
    setSelectedStudent(null);
  };

  // Fetch quiz report details on component mount
  useEffect(() => {
    if (quizSlug && !search) {
      fetchQuizReportDetails();
    }
  }, [quizSlug, search]);

  useEffect(() => {
    // Always fetch when filters change, including initial load
    fetchQuizReportDetails();
  }, [statusFilter, dateRangeFilter]);

  // Debounced search effect
  useEffect(() => {
    if (search.trim()) {
      const timer = setTimeout(() => {
        fetchQuizReportDetails();
      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [search]);

  // If a student is selected, show their quiz result view
  if (selectedStudent) {
    return (
      <>
        <ViewResult
          attemptId={selectedStudent.attempt_id}
          onBackClick={handleBackToAttempts}
        />
      </>
    );
  }

  return (
    <div className="w-full">
      {/* Header with back button and filters */}
      {
        courseSlug &&
        <div className="flex flex-wrap justify-between items-start md:items-center p-4 md:p-6 space-y-4 md:space-y-0 border-b borderColor gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              <h1 className="text-md font-semibold">{t("quiz_report")}</h1>
            </div>
            {/* date range Filter dropdown */}
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-10 border rounded-md sectionBg text-gray-500">
                <SelectValue placeholder={t("all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="pl-2">{t("all")}</SelectItem>
                <SelectItem value="this_week" className="pl-2">{t("this_week")}</SelectItem>
                <SelectItem value="this_month" className="pl-2">{t("this_month")}</SelectItem>
                <SelectItem value="custom" className="pl-2">{t("custom_date_range")}</SelectItem>
              </SelectContent>
            </Select>
            {/* Filter dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-10 border rounded-md sectionBg text-gray-500">
                <SelectValue placeholder={t("pass_fail")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="pl-2">{t("pass/fail")}</SelectItem>
                <SelectItem value="pass" className="pl-2">{t("pass")}</SelectItem>
                <SelectItem value="fail" className="pl-2">{t("fail")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Search input */}
          <div className="flex w-full md:w-auto">
            <Input
              type="text"
              placeholder={t("search_quiz")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-r-none sectionBg focus-visible:ring-0 border-r-0 w-full md:min-w-[300px] h-10"
            />
            <Button
              type="submit"
              variant="default"
              className="rounded-l-none bg-black text-white hover:bg-black/90 h-10 px-4 flex items-center"
            >
              {t("search")} <BiSearchAlt className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      }

      {/* divider */}

      {/* Quiz information card */}
      {
        isLoading ? <SkeletonQuizInfo />
          :
          <QuizInfo
            onBackClick={onBackClick}
            quizInfo={quizReportDetails?.quiz_info as QuizInfoType}
            quizStatistics={quizReportDetails?.quiz_statistics as QuizStatisticsType}
            studentReportPage={courseSlug ? false : true}
          />
      }

      <div className={`${courseSlug ? '' : 'bg-white rounded-2xl border borderColor'}`}>
        {
          !courseSlug &&
          <div className="flex flex-wrap justify-between items-start md:items-center p-4 md:p-6 space-y-4 md:space-y-0 border-b borderColor gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center">
                <h1 className="text-md font-semibold">{t("student_list")}</h1>
              </div>
              {/* date range Filter dropdown */}
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-10 border rounded-md sectionBg text-gray-500">
                  <SelectValue placeholder={t("all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="pl-2">{t("all")}</SelectItem>
                  <SelectItem value="this_week" className="pl-2">{t("this_week")}</SelectItem>
                  <SelectItem value="this_month" className="pl-2">{t("this_month")}</SelectItem>
                  <SelectItem value="custom" className="pl-2">{t("custom_date_range")}</SelectItem>
                </SelectContent>
              </Select>
              {/* Filter dropdown */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-10 border rounded-md sectionBg text-gray-500">
                  <SelectValue placeholder={t("pass_fail")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="pl-2">{t("all")}</SelectItem>
                  <SelectItem value="pass" className="pl-2">{t("pass")}</SelectItem>
                  <SelectItem value="fail" className="pl-2">{t("fail")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Search input */}
            <div className="flex w-full md:w-auto">
              <Input
                type="text"
                placeholder={t("search_quiz")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-r-none sectionBg focus-visible:ring-0 border-r-0 w-full md:min-w-[300px] h-10"
              />
              <Button
                type="submit"
                variant="default"
                className="rounded-l-none bg-black text-white hover:bg-black/90 h-10 px-4 flex items-center"
              >
                {t("search")} <BiSearchAlt className="ml-2" size={18} />
              </Button>
            </div>
          </div>
        }
        {/* Student attempts table - visible on medium screens and up */}
        <StudentListTable
          studentAttempts={quizReportDetails?.student_performance || []}
          handleViewResult={handleViewResult}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default QuizAttemptDetails;

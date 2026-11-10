"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CustomPagination from "../commonCommponents/pagination/CustomPagination";
// Import enrolled students API and types
import { getCourseEnrolledStudents, EnrolledStudentDataType, GetCourseEnrolledStudentsParams } from "@/utils/api/instructor/course/getCourseEnrollStudents";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import TableCellSkeleton from "@/components/skeletons/instrutor/TableCellSkeleton";
import DataNotFound from "@/components/commonComp/DataNotFound";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentEnrolledProps {
  courseId: number;
}

const StudentEnrolled: React.FC<StudentEnrolledProps> = ({ courseId }) => {

  const { t } = useTranslation();

  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudentDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch enrolled students function (similar to fetchAddedCourses)
  const fetchEnrolledStudents = async (params?: {
    page?: number;
    per_page?: number;
    id?: number;
  }) => {
    setIsLoading(true);

    try {
      // Build API parameters based on current filters
      const apiParams: GetCourseEnrolledStudentsParams = {
        per_page: params?.per_page || rowsPerPage,
        page: params?.page || currentPage,
        id: courseId, // Always include course ID
      };

      // Fetch enrolled students with server-side filtering and pagination
      const response = await getCourseEnrolledStudents(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            setEnrolledStudents(response.data.data);
          }
          // Set pagination data directly from response
          if (response.data) {
            setTotalStudents(response.data.total);
            setTotalPages(response.data.last_page);
          } else {
            setTotalStudents(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch enrolled students");
          setEnrolledStudents([]);
          setTotalStudents(0);
          setTotalPages(0);
        }
      } else {
        console.log("response is null in component", response);
        setEnrolledStudents([]);
        setTotalStudents(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setEnrolledStudents([]);
      setTotalStudents(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEnrolledStudents({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    fetchEnrolledStudents({ per_page: perPage, page: 1 });
  };

  // Fetch enrolled students on component mount
  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  // Custom circular progress component
  const CircularProgress = ({ value }: { value: number }) => {
    return (
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r="22"
            strokeWidth="4"
            stroke="#83B8071F"
            fill="none"
          />
          <circle
            cx="28"
            cy="28"
            r="22"
            strokeWidth="4"
            stroke={'#83B807'}
            strokeDasharray="138.2"
            strokeDashoffset={138.2 - (138.2 * value) / 100}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold leading-none">{Math.round(value)}%</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 rounded-2xl">
      <div className="p-6 border-b borderColor">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-semibold text-lg">{t("students_enrolled")}</h3>
        </div>
      </div>
      {/* desktop view  */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="border-y borderColor">
            <tr className="sectionBg">
              <th className="py-3 px-6 font-medium text-start">#</th>
              <th className="py-3 px-6 font-medium text-start">{t("students_name")}</th>
              <th className="py-3 px-6 font-medium text-start">{t("enrollment_date")}</th>
              <th className="py-3 px-6 font-medium text-start">{t("student_progress")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  <TableCellSkeleton />
                </td>
              </tr>
            ) : enrolledStudents.length > 0 ? (
              enrolledStudents.map((student) => (
                <tr
                  key={student?.id}
                  className="border-b borderColor last:border-b-0"
                >
                  <td className="py-4 px-6 w-10">{student?.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden">
                        <CustomImageTag
                          src={student?.profile}
                          alt={student?.name || "Student"}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{student?.name || "-"}</div>
                        <div className="text-sm">
                          {t("email")} -{" "}
                          <span className="primaryColor font-medium">
                            {student?.email || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {student?.enrolled_at}
                  </td>
                  <td className="py-4 px-6">
                    <CircularProgress value={student?.progress_percentage} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  <DataNotFound />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* mobile view  */}
      <div className="block md:hidden">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-4">
              <TableCellSkeleton />
            </div>
          ) : enrolledStudents.length > 0 ? (
            enrolledStudents.map((student, index) => (
              <div key={student?.id} className="p-4 bg-white border-b borderColor last:border-b-0">
                <div className="space-y-4">
                  {/* Index Number */}
                  <div className="text-gray-900 font-medium text-sm">
                    {index + 1}
                  </div>

                  {/* Student Header */}
                  <div className="flex items-center gap-3 pb-4 border-b borderColor">
                    {/* Avatar/Image */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                      <CustomImageTag
                        src={student?.profile}
                        alt={student?.name || "Student"}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {student?.name || "-"}
                      </h3>
                      <p className="text-sm text-[#4F547B]">
                        {t("email")} - <span className="primaryColor font-medium">{student?.email || "-"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-4">
                    {/* Enrollment Date */}
                    <div className="flex justify-between items-center pb-4 border-b borderColor">
                      <span className="font-semibold text-gray-900">{t("enrollment_date")}:</span>
                      <span className="text-[#4F547B]">
                        {student?.enrolled_at}
                      </span>
                    </div>

                    {/* Student Progress */}
                    <div className="flex justify-between items-center pb-2">
                      <span className="font-semibold text-gray-900">{t("student_progress")}:</span>
                      <div className="flex items-center">
                        <CircularProgress value={student?.progress_percentage} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <DataNotFound />
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="p-4 border-t borderColor">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalStudents}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageSelectChange}
            showResultText={true}
          />
        </div>
      )}
    </Card>
  );
};

export default StudentEnrolled;

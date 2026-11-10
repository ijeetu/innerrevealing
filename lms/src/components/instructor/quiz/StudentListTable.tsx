'use client'
import { Button } from '@/components/ui/button'
import React from 'react'
import { BiCheck, BiX } from 'react-icons/bi'
import { Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StudentPerformanceType } from '@/utils/api/instructor/quiz/getQuizReportDetails'
import TableCellSkeleton from '@/components/skeletons/instrutor/TableCellSkeleton'
import DataNotFound from '@/components/commonComp/DataNotFound'
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag'
import { useTranslation } from '@/hooks/useTranslation'


interface StudentListTableProps {
    studentAttempts: StudentPerformanceType[];
    handleViewResult: (student: StudentPerformanceType) => void;
    isLoading: boolean;
}

const StudentListTable = ({ studentAttempts, handleViewResult, isLoading }: StudentListTableProps) => {

    const { t } = useTranslation();

    return (
        <div>
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                    {/* Table header */}
                    <thead className="sectionBg">
                        <tr>
                            <th className="px-4 py-3 text-start w-12 font-medium text-sm">
                                #
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("player_name")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("total_attempts")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("correct_answer")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("incorrect_answer")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("earned_points")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("pass_fail")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("last_attempt_date")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">
                                {t("action")}
                            </th>
                        </tr>
                    </thead>

                    {/* Table body */}
                    <tbody>
                        {
                            isLoading ? (
                                <tr>
                                    <td colSpan={9} className="text-center p-4">
                                        <TableCellSkeleton />
                                    </td>
                                </tr>
                            ) :
                                studentAttempts.length > 0 ?
                                    studentAttempts.map((student) => (
                                        <tr key={student.user_id} className="border-t border-gray-200">
                                            <td className="px-4 py-4 text-sm">{student.user_id}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <CustomImageTag
                                                        src={student.player_image}
                                                        alt={student.player_name}
                                                        className="w-10 h-10 rounded-md me-3"
                                                    />
                                                    <div>
                                                        <div className="font-semibold">{student.player_name}</div>
                                                        <div className="text-sm">
                                                            {t("email")} -{" "}
                                                            <span className="primaryColor font-medium">
                                                                {student.player_email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm">{student.total_attempts}</td>
                                            <td className="px-4 py-4 text-sm">{student.correct_answers}</td>
                                            <td className="px-4 py-4 text-sm">
                                                {student.incorrect_answers}
                                            </td>
                                            <td className="px-4 py-4 text-sm">{Math.round(student.earned_points || 0) || "-"}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-sm `}
                                                >
                                                    {student.pass_fail === "Pass" && (
                                                        <>
                                                            <BiCheck className="text-white bg-green-500 rounded-full w-3 h-3 me-1" />
                                                            {student.pass_fail}
                                                        </>
                                                    )}
                                                    {student.pass_fail === "Fail" && (
                                                        <>
                                                            <BiX className="text-white bg-red-500 rounded-full w-3 h-3 me-1" />
                                                            {student.pass_fail}
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm">{student.last_attempt_date}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <Button
                                                    size="sm"
                                                    className="commonBtn primaryBg hover:!hoverBgColor"
                                                    onClick={() => handleViewResult(student)}
                                                >
                                                    <Eye className="me-1 h-4 w-4" />
                                                    {t("view_results")}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr>
                                        <td colSpan={9} className="text-center p-4">
                                            <DataNotFound />
                                        </td>
                                    </tr>
                        }
                    </tbody>
                </table>
            </div>

            {/* Mobile view of student attempts - card based layout */}
            <div className="md:hidden space-y-4 mb-6">
                {isLoading ? (
                    <TableCellSkeleton />
                ) : studentAttempts.length === 0 ? (
                    <DataNotFound />
                ) : studentAttempts.map((student, index) => (
                    <Card key={student.user_id} className="p-4 rounded-none">
                        {/* User identification section */}
                        <div className="flex items-start mb-4">
                            {/* Number indicator */}
                            <span className="text-lg font-bold text-gray-600 me-3">{index + 1}</span>

                            {/* Avatar placeholder */}
                            <div className="">
                                <CustomImageTag
                                    src={student.player_image}
                                    alt={student.player_name}
                                    className="w-10 h-10 rounded-md me-3"
                                />
                            </div>

                            {/* User info */}
                            <div className="flex-1">
                                <h3 className="font-semibold text-base">{student.player_name}</h3>
                                <p className="text-sm text-gray-500">
                                    {t("email")} -{" "}
                                    <span className="text-[var(--primary-color)]">
                                        {student.player_email}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Statistics section */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">{t("total_attempts")}</span>
                                <span className="font-semibold">{student.total_attempts}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">{t("correct_answer")}</span>
                                <span className="font-semibold">{student.correct_answers}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">{t("incorrect_answer")}</span>
                                <span className="font-semibold">{student.incorrect_answers}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">{t("earned_points")}</span>
                                <span className="font-semibold">{student.earned_points || "-"}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">{t("pass_fail")}</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-sm">
                                    {student.pass_fail === "Pass" && (
                                        <>
                                            <BiCheck className="text-white bg-green-500 rounded-full w-3 h-3 me-1" />
                                            {student.pass_fail}
                                        </>
                                    )}
                                    {student.pass_fail === "Fail" && (
                                        <>
                                            <BiX className="text-white bg-red-500 rounded-full w-3 h-3 me-1" />
                                            {student.pass_fail}
                                        </>
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600">{t("last_attempt_date")}</span>
                                <span className="font-semibold">{student.last_attempt_date}</span>
                            </div>
                        </div>

                        {/* View Result button */}
                        <Button
                            size="sm"
                            className="w-full primaryBg text-white"
                            onClick={() => handleViewResult(student)}
                        >
                            <Eye className="me-2 h-4 w-4" />
                            {t("view_results")}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default StudentListTable

'use client'
import React from 'react'
import { BiLinkExternal } from 'react-icons/bi'
import { AssignmentSubmissionDataType } from '@/utils/api/instructor/assignment/getAssignmentSubmissions'
import Link from 'next/link'
import TableCellSkeleton from '@/components/skeletons/instrutor/TableCellSkeleton'
import DataNotFound from '@/components/commonComp/DataNotFound'
import EditAssignmentSubmission from './EditAssignmentSubmission'
import { useTranslation } from '@/hooks/useTranslation'
import { formatDate } from '@/utils/helpers';

interface AssignmentViewTableProps {
  students: AssignmentSubmissionDataType[];
  isLoading?: boolean;
  assignmentName?: string;
  setIsSubmissionUpdated?: (isSubmissionUpdated: boolean) => void;
}

const AssignmentViewTable = ({ students, isLoading, assignmentName, setIsSubmissionUpdated }: AssignmentViewTableProps) => {

  const { t } = useTranslation();

  return (
    <>
      <div className="overflow-x-auto hidden md:block customScrollbar bg-white w-full">
        <table className="min-w-full">
          <thead className="sectionBg border-y borderColor">
            <tr className="border-b borderColor">
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">#</th>
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">
                {t("student_name")}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">{t("files")}</th>
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">
                {t("submitted_date")}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">
                {t("status")}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">
                {t("earned_points")}
              </th>
              {/* <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">
                {t("Comments")}
              </th> */}
              <th className="py-3 px-4 text-left text-sm font-semibold whitespace-nowrap">
                {t("action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  <TableCellSkeleton />
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map((submission) => (
                <tr key={submission.id} className="border-b borderColor last:border-b-0">
                  <td className="py-4 px-4">{submission.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-400 rounded mr-3 overflow-hidden">
                        {submission.user.profile && (
                          <img
                            src={submission.user.profile}
                            alt={submission.user.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{submission.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {t("email")} -{" "}
                          <span className="text-[var(--primary-color)]">
                            {submission.user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {submission.files && submission.files.length > 0 ? (
                      <div className="space-y-1">
                        {submission.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.type === 'file' ? file.file! : file.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0186D8] flex items-center text-sm hover:underline"
                          >
                            <BiLinkExternal size={16} className="mr-1 shrink-0" />
                            {file.file.split('/').pop()}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {submission.submitted_at ? formatDate(submission.submitted_at) : '-'}
                  </td>
                  <td className="py-4 px-1 ">
                    <span
                      className={`px-2 py-1 rounded-[5px] w-full text-center text-xs font-medium capitalize ${submission.status === 'accepted'
                        ? 'bg-[#83B8071F] text-[#83B807]'
                        : submission.status === 'rejected'
                          ? 'bg-[#FF00001F] text-[#FF0000]'
                          : submission.status === 'submitted'
                            ? 'bg-[#6F42C11F] text-[#6F42C1]'
                            : 'bg-[#0186D81F] text-[#0186D8]'
                        }`}
                    >
                      {t(submission.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{Number(submission.points).toFixed(0) || '-'}</td>
                  {/* <td className="py-4 px-4">{submission.comment || '-'}</td> */}
                  <td className="py-4 px-4">
                    <EditAssignmentSubmission assignmentName={assignmentName || ''} submissionData={submission} setIsSubmissionUpdated={setIsSubmissionUpdated || (() => { })} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <DataNotFound />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* mobile view  */}
      <div className="block md:hidden mt-1 border-t borderColor">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="p-4 text-center">
              <TableCellSkeleton />
            </div>
          ) : students.length > 0 ? (
            students.map((submission) => (
              <div key={submission.id} className="border-b border-gray-200 p-4">
                {/* Student Header */}
                <div className="flex items-start justify-between mb-4">
                  {/* Left side with index and student info */}
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center justify-between w-full ">
                      {/* Index Number */}
                      <div className="flex-shrink-0 w-6 font-medium">
                        {submission.id}
                      </div>
                      {/* Edit Icon */}
                      <EditAssignmentSubmission assignmentName={assignmentName || ''} submissionData={submission} setIsSubmissionUpdated={setIsSubmissionUpdated || (() => { })} />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded overflow-hidden">
                        {submission.user.profile && (
                          <img
                            src={submission.user.profile}
                            alt={submission.user.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold">
                          {submission.user.name}
                        </h3>
                        <p className="text-sm">
                          {t("email")} - <span className="primaryColor">{submission.user.email}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Information */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 text-sm break-all border-b border-gray-200">
                    <span className="font-semibold mr-2">{t("files")}:</span>
                    <div className="space-y-1">
                      {submission.files && submission.files.length > 0 ? (
                        submission.files.map((file) => (
                          <Link
                            key={file.id}
                            href={file.type === 'file' ? file.file! : file.url!}
                            target="_blank"
                            className="text-[#0186D8] flex items-center text-sm hover:underline"
                          >
                            <BiLinkExternal size={14} className="mr-1 shrink-0" />
                            {file.file.split('/').pop()}
                          </Link>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Details - Two Column Layout */}
                <div className="space-y-3 mt-1">
                  {/* Submission Date */}
                  <div className="grid grid-cols-2 text-sm break-all border-b border-gray-200 pb-3">
                    <span className="font-semibold">{t("submitted_date")}:</span>
                    <span className="text-gray-900">{submission.submitted_at ? formatDate(submission.submitted_at) : '-'}</span>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-2 text-sm break-all border-b border-gray-200 pb-3">
                    <span className="font-semibold">{t("status")}:</span>
                    <span
                      className={`w-max px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'accepted'
                        ? 'bg-[#83B8071F] text-[#83B807]'
                        : submission.status === 'rejected'
                          ? 'bg-[#FF00001F] text-[#FF0000]'
                          : submission.status === 'submitted'
                            ? 'bg-[#6F42C11F] text-[#6F42C1]'
                            : 'bg-[#0186D81F] text-[#0186D8]'
                        }`}
                    >
                      {t(submission.status)}
                    </span>
                  </div>

                  {/* Earned Points */}
                  <div className="grid grid-cols-2 text-sm break-all">
                    <span className="font-semibold">{t("earned_points")}:</span>
                    <span className="text-gray-900">{Number(submission.points).toFixed(0) || '-'}</span>
                  </div>

                  {/* Comment */}
                  {/* {submission.comment && (
                    <div className="grid grid-cols-2 text-sm break-all border-b border-gray-200 pb-3">
                      <span className="font-semibold">{t("comment")}:</span>
                      <span className="text-gray-900">{submission.comment}</span>
                    </div>
                  )} */}
                </div>
              </div>
            ))
          ) : (
            <DataNotFound />
          )}
        </div>
      </div>
    </>
  )
}

export default AssignmentViewTable

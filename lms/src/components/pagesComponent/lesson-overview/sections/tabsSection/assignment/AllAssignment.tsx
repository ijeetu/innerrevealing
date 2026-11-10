"use client"
import React, { useState } from 'react'
import { FaDownload, FaCaretDown, FaCaretUp, FaCheck, FaFileAlt, FaTimes } from 'react-icons/fa'
import { RiDownload2Line } from "react-icons/ri";
import AddAssignmentModal from './AddAssignmentModal';
import { ChapterWithAssignments } from '@/utils/api/user/lesson-overview/assignment/getAssignments';
import DataNotFound from '@/components/commonComp/DataNotFound';
import { handleDownload } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { PiPencilSimpleLineLight } from "react-icons/pi";
import { PiLockKey } from "react-icons/pi";
import { useSelector } from 'react-redux';
import { selectedCurriculumItemSelector } from '@/redux/reducers/helpersReducer';

interface AllAssignmentProps {
    chapters?: ChapterWithAssignments[];
    onAssignmentSubmitted?: () => void; // Callback to refresh data after assignment submission
    isSequentialAccess: boolean;
}

const AllAssignment: React.FC<AllAssignmentProps> = ({ chapters, onAssignmentSubmitted, isSequentialAccess }) => {

    const { t } = useTranslation();
    const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);

    const [showFullDescription, setShowFullDescription] = useState(false);
    // Track expanded state for each assignment individually
    const [expandedAssignments, setExpandedAssignments] = useState<{ [key: string]: boolean }>({});

    // edit assignment state - stores submission details when user wants to edit a rejected submission
    const [editAssignmentSubmission, setEditAssignmentSubmission] = useState<{ submissionId: number; assignmentId: number; title: string } | null>(null);

    const toggleAssignment = (assignmentId: number) => {
        setExpandedAssignments(prev => ({
            ...prev,
            [assignmentId]: !prev[assignmentId]
        }));
    };

    if (!chapters || chapters?.length === 0) {
        return <DataNotFound />
    }

    console.log("assignment", chapters.map(c => c.assignments))

    return (
        <div className='flex flex-col gap-4'>
            {chapters?.map((chapter, index) => (
                <div key={index} className="p-4 sectionBg rounded-[8px]">
                    <div className='flex flex-col gap-4 mb-4'>
                        <div>
                            <h1>{index + 1}. {chapter.chapter_title}</h1>
                        </div>
                    </div>

                    {/* Assignment Header */}
                    {chapter.assignments.map((assignment, index) => {
                        const isSkipped = assignment.is_skip === 0;
                        const hasSubmissions = assignment.submissions && assignment.submissions.some(s => s.status === 'submitted');
                        const isLocked = isSequentialAccess && selectedCurriculumItem && selectedCurriculumItem?.id !== assignment.id && !hasSubmissions && isSkipped;

                        return (
                            <div key={index} className="bg-white rounded-[8px] overflow-hidden mb-4 p-4">
                                <div className={`flex flex-row justify-between items-center ${isLocked ? "cursor-default" : "cursor-pointer"} md:gap-y-0 gap-y-4`} onClick={() => !isLocked && toggleAssignment(assignment.id)}>
                                    <div className="flex flex-row items-center gap-4">
                                        <div className="w-10 h-10 bg-black text-white rounded-[8px] flex items-center justify-center font-medium text-sm shrink-0">
                                            {`0${index + 1}`}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm font-semibold">{assignment.title}</p>
                                            <p className="text-sm text-gray-500">{assignment.points} {t("points")}</p>
                                        </div>
                                    </div>

                                    <div className="text-right text-sm">
                                        <div className="text-xs sm:text-base flex items-center gap-2">
                                            <span className="cursor-pointer sectionBg p-1 rounded-[4px]">
                                                {expandedAssignments[assignment.id] ? (
                                                    <FaCaretUp className="text-black" />
                                                ) : (
                                                    <FaCaretDown className="text-black" />
                                                )}
                                            </span>

                                            {isLocked && (
                                                <PiLockKey className="w-[24px] h-[24px] shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Assignment Details - only show when expanded */}
                                {!isLocked && expandedAssignments[assignment.id] && (
                                    <>
                                        {/* Assignment Description */}
                                        <div className="my-4">
                                            <p className={`text-sm text-gray-700 ${showFullDescription ? "line-clamp-none" : "line-clamp-4"}`}>
                                                {assignment.description}
                                            </p>
                                            {assignment.description.length > 150 && (
                                                <button
                                                    className="primaryColor text-sm mt-2 flex items-center"
                                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                                >
                                                    {showFullDescription ? "- Read Less" : "+ Read More"}
                                                </button>
                                            )}
                                        </div>

                                        {/* Assignment Attachment */}
                                        <div className="mb-6">
                                            <h3 className="font-semibold text-base mb-3">{t("assignment_attachment")}</h3>
                                            {assignment.media_url && (
                                                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between sectionBg">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            onClick={() => handleDownload(assignment.media_url)}
                                                            className="w-10 h-10 shrink-0 bg-[#83B807] text-white rounded flex items-center justify-center cursor-pointer">
                                                            <RiDownload2Line />
                                                        </div>
                                                        <span className="text-sm break-all cursor-pointer" onClick={() => handleDownload(assignment.media_url)}>{assignment.media_url.split('/').pop()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* My Assignments Section */}
                                        <div className="mb-6 bg-[#F8FAFC] rounded-[8px]">
                                            {assignment.submissions.length > 0 ? (
                                                <div className="border borderColor rounded-lg overflow-hidden">
                                                    {/* Submitted Files Section */}
                                                    <div className="bg-white">
                                                        <div className="p-4 border-b border-gray-200 sectionBg">
                                                            <h3 className="font-medium text-base text-gray-900">{t("my_assignments")}</h3>
                                                        </div>
                                                        {assignment.submissions.map((submission, index) => (
                                                            <div key={index} className="p-4">
                                                                <div className="flex items-center justify-between p-3 border borderColor rounded-lg mb-4 max-[475px]:gap-2 max-[475px]:flex-col max-[475px]:items-start">
                                                                    <div className="flex items-center gap-1 max-[370px]:items-start">
                                                                        {/* File Icon */}
                                                                        <div className="w-6 h-8 rounded flex items-center justify-center ">
                                                                            <FaFileAlt className="w-4 h-4 text-gray-600" />
                                                                        </div>
                                                                        {/* File Name */}
                                                                        <div className='flex gap-3 max-[380px]:flex-col max-[380px]:gap-0.5'>
                                                                            <span className="text-sm font-medium text-gray-900 break-all">
                                                                                {submission.file_name || `Assignment_${submission.id}`}
                                                                            </span>

                                                                            {/* Assignment Status */}
                                                                            <div className="flex items-center gap-1">
                                                                                {/* Status Dot */}
                                                                                <span
                                                                                    className={`
                                                                                w-1 h-1 rounded-full
                                                                                ${submission.status === 'submitted' && 'bg-blue-500'}
                                                                                ${submission.status === 'rejected' && 'bg-red-500'}
                                                                                ${submission.status === 'accepted' && 'bg-green-500'}
                                                                                `}
                                                                                ></span>

                                                                                {/* Status Text */}
                                                                                <span
                                                                                    className={`
                                                                                text-[14px] capitalize
                                                                                ${submission.status === 'submitted' && 'text-blue-500'}
                                                                                ${submission.status === 'rejected' && 'text-red-600'}
                                                                                ${submission.status === 'accepted' && 'text-green-600'}
                                                                            `}
                                                                                >
                                                                                    {submission.status === "submitted" ? "In Review" : submission.status}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Action Buttons */}
                                                                    {submission.status === 'accepted' ? (
                                                                        null
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 rounded-[4px] py-1 px-2">
                                                                            <PiPencilSimpleLineLight
                                                                                className="p-1 text-black font-normal w-[25px] h-[25px]"
                                                                                title="Edit submission"
                                                                                onClick={() => setEditAssignmentSubmission({
                                                                                    submissionId: submission.id,
                                                                                    assignmentId: assignment.id,
                                                                                    title: submission.comment || ''
                                                                                })}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Success Message with Feedback */}
                                                                {submission.status === "accepted" ? (
                                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                                        <div className="flex md:items-center items-start gap-3">
                                                                            {/* Success Icon */}
                                                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                                <FaCheck className="w-3 h-3 text-white" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h4 className="font-normal text-base text-black mb-1">
                                                                                    {t("congratulations_your_assignment_has_been_approved")}
                                                                                </h4>
                                                                                <div className="mt-2 flex md:flex-row flex-col gap-1">
                                                                                    <p className="font-semibold text-base text-gray-800 mb-1">{t("feedback")}:</p>
                                                                                    <p className="text-sm text-black">
                                                                                        {submission?.feedback}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : submission.status === "rejected" ? (
                                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                                        <div className="flex md:items-center items-start gap-3">
                                                                            {/* Rejected Icon */}
                                                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                                <FaTimes className="w-3 h-3 text-white" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h4 className="font-normal text-base text-black mb-1">
                                                                                    {t("your_assignment_rejected")}
                                                                                </h4>
                                                                                <div className="mt-2 flex md:flex-row flex-col gap-1">
                                                                                    <p className="font-semibold text-base text-gray-800 mb-1">
                                                                                        {t("feedback")} :
                                                                                    </p>
                                                                                    <p className="text-sm text-black">
                                                                                        {submission?.feedback}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    null
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            ) : (
                                                <div>
                                                    <div className="p-4 border-b border-gray-200 sectionBg">
                                                        <h3 className="font-medium text-base text-gray-900">{t("my_assignments")}</h3>
                                                    </div>
                                                    <div className=" p-8 text-center">

                                                        <h4 className="font-medium text-base mb-2">{t("no_assignments_submitted_yet")}</h4>
                                                        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                                                            {t("start_completing_your_assignments")}
                                                        </p>
                                                        <AddAssignmentModal assignmentId={assignment.id} onAssignmentSubmitted={onAssignmentSubmitted} allowedFileTypes={assignment.allowed_file_types} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
            {/* Edit Assignment Modal - Opens when user clicks Re-submit on a rejected submission */}
            {editAssignmentSubmission?.submissionId && (
                <AddAssignmentModal
                    submissionId={editAssignmentSubmission.submissionId}
                    assignmentId={editAssignmentSubmission.assignmentId}
                    existingTitle={editAssignmentSubmission.title}
                    isEdit={true}
                    openFromParent={true}
                    onAssignmentSubmitted={() => {
                        setEditAssignmentSubmission(null);
                        if (onAssignmentSubmitted) onAssignmentSubmitted();
                    }}
                    onCloseModal={() => setEditAssignmentSubmission(null)}
                />
            )}
        </div>
    )
}

export default AllAssignment


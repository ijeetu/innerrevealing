'use client'
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FiEdit } from 'react-icons/fi';
import { editAssignmentSubmission, EditAssignmentSubmissionParams } from '@/utils/api/instructor/assignment/editAssignmentSubmission';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import { AssignmentSubmissionDataType } from '@/utils/api/instructor/assignment/getAssignmentSubmissions';
import { useTranslation } from '@/hooks/useTranslation';

interface EditAssignmentSubmissionProps {
    assignmentName: string;
    submissionData: AssignmentSubmissionDataType;
    setIsSubmissionUpdated: (isSubmissionUpdated: boolean) => void;
}

const EditAssignmentSubmission = ({ assignmentName, submissionData, setIsSubmissionUpdated }: EditAssignmentSubmissionProps) => {

    const { t } = useTranslation();

    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        assignmentStatus: '',
        assignmentPoints: '',
        feedback: ''
    })

    const totalPoints = Number(submissionData?.assignment?.points);

    const isSubmissionDone = submissionData?.status === 'accepted' || submissionData?.status === 'rejected'

    useEffect(() => {
        if (isSubmissionDone) {
            setFormData({
                assignmentStatus: submissionData?.status,
                assignmentPoints: Number(submissionData?.points).toFixed(0),
                feedback: submissionData?.feedback || ''
            })
        }
    }, [submissionData])

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            // Validate form data
            if (!formData.assignmentStatus) {
                toast.error(t("please_select_assignment_status"));
                return;
            }

            if (formData.assignmentStatus !== 'rejected') {
                if (!formData.assignmentPoints) {
                    toast.error(t("please_enter_assignment_points"));
                    return;
                }
                if (Number(formData.assignmentPoints) > Number(totalPoints.toFixed(0))) {
                    toast.error(t("assignment_points_cannot_be_greater_than_assignment_points"));
                    return;
                }
            }

            if (!formData.feedback) {
                toast.error(t("please_provide_feedback"));
                return;
            }

            // Prepare API parameters
            const apiParams: EditAssignmentSubmissionParams = {
                submission_id: submissionData?.id,
                status: formData.assignmentStatus.toLowerCase() as 'accepted' | 'rejected',
                feedback: formData.feedback,
                points: formData.assignmentStatus === 'rejected' ? 0 : parseFloat(formData.assignmentPoints)
            };

            // Call the API
            const response = await editAssignmentSubmission(apiParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    toast.success(response.message || 'Assignment submission updated successfully!');
                    setIsSubmissionUpdated(true)
                    setIsOpen(false);
                    // Reset form data
                    setFormData({
                        assignmentStatus: '',
                        assignmentPoints: '',
                        feedback: ''
                    });
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to update assignment submission");
                }
            } else {
                console.log("response is null in component", response);
                toast.error("Failed to update assignment submission");
            }
        } catch (error) {
            extractErrorMessage(error);
            toast.error("An unexpected error occurred while updating the assignment submission");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button
                        className="bg-[var(--primary-color)] text-white p-2 rounded flex-shrink-0 hover:opacity-80 transition-opacity"
                        onClick={() => setIsOpen(true)}
                    >
                        <FiEdit className="w-4 h-4" />
                    </button>
                </DialogTrigger>
                <DialogContent className="w-[95%] sm:max-w-[50%] max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold break-words">
                            {t("edit_assignment_submission")}
                        </DialogTitle>
                        <p className="text-base mt-1 break-words">
                            {assignmentName}
                        </p>
                    </DialogHeader>

                    {/* divider */}
                    <hr className="bg-gray-100" />
                    <div className="pb-4">
                        {/* Assignment Status */}
                        <div className="mb-5">
                            <div className="flex items-center">
                                <span className="text-base font-medium">{t("assignment_status")}</span>
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <div className="flex mt-2 gap-4 flex-wrap w-full">
                                <RadioGroup
                                    value={formData.assignmentStatus}
                                    onValueChange={(value) => setFormData({ ...formData, assignmentStatus: value })}
                                    className="flex flex-col sm:flex-row flex-wrap gap-4 w-full"
                                >
                                    <div className="flex items-center space-x-2 py-2 px-4 ring-1 ring-gray-300 rounded w-full sm:w-40 flex-1">
                                        <RadioGroupItem
                                            value="accepted"
                                            id="accept"
                                            className="h-5 w-5 text-black border-2 border-gray-400 data-[state=checked]:primaryBorder data-[state=checked]:bg-white data-[state=checked]:primaryColor"
                                        />
                                        <Label htmlFor="accept" className="cursor-pointer">
                                            {t("accept")}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 py-2 px-4 ring-1 ring-gray-300 rounded w-full sm:w-40 flex-1">
                                        <RadioGroupItem
                                            value="rejected"
                                            id="reject"
                                            className="h-5 w-5 text-black border-2 border-gray-400 data-[state=checked]:primaryBorder data-[state=checked]:bg-white data-[state=checked]:primaryColor"
                                        />
                                        <Label htmlFor="reject" className="cursor-pointer">
                                            {t("reject")}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {/* Assignment Points */}
                        <div className="mb-5">
                            <div className="flex items-center">
                                <span className="text-base font-medium">{t("assignment_points")}</span>
                                {formData.assignmentStatus !== 'rejected' && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <Input
                                placeholder="e.g. 70"
                                className={`mt-2 ${formData.assignmentStatus === 'rejected' ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'sectionBg'} w-full`}
                                value={formData.assignmentStatus === 'rejected' ? '' : (formData.assignmentPoints || '')}
                                onChange={(e) => setFormData({ ...formData, assignmentPoints: e.target.value })}
                                disabled={formData.assignmentStatus === 'rejected'}
                            />
                        </div>

                        {/* Feedback */}
                        <div className="mb-1">
                            <div className="flex items-center">
                                <span className="text-base font-medium">{t("feedback")}</span>
                                <span className="text-red-500 ml-1">*</span>
                            </div>
                            <Textarea
                                placeholder={t("write_assignment_feedback_here")}
                                className="mt-2 sectionBg w-full break-all"
                                value={formData.feedback || ''}
                                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                maxLength={150}
                            />
                            <div className="text-sm text-gray-500 mt-1 flex justify-end">
                                {t("max_150_characters_allowed")}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-2 flex-col sm:flex-row">
                        <Button variant="default" onClick={() => setIsOpen(false)} className='bg-transparent text-black hover:bg-transparent'>
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="primaryBg text-white hover:opacity-80 disabled:opacity-50 hover:hoverBgColor"
                        >
                            {isLoading ? t("updating") + "..." : t("submit")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default EditAssignmentSubmission

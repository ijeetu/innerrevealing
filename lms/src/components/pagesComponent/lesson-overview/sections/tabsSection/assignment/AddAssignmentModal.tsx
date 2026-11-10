'use client'
import React, { useEffect, useRef, useState } from 'react'
import { FiPlusCircle, FiUploadCloud, FiX } from 'react-icons/fi'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { submitAssignment } from '@/utils/api/user/lesson-overview/assignment/assignmentSubmit';
import { setIsCurriculumItemCompleted } from '@/redux/reducers/helpersReducer';
import { editAssignmentSubmission } from '@/utils/api/user/lesson-overview/assignment/editAssignment';
import { useTranslation } from '@/hooks/useTranslation';
import { allowedDocTypes, allowedVideoTypes } from '@/utils/helpers';

interface AddAssignmentModalProps {
    submissionId?: number;
    assignmentId?: number;
    onAssignmentSubmitted?: () => void; // Callback to refresh data after submission
    isEdit?: boolean;
    existingTitle?: string;
    openFromParent?: boolean; // allow parent to open modal
    onCloseModal?: () => void;
    allowedFileTypes?: string[];
}

// validation schema using zod
// For new submissions: assignment_id, comment, and files are required
// For edit submissions: only comment and files are required (assignment_id comes from existing submission)
const assignmentFormSchema = (isEdit: boolean) => z.object({
    assignment_id: isEdit ? z.number().optional() : z.number().min(1, "Assignment ID is required"),
    comment: z.string().min(1, "Assignment title is required").max(1000, "Comment must be less than 1000 characters"),
    files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
});

// type for form errors
type FormErrors = {
    assignment_id?: string;
    comment?: string;
    files?: string;
};

const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
    submissionId,
    assignmentId,
    onAssignmentSubmitted,
    isEdit = false,
    existingTitle,
    openFromParent = false,
    onCloseModal,
    allowedFileTypes,
}) => {

    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [assignmentTitle, setAssignmentTitle] = useState(existingTitle || '');


    const { t } = useTranslation();

    // reset the input type file 
    const fileInputRef = useRef<HTMLInputElement>(null);


    // open modal when the parent tiggers it
    useEffect(() => {
        if (openFromParent) {
            setIsOpen(true);
        }
    }, [openFromParent]);

    // reset all fields when modal closes
    useEffect(() => {
        if (!isOpen) {
            setAssignmentTitle(existingTitle || '');
            setFiles([]);
            setErrors({});
            setIsDragging(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen, existingTitle]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(prev => [...prev, ...newFiles]);

            // Clear file error
            if (errors.files) {
                setErrors(prev => ({ ...prev, files: undefined }));
            }
        }
    };

    // For comment input
    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAssignmentTitle(e.target.value);

        // Clear comment error instantly when user types
        if (errors.comment) {
            setErrors(prev => ({ ...prev, comment: undefined }));
        }
    };

    // For file input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            // Clear file error when a file is selected
            if (errors.files) {
                setErrors(prev => ({ ...prev, files: undefined }));
            }

            // Reset input value to allow selecting the same file again
            e.target.value = "";
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getAcceptType = () => {
        if (allowedFileTypes?.includes("image")) return "image/*";
        if (allowedFileTypes?.includes("audio")) return "audio/*";
        if (allowedFileTypes?.includes("video")) return allowedVideoTypes?.join(",");
        if (allowedFileTypes?.includes("document")) return allowedDocTypes?.join(",");
        return "";
    };

    // Validate form using Zod
    // Different validation rules for new submissions vs editing existing submissions
    const validateForm = () => {
        const dataToValidate = {
            assignment_id: assignmentId,
            comment: assignmentTitle,
            files: files,
        };

        try {
            // Use different schema based on edit mode
            assignmentFormSchema(isEdit).parse(dataToValidate);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {};
                error.errors.forEach(err => {
                    const field = err.path[0] as keyof FormErrors;
                    newErrors[field] = err.message;
                });
                setErrors(newErrors);
            }
            toast.error("Please fix the validation errors before submitting");
            return false;
        }
    };

    const handleUpload = async () => {
        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            let response;
            // If editing (re-submitting a rejected assignment), use edit API
            // Otherwise, use the submit API for new submissions
            if (isEdit && submissionId) {
                // Call edit API when submission status is rejected and user wants to re-submit
                response = await editAssignmentSubmission({
                    id: submissionId,
                    files: files,
                    comment: assignmentTitle,
                });
            } else {
                // Call submit API for new assignment submissions
                response = await submitAssignment({
                    assignment_id: assignmentId || 0,
                    files: files,
                    comment: assignmentTitle,
                });
            }

            if (response?.error) {
                // remove this if you wnat to show the modal after the error
                toast.error(response.message || "Failed to submit assignment")
                setIsOpen(false)
                setAssignmentTitle('')
                setFiles([])
                setErrors({})
                if (fileInputRef.current) fileInputRef.current.value = "";
                return
            }

            toast.success(response?.message || "Assignment submitted successfully")
            dispatch(setIsCurriculumItemCompleted({ completed: true }));
            setIsOpen(false)
            setAssignmentTitle('')
            setFiles([])
            setErrors({})

            // Call the callback to refresh assignment data
            if (onAssignmentSubmitted) {
                onAssignmentSubmitted();
            }

        } catch (error) {
            console.error("Error in handleUpload:", error)
            toast.error("Failed to submit assignment")
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open && onCloseModal) {
                onCloseModal(); // tell parent modal is closed
            }
        }}>
            {!openFromParent && (
                <DialogTrigger asChild>
                    <button className="border borderColor rounded-md py-2 px-4 flex items-center gap-2 mx-auto" onClick={() => setIsOpen(true)}>
                        <FiPlusCircle size={14} />
                        <span className="text-sm">{t("add_assignment")}</span>
                    </button>
                </DialogTrigger>
            )}
            <DialogContent className="bg-white rounded-md p-0 max-w-md w-full">
                <DialogHeader className='hidden'>
                    <DialogTitle>{isEdit ? "Edit Assignment" : "Upload Assignment"}</DialogTitle>
                </DialogHeader>
                <div className="p-5 relative">
                    {/* Title and close button */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium">{isEdit ? "Edit Assignment" : "Upload Assignment"}</h2>
                    </div>

                    {/* Form content */}
                    <div className="py-5">
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium">{t("assignment_title")}</label>
                            <input
                                type="text"
                                placeholder="Enter Text..."
                                value={assignmentTitle}
                                onChange={handleCommentChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1"
                            />
                            {errors.comment && <p className="text-sm text-red-500 mt-1">{errors.comment}</p>}
                        </div>

                        {/* File upload area */}
                        <div
                            className={`border-2 border-dashed ${isDragging ? 'borderPrimary bg-blue-50' : 'border-gray-300'
                                } rounded-md p-6 flex flex-col items-center justify-center cursor-pointer`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className="mb-3 p-3 bg-gray-100 rounded-full">
                                <FiUploadCloud className="text-gray-500 text-2xl" />
                            </div>

                            {files.length > 0 ? (
                                <div className="w-full mb-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1 border border-gray-100">
                                            <span className="text-sm truncate flex-1 text-left">{file.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(index);
                                                }}
                                                className="text-red-500 hover:text-red-700 ml-2 p-1"
                                                type="button"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center mb-2">{t("choose_a_file_or_drag_and_drop_it_here")}</p>
                            )}

                            <p className="text-sm text-gray-500 mb-3">or</p>

                            <label className="cursor-pointer">
                                <span className="px-4 py-2 border borderPrimary rounded-md text-sm primaryColor hover:bg-gray-50">
                                    {t("choose_file")}
                                </span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={getAcceptType()}
                                    multiple
                                />
                            </label>
                        </div>
                        {errors.files && <p className="text-sm text-red-500 mt-2">{errors.files}</p>}
                    </div>

                    {/* Upload button */}
                    <button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className="commonBtn w-full"
                    >
                        {isLoading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddAssignmentModal

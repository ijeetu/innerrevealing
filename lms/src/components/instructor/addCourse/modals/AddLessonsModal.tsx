'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { createdCourseIdSelector, setIsLessonAddedOnce } from '@/redux/reducers/helpersReducer'
import { createCourseChapter } from '@/utils/api/instructor/createCourseApis/create-course/createChapters'
import { setIsLessonAdded } from '@/redux/instructorReducers/AddCourseSlice';
import { updateCourseChapter } from '@/utils/api/instructor/editCourse/editChapter';
import { FaPlus } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

// Define Zod schema for lesson validation
const lessonSchema = z.object({
    lessonTitle: z.string().min(1, "Lesson title is required").max(100, "Title must be less than 100 characters"),
});

// Define a type for form errors
type FormErrors = {
    lessonTitle?: string;
};

interface AddLessonsModalProps {
    editLesson: {
        isEditLesson: boolean;
        lessonId: number | null;
        lessonTitle: string | null;
    };
    setEditLesson: (editLesson: {
        isEditLesson: boolean;
        lessonId: number | null;
        lessonTitle: string | null;
    }) => void;
}

const AddLessonsModal = ({ editLesson, setEditLesson }: AddLessonsModalProps) => {

    const dispatch = useDispatch()

    const createdCourseId = useSelector(createdCourseIdSelector);
    const [isOpen, setIsOpen] = useState(false)
    const [lessonTitle, setLessonTitle] = useState('')
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)

    const { t } = useTranslation();

    // Validate form using Zod
    const validateForm = () => {
        try {
            // Validate form data with Zod schema
            lessonSchema.parse({ lessonTitle });

            // Clear all errors if validation passes
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Convert Zod errors to our error format
                const newErrors: FormErrors = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        const fieldName = err.path[0] as keyof FormErrors;
                        newErrors[fieldName] = err.message;
                    }
                });

                setErrors(newErrors);
                toast.error("Please fix the validation errors");
            }
            return false;
        }
    };

    // Handle lesson title change with validation
    const handleLessonTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLessonTitle(value);

        // Clear error when user types
        if (errors.lessonTitle) {
            setErrors({ ...errors, lessonTitle: "" });
        }
    };

    const handleAddLessonModal = () => {
        setLessonTitle('')
        setErrors({})
        setEditLesson({
            isEditLesson: false,
            lessonId: null,
            lessonTitle: '',
        })
    }

    const handleAddLesson = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {

            // Create FormData for API submission
            const formData = new FormData();
            formData.append('course_id', createdCourseId!.toString());
            formData.append('title', lessonTitle);
            formData.append('is_active', '1'); // Default to active

            // Use the createCourseChapter function from our API utility
            const result = await createCourseChapter(formData);

            // Handle the response based on our standardized API response structure
            if (!result.success) {
                toast.error(result.error || result.message || 'Failed to create lesson');
            } else {
                toast.success(result.message || 'Lesson created successfully!');
                setLessonTitle('');
                setErrors({});
                setIsOpen(false);
                dispatch(setIsLessonAdded(true));
                dispatch(setIsLessonAddedOnce(true));
            }

        } catch (error) {
            // Handle unexpected errors
            console.error('Unexpected error in handleAddLesson:', error);
            toast.error('Failed to create lesson');
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditLesson = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {

            // Create FormData for API submission
            const formData = new FormData();
            formData.append('course_id', createdCourseId!.toString());
            formData.append('title', lessonTitle);
            formData.append('is_active', '1'); // Default to active

            // Use the createCourseChapter function from our API utility
            const result = await updateCourseChapter(formData, editLesson.lessonId!);

            // Handle the response based on our standardized API response structure
            if (!result.success) {
                toast.error(result.error || result.message || 'Failed to edit lesson');
            } else {
                toast.success(result.message || 'Lesson edited successfully!');
                setLessonTitle('');
                setErrors({});
                setIsOpen(false);
                dispatch(setIsLessonAdded(true));
            }

        } catch (error) {
            // Handle unexpected errors
            console.error('Unexpected error in handleEditLesson:', error);
            toast.error('Failed to edit lesson');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (editLesson.isEditLesson) {
            setIsOpen(true)
        }
        if (editLesson.lessonTitle) {
            setLessonTitle(editLesson.lessonTitle)
        }

    }, [editLesson])

    const handleCloseModal = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setLessonTitle('')
            setErrors({})
            setEditLesson({
                isEditLesson: false,
                lessonId: null,
                lessonTitle: '',
            })
        }
    }



    return (
        <Dialog open={isOpen} onOpenChange={handleCloseModal}>
            <DialogTrigger asChild>
                <Button className="w-auto bg-black text-white hover:bg-black/90" onClick={handleAddLessonModal}>
                    <FaPlus className="mr-1" size={14} />
                    {t("add_chapter")}
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0 md:max-w-lg mx-auto">
                <div className="p-3 md:p-4 border-b">
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-lg md:text-xl font-semibold">
                            {
                                editLesson.isEditLesson ? t("edit_chapter") : t("add_chapter")
                            }
                        </DialogTitle>
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="lessonTitle" className='requireField'>{t("chapter_title")}</Label>
                            <Input
                                id="lessonTitle"
                                placeholder={t("chapter_title")}
                                className={`sectionBg text-sm md:text-base ${errors.lessonTitle ? "border-red-500" : ""}`}
                                value={lessonTitle}
                                onChange={handleLessonTitleChange}
                            />
                            {errors.lessonTitle && (
                                <p className="text-red-500 text-xs">{errors.lessonTitle}</p>
                            )}
                        </div>
                        <Button
                            onClick={editLesson.isEditLesson ? handleEditLesson : handleAddLesson}
                            className="w-full primaryBg text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? `${editLesson.isEditLesson ? t("editing") : t("adding")}` : editLesson.isEditLesson ? t("edit_chapter") : t("add_chapter")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddLessonsModal

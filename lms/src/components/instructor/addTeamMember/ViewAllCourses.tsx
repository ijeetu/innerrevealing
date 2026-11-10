"use client";
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslation } from '@/hooks/useTranslation'
import { FaAngleRight } from 'react-icons/fa';

// Generic course interface that works with both TeamMemberCourse and PromoCode Course
interface CourseItem {
    id: number;
    title: string;
}

interface ViewAllCoursesProps {
    courses: CourseItem[];
    memberName?: string;
}

const ViewAllCourses: React.FC<ViewAllCoursesProps> = ({
    courses,
    memberName
}) => {

    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="primaryColor cursor-pointer font-semibold flex gap-2 items-center mt-2 hover:underline">
                {t('view_all')} <FaAngleRight />
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto customScrollbar">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {memberName ? `${t('assigned_courses')} - ${memberName}` : t('assigned_courses')}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    {courses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>{t('no_courses_assigned') || 'No courses assigned'}</p>
                        </div>
                    ) : (
                        <ol className="list-decimal list-inside space-y-3">
                            {courses.map((course, index) => (
                                <li
                                    key={index}
                                    className="text-sm py-2 border-b borderColor last:border-b-0"
                                >
                                    <span className="font-medium text-gray-900">
                                        {course.title}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ViewAllCourses

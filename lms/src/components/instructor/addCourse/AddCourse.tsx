"use client";
import { CourseTabProvider } from "@/contexts/CourseTabContext";
import AddCourseContent from "./AddCourseContent";



export default function AddCoursePage({ editCourse }: { editCourse?: boolean }) {
    return (
        <CourseTabProvider>
            <AddCourseContent editCourse={editCourse} />
        </CourseTabProvider>
    );
}

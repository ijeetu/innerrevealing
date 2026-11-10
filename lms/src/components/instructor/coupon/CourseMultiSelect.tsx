"use client"

import React, { useEffect, useState } from "react"
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getCoursesForCoupon, InstructorCourse } from "@/utils/api/instructor/coupon/getCoursesForCoupon";
import { extractErrorMessage } from "@/utils/helpers";
import { useTranslation } from "@/hooks/useTranslation";

interface CourseMultiSelectProps {
    selectedCourseIds: number[];
    onCourseChange: (courseIds: number[]) => void;
    className?: string;
}

const CourseMultiSelect = ({
    selectedCourseIds,
    onCourseChange,
    className = ""
}: CourseMultiSelectProps) => {

    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [availableCourses, setAvailableCourses] = useState<InstructorCourse[]>([]);

    // Handle multi-select change for individual courses or "all" option
    // When "all" is selected, select all available course IDs
    const handleMultiSelectChange = (courseId: number | 'all') => {
        // Handle "all" selection - select all available course IDs
        if (courseId === 'all') {
            // Get all course IDs from available courses
            const allCourseIds = availableCourses.map(course => course.id);

            // If all courses are already selected, deselect all
            // Otherwise, select all courses
            const areAllSelected = availableCourses.length > 0 &&
                allCourseIds.every(id => selectedCourseIds.includes(id));

            if (areAllSelected) {
                // Deselect all courses
                onCourseChange([]);
            } else {
                // Select all course IDs
                onCourseChange(allCourseIds);
            }
        } else {
            // Handle individual course selection/deselection
            const newCourseIds = selectedCourseIds.includes(courseId)
                ? selectedCourseIds.filter(id => id !== courseId)
                : [...selectedCourseIds, courseId];

            onCourseChange(newCourseIds);
        }
    };

    // Get selected course names for display
    const selectedCourseNames = selectedCourseIds.map(id => {
        const course = availableCourses.find(c => c.id === id);
        return course ? course.name : `Course ${id}`;
    });

    // Check if all courses are currently selected
    // This is used to show visual indicator on "all" option
    const areAllCoursesSelected = availableCourses.length > 0 &&
        availableCourses.every(course => selectedCourseIds.includes(course.id));

    // This function loads all courses created by the instructor for use in coupon creation
    const fetchInstructorCourses = async () => {
        try {
            const response = await getCoursesForCoupon();

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data) {
                        setAvailableCourses(response.data);
                    }
                } else {
                    console.error("Error fetching courses:", response.message);
                    setAvailableCourses([]);
                }
            } else {
                console.log("response is null in component", response);
                setAvailableCourses([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setAvailableCourses([]);
        }
    };

    // Load courses when component mounts
    useEffect(() => {
        fetchInstructorCourses();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="hover:!bg-white bg-white">
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full overflow-hidden text-ellipsis whitespace-nowrap justify-between ${selectedCourseIds.length > 0 ? 'text-black hover:text-black' : 'text-gray-400 !font-[500] hover:text-gray-400'} ${className}`}
                >
                    {areAllCoursesSelected ? t("all") : selectedCourseIds.length > 0 ? selectedCourseNames.join(", ") : t("select_courses")}
                    <FaAngleDown className="!h-3 !w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command className='w-full'>
                    <CommandList>
                        <CommandEmpty>{t("no_courses_found")}</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value={'all'}
                                onSelect={() => handleMultiSelectChange('all')}
                                className="w-full"
                            >
                                <FaCheck
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        areAllCoursesSelected ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {t("all")}
                            </CommandItem>
                            {availableCourses?.map((course) => (
                                <CommandItem
                                    key={course.id}
                                    value={course.name}
                                    onSelect={() => handleMultiSelectChange(course.id)}
                                    className="w-full"
                                >
                                    <FaCheck
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCourseIds.includes(course.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {course.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default CourseMultiSelect;

"use client";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaCheckCircle } from "react-icons/fa";
import { Progress } from "@/components/ui/progress";
import CustomImageTag from "../commonComp/customImage/CustomImageTag";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelector } from "react-redux";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { Course } from "@/types";

interface CourseCardProps {
  course: Course;
}

const CourseLearningCard: React.FC<CourseCardProps> = ({
  course,
}) => {
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const completed = course.progress_status === "completed";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleScroll = () => {
      setOpen(false);
    };

    const handleTouchStart = () => {
      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('touchstart', handleTouchStart, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('touchstart', handleTouchStart, true);
    };
  }, [open]);

  // Close popover when component unmounts
  useEffect(() => {
    return () => {
      setOpen(false);
    };
  }, []);


  return (
    <div
      ref={cardRef}
      className="sectionBg rounded-[5px] overflow-hidden border border-gray-200 flex flex-col h-full rounded-[8px]"
    >
      {/* Image Placeholder */}
      <div className="relative h-50 flex items-center justify-center p-4 pb-0 rounded-[5px]">
        <CustomImageTag
          src={course?.image || ""}
          alt={course?.title}
          className="w-full h-full  rounded-[8px] "
        />
        {/* Popover menu integrated */}
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <button
              aria-label="open-menu"
              className="absolute top-6 right-6 bg-white border border-black rounded-full p-1.5 shadow-sm text-gray-600 hover:text-gray-900 transition"
            >
              <HiOutlineDotsVertical size={20} />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            side="bottom"
            className="w-32 p-0 bg-white border border-gray-200 rounded-md shadow-lg z-50"
            sideOffset={5}
          >
            <div className="flex flex-col">
              <Link
                href={`/course-details/${course?.slug}?tab=Reviews`}
                className="text-md text-gray-700 p-2 hover:bg-gray-100 transition"
                onClick={() => setOpen(false)}
              >
                {t("reviews")}
              </Link>
              <Link
                href={`/course-details/${course?.slug}?tab=Assignment`}
                className="text-md text-gray-700 p-2 hover:bg-gray-100 transition"
                onClick={() => setOpen(false)}
              >
                {t("assignments")}
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Content Area */}
      <Link href={`/course-details/${course?.slug}?lang=${currentLanguageCode}`} className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <span className="text-xs primaryColor bg-indigo-100 px-2 py-0.5 rounded-[5px] w-max mb-2">
          {course?.category_name}
        </span>

        {/* Title & Subtitle */}
        <h3 className="text-sm font-light text-gray-800 mb-1 line-clamp-1">
          {course?.current_chapter_name}
        </h3>
        <Link href={`/course-details/${course?.slug}?lang=${currentLanguageCode}`} className="text-sm font-semibold text-gray-900 mb-3 line-clamp-1">
          {course?.title}
        </Link>

        {/* Progress Info - Placed at the bottom */}
        <div className="mt-auto space-y-2 pt-2">
          {" "}
          {/* Pushes content to bottom */}
          <div className="flex justify-between items-center text-xs text-gray-600">
            {completed ? (
              <>
                <span className="text-gray-600 font-semibold">{t("complete")}</span>
                <span className="text-[#83B807]">
                  <FaCheckCircle size={16} />
                </span>
              </>
            ) : (
              <span className="font-semibold">{course?.progress_percentage || 0}%</span>
            )}
            {!completed && (
              <span className="font-semibold">
                <span className="font-bold">{String(course?.completed_chapters).padStart(2, "0")}</span>
                /{String(course?.total_chapters).padStart(2, "0")} {t("chapters")}
              </span>

            )}
          </div>
          {/* Progress Bar */}
          <Progress
            value={course?.progress_percentage}
            className="h-1.5"
            indicatorClassName={completed ? "bg-[#83B807]" : "bg-[#83B807]"}
          />
        </div>
      </Link>
    </div>
  );
};

export default CourseLearningCard;

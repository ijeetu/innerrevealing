"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import * as Progress from "@radix-ui/react-progress";
import Link from "next/link";
import { Course } from "@/types";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import "swiper/css";
import "swiper/css/pagination";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelector } from 'react-redux';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

interface ContinueLearningProps {
  courses: Course[];
}

export default function ContinueLearning({ courses }: ContinueLearningProps) {
  const { t } = useTranslation();
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const isRTL = useSelector(isRTLSelector);

  if (courses?.length === 0) return null;

  return (
    <div className="commonMB commonMT">
      <div className="container space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-wrap gap-y-3">
          <h3 className="sectionTitle">{t("my_learning")}</h3>
          <Link href="/my-learnings" title="Browse All" className="text-base md:text-xl flex items-center gap-1">
            <span>{t("my_learnings")}</span>
            {isRTL ? <FiArrowLeft size={18} /> : <FiArrowRight size={18} />}
          </Link>
        </div>

        {/* Swiper Slider Section */}
        <Swiper
          key={currentLanguageCode || 'default'}
          dir={isRTL ? 'rtl' : 'ltr'}
          modules={[Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1.2, spaceBetween: 20 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          className="relative pb-10 continue-learning-swiper"
        >
          {courses?.length > 0 && courses.map((course) => (
            <SwiperSlide key={course.id}>
              <Link href={`/course-details/${course.slug}`} className="bg-[#F2F5F7C2] rounded-2xl p-4 border borderColor flex flex-col h-full">
                <div className="flex flex-col sm:flex-row flex-grow">
                  {/* Image */}
                  <div className="w-full sm:w-1/3 bg-gray-300 rounded-lg mb-3 sm:mb-0 sm:ltr:mr-4 sm:rtl:ml-4 flex-shrink-0 h-36 sm:h-24 md:h-32">
                    <CustomImageTag
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="w-full sm:w-2/3 flex flex-col justify-start">
                    <span className="text-sm font-medium primaryColor primaryLightBg px-2 py-0.5 rounded mb-2 inline-block self-start">
                      {course.category_name}
                    </span>
                    <p className="text-sm text-gray-700 mb-1 line-clamp-1">{course.title}</p>
                    <p className="font-semibold mb-3 sm:mb-auto line-clamp-1 cursor-pointer">{course.current_chapter_name}</p>

                    {/* Progress Section */}
                    <div className="border-t border-gray-100 pt-2 sm:pt-1 mt-2">
                      <div className="flex justify-between items-center text-gray-800 mb-1">
                        <span className="font-semibold">{course.progress_percentage}%</span>
                        <span>
                          <strong>{String(course.completed_chapters).padStart(2, "0")}/</strong>
                          {String(course.total_chapters).padStart(2, "0")} {t("chapters")}
                        </span>
                      </div>

                      <Progress.Root
                        className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2"
                        style={{ transform: "translateZ(0)" }}
                        value={30}
                      >
                        <Progress.Indicator
                          className="bg-[#83B807] w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
                          style={{ transform: `translateX(-${100 - (course.progress_percentage || 0)}%)` }}
                        />
                      </Progress.Root>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

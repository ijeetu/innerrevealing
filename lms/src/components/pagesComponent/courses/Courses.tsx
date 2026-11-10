"use client";
import React, { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import CourseContent from "./CourseContent";
import { useTranslation } from "@/hooks/useTranslation";

import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";

// Loading component for Suspense fallback
const CourseContentLoading = () => {
  return (
    <div className="container">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const Courses: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="commonGap">
        <div>
          <div className="sectionBg py-8 md:py-12">
            <div className="container px-4 md:px-8 space-y-4">
              <div className="bg-white rounded-full py-2 px-4 w-max flexCenter gap-1">
                <Link href={"/"} className="primaryColor" title={t("home")}>
                  {t("home")}
                </Link>
                <span>
                  <MdKeyboardArrowRight size={22} />
                </span>
                <span>{t("courses")}</span>
              </div>
              <div className="flexColCenter items-start gap-2">
                <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
                  Courses and practices
                </h1>
                <p className="sectionPara lg:w-[52%]">
                  Make time to pause, reconnect and grow. Explore a practice that feels right for you.
                </p>
              </div>
            </div>
          </div>
          <nav aria-label="Practice areas" className="container flex flex-wrap gap-3 pt-6">
            <Link href='/courses/search/meditation' className='commonBtn'>Meditation</Link>
            <Link href='/courses/search/yoga' className='rounded-full border borderColor bg-white px-6 py-3 font-medium hover:primaryColor'>Yoga</Link>
            <Link href='/courses/search/mindfulness' className='rounded-full border borderColor bg-white px-6 py-3 font-medium hover:primaryColor'>Personal growth</Link>
          </nav>
        </div>

        <Suspense fallback={<CourseContentLoading />}>
          <CourseContent />
        </Suspense>
      </div>
    </Layout>
  );
};

export default Courses;

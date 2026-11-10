"use client";
import React, { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import dynamic from "next/dynamic";
const CategorySwiper = dynamic(
  () => import("@/components/commonComp/CategorySwiper"),
  { ssr: false }
);
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
                  {t("unlock_learning_pathways_by_categories")}
                </h1>
                <p className="sectionPara lg:w-[52%]">
                  {t("courses_description")}
                </p>
              </div>
            </div>
          </div>
          <CategorySwiper />
        </div>

        <Suspense fallback={<CourseContentLoading />}>
          <CourseContent />
        </Suspense>
      </div>
    </Layout>
  );
};

export default Courses;

"use client";
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BiSolidStar } from "react-icons/bi";
import SalesStatisticsChart from "@/components/instructor/dashboard/SalesStatisticsChart";
import { CourseDetail } from "@/utils/api/instructor/course/getCourseDetails";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { formatDate, getCurrencySymbol } from "@/utils/helpers";
import CourseBadge from "@/components/commonComp/CourseBadge";
import { useTranslation } from "@/hooks/useTranslation";
import icon1 from "@/assets/images/instructorPanel/CourseDetails/earnings.svg";
import icon2 from "@/assets/images/instructorPanel/CourseDetails/enroll.svg";
import icon3 from "@/assets/images/instructorPanel/CourseDetails/ratings.svg";
import icon4 from "@/assets/images/instructorPanel/CourseDetails/sales.svg";

interface CourseStatisticsProps {
  course: CourseDetail;
}

const CourseStatistics: React.FC<CourseStatisticsProps> = ({ course }) => {
  const { t } = useTranslation();
  const courseDetails = course?.course_details;
  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      {/* ── Course Number & Publish Date ── */}
      <div className="flex flex-wrap gap-y-2 border-b border-gray-200 justify-between text-sm sectionBg p-3 rounded">
        <div className="min-w-0">
          <span className="font-medium">{t("course_number")}</span>
          <br />
          <span className="font-semibold">{courseDetails?.id}</span>
        </div>
        <div className="min-w-0 text-right">
          <span className="font-medium">{t("publish_date")}</span>
          <br />
          <span className="font-semibold">{formatDate(courseDetails?.created_at)}</span>
        </div>
      </div>

      {/* ── Course Details Card ── */}
      <Card className="mb-6 m-2 sm:m-4 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row justify-between items-center border-b border-gray-200 gap-2 flex-wrap">
          <h3 className="text-xl font-semibold">{t("course_details")}</h3>
          <CourseBadge status={courseDetails?.status} />
        </CardHeader>

        <CardContent className="p-0">
          <div className="bg-[#010211] text-white rounded-md m-2 sm:m-4 p-4 sm:p-6">

            {/* Thumbnail + Title + Price */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              {/* Left: thumbnail + title */}
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 min-w-0">
                <div className="rounded-md border border-gray-600 p-1 shrink-0">
                  <CustomImageTag
                    src={courseDetails?.thumbnail}
                    alt="course thumbnail"
                    className="w-[120px] h-[75px] sm:w-[152px] sm:h-[92px] object-cover"
                  />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-snug break-words min-w-0">
                  {courseDetails?.title}
                </h2>
              </div>

              {/* Right: price */}
              <div className="shrink-0 sm:text-right">
                {courseDetails?.course_type === "free" ? (
                  <p className="text-xl sm:text-2xl font-semibold">{t("free")}</p>
                ) : (
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                    <p className="text-xl sm:text-2xl font-semibold">
                      {getCurrencySymbol()}
                      {(courseDetails?.discounted_price ?? courseDetails?.price)?.toFixed(2)}
                    </p>
                    {courseDetails?.discounted_price && (
                      <p className="text-base lg:text-xl text-gray-400 line-through">
                        {getCurrencySymbol()}{courseDetails?.price?.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Short description */}
            <p className="text-sm sm:text-base lg:text-xl text-gray-400 mb-5 leading-relaxed">
              {courseDetails?.short_description}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-gray-700 mb-4" />

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
              {/* Instructor */}
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full p-0.5 border border-white">
                  <CustomImageTag
                    src={courseDetails?.author.profile}
                    alt="instructor"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm">{t("instructor")}</p>
                  <p className="text-white font-medium mt-1 text-sm sm:text-base truncate">
                    {courseDetails?.author.name}
                  </p>
                </div>
              </div>

              {/* Level */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{t("level")}</p>
                <p className="text-white font-medium mt-1 text-sm sm:text-base capitalize">
                  {courseDetails?.level}
                </p>
              </div>

              {/* Duration */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{t("course_duration")}</p>
                <p className="text-white font-medium mt-1 text-sm sm:text-base">
                  {course?.statistics?.content_statistics?.total_duration.formatted}
                </p>
              </div>

              {/* Language */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{t("course_taught")}</p>
                <p className="text-white font-medium mt-1 text-sm sm:text-base">
                  {courseDetails?.language.name}
                </p>
              </div>

              {/* Access */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{t("course_access")}</p>
                <p className="text-white font-medium mt-1 text-sm sm:text-base">Lifetime</p>
              </div>

              {/* Certificate */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{t("course_certificate")}</p>
                <p className="text-white font-medium mt-1 text-sm sm:text-base">
                  {courseDetails?.certificate_enabled ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Course Analytics Card ── */}
      <Card className="mt-6 m-2 sm:m-4 rounded-2xl  overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold">{t("course_analytics")}</h3>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-0 divide-x-0 md:divide-x divide-y md:divide-y-0 divide-gray-200 overflow-hidden">

            {/* Earnings */}
            <div className="p-4 sm:p-5 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#01021114] rounded-full mx-auto mb-3 flex items-center justify-center">
                <CustomImageTag src={icon1} alt="earnings icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {getCurrencySymbol()}{course?.statistics?.analytics.total_earnings.amount.toFixed(2)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{t("earnings_from_this_course")}</p>
            </div>

            {/* Enrolled */}
            <div className="p-4 sm:p-5 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#01021114] rounded-full mx-auto mb-3 flex items-center justify-center">
                <CustomImageTag src={icon2} alt="enrolled icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {course?.statistics?.analytics.total_enrolled_users.count}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{t("total_enrolled_users")}</p>
            </div>

            {/* Reviews */}
            <div className="p-4 sm:p-5 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#01021114] rounded-full mx-auto mb-3 flex items-center justify-center">
                <CustomImageTag src={icon3} alt="ratings icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center mb-1">
                <span className="text-yellow-500 mr-1"><BiSolidStar /></span>
                {courseDetails?.ratings.average}
                <span className="text-xs sm:text-sm font-normal text-gray-600 ml-1">
                  ({courseDetails?.ratings.count})
                </span>
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{t("total_reviews_received")}</p>
            </div>

            {/* Sales */}
            <div className="p-4 sm:p-5 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#01021114] rounded-full mx-auto mb-3 flex items-center justify-center">
                <CustomImageTag src={icon4} alt="sales icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {course?.statistics?.analytics.total_sales.count}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">{t("course_sales")}</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ── Sales Chart ── */}
      <div className="m-2 sm:m-4 overflow-hidden">
        <SalesStatisticsChart data={course?.statistics?.sales_chart_data} />
      </div>
    </div>
  );
};

export default CourseStatistics;

"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import { CourseDetail, getCourseDetails } from "@/utils/api/instructor/course/getCourseDetails";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { extractErrorMessage, getStatus } from "@/utils/helpers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import CourseDetails from "@/components/instructor/courses/CourseDetails";
import { Skeleton } from "@/components/ui/skeleton";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrencySymbol } from "@/utils/helpers";

export default function ViewCourse() {

  const { t } = useTranslation();
  const router = useRouter();
  const { courseSlug, slug } = useParams<{ courseSlug: string, slug: string }>();
  const [course, setCourse] = useState<CourseDetail | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true);

  const handleFetchCourse = async () => {
    try {
      setIsLoading(true);

      const response = await getCourseDetails({
        slug: courseSlug,
        course_details: 1,
        statistics: 1
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setCourse(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch course details");
          setCourse(undefined);
        }
      } else {
        console.log("response is null in component", response);
        setCourse(undefined);
      }
    } catch (error) {
      extractErrorMessage(error);
      setCourse(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (courseSlug) {
      handleFetchCourse()
    }
  }, [courseSlug])

  const courseDetails = course?.course_details;
  const statistics = course?.statistics;


  return (
    <div>

      <DashboardBreadcrumb title={t("view_courses")} firstElement={t("course")} firstElementLink={`/my-teams/${slug}/course`} secondElement={t("view_courses")} teamDashboard={true} userSlug={slug} />

      {/* Course Details Card with Title and Status */}
      {
        isLoading ?
          <div className="p-4 rounded-2xl space-y-4 bg-white">
            <Skeleton className="w-full h-80" />
            <Skeleton className="w-full h-80" />
            <Skeleton className="w-full h-80" />
          </div>
          :
          courseDetails ?
            <Card className="border borderColor mb-6 rounded-2xl">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row justify-between items-center border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div
                    className="bg-black rounded-full w-10 h-10 flex items-center justify-center mr-4 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={router.back}
                    role="button"
                    tabIndex={0}
                    aria-label="Go back"
                  >
                    <span className="text-white">
                      <BiArrowBack size={20} />
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{t("course_details")}</h3>
                </div>
                <Badge className="bg-[#83B8071F] text-[#83B807] font-medium px-5 py-1 rounded-[5px]">
                  {getStatus(courseDetails?.status)}
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
                <div className="bg-[#010211] text-white rounded-md m-4 p-6">
                  <div className="flex flex-col sm:flex-row justify-between mb-5 w-full gap-3">
                    <div className="flex items-center gap-3">
                      {/* Course Thumbnail Placeholder */}
                      <div className="rounded-md border borderColor p-1">
                        <CustomImageTag
                          src={courseDetails?.thumbnail}
                          alt={'course thumbnail'}
                          className="w-[152px] h-[92px] object-cover"
                        />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold">
                        {courseDetails?.title}
                      </h2>
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex items-center sm:justify-end">
                        {
                          courseDetails?.course_type === 'free' ? (
                            <div className="text-start sm:text-right mt-2 sm:mt-0 flex items-center gap-2 sm:flex-col sm:gap-0">
                              <p className="text-xl sm:text-2xl font-semibold">
                                {t("free")}
                              </p>
                            </div>
                          ) : (
                            <div className="text-start sm:text-right mt-2 sm:mt-0 flex items-center gap-2 sm:flex-col sm:gap-0">
                              <p className="text-xl sm:text-2xl font-semibold">
                                {getCurrencySymbol()}{(courseDetails?.discounted_price !== undefined && courseDetails.discounted_price > 0 && courseDetails.discounted_price < courseDetails.price)
                                  ? courseDetails.discounted_price.toFixed(2)
                                  : courseDetails?.price.toFixed(2)}
                              </p>
                              {courseDetails?.discounted_price !== undefined && courseDetails.discounted_price > 0 && courseDetails.discounted_price < courseDetails.price && (
                                <p className="text-base lg:text-xl text-gray-400 line-through">
                                  {getCurrencySymbol()}{courseDetails?.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>

                  {/* Description in separate section */}
                  <p className="text-base lg:text-xl text-gray-400 mb-5 leading-relaxed">
                    {courseDetails?.short_description}
                  </p>

                  {/* Visible divider */}
                  <div className="w-full h-px bg-gray-700 mb-4"></div>

                  {/* Key Information */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:justify-between gap-4 sm:gap-2">
                      {/* Instructor */}
                      <div className="flex items-center border-b border-gray-700 pb-4 sm:border-none sm:pb-2 xl:pb-0">
                        <div className="w-12 h-12 mr-3 rounded-full p-1 border border-white">
                          <CustomImageTag
                            src={courseDetails?.author.profile}
                            alt={'course thumbnail'}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="">
                          <p className="text-gray-400">{t("instructor")}</p>
                          <p className="text-white font-medium mt-2">
                            {courseDetails?.author.name}
                          </p>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="hidden xl:block w-px bg-gray-700 h-16 self-center"></div>
                      <div className="border-b border-gray-700 pb-4 sm:border-none sm:pb-2 xl:pb-0">
                        <p className="text-gray-400">{t("level")}</p>
                        <p className="text-white font-medium mt-2 capitalize">{courseDetails?.level}</p>
                      </div>

                      {/* Course Duration */}
                      <div className="hidden xl:block w-px bg-gray-700 h-16 self-center"></div>
                      <div className="border-b border-gray-700 pb-4 sm:border-none sm:pb-2 xl:pb-0">
                        <p className="text-gray-400">{t("course_duration")}</p>
                        <p className="text-white font-medium mt-2">
                          {statistics?.content_statistics?.total_duration.formatted || '-'}
                        </p>
                      </div>

                      {/* Course Taught */}
                      <div className="hidden xl:block w-px bg-gray-700 h-16 self-center"></div>
                      <div className="border-b border-gray-700 pb-4 sm:border-none sm:pb-2 xl:pb-0">
                        <p className="text-gray-400">{t("course_taught")}</p>
                        <p className="text-white font-medium mt-2">{courseDetails?.language.name}</p>
                      </div>

                      {/* Course Access */}
                      <div className="hidden xl:block w-px bg-gray-700 h-16 self-center"></div>
                      <div className="border-b border-gray-700 pb-4 sm:border-none sm:pb-2 xl:pb-0">
                        <p className="text-gray-400">{t("course_access")}</p>
                        <p className="text-white font-medium mt-2">{"Lifetime"}</p>
                      </div>

                      {/* Course Certificate */}
                      <div className="hidden xl:block w-px bg-gray-700 h-16 self-center"></div>
                      <div className="">
                        <p className="text-gray-400">{t("course_certificate")}</p>
                        <p className="text-white font-medium mt-2">
                          {courseDetails?.certificate_enabled ? t("yes") : t("no")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CourseDetails course={course as CourseDetail} />
            </Card>
            :
            !isLoading && !courseDetails &&
            <DataNotFound />
      }
    </div>
  );
}

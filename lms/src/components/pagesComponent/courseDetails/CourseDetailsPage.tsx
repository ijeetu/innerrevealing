"use client";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import CourseDescriptionSection from "./sections/CourseDescriptionSection";
import CourseCertificate from "./sections/CourseCertificate";
import CourseInstructor from "./sections/CourseInstructor";
import CoursePurchaseCard from "./sections/CoursePurchaseCard";
import breadcrumbsBg from "@/assets/images/courseDetailBreadcrumbg.jpg";
import { FaStar } from "react-icons/fa";
import { useTranslation } from '@/hooks/useTranslation';
import { Course, getCourse } from "@/utils/api/user/getCourse";
import CourseDetailsSkeleton from "@/components/skeletons/CourseDetailsSkeleton";
import InstructorCourses from "../instructorDetail/sections/InstructorCourses";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import CourseCurriculam from "./sections/CourseCurriculam";
import ReviewSection from "../lesson-overview/sections/tabsSection/review/ReviewSection";
import OpenInAppPopUp from "@/components/commonComp/OpenInAppPopUp";
import { courseView } from "@/utils/api/user/courseView";
import { useSelector } from "react-redux";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import { getDurationLabel } from "@/utils/helpers";
import withBalanceCheck from "@/components/hoc/withBalanceCheck";
import { settingsSelector } from "@/redux/reducers/settingsSlice";

interface CourseDetailsPageProps {
  courseData?: Course;
  slug?: string;
}

const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({ courseData: initialCourseData, slug }) => {

  const { t } = useTranslation();
  const isLogin = useSelector(isLoginSelector);

  const settings = useSelector(settingsSelector)

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<Course | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFetchCourse = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const response = await getCourse({ slug });
      if (response && !response.error && response.data) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setIsClient(true);
    if (slug) {
      handleFetchCourse();
    }
  }, [slug]);

  // instructor reviews & rating
  const instructorReviews = courseData?.instructor?.reviews;

  const instructorName = courseData?.instructor?.instructor_type === "team"
    ? courseData?.instructor?.team_name
    : courseData?.instructor?.instructor_type === "individual"
      ? courseData?.instructor?.name
      : courseData?.instructor?.name || ""


  const [isSticky, setIsSticky] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const instructorTopCoursesRef = useRef<HTMLDivElement>(null);

  const handleCourseView = async () => {
    if (!courseData?.id) return;
    const response = await courseView({
      course_id: courseData.id,
    });
    if (response) {
      if (response.error) {
        console.log(response.message);
      }
    }
  };

  useEffect(() => {
    if (isLogin) {
      handleCourseView();
    }
  }, [isLogin]);


  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window !== "undefined" && window.innerWidth >= 1200) {
      const handleScroll = () => {
        if (containerRef.current && instructorTopCoursesRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const instructorTopCoursesRect =
            instructorTopCoursesRef.current.getBoundingClientRect();
          const threshold = 100; // Adjust as needed

          if (containerRect.top <= threshold) {
            setIsSticky(true);
          } else {
            setIsSticky(false);
          }
        }
      };
      window.addEventListener("scroll", handleScroll);
      // Initialize on component mount
      handleScroll();

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);


  // Loading state
  if (loading && isClient) {
    return <CourseDetailsSkeleton />;
  }

  // Error state
  if (!courseData) {
    return (
      <Layout>
        <div className="commonGap">
          <div className="container flex flex-col justify-center items-center min-h-[600px] space-y-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {t("course_not_found")}
            </h1>
            <p className="text-gray-600">
              {t("the_course_you_are_looking_for_does_not_exist")}
            </p>
            <Link href="/courses" className="commonBtn">
              {t("browse_all_courses")}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="commonGap">
        <div
          style={{ backgroundImage: `url(${breadcrumbsBg.src})` }}
          className="bg-cover bg-center"
        >
          <div className="bg-[#010211CC] py-8 md:py-12">
            <div className="container space-y-4">
              <div className="bg-white rounded-full py-2 px-4 flex-wrap inline-flex items-center gap-1 max-w-full">
                <Link href={"/"} className="primaryColor" title={t("home")}>
                  {t("home")}
                </Link>
                <span>
                  <MdKeyboardArrowRight size={22} className="rtl:rotate-180" />
                </span>
                <Link
                  href={"/courses"}
                  className="primaryColor"
                  title={t("courses")}
                >
                  {t("courses")}
                </Link>
                <span>
                  <MdKeyboardArrowRight size={22} className="rtl:rotate-180" />
                </span>
                <span>{courseData.category_name || t("course")}</span>
              </div>
              <div className="flexColCenter items-start gap-2 text-white">
                <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px] min-[1200px]:w-[65%]">
                  {courseData.title}
                </h1>
                <div className="sectionPara lg:w-[52%] opacity-[76%]">
                  {isExpanded
                    ? (courseData.short_description || "")
                    : (courseData.short_description || "").length > 100
                      ? `${courseData.short_description.slice(0, 100)}...`
                      : (courseData.short_description || "")}
                  {(courseData.short_description || "").length > 100 && (
                    <span
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="cursor-pointer font-bold underline ml-1 primaryColor"
                    >
                      {isExpanded ? t("read_less") : t("read_more")}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="flex flex-col items-start sm:flex-row sm:items-center text-white gap-2 sm:gap-6 text-sm md:text-base"
                ref={containerRef}
              >
                {/* Instructor Image And Name */}
                {settings?.data?.instructor_mode == "multi" && (
                  <div className="flex items-center gap-2">
                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden border border-white p-[2px]">
                      <CustomImageTag
                        src={courseData.instructor?.avatar}
                        alt={t("instructor")}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="flex flex-col sm:gap-1 gap-0">
                      <span className="opacity-60 text-base">{t("instructor")}</span>
                      <span className="text-[#fff] text-base">{instructorName}</span>
                    </div>
                    <div className="border sm:h-[40px] sm:w-[1px] w-full h-px borderColor opacity-20" />
                  </div>
                )}

                {/* Course Level */}
                <div className="flex flex-col gap-1">
                  <span className="opacity-60 text-base">{t("level")}</span>
                  <span className="capitalize text-base">{courseData.level}</span>
                </div>
                <div className="border sm:h-[40px] sm:w-[1px] w-full h-px borderColor opacity-20" />
                {/* course duration */}
                <div className="flex flex-col gap-1">
                  <span className="opacity-60 text-base">{t("duration")}</span>
                  <span className="capitalize text-base">
                    {getDurationLabel(courseData.total_duration)}
                    {/* {formatCourseDurationCustom(courseData.total_duration, t) || courseData.total_duration_formatted} */}
                  </span>
                </div>
                <div className="border sm:h-[40px] sm:w-[1px] w-full h-px borderColor opacity-20" />
                {/* Course Language */}
                <div className="flex flex-col gap-1">
                  <span className="opacity-60 text-base">{t("language")}</span>
                  <span className="text-base">{courseData.language || t("english")}</span>
                </div>
                {courseData.average_rating > 0 && (
                  <div className="border sm:h-[40px] sm:w-[1px] w-full h-px borderColor opacity-20" />
                )}
                {/* Ratings */}
                <div className="flex flex-col gap-1">
                  {courseData.average_rating > 0 && (
                    <>
                      <span className="opacity-60 text-base">{t("ratings")}</span>
                      <span className="flex items-center gap-1">
                        <FaStar color="#DB9305" size={16} />
                        {courseData.average_rating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mb-12">
          <div className="grid grid-cols-12 max-575:gap-y-10 between-1200-1399:gap-y-20 max-1199:gap-y-20 lg:gap-x-8  gap-6">
            <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col gap-6 lg:gap-12">
              <CourseDescriptionSection courseData={courseData} />
              <CourseCertificate courseData={courseData} />
              <CourseCurriculam courseData={courseData} />
              {settings?.data?.instructor_mode == "multi" && (
                <CourseInstructor
                  name={instructorName}
                  title={courseData?.instructor?.qualification || ''}
                  rating={instructorReviews?.average_rating}
                  reviews={instructorReviews?.total_reviews}
                  profileImage={courseData.instructor?.avatar || ''}
                  aboutMe={courseData.instructor?.about_me || ''}
                  qualifications={courseData.instructor?.qualification || ''}
                  skills={courseData.instructor?.skills}
                  teamMembers={courseData.instructor.team_members}
                />
              )}
              {/* <ReviewsSect/> */}
              <ReviewSection courseDetailsPage={true} />
            </div>

            <div className="col-span-12 md:col-span-5 lg:col-span-4">
              <div className="sticky top-4 w-full">
                <CoursePurchaseCard
                  isSticky={isSticky}
                  courseData={courseData}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10" ref={instructorTopCoursesRef}>
          <InstructorCourses
            instructorSlug={courseData.instructor?.slug || 'admin-slug'}
            sectionTitle={t("top_courses_from_this_instructor")}
            currentCourseId={courseData.id}
          />
        </div>
        <OpenInAppPopUp />
      </div>
    </Layout>
  );
};

export default withBalanceCheck(CourseDetailsPage, (props) => !!props.courseData?.is_purchased);

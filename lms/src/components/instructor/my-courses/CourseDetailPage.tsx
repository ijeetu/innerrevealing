"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import CourseTabs, {
  TabItem,
} from "@/components/instructor/courses/CourseTabs";
import CourseStatistics from "@/components/instructor/courses/CourseStatistics";
import CourseDetails from "@/components/instructor/courses/CourseDetails";
import StudentEnrolled from "@/components/instructor/courses/StudentEnrolled";
import AssignmentList from "@/components/instructor/assignments/AssignmentList";
import QuizReport from "@/components/instructor/quiz/QuizReport";
import Discussion from "@/components/instructor/courses/Discussion";
import Reviews from "@/components/instructor/reviews/Reviews";
import { CourseDetail } from "@/utils/api/instructor/course/getCourseDetails";
import { getCourseDetails } from "@/utils/api/instructor/course/getCourseDetails";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";



export default function CourseDetailsPage() {

  const router = useRouter();

  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("statistics");
  const [course, setCourse] = useState<CourseDetail | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true);

  const handleFetchCourse = async () => {
    try {
      setIsLoading(true);

      const response = await getCourseDetails({
        slug: slug,
        statistics: activeTab === "statistics" ? 1 : 0,
        assignment_details: activeTab === "assignments" ? 1 : 0,
        course_details: activeTab === "details" ? 1 : 0,
        student_enrolled: activeTab === "enrolled" ? 1 : 0,
        quiz_reports: activeTab === "quiz" ? 1 : 0,
        discussion: activeTab === "discussion" ? 1 : 0,
      });

      if (response) {
        if (!response.error) {
          if (response.data) {
            setCourse(response.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch course details");
          setCourse(undefined);
          router.push("/instructor/my-course")
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
    if (activeTab === "statistics" || activeTab === "details") {
      handleFetchCourse()
    }
  }, [activeTab])

  const tabs: TabItem[] = [
    { id: "statistics", label: t("course_statistics") },
    { id: "details", label: t("course_details") },
    { id: "enrolled", label: t("student_enrolled") },
    { id: "assignments", label: t("assignment_list") },
    { id: "quiz", label: t("quiz_report") },
    { id: "discussion", label: t("discussion") },
    { id: "reviews", label: t("reviews") },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section with Title and Breadcrumbs */}
      <DashboardBreadcrumb title={t("course_details")} firstElement={t("my_courses")} firstElementLink="/instructor/my-course" secondElement={tabs.find((tab) => tab.id === activeTab)?.label || ""} />
      {/* Navigation Tabs and Content */}
      <Card className="p-0 borderColor rounded-2xl">
        <CourseTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {
          isLoading ?
            <div className="p-2 space-y-4">
              <Skeleton className="w-full h-80" />
              <Skeleton className="w-full h-80" />
              <Skeleton className="w-full h-80" />
            </div>
            :
            course ?
              <>
                {activeTab === "statistics" && <CourseStatistics course={course} />}
                {activeTab === "details" && <CourseDetails course={course} />}
                {activeTab === "enrolled" && <StudentEnrolled courseId={course.course_details.id} />}
                {activeTab === "assignments" && <AssignmentList courseSlug={slug} />}
                {activeTab === "quiz" && <QuizReport courseSlug={slug} />}
                {activeTab === "discussion" && <Discussion course={course} />}
                {activeTab === "reviews" && <Reviews courseSlug={slug} />}
              </>
              :
              <DataNotFound />
        }
      </Card>
    </div>
  );
}

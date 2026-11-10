"use client";
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import CourseLearningCard from "@/components/cards/CourseLearningCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import { useTranslation } from '@/hooks/useTranslation';
import { getMyLearning, GetMyLearningParams } from "@/utils/api/user/myLearning";
import { useEffect, useState } from "react";
import { Course } from "@/types";
import { extractErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";
import DataNotFound from "@/components/commonComp/DataNotFound";
import withBalanceCheck from "@/components/hoc/withBalanceCheck";

function MyLearningsPage() {
  const { t } = useTranslation();

  // State for my learning courses
  const [myLearningCourses, setMyLearningCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "in_progress" | "completed">("all");


  // Function to fetch my learning courses
  const fetchMyLearningCourses = async (page: number = 1, loadMore: boolean = false, status: "all" | "in_progress" | "completed" = selectedStatus) => {
    try {
      // Set appropriate loading state based on whether we're loading more or initial load
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setCoursesLoading(true);
      }

      // Build parameters for my learning courses
      const params: GetMyLearningParams = {
        per_page: 8,
        page: page,
        progress_status: status
      };

      // Call the getMyLearning API
      const response = await getMyLearning(params);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            const courseData = response.data.data;
            if (loadMore) {
              setMyLearningCourses(prev => [...prev, ...courseData as unknown as Course[]]);
            } else {
              setMyLearningCourses(courseData as unknown as Course[]);
            }

            // Check if there are more pages
            const totalPages = Math.ceil(response.data.total / 8);
            setHasMore(page < totalPages);
          } else {
            if (!loadMore) {
              setMyLearningCourses([]);
            }
            setHasMore(false);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch my learning courses");

          if (!loadMore) {
            setMyLearningCourses([]);
          }
          setHasMore(false);
        }
      } else {
        console.log("response is null in component", response);

        if (!loadMore) {
          setMyLearningCourses([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      extractErrorMessage(error);
      if (!loadMore) {
        setMyLearningCourses([]);
      }
      setHasMore(false);
    } finally {
      // Reset appropriate loading state
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setCoursesLoading(false);
      }
    }
  };

  // Load more courses function
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMyLearningCourses(nextPage, true);
    }
  };


  // Fetch my learning courses when component mounts
  useEffect(() => {
    fetchMyLearningCourses(1, false, selectedStatus);
  }, [selectedStatus]);
  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("my_learnings")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 flex-wrap inline-flex items-center gap-1 max-w-full">
            <Link href={"/"} className="primaryColor" title={t("home")}>
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_learnings")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar myLearning={true} />

            <div className="bg-white flex-1 w-full rounded-[10px] ">
              <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-0">
                  {t("my_learnings")}
                </h2>
                {/* filter my learnings for the desktop */}
                <div className="hidden md:block">
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => {
                      setSelectedStatus(value as "all" | "in_progress" | "completed");
                      setCurrentPage(1); // reset pagination when filter changes
                      setCoursesLoading(true); // show skeleton when filter changes
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                      <SelectValue placeholder={t("all")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all")}</SelectItem>
                      <SelectItem value="in_progress">{t("in_progress")}</SelectItem>
                      <SelectItem value="completed">{t("completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Show skeleton if coursesLoading is true */}
              {coursesLoading && (
                <>
                  {/* Desktop skeleton */}
                  <div className="p-6 hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index}>
                        <CourseCardSkeleton />
                      </div>
                    ))}
                  </div>

                  {/* Mobile skeleton */}
                  <div className="md:hidden w-full px-4 py-6 pr-2">
                    <Swiper
                      freeMode={true}
                      modules={[FreeMode, Pagination]}
                      pagination={{
                        clickable: true,
                      }}
                      spaceBetween={16}
                      slidesPerView={1}
                      breakpoints={{
                        0: {
                          slidesPerView: 1.2,
                        },
                        480: {
                          slidesPerView: 2.2,
                        }
                      }}
                      className="relative [&>.swiper-wrapper]:pb-8 md:[&>.swiper-wrapper]:pb-12 [&>.swiper-pagination]:flex [&>.swiper-pagination]:items-center [&>.swiper-pagination]:justify-center [&>.swiper-pagination]:pb-[6px] md:[&>.swiper-pagination]:pb-[12px] [&>.swiper-pagination]:gap-3"
                    >
                      {Array.from({ length: 4 }).map((_, index) => (
                        <SwiperSlide key={index}>
                          <CourseCardSkeleton />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </>
              )}

              {/* Show Data Not Found When there is no data and not loading */}
              {!coursesLoading && myLearningCourses.length === 0 && (
                <DataNotFound />
              )}

              {/* My Learnings for the desktop */}
              {!coursesLoading && myLearningCourses.length > 0 && (
                <div className="p-6 hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  {myLearningCourses.map((course, index) => (
                    <div key={index}>
                      <CourseLearningCard course={course} />
                    </div>
                  ))}

                  {/* Show additional skeleton cards when loading more */}
                  {loadingMore && (
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`${index}`}>
                          <CourseCardSkeleton />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* My Learnings for the mobile */}
              {!coursesLoading && myLearningCourses.length > 0 && (
                <div className="md:hidden w-full px-4 py-6 pr-2">
                  <Swiper
                    freeMode={true}
                    modules={[FreeMode, Pagination]}
                    pagination={{
                      clickable: true,
                    }}
                    spaceBetween={16}
                    slidesPerView={1}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    breakpoints={{
                      0: {
                        slidesPerView: 1.2,
                      },
                      480: {
                        slidesPerView: 2.2,
                      }
                    }}
                    className="relative [&>.swiper-wrapper]:pb-8 md:[&>.swiper-wrapper]:pb-12 [&>.swiper-pagination]:flex [&>.swiper-pagination]:items-center [&>.swiper-pagination]:justify-center [&>.swiper-pagination]:pb-[6px] md:[&>.swiper-pagination]:pb-[12px] [&>.swiper-pagination]:gap-3"
                  >
                    {myLearningCourses.map((course, index) => (
                      <SwiperSlide key={index}>
                        <CourseLearningCard course={course} />
                      </SwiperSlide>
                    ))}

                    <div className="mt-6 flex justify-center">
                      <div className="swiper-pagination"></div>
                    </div>
                  </Swiper>
                </div>
              )}

              {/* Load More Courses */}
              {!coursesLoading && hasMore && (
                <div className="px-6 pb-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="text-white commonBtn w-full md:w-max disabled:opacity-50 disabled:cursor-not-allowed">
                    {loadingMore ? 'Loading Courses...' : t("load_more")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withBalanceCheck(MyLearningsPage);

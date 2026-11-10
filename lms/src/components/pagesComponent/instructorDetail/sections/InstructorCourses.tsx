"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { Course } from "@/types";
import { extractErrorMessage } from '@/utils/helpers'
import { getCourses, GetCoursesParams } from '@/utils/api/user/getCourses'
import toast from 'react-hot-toast'
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";
import CourseCard from "@/components/cards/CourseCard";
import { useSelector } from 'react-redux';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';

// Interface for component props
interface InstructorCoursesProps {
  instructorSlug: string;
  sectionTitle?: string;
  currentCourseId?: number;
}

const InstructorCourses: React.FC<InstructorCoursesProps> = ({ instructorSlug, sectionTitle = "Courses", currentCourseId }) => {

  const isLogin = useSelector(isLoginSelector);
  // State for instructor courses
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const isRTL = useSelector(isRTLSelector);

  // function to fetch instructor courses
  // Fetch instructor courses
  const fetchInstructorCourses = useCallback(async (instructorSlug: string, page: number = 1, loadMore: boolean = false) => {
    try {
      setCoursesLoading(true);

      // Build parameters for instructor courses
      const params: GetCoursesParams = {
        instructor_slug: instructorSlug,
        per_page: 8, // Show 8 courses per page
        page: page,
      };

      // Call the getCourses API with instructor_slug parameter and auth token
      const response = await getCourses(params);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            let courseData = response.data.data;

            if (currentCourseId) {
              courseData = courseData.filter((course) => course.id !== currentCourseId);
            }

            if (loadMore) {
              setInstructorCourses(prev => [...prev, ...courseData as unknown as Course[]]);
            } else {
              setInstructorCourses(courseData as unknown as Course[]);
            }

            // Check if there are more pages
            const totalPages = Math.ceil(response.data.total / 8);
            setHasMore(page < totalPages);
          } else {
            if (!loadMore) {
              setInstructorCourses([]);
            }
            setHasMore(false);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch instructor courses");

          if (!loadMore) {
            setInstructorCourses([]);
          }
          setHasMore(false);
        }
      } else {
        console.log("response is null in component", response);

        if (!loadMore) {
          setInstructorCourses([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      extractErrorMessage(error);
      if (!loadMore) {
        setInstructorCourses([]);
      }
      setHasMore(false);
    } finally {
      setCoursesLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Load more courses function
  const handleLoadMore = () => {
    if (instructorSlug && hasMore && !coursesLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchInstructorCourses(instructorSlug, nextPage, true);
    }
  };

  // Fetch instructor courses when instructor data is loaded
  useEffect(() => {
    if (instructorSlug) {
      fetchInstructorCourses(instructorSlug, 1, false);
    }
  }, [instructorSlug, fetchInstructorCourses]);

  return (
    instructorCourses && instructorCourses.length > 0 && (
      <div className={`sectionBg py-4 sm:py-8 md:py-12 lg:py-16`}>
        <div className="container space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-y-3">
            <h3 className="sectionTitle">{sectionTitle}</h3>
          </div>

          {/* show skeleton if coursesLoading is true */}
          {coursesLoading && instructorCourses.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <CourseCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {instructorCourses.length > 0 && (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {instructorCourses.map((course, index) => (
                  <div key={index}>
                    <CourseCard courseData={course} />
                  </div>
                ))}

                {/* Show additional skeleton cards when loading more */}
                {coursesLoading && (
                  <>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={`loading-${index}`}>
                        <CourseCardSkeleton />
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Mobile Swiper */}
              <div className="md:hidden w-full category-swiper">
                <Swiper
                  freeMode={true}
                  key={currentLanguageCode || 'default'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  modules={[FreeMode, Pagination]}
                  pagination={{ clickable: true }}
                  spaceBetween={16}
                  breakpoints={{
                    0: { slidesPerView: 1.2 },
                    480: { slidesPerView: 2.2 },
                  }}
                  className="relative [&>.swiper-wrapper]:pb-8 [&>.swiper-pagination]:flex [&>.swiper-pagination]:items-center [&>.swiper-pagination]:justify-center [&>.swiper-pagination]:pb-[6px] [&>.swiper-pagination]:gap-3"
                >
                  {instructorCourses.map((course, index) => (
                    <SwiperSlide key={index}>
                      <CourseCard courseData={course} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Load More Courses — only on desktop */}
              {hasMore && (
                <div className="hidden md:flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={coursesLoading}
                    className="commonBtn w-full md:w-max disabled:opacity-50 disabled:cursor-not-allowed">
                    {coursesLoading ? 'Loading Courses...' : 'Load More Courses'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  )
}

export default InstructorCourses

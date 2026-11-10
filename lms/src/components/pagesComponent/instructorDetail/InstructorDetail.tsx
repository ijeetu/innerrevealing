"use client";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  FaInstagram,
  FaStar,
  FaTrophy,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { FaRegCirclePlay } from "react-icons/fa6";
import { GiGraduateCap } from "react-icons/gi";
import About from "./sections/About";
import ReviewMatters from "./sections/ReviewMatters";
import { getInstructors, InstructorData } from "@/utils/api/user/getInstructors";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import InstructorDetailSkeleton from "@/components/skeletons/InstructorDetailSkeleton";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import InstructorCourses from "./sections/InstructorCourses";
import AllReviews from "../lesson-overview/sections/tabsSection/review/AllReviews";
import AverageReviewsComp from "../lesson-overview/sections/tabsSection/review/AverageReviewsComp";
import { getInstructorReviews, InstructorReviewsData } from "@/utils/api/user/getInstructorReviews";
import { useTranslation } from "@/hooks/useTranslation";
import { PiFacebookLogoBold } from "react-icons/pi";
import { SocialMediaItem } from "@/utils/api/user/getUserDetails";
import { PiYoutubeLogo } from "react-icons/pi";
import { PiLinkedinLogo } from "react-icons/pi";
import InstructorReviewsSkeleton from "@/components/skeletons/InstructorReviewsSkeleton";
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { useSelector } from "react-redux";


// Interface for InstructorDetailProps
interface InstructorDetailsProps {
  slug: string
}

const InstructorDetail = ({ slug }: InstructorDetailsProps) => {

  const { t } = useTranslation();

  // State for instructor data
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [loading, setLoading] = useState(false);

  // State for the video playback
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Function to handel video playback
  const handleVideoPlayback = () => {
    if (instructorData?.preview_video) {
      setIsVideoPlaying(true);
    }
  }

  // Function to handle video pause - go back to video thumbnail
  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  }

  // Function to fetch instructor data
  const fetchInstructorData = useCallback(async (slug: string) => {
    try {
      setLoading(true);

      // Call the API to get instructor data by slug
      const response = await getInstructors({ slug });
      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data && response.data.data.length > 0) {
            // Get the first instructor (should be only one when fetching by slug)
            const instructor = response.data.data[0];

            setInstructorData(instructor);
          } else {
            console.log("Instructor not found");
            setInstructorData(null);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch instructor data");
          setInstructorData(null);
        }
      } else {
        console.log("response is null in component", response);
        setInstructorData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setInstructorData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchInstructorData(slug);
    }
  }, [slug, fetchInstructorData]);



  // State management following ReviewsSect pattern
  const [reviewsData, setReviewsData] = useState<InstructorReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const settings = useSelector(settingsSelector);

  // Fetch reviews function following ReviewsSect pattern
  const fetchInstructorReviews = async (page: number = 1, loadMore: boolean = false) => {
    if (!slug) {
      console.log("No slug available for fetching reviews");
      return;
    }

    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const apiParams = {
        slug: slug,
        per_page: 5, // Set a reasonable per_page limit
        page: page,
      };

      const response = await getInstructorReviews(apiParams);
      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            if (loadMore) {
              // Append new reviews to existing ones
              setReviewsData(prevData => {
                if (prevData && response.data) {
                  return {
                    ...prevData,
                    reviews: {
                      ...prevData.reviews,
                      data: [...prevData.reviews.data, ...response.data.reviews.data]
                    }
                  };
                }
                return response.data;
              });
            } else {
              setReviewsData(response.data);
            }

            // Check if there are more pages
            const totalPages = Math.ceil(response.data.reviews.total / 5);
            setHasMore(page < totalPages);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch reviews");

          if (!loadMore) {
            setReviewsData(null);
          }
          setHasMore(false);
        }
      } else {
        console.log("response is null in ReviewTabContent", response);

        if (!loadMore) {
          setReviewsData(null);
        }
        setHasMore(false);
      }
    } catch (error) {
      extractErrorMessage(error);

      if (!loadMore) {
        setReviewsData(null);
      }
      setHasMore(false);
    } finally {
      // Reset appropriate loading state
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Load reviews on component mount and when slug changes
  useEffect(() => {
    if (slug) {
      fetchInstructorReviews(1, false);
    }
  }, [slug]);

  // Load more reviews function following ReviewsSect pattern
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchInstructorReviews(nextPage, true);
    }
  };

  const allReviews = reviewsData?.reviews.data;


  const socialMediaIcons = (socialMedia: SocialMediaItem) => {
    const normalizedTitle = socialMedia.title.toLowerCase().trim();
    switch (normalizedTitle) {
      case "facebook":
        return <PiFacebookLogoBold className="w-8 h-8 bg-black rounded-2xl p-1" />;
      case "twitter":
        return <FaXTwitter className="w-8 h-8 bg-black rounded-2xl p-1" />;
      case "instagram":
        return <FaInstagram className="w-8 h-8 bg-black rounded-2xl p-1" />;
      case "youtube":
        return <PiYoutubeLogo className="w-8 h-8 bg-black rounded-2xl p-1" />;
      case "linkedin":
        return <PiLinkedinLogo className="w-8 h-8 bg-black rounded-2xl p-1" />;
    }
  }

  // Show skeleton while loading
  if (loading) {
    return (
      <Layout>
        <InstructorDetailSkeleton />
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="commonGap">
        <div className="sectionBg py-8 md:py-12">
          <div className="container space-y-4">
            <div className="bg-white rounded-3xl w-fit py-2 px-4 flex-wrap flex justify-start items-center gap-1">
              <Link href={"/"} className="primaryColor" title="Home">
                {t("home")}
              </Link>
              <span>
                <MdKeyboardArrowRight size={22} />
              </span>
              <Link href={"/instructors"} className="" title="Instructor">
                {t("instructor")}
              </Link>
              <span>
                <MdKeyboardArrowRight size={22} />
              </span>
              <span className="text-[#010211]" title="Instructor">
                {instructorData?.name}
              </span>
            </div>

            {/* Instructor Detail Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-8">
              {/* Video Thumbnail */}
              <div className="col-span-1 lg:col-span-1 h-full md:p-2">
                <div className="relative bg-[#A5B7C4] aspect-video rounded-[24px]">
                  {isVideoPlaying && instructorData?.preview_video ? (
                    // Show video when playing
                    <video
                      src={instructorData.preview_video}
                      autoPlay
                      controls
                      className="w-full h-full object-cover rounded-[24px]"
                      onClick={handleVideoPause}
                    >
                    </video>
                  ) : (
                    // Show video as background with play button overlay
                    <div className="relative w-full h-full">
                      {/* Video as background/thumbnail */}
                      <video
                        src={instructorData?.preview_video}
                        className="w-full h-full object-cover rounded-[24px]"
                        muted
                        preload="metadata"
                      >
                      </video>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handleVideoPlayback}>
                        <div className="bg-white rounded-full p-3 opacity-90">
                          <FaPlay className="primaryColor text-2xl" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Instructor Info */}
              <div className="col-span-1 lg:col-span-2">
                <div className="p-2 md:p-2 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-[87px] h-[87px] md:w-[100px] md:h-[100px] rounded-[12px] overflow-hidden border border-black p-1 flexCenter">
                      <CustomImageTag
                        src={instructorData?.profile}
                        alt={instructorData?.name || 'Instructor'}
                        className="w-[78px] h-[78px] md:w-[92px] md:h-[92px] object-cover rounded-[6px]"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{instructorData?.type == "team" ? instructorData?.team_name : instructorData?.name}</h1>
                      <p className="text-gray-600"> {instructorData?.qualification}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-2xl">
                    {/* Ratings and Courses */}
                    {/* <div className="flex items-center gap-6"> */}
                    <div className="flex items-center gap-2">
                      <FaStar className="" />
                      <span className="font-semibold">{instructorData?.average_rating}</span>
                      <span className="text-gray-500 text-[14px]">{instructorData?.total_ratings} {instructorData?.total_ratings && instructorData?.total_ratings > 1 ? t("reviews") : t("review")}</span>
                    </div>

                    {/* </div> */}
                    <div className="flex items-center gap-2">
                      <FaRegCirclePlay />
                      <span className="text-gray-500 text-[14px]">
                        <span className="text-black font-semibold text-[16px]">{instructorData?.active_courses_count}</span>{" "}
                        {t("courses")}
                      </span>
                    </div>

                    {/* <div className='flex items-center gap-6'> */}
                    {/* Enrolled Students */}
                    <div className="flex items-center gap-2">
                      <GiGraduateCap size={20} />
                      <span className="font-semibold">{instructorData?.student_enrolled_count}</span>
                      <span className="text-gray-500 text-[14px]">{t("enrolled")}</span>
                    </div>
                    {/* Skills */}
                    <div className="">
                      <div className="flex flex-wrap items-center gap-2">
                        <FaTrophy />
                        <span className="font-semibold mr-1">{t("skills")} : </span>
                        <div className="flex flex-wrap gap-1">
                          {instructorData?.skills.split(",").map((skill, i) => (
                            <span key={i} className="text-sm text-gray-500 text-[14px]">
                              {skill.trim()}
                              {i !== instructorData?.skills.split(",").length - 1 && ","}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* </div> */}
                  </div>

                  {/* Connect with Mentor with social media links */}
                  {instructorData?.social_medias && instructorData.social_medias.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        {t("connect_with_your_mentor")}
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        {instructorData.social_medias.map((social, index) => (
                          <Link
                            key={social.id ?? index}
                            href={social.url || ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 text-white rounded-full flex items-center justify-center"
                          >
                            {socialMediaIcons(social as unknown as SocialMediaItem)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About Section */}
      <div className="mt-8 container">
        <About aboutMe={instructorData?.about_me || ''} />
      </div>

      {/* Instructor Courses Section */}
      <InstructorCourses
        instructorSlug={slug}
        sectionTitle={t("courses")}
      />
      {/* Reviews Section */}
      <div className="container py-8 md:py-12">
        {
          isLoading ? <InstructorReviewsSkeleton showReviewForm={instructorData?.user_purchased_course} /> :
            <div className="grid grid-cols-12 max-575:gap-y-6 between-1200-1399:gap-y-20 max-1199:gap-y-8 gap-6">
              {allReviews && allReviews?.length > 0 ? (
                <div className="max-1199:col-span-12 col-span-8 flex flex-col max-1199:order-1">
                  <div className='flex items-center justify-between mb-1'>
                    <h2 className={`sm:text-lg md:text-xl font-semibold text-gray-800`}>{allReviews?.length} {allReviews?.length > 1 ? t("reviews") : t("review")}</h2>
                  </div>

                  <AverageReviewsComp
                    reviewsData={reviewsData as InstructorReviewsData}
                    instructorDetailsPage={true}
                    hasReviews={!!(reviewsData?.reviews?.data?.length)}
                  />

                  <AllReviews
                    reviews={allReviews || []}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadMore={handleLoadMore}
                    totalReviews={reviewsData?.reviews.total || 0}
                    instructorDetailsPage={true}
                  />
                </div>
              ) : (
                <div className="max-1199:col-span-12 col-span-8 flex flex-col max-1199:order-1 border border-[#D8E0E6] rounded-[12px] h-max">
                  <div className="flex flex-col items-center justify-center gap-2 p-6">
                    <p className="text-[20px] text-[#010211] font-semibold">{t("be_the_first_to_review")}</p>
                    <p className="text-base text-[#010211] max-w-[400px] text-center font-normal">
                      {t("this_instructor_is_new_to_reviews_take_a_course_and_be_the_first_to_share_your_feedback")}
                    </p>
                  </div>
                </div>
              )}
              {instructorData?.user_purchased_course && (
                <div className="max-1199:col-span-12 col-span-4 max-1199:order-2">
                  <ReviewMatters myReview={reviewsData?.my_review} instructorId={instructorData?.id} onReviewSubmitted={fetchInstructorReviews} />
                </div>
              )}
            </div>
        }

      </div>
    </Layout >
  );
};

export default InstructorDetail;

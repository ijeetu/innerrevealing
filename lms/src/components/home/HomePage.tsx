'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Layout from '../layout/Layout'
import HeroSect from './sections/HeroSect'
import Journey from './sections/Journey'
import TopCategories from './sections/TopCategories'
import CommonCoursesSection from './sections/CommonCoursesSection'
import WhyChooseUs from './sections/WhyChooseUs'
import InstructorCommunity from './sections/InstructorCommunity'
import ExpertEducatorsSect from './sections/ExpertEducatorsSect'
import Faqs from './sections/Faqs'
import Testimonials from './sections/Testimonials'
import ContinueLearning from './sections/ContinueLearning'
import { useSelector } from 'react-redux'
import { isLoginSelector } from '@/redux/reducers/userSlice'

import { FeatureSectionData, getFeatureSections, WhyChooseUsType } from '@/utils/api/user/getFeatureSection'
import { Course, educatorCardDataTypes } from '@/types'
import { extractErrorMessage } from '@/utils/helpers'
import CourseSectionSkeleton from '../skeletons/home/CourseSectionSkeleton'
import { toast } from 'react-hot-toast'
import CustomImageTag from '../commonComp/customImage/CustomImageTag'
import { FaqData, getFaqs } from '@/utils/api/user/getFaqs'
import { settingsSelector } from '@/redux/reducers/settingsSlice'


const HomePage: React.FC = () => {
  // selectors 
  const isLogin = useSelector(isLoginSelector);
  const setting = useSelector(settingsSelector);

  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hasScrolled = useRef(false);

  const [sections, setSections] = useState<FeatureSectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const getFeatureSectionsData = async () => {
    try {
      setLoading(true);
      const response = await getFeatureSections();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data && response.data.length > 0) {
            setSections(response.data);
          } else {
            setSections([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch feature sections");
          setSections([]);
        }
      } else {
        console.log("response is null in component", response);
        setSections([]);
      }
    } catch (error) {
      extractErrorMessage(error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }

  const handleWishlistToggle = (courseId: number, newWishlistStatus: boolean) => {
    setSections(prevSections =>
      prevSections.map(section => {
        // Only update if this section contains courses
        if (section.type !== 'offer') {
          return {
            ...section,
            data: Array.isArray(section.data) ? section.data.map((course) => {
              const courseData = course as Course;
              return courseData.id === courseId ? { ...courseData, is_wishlisted: newWishlistStatus } : courseData;
            }) : [],
          };
        }
        return section;
      })
    );
  };


  useEffect(() => {
    setIsClient(true)
    getFeatureSectionsData();
  }, [isLogin]);

  // state for faqs
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // fetch faqs
  const fetchFaqs = async () => {
    try {
      setLoadingFaqs(true);
      const response = await getFaqs();
      if (response) {
        if (!response.error) {
          if (response.data && response.data.data && response.data.data.length > 0) {
            const data = response.data.data;
            setFaqs(data);
          }
          else {
            setFaqs([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch faqs");
          setFaqs([]);
        }
      } else {
        console.log("response is null in component", response);
        setFaqs([]);
      }
    }
    catch (error) {
      extractErrorMessage(error);
      setFaqs([]);
    }
    finally {
      setLoadingFaqs(false);
    }
  }

  useEffect(() => {
    if (!isLogin) {
      fetchFaqs();
    } else {
      setLoadingFaqs(false);
    }
  }, [isLogin]);

  useEffect(() => {
    if (!isClient) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (window.location.pathname !== '/') return;
      if (window.scrollY === 0) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.scrollY > 0) {
          sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
        }
      }, 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [isClient]);

  useLayoutEffect(() => {
    if (!isClient) return;

    const savedScrollPos = sessionStorage.getItem('homeScrollPos');

    if (!savedScrollPos) {
      setIsVisible(true);
      return;
    }

    if (!loading && !loadingFaqs && !hasScrolled.current) {
      hasScrolled.current = true;
      sessionStorage.removeItem('homeScrollPos');
      window.scrollTo(0, parseInt(savedScrollPos, 10));
      setIsVisible(true);
    }
  }, [loading, loadingFaqs, isClient]);

  const renderSection = (section: FeatureSectionData) => {
    // Use helper function to extract courses from section
    const featureSection = section.data as Course[];

    switch (section.type) {

      case "top_rated_courses":
        return <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "newly_added_courses":
        return <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "offer":
        return !isLogin && (
          <div key={section.id} className='container commonMT commonMB '>
            <CustomImageTag src={featureSection[0]?.image} alt='free-course-img' className='w-auto h-[200px] md:h-[250px] lg:h-[350px] rounded-[4px]' />
          </div>
        )

      case "why_choose_us":
        return !isLogin && <WhyChooseUs key={section.id} whyChooseUsData={featureSection as unknown as WhyChooseUsType} />;

      case "top_rated_instructors":
        return setting?.data?.instructor_mode == "multi" && <ExpertEducatorsSect key={section.id} instructors={featureSection as unknown as educatorCardDataTypes[]} />

      case "free_courses":
        return <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "wishlist":
        return isLogin && <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "become_instructor":
        return setting?.data?.instructor_mode == "multi" && <InstructorCommunity key={section.id} />;

      case "searching_based":
        return isLogin && <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "recommend_for_you":
        return isLogin && <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "most_viewed_courses":
        return isLogin && <CommonCoursesSection key={section.id} title={section.title} courses={featureSection} onWishlistToggle={handleWishlistToggle} sectionType={section?.type} />;

      case "my_learning":
        return isLogin && <ContinueLearning key={section.id} courses={featureSection} />;

      default:
        return null;
    }
  };

  return (
    isClient &&
    <div style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
    <Layout>
      <div className=''>
        <HeroSect />
        {
          !isLogin && (
            <Journey />
          )
        }
        <TopCategories />
        {loading ? (
          <div className='grid grid-cols-1 gap-10 md:gap-20 commonMT commonMB'>
            {[...Array(6)].map((_, index) => (
              <CourseSectionSkeleton key={index} horizontalCard={index % 2 === 0} />
            ))}
          </div>
        ) : sections.map((section) => renderSection(section))}

        {
          !isLogin && (
            <>
              {
                faqs.length > 0 && (
                  <Faqs faqs={faqs} loadingFaqs={loadingFaqs} />
                )
              }
              <Testimonials />
            </>
          )
        }
      </div>
    </Layout>
    </div>
  )
}

export default HomePage
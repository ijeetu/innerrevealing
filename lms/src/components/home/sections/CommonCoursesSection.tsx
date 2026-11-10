'use client'
import CommonSwiperSect from '@/components/commonComp/CommonSwiperSect'
import React, { useEffect, useState } from 'react'
import { Course } from '@/types'
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from 'react-redux';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';

interface CommonCoursesSectionProps {
    title: string;
    courses: Course[];
    onWishlistToggle?: (courseId: number, newStatus: boolean) => void; // Add callback for wishlist toggle
    sectionType?: string;
}

const CommonCoursesSection: React.FC<CommonCoursesSectionProps> = ({ title, courses, onWishlistToggle, sectionType }) => {

    const currentLanguageCode = useSelector(currentLanguageSelector);
    const { t } = useTranslation();

    // State to store the section title based on sectionType
    const [sectionTitle, setsectionTitle] = useState(title)
    const [sectionLink, setsectionLink] = useState('')

    const isHorizontalCard = sectionType === "newly_added_courses" || sectionType === "searching_based" || sectionType === "wishlist"

    // Update section title based on sectionType from HomePage cases
    useEffect(() => {
        switch (sectionType) {
            case "top_rated_courses":
                setsectionTitle(t("top_rated_courses"))
                setsectionLink(`/courses?feature_section=top_rated_courses&lang=${currentLanguageCode}`)
                break;
            case "newly_added_courses":
                setsectionTitle(t("newly_added_courses"))
                setsectionLink(`/courses?feature_section=newly_added_courses&lang=${currentLanguageCode}`)
                break;
            case "free_courses":
                setsectionTitle(t("free_courses"))
                setsectionLink(`/courses?feature_section=free_courses&lang=${currentLanguageCode}`)
                break;
            case "wishlist":
                setsectionTitle(t("wishlist"))
                setsectionLink(`/courses?feature_section=wishlist&lang=${currentLanguageCode}`)
                break;
            case "searching_based":
                setsectionTitle(t("based_on_your_searches"))
                setsectionLink(`/courses?feature_section=searching_based&lang=${currentLanguageCode}`)
                break;
            case "recommend_for_you":
                setsectionTitle(t("recommended_for_you"))
                setsectionLink(`/courses?feature_section=recommend_for_you&lang=${currentLanguageCode}`)
                break;
            case "most_viewed_courses":
                setsectionTitle(t("most_viewed_courses"))
                setsectionLink(`/courses?feature_section=most_viewed_courses&lang=${currentLanguageCode}`)
                break;

            default:
                // Fallback to the title prop if sectionType doesn't match or is not provided
                setsectionTitle(title)
                break;
        }
    }, [sectionType, title, currentLanguageCode, t])

    if (!courses || courses.length === 0) return null;
    return (
        <section className='sectionBg py-8 md:py-12 lg:py-[60px]'>
            <CommonSwiperSect sectionTitle={sectionTitle} data={courses} horizontalCard={isHorizontalCard} link={sectionLink} onWishlistToggle={onWishlistToggle} />
        </section>
    )
}


export default CommonCoursesSection
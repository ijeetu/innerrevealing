import React, { useState } from 'react'
import { FaStar, FaCheck } from 'react-icons/fa'
import { Course } from '@/utils/api/user/getCourse';
import {
    FaBookOpen,
    FaPlayCircle,
    FaClock,
    FaGraduationCap,
    FaGlobe,
    FaLock,
} from 'react-icons/fa';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import RichTextContent from '@/components/commonComp/RichText';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateForLessonsOverview } from '@/utils/helpers';
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';

interface OverviewTabContentProps {
    courseData: Course;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ courseData }) => {

    const { t } = useTranslation();
    const settings = useSelector(settingsSelector)
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAboutCourseExpanded, setIsAboutCourseExpanded] = useState(false);
    const ABOUT_ME_LIMIT = 50;
    const isLongText = (courseData.instructor.about_me?.length || 0) > ABOUT_ME_LIMIT;

    return (
        <div className="p-4 md:p-8">
            <div className='grid grid-cols-12 border-b borderColor pb-4 gap-y-6 md:gap-3'>
                <div className='col-span-12 order-2 md:order-1 md:col-span-8'>
                    {/* Title and Basic Info */}
                    <h1 className="text-2xl font-normal mb-4">{courseData.title}</h1>

                    <div className="flex flex-col md:flex-row  flex-wrap gap-2 md:gap-6 mb-6 text-sm">
                        <div className="flex items-start flex-col gap-1">
                            <span className='opacity-75 text-sm'>{t("rating")}</span>
                            <div className='flex items-center'>
                                <FaStar className="text-[#DB9305] mr-1" />
                                <span className="font-medium">{courseData.average_rating?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className='border borderColor' />
                        <div className="flex flex-col gap-1">
                            <span className='opacity-75 text-sm'>{t("enrolled_students")}</span>
                            <span className="font-medium">{courseData.enroll_students}</span>
                        </div>
                        <div className='border borderColor' />
                        <div className="flex items-start flex-col gap-1">
                            <span className='opacity-75 text-sm'>{t("last_update")}</span>
                            <span className="font-medium">{formatDateForLessonsOverview(courseData.last_updated)}</span>
                        </div>
                    </div>

                    {/* About Course */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">{t("about_course")}</h2>
                        <div className="text-gray-700 whitespace-pre-line">
                            {isAboutCourseExpanded
                                ? (courseData.short_description || "")
                                : (courseData.short_description || "").length > 200
                                    ? `${courseData.short_description.slice(0, 200)}...`
                                    : (courseData.short_description || "")}
                            {(courseData.short_description || "").length > 200 && (
                                <span
                                    onClick={() => setIsAboutCourseExpanded(!isAboutCourseExpanded)}
                                    className="cursor-pointer font-bold underline ml-1 primaryColor"
                                >
                                    {isAboutCourseExpanded ? t("read_less") : t("read_more")}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Course Includes - Mobile Only */}
                    <div className="bg-gray-100 p-6 rounded-2xl max-w-md w-full mx-auto block md:hidden">
                        <h3 className="text-lg font-semibold mb-5">{t("course_includes")}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3">
                                <span className='flex '><FaBookOpen /></span>
                                <span className="text-gray-800 text-sm md:text-base">{courseData.chapter_count} {t("chapters")}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaPlayCircle /></span>
                                <span className="text-gray-800 text-sm md:text-base">{courseData.lecture_count} {t("lectures")}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaClock /></span>
                                <span className="text-gray-800 text-sm md:text-base">{courseData.total_duration_formatted} {t("course_duration")}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaGraduationCap /></span>
                                <span className="text-gray-800 text-sm md:text-base">{t("skill_level")} {courseData.level}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaGlobe /></span>
                                <span className="text-gray-800 text-sm md:text-base">{t("taught_in")} {courseData.language}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaLock /></span>
                                <span className="text-gray-800 text-sm md:text-base">{t("lifetime_access")}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* Course Includes - Desktop Only */}
                <div className='col-span-12 order-1 md:order-2 md:col-span-4 hidden md:block'>
                    <div className="hidden md:block bg-gray-100 p-6 rounded-2xl max-w-md w-full mx-auto">
                        <h3 className="text-lg font-semibold mb-5">{t("course_includes")}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3">
                                <span><FaBookOpen /></span>
                                <span className="text-gray-800 text-sm md:text-base">{courseData.chapter_count} {t("chapters")}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaPlayCircle /></span>
                                <span className="text-gray-800 text-sm md:text-base">{courseData.lecture_count} {t("lectures")}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaClock /></span>
                                <span className="text-gray-800 text-sm md:text-base">{courseData.total_duration_formatted} {t("course_duration")}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaGraduationCap /></span>
                                <span className="text-gray-800 text-sm md:text-base">{t("skill_level")} {courseData.level}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaGlobe /></span>
                                <span className="text-gray-800 text-sm md:text-base">{t("taught_in")} {courseData.language}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span><FaLock /></span>
                                <span className="text-gray-800 text-sm md:text-base">{t("lifetime_access")}</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
            {/* What You'll Learn */}
            <div className="mb-8 border-b borderColor py-4 md:py-6">
                <h2 className="text-xl font-semibold mb-3">{t("what_you_ll_learn")}</h2>
                <ul className="space-y-2">
                    {courseData.learnings.map((learning, index) => (
                        <li key={index} className="flex items-start">
                            <FaCheck className="primaryColor mt-1 mr-2 flex-shrink-0" />
                            <span>{learning.title}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Requirements */}
            <div className="mb-8 border-b borderColor py-4 md:py-6">
                <h2 className="text-xl font-semibold mb-3">{t("requirements")}</h2>
                <ul className="space-y-2">
                    {courseData.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                            <FaCheck className="primaryColor mt-1 mr-2 flex-shrink-0" />
                            <span>{requirement.requirement}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {settings?.data?.instructor_mode == "multi" && (
                <div className="">
                    <div className="py-3">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            {t("instructor")}
                        </h2>
                    </div>

                    <div className="border borderColor rounded-2xl overflow-hidden bg-white">
                        <div className="max-479:p-3 p-5 border-b borderColor flex items-center gap-4">
                            <div className="flex-shrink-0 border border-black p-[2px] rounded-full h-[90px] w-[90px] max-479:h-[60px] max-479:w-[60px]">
                                <CustomImageTag
                                    src={courseData.instructor?.avatar}
                                    alt={courseData.instructor?.name || ""}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>

                            <div>
                                <div className="flex items-center mb-1 gap-1">
                                    <div className="flex text-yellow-400">
                                        <FaStar />
                                    </div>

                                    <span className="font-medium text-gray-800">
                                        {courseData.instructor?.reviews?.average_rating?.toFixed(1) || "0.0"}
                                    </span>

                                    <span className="text-gray-500 text-sm ltr:ml-1 rtl:mr-1">
                                        (
                                        {courseData.instructor?.reviews?.total_reviews || 0}{" "}
                                        {(courseData.instructor?.reviews?.total_reviews || 0) > 1
                                            ? t("reviews")
                                            : t("review")}
                                        )
                                    </span>
                                </div>

                                <h3 className="font-medium text-lg">
                                    {courseData?.instructor?.instructor_type === "team"
                                        ? courseData?.instructor?.team_name
                                        : courseData?.instructor?.name}
                                </h3>

                                {courseData.instructor?.team_members?.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <h4 className="font-medium">
                                            {t("team_members")}:
                                        </h4>

                                        <ul className="flex gap-2 flex-wrap">
                                            {courseData.instructor.team_members.map(
                                                (member, idx) => (
                                                    <li
                                                        key={member.id}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <span className="text-gray-700">
                                                            {member.name}
                                                            {idx <
                                                                courseData.instructor.team_members
                                                                    .length -
                                                                1
                                                                ? ","
                                                                : ""}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-5">
                            {/* About Me */}
                            <div className="mb-1">
                                <div className="text-gray-700 break-all">
                                    <RichTextContent
                                        content={courseData.instructor?.about_me ?? ""}
                                    />
                                </div>
                            </div>

                            {/* Qualifications */}
                            {courseData.instructor?.qualification && (
                                <div className="mb-5">
                                    <h4 className="font-medium mb-2">
                                        {t("qualifications")}:
                                    </h4>

                                    <span className="text-gray-700">
                                        {courseData.instructor.qualification}
                                    </span>
                                </div>
                            )}

                            {/* Skills */}
                            {courseData.instructor?.skills && (
                                <div className="mb-5">
                                    <h4 className="font-medium mb-2">
                                        {t("my_skills")}:
                                    </h4>

                                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                                        {courseData.instructor.skills
                                            .split(",")
                                            .map((skill, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start"
                                                >
                                                    <span className="inline-block w-1 h-1 rounded-full bg-gray-700 mt-2.5 mr-2"></span>
                                                    <span>{skill.trim()}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            {isLongText && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="primaryColor font-medium flex items-center mt-4"
                                >
                                    {isExpanded
                                        ? `- ${t("read_less")}`
                                        : `+ ${t("read_more")}`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OverviewTabContent

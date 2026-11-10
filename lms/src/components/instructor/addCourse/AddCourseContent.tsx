"use client";
import React, { useEffect, useState } from "react";
import CourseTabsNavigation, {
    CourseTab,
} from "@/components/instructor/addCourse/Tabs/CourseTabsNavigation";
import CourseDetailsTab from "@/components/instructor/addCourse/Tabs/CourseDetailsTab";
import PricingTab from "@/components/instructor/addCourse/Tabs/PricingTab";
import CurriculumTab from "@/components/instructor/addCourse/Tabs/CurriculumTab";
import PublishTab from "@/components/instructor/addCourse/Tabs/PublishTab";
import { useCourseTab } from "@/contexts/CourseTabContext";
import DashboardBreadcrumb from "../commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import { AssignmentTabDataType, LectureTabDataType, QuizTabDataType, ResourcesTabDataType } from "@/types/instructorTypes/instructorTypes";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createdCourseIdSelector, setCreatedCourseId, setIsUpdateFile } from "@/redux/reducers/helpersReducer";
import { addCourseDataSelector, setCourseDetailsData } from "@/redux/instructorReducers/AddCourseSlice";
import { createCourse } from "@/utils/api/instructor/createCourseApis/create-course/createCourse";
import { assignmentDataSelector, lectureDataSelector, quizDataSelector, resourcesDataSelector } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { useParams } from "next/navigation";
import { getCourseDetails } from "@/utils/api/instructor/course/getCourseDetails";
import { updateCourse } from "@/utils/api/instructor/course/delete-update-course/updateCourse";
import { extractErrorMessage } from "@/utils/helpers";
import { useTranslation } from "@/hooks/useTranslation";
import icon1 from "@/assets/images/instructorPanel/createCourse/courseDetails.svg";
import icon2 from "@/assets/images/instructorPanel/createCourse/pricing.svg";
import icon3 from "@/assets/images/instructorPanel/createCourse/curriculumContent.svg";
import icon4 from "@/assets/images/instructorPanel/createCourse/publishSettings.svg";

// Helper function to convert base64 data URL to File object
const base64ToFile = (base64String: string, filename: string): File | null => {
    try {
        // Check if it's a valid base64 data URL
        if (!base64String.startsWith('data:')) {
            return null;
        }

        // Extract the mime type and base64 data
        const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return null;
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a Blob from the binary data
        const blob = new Blob([bytes], { type: mimeType });

        // Convert Blob to File
        return new File([blob], filename, { type: mimeType });
    } catch (error) {
        console.error('Error converting base64 to file:', error);
        return null;
    }
};

// Separate component for the course content to use the context
const CourseContent = ({ editCourse }: { editCourse?: boolean }) => {
    const params = useParams();
    const slug = params.slug as string;
    const dispatch = useDispatch();
    const createdCourseId = useSelector(createdCourseIdSelector);
    const createCourseData = useSelector(addCourseDataSelector);
    const { courseDetailsData } = createCourseData;

    const lectureData = useSelector(lectureDataSelector) as LectureTabDataType;
    const quizData = useSelector(quizDataSelector) as QuizTabDataType;
    const assignmentData = useSelector((assignmentDataSelector)) as AssignmentTabDataType;
    const resourcesData = useSelector(resourcesDataSelector) as ResourcesTabDataType;

    const { t } = useTranslation();

    const { activeTab, setActiveTab } = useCourseTab();

    const courseTabs: CourseTab[] = [
        {
            id: "course-details",
            icon: icon1,
            label: t("course_details"),
            description: t("define_course_details_overview_and_requirements"),
        },
        {
            id: "pricing",
            icon: icon2,
            label: t("pricing"),
            description: t("set_course_price_or_free_course"),
        },
        {
            id: "curriculum",
            icon: icon3,
            label: t("curriculum_content"),
            description: t("add_lessons_videos_and_quizzes"),
        },
        {
            id: "publish",
            icon: icon4,
            label: t("publish_settings"),
            description: t("set_preferences_and_publish"),
        },
    ];

    const [isCourseCreated, setIsCourseCreated] = useState<boolean>(false);

    const handleCreateCourse = async () => {
        if (slug) {
            handleUpdateCourse();
            return;

        }
        else {
            try {
                setIsCourseCreated(true);

                // Create FormData object to send to the server
                const formData = new FormData();

                // Add basic course fields
                formData.append('title', courseDetailsData.title);
                formData.append('short_description', courseDetailsData.shortDescription);
                formData.append('level', courseDetailsData.difficultyLevel);
                formData.append('course_type', courseDetailsData.isFree ? 'free' : 'paid');
                if (!courseDetailsData.isFree && courseDetailsData.price! > 0) {
                    formData.append('price', courseDetailsData.price!.toString());
                    if (courseDetailsData.discount) {
                        formData.append('discount_price', courseDetailsData.discount.toString());
                    }
                }
                formData.append('category_id', courseDetailsData.categoryId.toString());
                formData.append('is_active', '1');
                // Add optional fields if they exist
                if (courseDetailsData.metaTag) {
                    formData.append('meta_tags', courseDetailsData.metaTag);
                }
                if (courseDetailsData.metaTitle) {
                    formData.append('meta_title', courseDetailsData.metaTitle);
                }
                if (courseDetailsData.metaDescription) {
                    formData.append('meta_description', courseDetailsData.metaDescription);
                }
                if (courseDetailsData.languageId) {
                    formData.append('language_id', courseDetailsData.languageId);
                }
                // Handle file uploads - convert base64 to File if needed
                if (courseDetailsData.thumbnail) {
                    let thumbnailFile: File | null = null;

                    // Check if it's a File object
                    if (courseDetailsData.thumbnail instanceof File) {
                        thumbnailFile = courseDetailsData.thumbnail;
                    }
                    // Check if it's a base64 string
                    else if (typeof courseDetailsData.thumbnail === 'string' && courseDetailsData.thumbnail.startsWith('data:')) {
                        thumbnailFile = base64ToFile(courseDetailsData.thumbnail, 'thumbnail.jpg');
                    }

                    if (thumbnailFile) {
                        formData.append('thumbnail', thumbnailFile);
                        formData.append('meta_image', thumbnailFile);
                    }
                }

                if (courseDetailsData.video) {
                    let videoFile: File | null = null;

                    // Check if it's a File object
                    if (courseDetailsData.video instanceof File) {
                        videoFile = courseDetailsData.video;
                    }
                    // Check if it's a base64 string
                    else if (typeof courseDetailsData.video === 'string' && courseDetailsData.video.startsWith('data:')) {
                        videoFile = base64ToFile(courseDetailsData.video, 'preview_video.mp4');
                    }

                    if (videoFile) {
                        formData.append('intro_video', videoFile);
                    }
                }


                // Handle course tags array
                if (courseDetailsData.courseTag && courseDetailsData.courseTag.length > 0) {
                    const filteredTags = courseDetailsData.courseTag.filter(tag => tag);
                    filteredTags.forEach((tag, index) => {
                        formData.append(`course_tags[${index}]`, tag.toString());
                        // formData.append(`course_tags[${index}][name]`, tag);
                    });
                }

                // Handle learning objectives array
                if (courseDetailsData.whatYoullLearn && courseDetailsData.whatYoullLearn.length > 0) {
                    const filteredLearnings = courseDetailsData.whatYoullLearn.filter(learning => learning.title);
                    filteredLearnings.forEach((learning, index) => {
                        formData.append(`learnings_data[${index}][learning]`, learning.title);
                    });
                }

                // Handle requirements array
                if (courseDetailsData.requirements && courseDetailsData.requirements.length > 0) {
                    const filteredRequirements = courseDetailsData.requirements.filter(requirement => requirement.requirement);
                    filteredRequirements.forEach((requirement, index) => {
                        formData.append(`requirements_data[${index}][requirement]`, requirement.requirement);
                    });
                }

                // Handle instructors array
                if (courseDetailsData.instructor && courseDetailsData.instructor.length > 0) {
                    courseDetailsData.instructor.forEach((instructorId, index) => {
                        formData.append(`instructors[${index}]`, instructorId.toString());
                    });
                }

                if (courseDetailsData.status) {
                    formData.append(`status`, courseDetailsData.status);
                }

                formData.append(`sequential_access`, courseDetailsData.isSequentialAccess ? '1' : '0');

                if (courseDetailsData.certificateEnabled) {
                    formData.append(`certificate_enabled`, courseDetailsData.certificateEnabled ? '1' : '0');
                }

                // Call the API using the new createCourse function
                const response = await createCourse(formData);

                // Check if the API response indicates success
                if (response.success) {
                    // Extract course ID from response data if available
                    const courseId = response.data?.data?.course_id;
                    const successMessage = response.message || 'Course created successfully';
                    setIsCourseCreated(false);
                    if (courseId) {
                        dispatch(setCreatedCourseId(Number(courseId)));
                    }

                    toast.success(successMessage);
                    setActiveTab("curriculum");
                } else {
                    toast.error(response.error || response.message || 'Failed to create course');
                    setIsCourseCreated(false);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error('Error creating course:', error);

                // Handle different types of errors
                let errorMessage = 'Failed to create course';

                if (error.message) {
                    errorMessage = error.message;
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response?.data?.data?.message) {
                    errorMessage = error.response.data.data.message;
                }
                setIsCourseCreated(false);
            }
        }
    }

    const handleUpdateCourse = async () => {
        try {
            setIsCourseCreated(true);

            // Create FormData object to send to the server
            const formData = new FormData();

            // Add basic course fields
            formData.append('title', courseDetailsData.title);
            formData.append('short_description', courseDetailsData.shortDescription);
            formData.append('level', courseDetailsData.difficultyLevel);
            formData.append('course_type', courseDetailsData.isFree ? 'free' : 'paid');
            if (!courseDetailsData.isFree && courseDetailsData.price! > 0) {
                formData.append('price', courseDetailsData.price!.toString());
                if (courseDetailsData.discount) {
                    formData.append('discount_price', courseDetailsData.discount.toString());
                }
            }
            formData.append('category_id', courseDetailsData.categoryId.toString());
            formData.append('is_active', '1'); // Default to active

            // Add optional fields if they exist
            if (courseDetailsData.metaTag) {
                formData.append('meta_tags', courseDetailsData.metaTag);
            }
            if (courseDetailsData.metaTitle) {
                formData.append('meta_title', courseDetailsData.metaTitle);
            }
            if (courseDetailsData.metaDescription) {
                formData.append('meta_description', courseDetailsData.metaDescription);
            }
            if (courseDetailsData.languageId) {
                formData.append('language_id', courseDetailsData.languageId);
            }

            // Handle file uploads - convert base64 to File if needed
            if (courseDetailsData.thumbnail) {
                let thumbnailFile: File | null = null;

                // Check if it's a File object
                if (courseDetailsData.thumbnail instanceof File) {
                    thumbnailFile = courseDetailsData.thumbnail;
                }
                // Check if it's a base64 string
                else if (typeof courseDetailsData.thumbnail === 'string' && courseDetailsData.thumbnail.startsWith('data:')) {
                    thumbnailFile = base64ToFile(courseDetailsData.thumbnail, 'thumbnail.jpg');
                }

                if (thumbnailFile) {
                    formData.append('thumbnail', thumbnailFile);
                    formData.append('meta_image', thumbnailFile);
                }
            }

            if (courseDetailsData.video) {
                let videoFile: File | null = null;

                // Check if it's a File object
                if (courseDetailsData.video instanceof File) {
                    videoFile = courseDetailsData.video;
                }
                // Check if it's a base64 string
                else if (typeof courseDetailsData.video === 'string' && courseDetailsData.video.startsWith('data:')) {
                    videoFile = base64ToFile(courseDetailsData.video, 'preview_video.mp4');
                }

                if (videoFile) {
                    formData.append('intro_video', videoFile);
                }
            }


            // Handle course tags array
            if (courseDetailsData.courseTag && courseDetailsData.courseTag.length > 0) {
                const filteredTags = courseDetailsData.courseTag.filter(tag => tag);
                filteredTags.forEach((tag, index) => {
                    formData.append(`course_tags[${index}]`, tag.toString());
                });
            }

            // Handle learning objectives array
            // Send the actual id from the learning object so backend can update existing items instead of creating new ones
            if (courseDetailsData.whatYoullLearn && courseDetailsData.whatYoullLearn.length > 0) {
                const filteredLearnings = courseDetailsData.whatYoullLearn.filter(learning => learning.title);
                filteredLearnings.forEach((learning, index) => {
                    // Use the actual id if it exists (for updates), otherwise use '0' for new items
                    formData.append(`learnings_data[${index}][id]`, learning.id?.toString() || '0');
                    formData.append(`learnings_data[${index}][learning]`, learning.title);
                });
            }

            // Handle requirements array
            // Send the actual id from the requirement object so backend can update existing items instead of creating new ones
            if (courseDetailsData.requirements && courseDetailsData.requirements.length > 0) {
                const filteredRequirements = courseDetailsData.requirements.filter(requirement => requirement.requirement);
                filteredRequirements.forEach((requirement, index) => {
                    // Use the actual id if it exists (for updates), otherwise use '0' for new items
                    formData.append(`requirements_data[${index}][id]`, requirement.id?.toString() || '0');
                    formData.append(`requirements_data[${index}][requirement]`, requirement.requirement);
                });
            }

            // Handle instructors array
            if (courseDetailsData.instructor && courseDetailsData.instructor.length > 0) {
                courseDetailsData.instructor.forEach((instructorId, index) => {
                    formData.append(`instructors[${index}]`, instructorId.toString());
                });
            }

            if (courseDetailsData.status !== "publish") {
                formData.append(`status`, courseDetailsData.status);
            }

            formData.append(`sequential_access`, courseDetailsData.isSequentialAccess ? '1' : '0');

            if (courseDetailsData.certificateEnabled) {
                formData.append(`certificate_enabled`, courseDetailsData.certificateEnabled ? '1' : '0');
            }

            // Call the API using the new createCourse function
            const response = await updateCourse(createdCourseId!, formData);

            // Check if the API response indicates success
            if (response.success) {
                // Extract course ID from response data if available
                const courseId = response.data?.data?.course_id;
                const successMessage = response.message || 'Course updated successfully';
                setIsCourseCreated(false);
                if (courseId) {
                    dispatch(setCreatedCourseId(Number(courseId)));
                }

                toast.success(successMessage);
                setActiveTab("curriculum");
            } else {
                toast.error(response.error || response.message || 'Failed to update course');
                setIsCourseCreated(false);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error updating course:', error);

            // Handle different types of errors
            let errorMessage = 'Failed to create course';

            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.data?.message) {
                errorMessage = error.response.data.data.message;
            }
            setIsCourseCreated(false);
        }
    }

    useEffect(() => {
        if (createdCourseId && !slug) {
            setActiveTab("curriculum");
        }
    }, [createdCourseId])

    const handleCheckCurriculumData = () => {
        return (!lectureData.lectureTitle || !quizData.quiz_title || !assignmentData.assignment_title || !resourcesData.resource_title)
    }

    const handleTabsRestriction = (targetTab: string) => {
        // Check if trying to access pricing tab
        if (targetTab === "pricing") {
            if (!courseDetailsData.title || !courseDetailsData.shortDescription || !courseDetailsData.categoryId) {
                setActiveTab("course-details");
                toast.error("Please fill the course details first");
                return false;
            }
        }

        // Check if trying to access curriculum tab
        if (targetTab === "curriculum") {
            if (!createdCourseId) {
                setActiveTab("course-details");
                toast.error("Please create a course first");
                return false;
            }
        }

        // Check if trying to access publish tab
        if (targetTab === "publish" && !createdCourseId) {
            setActiveTab("course-details");
            toast.error("Please create a course first");
            return false;
        }
        if (targetTab === "publish" && createdCourseId && !handleCheckCurriculumData()) {
            setActiveTab("curriculum");
            toast.error("Please add at least one chapter, quiz, assignment, or resource");
            return false;
        }

        // If all validations pass, allow tab change
        return true;
    }


    const handleFetchCourse = async () => {
        try {
            const response = await getCourseDetails({
                slug: slug,
                course_details: 1,
            });

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data) {
                        const courseDetails = response?.data?.course_details;

                        dispatch(setCreatedCourseId(courseDetails?.id));
                        dispatch(setIsUpdateFile({ courseThumbnail: true, coursePreviewVideo: true }));
                        dispatch(setCourseDetailsData({
                            title: courseDetails?.title,
                            shortDescription: courseDetails?.short_description,
                            categoryId: courseDetails?.category?.id.toString(),
                            difficultyLevel: courseDetails?.level,
                            languageId: courseDetails?.language?.id.toString(),
                            courseTag: courseDetails?.tags.map((tag: { id: number; name: string }) => tag.name),
                            whatYoullLearn: courseDetails?.learnings,
                            requirements: courseDetails?.requirements,
                            instructor: courseDetails?.co_instructors?.map((instructor: Record<string, string | number>) => Number(instructor.id)) || [],
                            metaTag: courseDetails?.meta_tags || '',
                            metaTitle: courseDetails?.meta_title,
                            metaDescription: courseDetails?.meta_description,
                            thumbnail: courseDetails?.thumbnail,
                            video: courseDetails?.preview_video,
                            price: courseDetails?.price,
                            discount: courseDetails?.discounted_price,
                            isFree: courseDetails?.course_type == 'free',
                            isSequentialAccess: courseDetails?.sequential_access,
                            certificateEnabled: courseDetails?.certificate_enabled,
                            certificateAmount: courseDetails?.certificate_fee,
                            status: courseDetails?.status,
                        }));
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch course details");
                }
            } else {
                console.log("response is null in component", response);
            }
        } catch (error) {
            extractErrorMessage(error);
        }
    }

    useEffect(() => {
        if (slug) {
            handleFetchCourse();
        }
    }, [slug]);


    return (
        <div className="space-y-6 pb-16 sm:pb-20 md:pb-32">
            {/* Header Section with Title and Breadcrumbs */}
            <DashboardBreadcrumb title={editCourse ? t("edit_course") : t("add_course")} firstElement={t("my_courses")} firstElementLink="/instructor/my-course" secondElement={editCourse ? t("edit_course") : t("add_course")} />

            {/* Main Content */}
            <div className="">
                <div
                    // value={activeTab}
                    // onValueChange={(value: string) => setActiveTab(value as TabValue)}
                    className="flex flex-col xl:flex-row gap-6"
                >
                    {/* Left sidebar with tabs */}
                    <div className="w-full xl:w-96 flex-shrink-0">
                        <CourseTabsNavigation
                            tabs={courseTabs}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab as (tab: string) => void}
                            handleTabsRestriction={handleTabsRestriction}
                        />
                    </div>

                    {/* Right side form content */}
                    <div className="flex-1">
                        {/* Course Details Tab Content */}
                        {activeTab === "course-details" && (
                            <div
                                // value="course-details"
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <CourseDetailsTab />
                            </div>
                        )}

                        {/* Pricing Tab Content */}
                        {activeTab === "pricing" && (
                            <div
                                // value="pricing"
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <PricingTab handleCreateCourse={handleCreateCourse} isCourseCreated={isCourseCreated} />
                            </div>
                        )}
                        {/* Curriculum Tab Content */}
                        {activeTab === "curriculum" && (
                            <div
                                // value="curriculum"
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <CurriculumTab />
                            </div>
                        )}
                        {/* Publish Tab Content */}
                        {activeTab === "publish" && (
                            <div
                                // value="publish"
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <PublishTab />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseContent;
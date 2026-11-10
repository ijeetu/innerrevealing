'use client'
import React from "react";
import img1 from "../../../assets/images/instructorImg1.svg";
import img2 from "../../../assets/images/instructorImg2.svg";
import img3 from "../../../assets/images/instructorImg3.svg";
import img4 from "../../../assets/images/instructorImg4.svg";
import { instructorCommmDataType } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelector } from "react-redux";
import { isLoginSelector, userDataSelector } from "@/redux/reducers/userSlice";
import type { UserDetails } from "@/utils/api/user/getUserDetails";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import ThemeSvg from "@/components/commonComp/customImage/ThemeSvg";
import { settingsSelector } from "@/redux/reducers/settingsSlice";

const InstructorCommunity = () => {

  const { t } = useTranslation();
  const router = useRouter();
  const userData = useSelector(userDataSelector) as UserDetails | null;
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const settings = useSelector(settingsSelector);

  const isLogin = useSelector(isLoginSelector);

  const stepData: instructorCommmDataType[] = [
    {
      stepNumber: 1,
      title: t("sign_up_and_create_an_account"),
      description: t("register_on_the_platform_and_complete_your_profile"),
      imageSrc: img1,
    },
    {
      stepNumber: 2,
      title: t("fill_out_the_instructor_application_form"),
      description:
        t("provide_details_about_your_expertise"),
      imageSrc: img2,
    },
    {
      stepNumber: 3,
      title: t("prepare_your_course_content"),
      description:
        t("plan_and_create_your_course_material"),
      imageSrc: img3,
    },
    {
      stepNumber: 4,
      title: t("upload_and_submit_your_course"),
      description:
        t("use_the_platforms_tools_to_upload_and_organize_your_course_then_submit_it_for_review_and_approval"),
      imageSrc: img4,
    },
  ];


  // Get the redirect path based on instructor status
  const isInstructor = userData?.is_instructor === true;
  const instructorStatus = userData?.instructor_process_status;
  const instructorRedirection = () => {

    // If already an approved instructor, go to dashboard
    if (isInstructor && instructorStatus === "approved") {
      return `/instructor/dashboard?lang=${currentLanguageCode}`;
    }
    // If instructor but pending/rejected/suspended, go to application
    if (isInstructor && instructorStatus === "pending") {
      return `/become-instructor/application?lang=${currentLanguageCode}`;
    }
    if (isInstructor && instructorStatus === "rejected") {
      return `/become-instructor/application?lang=${currentLanguageCode}`;
    }
    if (isInstructor && instructorStatus === "suspended") {
      return `/become-instructor/application?lang=${currentLanguageCode}`;
    }
    if (!isInstructor && instructorStatus === "pending") {
      return `/become-instructor/process?lang=${currentLanguageCode}`;
    }
    // Not an instructor yet, start the process
    return `/become-instructor/process?lang=${currentLanguageCode}`;
  };

  // Show toast if user is not logged in, otherwise navigate
  const handleBecomeInstructorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Check if user is logged in
    if (!isLogin) {
      // Show toast notification asking user to login
      toast.error(t("please_login_to_become_an_instructor"));
      return;
    }

    // User is logged in, proceed with navigation
    router.push(instructorRedirection());
  };

  return (
    <section className="primaryBg py-6 md:py-8 lg:py-12 commonMT">
      <div className="container">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex flex-col gap-2 text-white">
            <h5 className="sectionTitle">
              {t("unlock_teaching_potential")}
            </h5>
            <p className="">
              {t("join_our_platfrom")}
            </p>
          </div>
          <button
            onClick={handleBecomeInstructorClick}
            title={instructorStatus === "approved" ? t("switch_to_instructor") : t("become_an_instructor")}
            className="commonBtn bg-white primaryColor hover:!bg-white !w-full md:!w-max text-center !text-xl"
          >
            {instructorStatus === "approved" ? t("switch_to_instructor") : t("become_an_instructor")}
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stepData.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white rounded-[12px] p-6 flex flex-col items-center shadow-sm gap-6"
            >
              <div className="primaryColor text-sm font-medium mb-4 flexCenter bg-[#F2F5F7] py-2 px-4 rounded-full">
                Step {step.stepNumber}
              </div>

              <div className="h-44 w-full relative flex justify-center">
                <ThemeSvg
                  src={step.imageSrc}
                  alt="Data Not Found"
                  className="h-full object-contain"
                  colorMap={{
                    "#5A5BB5": "var(--primary-color)",
                    "#04294C": "var(--hover-color)",
                    "#EEF2FA": "var(--primary-light-color)",
                  }}
                />

              </div>

              <div className="flexColCenter gap-2">
                <h3 className="text-center font-semibold primaryColor">
                  {step.title}
                </h3>

                <p className="text-center text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorCommunity;

"use client";
import Breadcrumb from "@/components/commonComp/Breadcrumb";
import React, { useEffect } from "react";
import Image from "next/image";
import { BiFile, BiUser } from "react-icons/bi";
import { FaRegListAlt } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import arrow from "@/assets/images/instructor/Arrow.png";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import icon1 from "@/assets/images/becom-instructor/icon1.svg";
import icon2 from "@/assets/images/becom-instructor/icon2.svg";
import sectImg from "@/assets/images/becom-instructor/become-instructor.svg";
import { useSelector } from "react-redux";
import { userDataSelector } from "@/redux/reducers/userSlice";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import ThemeSvg from "@/components/commonComp/customImage/ThemeSvg";
import checkInstructorMode from "@/components/hoc/checkInstructorMode";


function BecomeInstructor() {
  const router = useRouter();
  const { t } = useTranslation();
  const userData = useSelector(userDataSelector) as UserDetails | null;
  const currentLanguageCode = useSelector(currentLanguageSelector);


  const instructorRedirection = () => {
    const instructorStatus = userData?.instructor_process_status;

    if (userData?.is_instructor && instructorStatus === "approved") {
      return `/instructor/dashboard?lang=${currentLanguageCode}`;
    }
    if (userData?.instructor_details) {
      return `/become-instructor/application?lang=${currentLanguageCode}`;
    } else {
      return `/become-instructor/process?lang=${currentLanguageCode}`;
    }
  };

  const handleBecomeInstructorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    router.push(instructorRedirection());
  };

  return (
    <>
      {/* When user total_balance is lessthan 0 then open this modal and student cannot access the web */}
      <Breadcrumb title={t("become_instructor")} firstElement={t("become_instructor")} />
      <div className="container mx-auto py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-2xl md:text-[40px] font-semibold mb-4">
              {t("become_an_instructor_inspire")}
              <br /> {t("educate_and_grow")}
            </h1>
            <p className="mb-8">
              {t("become_an_instructor_description")}
            </p>
            <div className="flex items-start mb-6 flex-col md:flex-row">
              <div className="w-12 h-12 rounded-full mr-4 flex-shrink-0">
                <CustomImageTag src={icon1} alt="icon1" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {t("become_an_instructor_as_an_individual")}:
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("become_an_instructor_as_an_individual_description")}
                </p>
              </div>
            </div>

            {/* Organization Instructor Section */}
            <div className="flex items-start mb-8 flex-col md:flex-row">
              <div className="w-12 h-12 rounded-full mr-4 flex-shrink-0">
                <CustomImageTag src={icon2} alt="icon2" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {t("become_an_instructor_as_an_organization")}:
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("become_an_instructor_as_an_individual_description")}
                </p>
              </div>
            </div>

            <Button
              onClick={handleBecomeInstructorClick}
              className="primaryBg text-white font-medium py-3 px-6 rounded-md text-lg transition duration-200 ease-in-out"
            >
              {t("become_an_instructor")}
            </Button>
          </div>
          <div className="w-auto h-[300px] md:h-[557px] rounded-md order-1 lg:order-2">
            <ThemeSvg
              src={sectImg}
              alt="section-img"
              className="w-full h-full object-contain"
              colorMap={{
                "#5A5BB5": "var(--primary-color)",
                "#04294C": "var(--hover-color)",
                "#EEF2FA": "var(--primary-light-color)",
              }}
            />
          </div>
        </div>
      </div>

      {/* How to Become an Instructor Section */}
      <div className="sectionBg py-8 lg:py-16">
        <div className="container">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("how_to_become_an_instructor_a_complete_guide")}
            </h2>
            <p className="max-w-2xl mx-auto text-gray-700">
              {t("how_to_become_an_instructor_description")}
            </p>
          </div>

          {/* Steps Container */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-20">
            {/* Step 1 */}
            <div className="flex flex-col items-center mb-10 md:mb-0">
              <div className="bg-white p-4 rounded-md shadow-sm  flex items-center justify-center relative">
                <div className="bg-black text-white absolute top-[-15px] left-[-15px] rounded-full w-8 h-8 flex items-center justify-center">
                  <span>01</span>
                </div>
                <BiUser className="text-4xl w-[64px] h-[64px] primaryColor" />
              </div>
              <p className="text-center mt-4 font-medium">
                {t("sign_up_and_create_an_account")}
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="block mt-6 mb-18 rotate-90 md:rotate-0 rtl:rotate-180">
              <Image src={arrow} alt="Arrow" width={112} height={112} />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center mb-10 md:mb-0 relative">
              <div className="bg-white p-4 rounded-md shadow-sm  flex items-center justify-center relative">
                <div className="bg-black text-white absolute top-[-15px] left-[-15px] rounded-full w-8 h-8 flex items-center justify-center">
                  <span>02</span>
                </div>
                <BiFile className="text-4xl w-[64px] h-[64px] primaryColor" />
              </div>
              <p className="text-center mt-4 font-medium">
                {t("fill_out_the_instructor_application_form")}
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="block mt-6 mb-18 rotate-90 md:rotate-0 rtl:rotate-180">
              <Image src={arrow} alt="Arrow" width={112} height={112} />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center mb-10 md:mb-0 relative">
              <div className="bg-white p-4 rounded-md shadow-sm  flex items-center justify-center relative">
                <div className="bg-black text-white absolute top-[-15px] left-[-15px] rounded-full w-8 h-8 flex items-center justify-center">
                  <span>03</span>
                </div>
                <FaRegListAlt className="text-4xl w-[64px] h-[64px] primaryColor" />
              </div>
              <p className="text-center mt-4 font-medium">
                {t("prepare_your_course_content")}
              </p>
            </div>

            {/* Arrow 3 */}
            <div className="block mt-6 mb-18 rotate-90 md:rotate-0 rtl:rotate-180">
              <Image src={arrow} alt="Arrow" width={112} height={112} />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center mb-10 md:mb-0 relative">
              <div className="bg-white p-4 rounded-md shadow-sm flex items-center justify-center relative">
                <div className="bg-black text-white absolute top-[-15px] left-[-15px] rounded-full w-8 h-8 flex items-center justify-center">
                  <span>04</span>
                </div>
                <FiUpload className="text-4xl w-[64px] h-[64px] primaryColor" />
              </div>
              <p className="text-center mt-4 font-medium">
                {t("upload_and_submit_your_course")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default checkInstructorMode(BecomeInstructor);

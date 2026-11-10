"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCourseTab } from "@/contexts/CourseTabContext";
import { updateCourseStatus } from "@/utils/api/instructor/createCourseApis/create-course/updateCourseStatus";
import { useDispatch, useSelector } from "react-redux";
import { createdCourseIdSelector, resetCourseRelatedData } from "@/redux/reducers/helpersReducer";
import toast from "react-hot-toast";
import { useParams, usePathname, useRouter } from "next/navigation";
import { addCourseDataSelector, resetAddCourseData, setCourseDetailsData } from "@/redux/instructorReducers/AddCourseSlice";
import { resetCurriculamData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { Input } from "@/components/ui/input";
import { CourseDetailsDataType } from "@/types/instructorTypes/instructorTypes";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrencySymbol } from "@/utils/helpers";
import { IoInformationCircle } from "react-icons/io5";

export default function PublishTab() {

  const { goToPreviousTab } = useCourseTab();
  const router = useRouter();
  const createdCourseId = useSelector(createdCourseIdSelector);
  const createCourseData = useSelector(addCourseDataSelector);
  const { courseDetailsData } = createCourseData;
  const dispatch = useDispatch();
  const { slug } = useParams();

  const pathname = usePathname();
  const isEditCourse = pathname.includes('edit-course');

  const { t } = useTranslation();

  const handleCertificateToggle = (checked: boolean) => {
    dispatch(setCourseDetailsData({ certificateEnabled: checked } as CourseDetailsDataType));
  };

  const handleUpdateCourseStatus = async () => {
    try {
      // Validate that we have a course ID
      if (!createdCourseId) {
        console.error("No course ID available for status update");
        return;
      }

      const status = isEditCourse && courseDetailsData?.status === 'publish' ? '' : 'publish';

      const certificate_enabled = courseDetailsData?.certificateEnabled ? '1' : '0';
      const certificate_fee = courseDetailsData?.certificateAmount || 0;

      const response = await updateCourseStatus(
        createdCourseId,
        status,
        certificate_enabled,
        certificate_fee
      );

      if (response.success) {
        toast.success(response.message || `${slug ? 'Course Updated' : 'Course Submitted'} successfully:`);
        dispatch(resetAddCourseData());
        dispatch(resetCourseRelatedData());
        dispatch(resetCurriculamData());
        router.push('/instructor/my-course');
      } else {
        console.error("Failed to update course status:", response.error);
        toast.error(response.error || `${slug ? 'Failed to update course' : 'Failed to submit course'}`);
        // Handle error (e.g., show error toast)
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      // Handle unexpected errors
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col bg-white rounded-lg">
        {/* Main Content */}
        <div className="flex-grow">
          <div className={`p-3 md:p-4 ${courseDetailsData?.isFree ? "" : "border-b border-gray-200"}`}>
            <h2 className="text-base md:text-lg lg:text-xl font-medium">
              {t("publish_settings")}
            </h2>
          </div>

          {/* divider */}

          {
            courseDetailsData?.isFree ? (
              <div >
                <div className="w-full h-[1px] bg-gray-200"></div>
                <div className="flex items-center p-3 md:p-4 gap-3 md:gap-4">
                  <Switch id="certificate" className="" checked={courseDetailsData?.certificateEnabled}
                    onCheckedChange={handleCertificateToggle} />
                  <label
                    htmlFor="certificate"
                    className="cursor-pointer"
                  >
                    {t("enable_this_if_the_course_is_free_but_you_want_users_to_pay_for_the_certificate")}
                  </label>
                </div>
                <div className="flex flex-col p-3 md:p-4 gap-1">
                  <label
                    htmlFor="certificate-amount"
                    className="cursor-pointer requireField"
                  >
                    {t("amount")}
                  </label>
                  <Input
                    id="certificate-amount"
                    type="number"
                    placeholder={`e.g ${getCurrencySymbol()}50`}
                    value={courseDetailsData?.certificateAmount || ""}
                    onChange={(e) => dispatch(setCourseDetailsData({ certificateAmount: parseInt(e.target.value) } as CourseDetailsDataType))}
                    disabled={!courseDetailsData?.certificateEnabled}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4">
                <div className="borde flex p-3 items-start gap-3 border border-gray-200 rounded-lg bg-[#F9F9F9]">
                  <IoInformationCircle className="w-5 h-5 shrink-0 primaryColor" />
                  <p className="text-sm md:text-base primaryColor">
                    {t("for_paid_courses_certificate_fees_are_included_in_the_course_price_separate_certificate_pricing_is_only_available_for_free_courses")}
                  </p>
                </div>
              </div>
            )}

        </div>
      </Card>

      {/* Footer Navigation */}
      <div className="flex justify-end items-center gap-4 p-3 sectionBg">
        <Button
          variant="ghost"
          className="w-auto text-sm md:text-base"
          onClick={goToPreviousTab}
        >
          {t("previous")}
        </Button>
        <Button
          size="lg"
          className="w-full md:w-auto px-4 md:px-6 lg:px-8 text-sm md:text-base"
          onClick={() => handleUpdateCourseStatus()}
        >
          {t("submit_course")}
        </Button>
      </div>
    </div>
  );
}

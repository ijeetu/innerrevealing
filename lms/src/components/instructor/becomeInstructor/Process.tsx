"use client";
import React, { useEffect, useState, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import Step2Form from "./Step2Form";
import Step3Agreement from "./Step3Agreement";
import { IoMdCheckmark } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Layout from "./Layout";
import { CustomFormField } from "@/types/instructorTypes/instructorTypes";
import { userDataSelector } from "@/redux/reducers/userSlice";
import { getCustomFields } from "@/utils/api/general/getCustomFields";
import { isInstructorFromResubmitSelector, setIsInstructorFromResubmit } from "@/redux/reducers/helpersReducer";
import { extractErrorMessage, getDirection } from "@/utils/helpers";

// new imports 
import { useDispatch, useSelector } from "react-redux";
import { becomeInstructorDataSelector, resetBecomeInstructorData, setBecomeInstructorData, setSocialMedia, setCustomFieldsData } from "@/redux/instructorReducers/becomeInstructor";
import FormSubmitLoader from "@/components/Loaders/FormSubmitLoader";
import { updateInstructorDetails, InstructorDetailsFormData } from "@/utils/api/instructor/update-instructor-details/updateInstructorDetails";
import { useTranslation } from "@/hooks/useTranslation";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import teamICon from "@/assets/images/becom-instructor/Team.svg";
import individualIcon from "@/assets/images/becom-instructor/Individual.svg";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";

// Re-defining step data structure for clarity in this new component structure
interface ProcessStep {
  stepNumber: number;
  stepTitle: string;
  title: string;
  description: string; // Main description/title for the step in the timeline
  contentDescription?: string; // Detailed description shown when the step is active
}

export default function Process() {

  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch();
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isStep2FormValid, setIsStep2FormValid] = useState(false);

  const [customFields, setCustomFields] = useState<CustomFormField[]>([]);
  const [submitApplicationClick, setSubmitApplicationClick] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const userData = useSelector(userDataSelector) as UserDetails;

  const isInstructor = userData?.is_instructor && (userData?.instructor_process_status === 'approved')

  const { t } = useTranslation();
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const isInstructorFromResubmit = useSelector(isInstructorFromResubmitSelector);

  const router = useRouter();
  const steps: ProcessStep[] = [
    {
      stepNumber: 1,
      stepTitle: t("step_1"),
      title: t("become_instructor_title"),
      description:
        t("become_instructor_description"),
      contentDescription:
        t("become_instructor_content_description"),
    },
    {
      stepNumber: 2,
      stepTitle: t("step_2"),
      title: t("complete_your_profile"),
      description: t("tell_us_more_description"),
    },
    {
      stepNumber: 3,
      stepTitle: t("step_3"),
      title: t("instructor_agreement"),
      description:
        t("agreement_description"),
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isInstructorFromResubmit) return;

    if (isInstructor) {
      router.push('/');
    } else if (userData?.instructor_details) {
      // If user has details but not approved, show application status
      router.push(`/become-instructor/application?lang=${currentLanguageCode}`);
    }
  }, [userData, isInstructor, router, currentLanguageCode, isInstructorFromResubmit]);

  const handleContinue = async () => {
    if (currentStep === 1 && !becomeInstructorData.instructorType) {
      toast.error("Please select an instructor type to continue.");
      return;
    }

    // Trigger Step2Form validation
    if (currentStep === 2) {
      setIsStep2FormValid(false); // Reset to ensure the effect detects the change
      setIsValidating(true);      // This triggers the useEffect in Step2Form
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsStep2FormValid(false);
      setIsValidating(false);
      setCurrentStep(currentStep - 1);
    }
  };


  // Submit form handler moved from Step2Form
  const handleSubmit = useCallback(async () => {
    // Ensure all conditions are met
    if (!submitApplicationClick) {
      console.log("Submit application not clicked");
      return;
    }

    if (!agreementAccepted) {
      toast.error("Please accept the agreement to continue");
      return;
    }

    setIsSubmitting(true);

    try {

      const socialMedias = [
        { title: 'facebook', url: becomeInstructorData.socialMedia?.facebook },
        { title: 'linkedin', url: becomeInstructorData.socialMedia?.linkedin },
        { title: 'twitter', url: becomeInstructorData.socialMedia?.twitter },
        { title: 'instagram', url: becomeInstructorData.socialMedia?.instagram },
        { title: 'youtube', url: becomeInstructorData.socialMedia?.youtube },
      ].filter(sm => sm.url); // Only include filled social media links

      // Prepare custom fields (other_details) array
      // Format: { id: number; option_id?: number; value: string; file?: File }
      const otherDetails: Array<{
        id: number;
        option_id?: number;
        value: string;
        file?: File;
      }> = [];

      customFields.forEach((field) => {
        const value = becomeInstructorData.customFieldsData?.[field.id];

        // Find original value to check if it's updated
        const originalDetail = userData?.instructor_details?.other_details?.find(
          (detail) => detail.custom_form_field_id === field.id
        );
        const originalValue = originalDetail?.value || "";

        let isUpdated = false;
        if (value instanceof File) {
          isUpdated = true;
        } else if (value !== originalValue) {
          isUpdated = true;
        }

        if (value && isUpdated) {
          if (field.type === 'checkbox') {
            const selectedLabels = (value as string).split(',').filter(Boolean);
            selectedLabels.forEach((label) => {
              const selectedOption = field.options.find(opt => opt.option === label);
              if (selectedOption) {
                otherDetails.push({
                  id: field.id,
                  option_id: selectedOption.id,
                  value: label,
                });
              }
            });
          } else if (field.type === 'radio' || field.type === 'select' || field.type === 'dropdown') {
            const selectedOption = field.options.find(opt => opt.option === value);
            if (selectedOption) {
              otherDetails.push({
                id: field.id,
                option_id: selectedOption.id,
                value: value as string,
              });
            }
          } else if (value instanceof File) {
            // Handle file uploads - value is required, so use empty string if no value
            otherDetails.push({
              id: field.id,
              value: '',
              file: value,
            });
          } else {
            // Handle text fields
            otherDetails.push({
              id: field.id,
              value: value as string,
            });
          }
        }
      });

      // Prepare instructor details parameters object
      // This follows the same pattern as EditProfile.tsx
      const instructorParams: InstructorDetailsFormData = {
        user_id: userData.id.toString(),
        instructor_type: becomeInstructorData.instructorType || 'individual',
        qualification: becomeInstructorData.qualification || '',
        years_of_experience: becomeInstructorData.experience || '',
        skills: becomeInstructorData.skills || '',
        bank_account_number: becomeInstructorData.bankAccNum || '',
        bank_name: becomeInstructorData.bankName || '',
        bank_account_holder_name: becomeInstructorData.bankHolderName || '',
        bank_ifsc_code: becomeInstructorData.bankIfscCode || '',
        team_name: becomeInstructorData.instructorType === 'team' ? (becomeInstructorData.teamName || '') : '',
        about_me: becomeInstructorData.aboutMe || '',
        team_logo: becomeInstructorData.instructorType === 'team' ? (becomeInstructorData.teamLogo || undefined) : undefined,
        id_proof: becomeInstructorData.idProof || undefined,
        preview_video: becomeInstructorData.previewVideo || undefined,
        social_media: socialMedias.length > 0 ? socialMedias : undefined,
        other_details: otherDetails.length > 0 ? otherDetails : undefined,
      };

      // Call the update instructor details API
      // This follows the same pattern as EditProfile.tsx - token first, then params
      const response = await updateInstructorDetails(instructorParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to update instructor details");
        } else {
          // Success - show success message
          toast.success(response.message || "Instructor details updated successfully!");
          dispatch(resetBecomeInstructorData());
          dispatch(setIsInstructorFromResubmit(false));
          // Navigate to next step or completion page
          router.push('/become-instructor/application');
        }
      } else {
        console.log("response is null in component", response);
        toast.error("Failed to update instructor details. Please try again.");
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to submit form'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [submitApplicationClick, agreementAccepted, currentStep, customFields, router]);

  // Add a separate function for handling the submit application button click
  const handleSubmitApplicationClick = () => {
    setSubmitApplicationClick(true);
  };

  const getStepMarker = (step: ProcessStep) => {
    const isActive = currentStep === step.stepNumber;
    const isCompleted = currentStep > step.stepNumber;

    if (isCompleted) {
      return (
        <span className="absolute flex items-center justify-center w-8 h-8 bg-black text-white rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
          <IoMdCheckmark className="text-white" />
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="absolute flex items-center justify-center w-8 h-8 bg-black text-white rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-700 font-medium">
          {step.stepNumber}
        </span>
      );
    }
    return (
      <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -start-4 ring-1 ring-gray-200 dark:ring-gray-900 dark:bg-gray-700">
        <span className="font-medium text-gray-500 dark:text-gray-400">
          {step.stepNumber}
        </span>
      </span>
    );
  };

  // Fetch custom fields function
  // This follows the same pattern as fetchAddedCourses in CoursesTable.tsx
  const fetchCustomFields = async () => {
    try {
      // Fetch custom fields from the API
      const response = await getCustomFields();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            setCustomFields(response.data);
          } else {
            setCustomFields([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch custom fields");
          setCustomFields([]);
        }
      } else {
        console.log("response is null in component", response);
        setCustomFields([]);
      }
    } catch (error) {
      extractErrorMessage(error);
      setCustomFields([]);
    }
  };

  // Fetch custom fields on component mount
  useEffect(() => {
    fetchCustomFields();
  }, []);

  // Pre-fill form data from the rejected application when resubmitting
  // Runs after customFields are loaded so custom field values can also be pre-filled
  useEffect(() => {
    if (!isInstructorFromResubmit || userData?.instructor_process_status !== 'rejected') return;
    if (!userData?.instructor_details) return;

    const personalDetails = userData.instructor_details.personal_details;

    // Step 1: pre-fill instructor type
    dispatch(setBecomeInstructorData({
      instructorType: userData.instructor_details.type || 'individual',
    }));

    // Step 2: pre-fill personal / bank / team fields (text values only)
    dispatch(setBecomeInstructorData({
      qualification: personalDetails?.qualification || '',
      experience: personalDetails?.years_of_experience?.toString() || '',
      skills: personalDetails?.skills || '',
      bankName: personalDetails?.bank_name || '',
      bankHolderName: personalDetails?.bank_account_holder_name || '',
      bankAccNum: personalDetails?.bank_account_number || '',
      bankIfscCode: personalDetails?.bank_ifsc_code || '',
      teamName: personalDetails?.team_name || '',
      aboutMe: personalDetails?.about_me || '',
      // File fields (idProof, previewVideo, teamLogo) are intentionally left empty
      // because we cannot convert a server URL back into a File object;
      // the user must re-upload those files
    }));

    // Step 2: pre-fill social media links
    const socialMedias = userData.instructor_details.social_medias || [];
    const getSocialUrl = (platform: string) =>
      socialMedias.find(sm => sm.title?.toLowerCase() === platform)?.url || '';

    dispatch(setSocialMedia({ key: 'facebook', value: getSocialUrl('facebook') }));
    dispatch(setSocialMedia({ key: 'linkedin', value: getSocialUrl('linkedin') }));
    dispatch(setSocialMedia({ key: 'twitter', value: getSocialUrl('twitter') }));
    dispatch(setSocialMedia({ key: 'instagram', value: getSocialUrl('instagram') }));
    dispatch(setSocialMedia({ key: 'youtube', value: getSocialUrl('youtube') }));

    // Step 2: pre-fill custom fields (non-file values only)
    const otherDetails = userData.instructor_details.other_details || [];
    if (otherDetails.length > 0) {
      const customFieldsDataMap: Record<string, string | File | null> = {};
      otherDetails.forEach((detail) => {
        if (detail.custom_form_field_id) {
          const field = customFields.find(f => f.id === detail.custom_form_field_id);
          // Skip file fields — user must re-upload
          if (field?.type === 'file') return;
          customFieldsDataMap[detail.custom_form_field_id] = detail.value || null;
        }
      });
      dispatch(setCustomFieldsData(customFieldsDataMap));
    }
  }, [isInstructorFromResubmit, userData, customFields]);

  useEffect(() => {
    if (agreementAccepted && currentStep === 3 && submitApplicationClick) {
      handleSubmit();
      // Reset the flag after submission to prevent multiple submissions
      setSubmitApplicationClick(false);
    }
  }, [agreementAccepted, currentStep, submitApplicationClick, handleSubmit])

  const becomeInstructorData = useSelector(becomeInstructorDataSelector);

  useEffect(() => {
    // Navigate to step 3 only when validation is complete and successful
    if (!isValidating && isStep2FormValid && currentStep === 2) {
      console.log("Validation successful, moving to step 3");

      // Check video file size limit (this is not handled by Zod validation)
      if (becomeInstructorData.previewVideo && becomeInstructorData.previewVideo.size > 10 * 1024 * 1024) {
        toast.error("Video file exceeds the maximum size of 10MB");
        setIsStep2FormValid(false);
        return;
      }

      setCurrentStep(3);
    }
  }, [isValidating, isStep2FormValid, currentStep, becomeInstructorData.previewVideo]);

  const handleInstructorTypeChange = (type: string) => {
    dispatch(setBecomeInstructorData({ instructorType: type }))
  };


  return (
    isClient && (!isInstructor || isInstructorFromResubmit) &&
    <Layout>
      <div className="container mx-auto pt-[20px] pb-[20px] sm:pt-[110px] sm:pb-[150px]">
        <div className="max-w-3xl mx-auto">
          <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 ml-1 sm:ml-4">
            {steps.map((step) => (
              <li key={step.stepNumber} className="mb-10 ms-6">
                {getStepMarker(step)}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step.stepTitle}
                </p>
                <h3
                  className={`text-lg font-semibold ${currentStep === step.stepNumber
                    ? "text-black font-medium"
                    : "text-gray-900 dark:text-white"
                    }`}
                >
                  {step.title}
                </h3>
                {currentStep === step.stepNumber && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {step.contentDescription || step.description}
                  </p>
                )}
                {currentStep > step.stepNumber && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("completed")}
                  </p>
                )}

                {/* Content for the active step */}
                {currentStep === step.stepNumber && step.stepNumber === 1 && (
                  <div className="mt-4 bg-white ">
                    <RadioGroup
                      value={becomeInstructorData.instructorType}
                      onValueChange={handleInstructorTypeChange}
                      className="space-y-4"
                      dir={getDirection() as "ltr" | "rtl"}
                    >
                      <div className="border border-gray-200 rounded-md p-4 hover:primaryBorder transition-colors cursor-pointer">
                        <label
                          htmlFor={`radio-individual-${step.stepNumber}`}
                          className="flex items-center w-full gap-4 cursor-pointer max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-2"
                        >
                          <div className="shrink-0">
                            <div className="w-[113px] h-[113px] bg-[#0102110D] rounded-[8px] flexCenter">
                              <CustomImageTag src={individualIcon} alt="individual-icon" className="w-[68px] h-[68px] object-contain" />
                            </div>
                          </div>
                          <div className="flex items-center w-full">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {t("as_an_individual")}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t("individual_instructor_description")}
                              </p>
                            </div>
                            <RadioGroupItem
                              value="individual"
                              id={`radio-individual-${step.stepNumber}`}
                              className="ms-3 shrink-0"
                            />
                          </div>
                        </label>
                      </div>
                      <div className="border border-gray-200 rounded-md p-4 hover:primaryBorder transition-colors cursor-pointer">
                        <label
                          htmlFor={`radio-team-${step.stepNumber}`}
                          className="flex items-center w-full gap-4 cursor-pointer max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-2"
                        >
                          <div className="shrink-0">
                            <div className="w-[113px] h-[113px] bg-[#0102110D] rounded-[8px] flexCenter">
                              <CustomImageTag src={teamICon} alt="team-icon" className="w-[68px] h-[68px] object-contain" />
                            </div>
                          </div>
                          <div className="flex items-center w-full">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {t("as_a_team")}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t("team_instructor_description")}
                              </p>
                            </div>
                            <RadioGroupItem
                              value="team"
                              id={`radio-team-${step.stepNumber}`}
                              className="ms-3 shrink-0"
                            />
                          </div>
                        </label>

                      </div>
                    </RadioGroup>
                  </div>
                )}
                {currentStep === step.stepNumber && step.stepNumber === 2 && (
                  <Step2Form
                    customFields={customFields}
                    instructorType={becomeInstructorData.instructorType}
                    isValidate={isValidating}
                    setIsValidating={setIsValidating}
                    setIsStep2FormValid={setIsStep2FormValid}
                  />
                )}
                {currentStep === step.stepNumber && step.stepNumber === 3 && (
                  <Step3Agreement
                    agreementAccepted={agreementAccepted}
                    setAgreementAccepted={setAgreementAccepted}
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline" // Using an outline style for back button for better distinction
                className="px-4 py-2 rounded-md sectionBg gap-2"
              >
                <IoChevronBack /> {t("previous")}
              </Button>
            )}
            <div
              className={`${currentStep === 1 ? "w-full flex justify-end" : ""
                }`}
            >
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmitApplicationClick}
                  disabled={!agreementAccepted || isSubmitting}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      {t("submitting")}
                      <FormSubmitLoader />
                    </>
                  ) : (
                    t("submit_application")
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleContinue}
                  disabled={
                    (currentStep === 1 && !becomeInstructorData.instructorType) ||
                    isValidating
                  }
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  {isValidating ? (
                    <>
                      {t("validating")}
                      <FormSubmitLoader />
                    </>
                  ) : (
                    t("save_and_continue")
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}



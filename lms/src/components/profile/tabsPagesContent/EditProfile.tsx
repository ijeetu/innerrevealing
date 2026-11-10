"use client";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { CountryRegionData } from "react-country-region-selector";
import { IoTrashOutline } from "react-icons/io5";
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector, useDispatch } from "react-redux";
import { userDataSelector, setUserData as setUserDataAction } from "@/redux/reducers/userSlice";
import { UserDetails, getUserDetails } from "@/utils/api/user/getUserDetails";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import ReactPlayer from "react-player";
import { updateProfile, UpdateProfileParams, SocialMediaEntry, OtherDetailEntry } from "@/utils/api/general/updateProfile";
import toast from 'react-hot-toast';
import { isRTLSelector } from "@/redux/reducers/languageSlice";
import { allowedVideoTypes, extractErrorMessage, getDirection } from '@/utils/helpers';
import ar from 'react-phone-input-2/lang/ar.json';
import dynamic from 'next/dynamic';
import { getCustomFields, CustomField } from "@/utils/api/general/getCustomFields";
import SwitchAccountModal from "./SwitchAccountModal";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country_code: z.string().min(1, "Country is required"),
});

// Dynamically import ReactQuill with SSR disabled to prevent "document is not defined" error
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const getFlagEmoji = (code: string) =>
  code.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');

// NOTE: Need to add whole country functionality from the backend side on get and post both profile API's
const getSocialMediaUrl = (userDetails: UserDetails | null, platformName: string): string => {
  if (!userDetails?.instructor_details?.social_medias) return "";
  const socialMedia = userDetails.instructor_details.social_medias.find(
    (item) => item?.title?.toLowerCase() === platformName.toLowerCase()
  );
  return socialMedia?.url || "";
};

export default function EditProfile() {

  const dispatch = useDispatch();
  const userDetails = useSelector(userDataSelector) as UserDetails;
  const instructorType = userDetails?.instructor_details?.type;
  const setting = useSelector(settingsSelector);

  const { t } = useTranslation();
  const isRTL = useSelector(isRTLSelector);


  const [isClient, setIsClient] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; country_code?: string }>({});

  useEffect(() => {
    setIsClient(true)
  }, [])

  const personalDetails = userDetails?.instructor_details?.personal_details;

  const getInitialPhoneNumber = () => {
    const mobile = userDetails?.mobile || "";
    const countryCode = userDetails?.country_calling_code || "";

    if (mobile && countryCode) {
      // Check if mobile already starts with country code (without + sign)
      const countryCodeDigits = countryCode.replace('+', '');
      if (mobile.startsWith(countryCodeDigits)) {
        // Mobile already includes country code, use as is
        return {
          number: mobile,
          countryCode: countryCode,
        };
      } else {
        // Combine country code with mobile number
        return {
          number: countryCodeDigits + mobile,
          countryCode: countryCode,
        };
      }
    }
    // Fallback to just mobile if available
    return {
      number: mobile,
      countryCode: countryCode,
    };
  };

  const [phoneNumber, setPhoneNumber] = useState<{
    number: string;
    countryCode: string;
  }>(getInitialPhoneNumber());

  const [userData, setUserData] = useState({
    // Basic user information - from root level
    name: userDetails?.name || "",
    email: userDetails?.email || "",
    phone: userDetails?.mobile || "",
    profile: userDetails?.profile || "",
    country_name: userDetails?.country_name || "",
    country_code: userDetails?.country_code?.toUpperCase() || "",
    // Professional information - from instructor_details.personal_details
    qualifications: personalDetails?.qualification || "",
    experience: personalDetails?.years_of_experience?.toString() || "",
    skills: personalDetails?.skills || "",
    aboutMe: personalDetails?.about_me || "",

    // Social media links - from instructor_details.social_medias array
    facebook: getSocialMediaUrl(userDetails, "Facebook"),
    linkedin: getSocialMediaUrl(userDetails, "LinkedIn"),
    twitter: getSocialMediaUrl(userDetails, "Twitter"),
    instagram: getSocialMediaUrl(userDetails, "Instagram"),
    youtube: getSocialMediaUrl(userDetails, "YouTube"),

    // Bank details - from instructor_details.personal_details
    bankHolderName: personalDetails?.bank_account_holder_name || "",
    bankAccNum: personalDetails?.bank_account_number || "",
    bankName: personalDetails?.bank_name || "",
    bankIfscCode: personalDetails?.bank_ifsc_code || "",

    // Team information - from instructor_details.personal_details
    teamName: personalDetails?.team_name || "",
    teamLogo: personalDetails?.team_logo || "",
    previewVideo: personalDetails?.preview_video || "",
    idProof: personalDetails?.id_proof || "",
  });

  // Store File objects separately for API submission
  // These are separate from userData which stores preview URLs for display
  const [fileObjects, setFileObjects] = useState<{
    profile?: File;
    teamLogo?: File;
    previewVideo?: File;
    idProof?: File;
  }>({});

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldsData, setCustomFieldsData] = useState<Record<number, string | string[] | File | null>>({});
  const [customFieldFiles, setCustomFieldFiles] = useState<Record<number, File | null>>({});

  useEffect(() => {
    const personalDetails = userDetails?.instructor_details?.personal_details;


    setUserData({
      name: userDetails?.name || "",
      email: userDetails?.email || "",
      phone: userDetails?.mobile || "",
      profile: userDetails?.profile || "",
      country_name: userDetails?.country_name || "",
      country_code: userDetails?.country_code?.toUpperCase() || "",

      // Professional information - from instructor_details.personal_details
      qualifications: personalDetails?.qualification || "",
      experience: personalDetails?.years_of_experience?.toString() || "",
      skills: personalDetails?.skills || "",
      aboutMe: personalDetails?.about_me || "",

      // Social media links - from instructor_details.social_medias array
      facebook: getSocialMediaUrl(userDetails, "Facebook"),
      linkedin: getSocialMediaUrl(userDetails, "LinkedIn"),
      twitter: getSocialMediaUrl(userDetails, "Twitter"),
      instagram: getSocialMediaUrl(userDetails, "Instagram"),
      youtube: getSocialMediaUrl(userDetails, "YouTube"),

      // Bank details - from instructor_details.personal_details
      bankHolderName: personalDetails?.bank_account_holder_name || "",
      bankAccNum: personalDetails?.bank_account_number || "",
      bankName: personalDetails?.bank_name || "",
      bankIfscCode: personalDetails?.bank_ifsc_code || "",

      // Team information - from instructor_details.personal_details
      teamName: personalDetails?.team_name || "",
      teamLogo: personalDetails?.team_logo || "",
      previewVideo: personalDetails?.preview_video || "",
      idProof: personalDetails?.id_proof || "",
    });

    // Update phone number state with fresh data from Redux
    const initialPhone = getInitialPhoneNumber();
    setPhoneNumber(initialPhone);

    if (userDetails?.instructor_details?.other_details) {
      const existingCustomFieldsData: Record<number, string | string[] | File | null> = {};
      userDetails.instructor_details.other_details.forEach((detail) => {
        if (detail.custom_form_field_id) {
          existingCustomFieldsData[detail.custom_form_field_id] = detail.value || null;
        }
      });
      setCustomFieldsData(existingCustomFieldsData);
    }
  }, [userDetails]);

  // Fetch custom fields function
  // This follows the same pattern as fetchCustomFields in Process.tsx
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

  useEffect(() => {
    if (userDetails?.is_instructor) {
      fetchCustomFields();
    }
  }, [userDetails?.is_instructor]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUserData({ ...userData, [field]: fileUrl });

      // Store the File object for API submission
      setFileObjects({ ...fileObjects, [field]: file });
    }
  };

  // Handle custom fields input change
  const handleCustomFieldChange = (
    fieldId: number,
    value: string | string[] | File | null
  ) => {
    setCustomFieldsData({ ...customFieldsData, [fieldId]: value });
    if (value instanceof File) {
      setCustomFieldFiles({ ...customFieldFiles, [fieldId]: value });
    }
  };

  // Handle custom file upload
  const handleCustomFileUpload = (fieldId: number, file: File | null) => {
    // Check file size if it's a video file (10MB limit)
    if (file && file.type?.includes('video') && file.size > 10 * 1024 * 1024) {
      toast.error("Video file exceeds the maximum size of 10MB");
      return;
    }

    // Update custom fields data
    handleCustomFieldChange(fieldId, file);
  };

  const renderExistingFilePreview = (url: string) => {
    const isVideo = /\.(mp4|webm|mov|avi|mpeg|mpg)(\?.*)?$/i.test(url);
    if (isVideo) {
      return <video src={url} controls className="max-h-32 w-full rounded mt-1" />;
    }
    return (
      <img
        src={url}
        alt="Preview"
        className="max-h-32 object-contain rounded"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  };

  // Render custom form field based on type
  // This follows the same pattern as renderCustomField in Step2Form.tsx
  const renderCustomField = (field: CustomField) => {
    const fieldValue = customFieldsData[field.id];
    const currentFile = customFieldFiles[field.id] || null;

    switch (field.type) {
      case 'text':
        // Check if field name suggests it should be a file upload
        if (field?.name?.toLowerCase()?.includes('photo') ||
          field?.name?.toLowerCase()?.includes('image') ||
          field?.name?.toLowerCase()?.includes('picture') ||
          field?.name?.toLowerCase()?.includes('video') ||
          field?.name?.toLowerCase()?.includes('document') ||
          field?.name?.toLowerCase()?.includes('file')) {
          // Render as file upload
          return (
            <div key={field?.id || Math.random()} className="mb-4">
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
                {field?.name || ''}
              </label>
              <input
                type="file"
                id={`custom-file-${field?.id || ''}`}
                name={`custom-file-${field?.id || ''}`}
                accept={field?.name?.toLowerCase()?.includes('video') ? allowedVideoTypes?.join(",") : "image/*,application/pdf"}
                onChange={(e) => handleCustomFileUpload(field?.id || 0, e.target.files?.[0] || null)}
                required={field?.is_required === 1 && !fieldValue}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:primaryBg file:text-white hover:file:primaryBg"
              />
              {currentFile && (
                <p className="text-xs text-gray-500 mt-1">{t("file_selected")}: {currentFile.name}</p>
              )}
              {!currentFile && typeof fieldValue === 'string' && fieldValue && (
                <div className="mt-2 text-left">
                  <a href={fieldValue} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-2">
                    {t("view_existing_file")}
                  </a>
                  {renderExistingFilePreview(fieldValue)}
                </div>
              )}
            </div>
          );
        } else {
          // Render as text input
          return (
            <div key={field?.id || Math.random()} className="mb-4">
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
                {field?.name || ''}
              </label>
              <input
                type="text"
                id={`custom-text-${field?.id || ''}`}
                name={`custom-text-${field?.id || ''}`}
                value={(fieldValue as string) || ''}
                onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
                placeholder={`Enter your ${field?.name || ''}`}
                required={field?.is_required === 1}
                className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
              />
            </div>
          );
        }

      case 'textarea':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <textarea
              id={`custom-textarea-${field?.id || ''}`}
              name={`custom-textarea-${field?.id || ''}`}
              value={(fieldValue as string) || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              placeholder={`Enter your ${field?.name || ''}`}
              required={field?.is_required === 1}
              rows={4}
              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
            />
          </div>
        );

      case 'number':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <input
              type="number"
              id={`custom-number-${field?.id || ''}`}
              name={`custom-number-${field?.id || ''}`}
              value={(fieldValue as string) || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              placeholder={`Enter your ${field?.name || ''}`}
              required={field?.is_required === 1}
              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
            />
          </div>
        );

      case 'email':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <input
              type="email"
              id={`custom-email-${field?.id || ''}`}
              name={`custom-email-${field?.id || ''}`}
              value={(fieldValue as string) || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              placeholder={`Enter your ${field?.name || ''}`}
              required={field?.is_required === 1}
              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
            />
          </div>
        );

      case 'date':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <input
              type="date"
              id={`custom-date-${field?.id || ''}`}
              name={`custom-date-${field?.id || ''}`}
              value={(fieldValue as string) || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              required={field?.is_required === 1}
              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
            />
          </div>
        );

      case 'radio':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <div className="flex space-x-4 max-[374px]:flex-col max-[374px]:gap-2">
              {field.options && field.options.map((option) => (
                <label key={option.id} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`custom-radio-${field?.id || ''}`}
                    value={option.option}
                    checked={(fieldValue as string) === option.option}
                    onChange={() => handleCustomFieldChange(field?.id || 0, option.option)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    required={field?.is_required === 1}
                  />
                  <span className="ltr:ml-2 rtl:mr-2 text-sm text-gray-700">
                    {option.option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'dropdown':
      case 'select':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <select
              id={`custom-select-${field?.id || ''}`}
              name={`custom-select-${field?.id || ''}`}
              value={(fieldValue as string) || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              required={field?.is_required === 1}
              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
            >
              <option value="">Select {field?.name || 'an option'}</option>
              {field.options && field.options.map((option) => (
                <option key={option.id} value={option.option}>
                  {option.option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        const checkboxValue = Array.isArray(fieldValue)
          ? fieldValue
          : typeof fieldValue === 'string' && fieldValue
            ? fieldValue.split(',')
            : [];
        console.log("checkboxValue", checkboxValue)
        const selectedCheckboxes = checkboxValue
          .map(val => val.trim()).filter(val => val !== '');
        const handleCheckboxChange = (optionValue: string, isChecked: boolean) => {
          let newValue: string;
          if (isChecked) {
            newValue = [...selectedCheckboxes, optionValue].join(',');
          } else {
            newValue = selectedCheckboxes
              .filter((val) => val !== optionValue)
              .join(',');
          }
          handleCustomFieldChange(field?.id || 0, newValue);
        };

        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <div className="flex flex-col space-y-2">
              {field.options && field.options.map((option) => (
                <label key={option.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={`custom-checkbox-${field?.id || ''}-${option.id}`}
                    value={option.option}
                    checked={selectedCheckboxes.includes(option.option)}
                    onChange={(e) => handleCheckboxChange(option.option, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 rounded"
                    required={field?.is_required === 1 && selectedCheckboxes.length === 0}
                  />
                  <span className="ltr:ml-2 rtl:mr-2 text-sm text-gray-700">
                    {option.option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <input
              type="file"
              id={`custom-file-${field?.id || ''}`}
              name={`custom-file-${field?.id || ''}`}
              accept="image/*,application/pdf,video/*"
              onChange={(e) => handleCustomFileUpload(field?.id || 0, e.target.files?.[0] || null)}
              required={field?.is_required === 1 && !fieldValue}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:primaryBg file:text-white hover:file:primaryBg"
            />
            {currentFile && (
              <p className="text-xs text-gray-500 mt-1">{t("file_selected")}: {currentFile.name}</p>
            )}
            {!currentFile && typeof fieldValue === 'string' && fieldValue && (
              <div className="mt-2 text-left">
                <a href={fieldValue} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-2">
                  {t("view_existing_file")}
                </a>
                {renderExistingFilePreview(fieldValue)}
              </div>
            )}
          </div>
        );

      default:
        // Fallback: render as text input
        return (
          <div key={field?.id || Math.random()} className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <input
              type="text"
              id={`custom-text-${field?.id || ''}`}
              name={`custom-text-${field?.id || ''}`}
              value={(fieldValue as string) || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              placeholder={`Enter your ${field?.name || ''}`}
              required={field?.is_required === 1}
              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
            />
          </div>
        );
    }
  };


  // Handle update profile function with proper error handling
  // Follows the same pattern as handleStartQuiz
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = profileSchema.safeParse({ name: userData.name, country_code: userData.country_code });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setFormErrors({
        name: fieldErrors.name?.[0],
        country_code: fieldErrors.country_code?.[0],
      });
      return;
    }
    setFormErrors({});

    try {
      setIsUpdating(true);
      const mobileNumber = phoneNumber.number.replace(phoneNumber.countryCode, '');
      const countryCode = phoneNumber.countryCode || undefined;
      const isMultiMode = setting?.data?.instructor_mode === "multi";

      const updateParams: UpdateProfileParams = {
        name: userData.name,
        email: userData.email,
        mobile: mobileNumber,
        country_calling_code: countryCode || undefined,
        country_code: userData.country_code || undefined,
        profile: fileObjects.profile,
      };

      if (isMultiMode) {
        const socialMedias: SocialMediaEntry[] = [];
        if (userData.facebook) socialMedias.push({ url: userData.facebook, title: "Facebook" });
        if (userData.linkedin) socialMedias.push({ url: userData.linkedin, title: "LinkedIn" });
        if (userData.twitter) socialMedias.push({ url: userData.twitter, title: "Twitter" });
        if (userData.instagram) socialMedias.push({ url: userData.instagram, title: "Instagram" });
        if (userData.youtube) socialMedias.push({ url: userData.youtube, title: "YouTube" });

        updateParams.instructor_type = (userDetails?.instructor_details?.type === "individual" || userDetails?.instructor_details?.type === "team")
          ? userDetails.instructor_details.type
          : undefined;
        updateParams.qualification = userData.qualifications || undefined;
        updateParams.years_of_experience = userData.experience ? parseFloat(userData.experience) : undefined;
        updateParams.skills = userData.skills || undefined;
        updateParams.bank_account_number = userData.bankAccNum || undefined;
        updateParams.team_name = userData.teamName || undefined;
        updateParams.about_me = userData.aboutMe || undefined;
        updateParams.bank_name = userData.bankName || undefined;
        updateParams.bank_account_holder_name = userData.bankHolderName || undefined;
        updateParams.bank_ifsc_code = userData.bankIfscCode || undefined;
        updateParams.social_medias = socialMedias.length > 0 ? socialMedias : undefined;

        if (fileObjects.teamLogo) updateParams.team_logo = fileObjects.teamLogo;
        if (fileObjects.previewVideo) updateParams.preview_video = fileObjects.previewVideo;
        if (fileObjects.idProof) updateParams.id_proof = fileObjects.idProof;

        const otherDetails: OtherDetailEntry[] = [];
        if (customFields.length > 0 && Object.keys(customFieldsData).length > 0) {
          customFields.forEach((field) => {
            const fieldValue = customFieldsData[field.id];
            const originalDetail = userDetails?.instructor_details?.other_details?.find(
              (detail) => detail.custom_form_field_id === field.id
            );
            const originalValue = originalDetail?.value || "";
            const isUpdated = fieldValue instanceof File || fieldValue !== originalValue;

            if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '' && isUpdated) {
              if (field.type === 'checkbox' && field.options) {
                const selectedValues = (fieldValue as string).split(',').map(v => v.trim()).filter(v => v !== '');
                selectedValues.forEach((selectedVal) => {
                  const matchingOption = field.options!.find(opt => opt.option === selectedVal);
                  otherDetails.push({
                    id: field.id,
                    value: selectedVal,
                    ...(matchingOption ? { option_id: matchingOption.id } : {}),
                  });
                });
              } else {
                const detail: OtherDetailEntry = {
                  id: field.id,
                  value: fieldValue instanceof File ? '' : (fieldValue as string),
                  file: fieldValue instanceof File ? fieldValue : undefined,
                };
                if ((field.type === 'dropdown' || field.type === 'select' || field.type === 'radio') && field.options) {
                  const matchingOption = field.options.find(opt => opt.option === fieldValue);
                  if (matchingOption) detail.option_id = matchingOption.id;
                }
                otherDetails.push(detail);
              }
            }
          });
        }
        if (otherDetails.length > 0) updateParams.other_details = otherDetails;
      }


      // Call the update profile API
      const response = await updateProfile(updateParams);
      if (response) {
        // Check if API returned an error (error: true in response)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to update profile");
        } else {
          // Success - show success message
          toast.success(response.message || "Profile updated successfully");

          // Refresh user data from server to update Redux store
          // This ensures the component shows updated data immediately
          // Without this, the Redux store would still have old data until page refresh
          try {
            const userDetailsResponse = await getUserDetails();
            if (userDetailsResponse && !userDetailsResponse.error && userDetailsResponse.data) {
              // Update Redux store with fresh user data
              dispatch(setUserDataAction(userDetailsResponse.data));
              console.log("userDetailsResponse.data from EditProfile", userDetailsResponse.data);
            }
          } catch (refreshError) {
            // Log error but don't show toast - profile update was successful
            // User can refresh page manually if needed
            console.log("Error refreshing user data after profile update:", refreshError);
          }
        }
      } else {
        console.log("response is null in component", response);
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      extractErrorMessage(error);
    }
    finally {
      setIsUpdating(false);
    }
  };

  return (
    isClient &&
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b borderColor">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("edit_profile")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 flex-wrap inline-flex items-center gap-1 max-w-full">
            <Link href={"/"} className="primaryColor" title={t("home")}>
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("edit_profile")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar />

            <form className="bg-white flex-1 w-full space-y-8 rounded-[10px]" onSubmit={handleUpdateProfile}>
              <h2 className="text-xl font-semibold text-gray-800 py-4 px-6 mb-0">
                {t("edit_profile")}
              </h2>

              <hr className="borderColor" />
              {/* Personal Information */}
              <div className="bg-white border borderColor rounded-[10px] overflow-hidden m-6 mt-0">
                <h3 className="text-base font-semibold text-gray-800 sectionBg py-3 px-4 border-b borderColor">
                  {t("personal_information")}
                </h3>
                <div className="p-3 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-dashed border-2 border-gray-300 rounded-lg p-4">
                    <CustomImageTag src={userData.profile} alt={userData.name} className="w-20 h-20 rounded-full object-cover" />
                    <div className="flex-grow text-center sm:text-left">
                      <p className="font-medium text-gray-700">
                        {userData.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("upload_your_profile_picture")}
                      </p>
                    </div>
                    <label
                      htmlFor="profile-picture-upload"
                      className="mt-3 sm:mt-0 sm:ml-auto cursor-pointer primaryBg hover:primaryBg text-white text-sm py-2 px-4 rounded-[4px] transition-colors"
                    >
                      {t("upload")}
                      <input
                        id="profile-picture-upload"
                        name="profile-picture-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => { handleFileInputChange(e, "profile") }}
                      />
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {t("name")}
                      </label>
                      <input
                        type="text"
                        id="name"
                        placeholder={t("e_g_john_doe")}
                        className={`bg-[#F8F8F9] w-full rounded-[4px] p-3 border text-sm ${formErrors.name ? "border-red-500" : "borderColor"}`}
                        value={userData.name}
                        onChange={(e) => {
                          setUserData({ ...userData, name: e.target.value });
                          if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    {/* {userDetails.email && ( */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {t("email")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        readOnly={userDetails.type === "google" || userDetails.type === "email"}
                        disabled={userDetails.type === "google" || userDetails.type === "email"}
                        placeholder={t("e_g_email_address")}
                        className="bg-[#F8F8F9] w-full rounded-[4px] p-3 border borderColor text-sm"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      />
                    </div>
                    {/* )} */}
                  </div>

                  {/* {userDetails.type === "mobile" && ( */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                    <div>
                      <label
                        htmlFor="mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {t("mobile_number")}
                      </label>
                      <div >
                        <div className={isRTL ? "rtl-phone-input" : ""}>
                          <PhoneInput
                            // enableLongNumbers={true}
                            inputStyle={{ direction: getDirection() as "ltr" | "rtl" }}
                            country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || "in"}
                            value={phoneNumber.number || ''}
                            onChange={(value: string, country: { dialCode: string; name: string; countryCode: string }) => {
                              setPhoneNumber({
                                number: value || "",
                                countryCode: country.dialCode || "",
                              });
                            }}
                            disableDropdown={userDetails.type === "phone"}
                            countryCodeEditable={true}
                            inputProps={{
                              name: "contactNumber",
                              id: "contactNumber",
                              required: true,
                              className: `w-full border border-gray-300 rounded-[4px] phone-input-custom ${isRTL ? "pr-14 pl-2 text-right" : "ltr:pl-12"}`,
                              readOnly: userDetails.type === "phone",
                            }}
                            localization={isRTL ? ar : undefined}
                            placeholder={t("1234567890")}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("country")}
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={userData.country_code}
                        onChange={(e) => {
                          const selectedCode = e.target.value;
                          const countryEntry = CountryRegionData.default.find(c => c[1] === selectedCode);
                          setUserData({
                            ...userData,
                            country_code: selectedCode,
                            country_name: countryEntry ? countryEntry[0] : "",
                          });
                          if (formErrors.country_code) setFormErrors((prev) => ({ ...prev, country_code: undefined }));
                        }}
                        className={`w-full border rounded-[4px] p-3 text-sm bg-[#F8F8F9] ${formErrors.country_code ? "border-red-500" : "borderColor"}`}
                      >
                        <option value="">{t("select_country") || "Select Country"}</option>
                        {CountryRegionData.default.map(([name, code]) => (
                          <option key={code} value={code}>
                            {getFlagEmoji(code)} {name}
                          </option>
                        ))}
                      </select>
                      {formErrors.country_code && <p className="text-red-500 text-xs mt-1">{formErrors.country_code}</p>}
                    </div>
                  </div>

                  {/* )} */}
                </div>
              </div>

              {/* Instructor Account Type and Switch */}
              {userDetails?.is_instructor && userDetails.instructor_process_status !== "pending" && userDetails.instructor_process_status !== "rejected" && userDetails.instructor_process_status !== "suspended" && setting?.data?.instructor_mode == "multi" && (
                <div className="bg-white border borderColor rounded-[10px] overflow-hidden m-6 mt-0">
                  <div className="sectionBg py-3 px-6 border-b borderColor space-y-1">
                    <h3 className="text-base font-semibold text-gray-800">
                      {t("account_type")}
                    </h3>
                    <p className="text-sm text-gray-600">{t("manage_your_instructor_account_type_and_switch_between_individual_and_organisation_accounts")}</p>
                  </div>
                  <div className="p-3 space-y-6">
                    <div className="bg-[#F2F5F7] rounded-[8px] p-4 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-sm font-normal text-gray-600">{t("instructor_type")}</span>
                        <p className="text-base font-semibold text-gray-800">{instructorType === "individual" ? t("individual_instructor") : t("team_instructor")}</p>
                      </div>
                      {/* switch account modal */}
                      <SwitchAccountModal />
                    </div>
                  </div>
                </div>
              )}

              {
                (userDetails?.is_instructor && setting?.data?.instructor_mode == "multi") &&
                <div className="bg-white border borderColor rounded-[10px] overflow-hidden m-6 mt-0">
                  <h3 className="text-base font-semibold text-gray-800 sectionBg py-3 px-6 border-b borderColor">
                    {t("instructor_information")}
                  </h3>
                  <div className="p-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="qualifications"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("qualifications")}
                        </label>
                        <input
                          type="text"
                          id="qualifications"
                          placeholder={t("e_g_degree_name")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.qualifications}
                          onChange={(e) => setUserData({ ...userData, qualifications: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="experience"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("years_of_experience")}
                        </label>
                        <input
                          type="text"
                          id="experience"
                          placeholder={t("e_g_3")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.experience}
                          onChange={(e) => setUserData({ ...userData, experience: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="skills"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("skills")}
                        </label>
                        <input
                          type="text"
                          id="skills"
                          placeholder={t("e_g_javascript_react_web_development")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.skills}
                          onChange={(e) => setUserData({ ...userData, skills: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="facebook"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("facebook")}
                        </label>
                        <input
                          type="url"
                          id="facebook"
                          placeholder={t("e_g_paste_your_profile_link")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.facebook}
                          onChange={(e) => setUserData({ ...userData, facebook: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="linkedin"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("linkedin")}
                        </label>
                        <input
                          type="url"
                          id="linkedin"
                          placeholder={t("e_g_paste_your_profile_link")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.linkedin}
                          onChange={(e) => setUserData({ ...userData, linkedin: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="twitter"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("x")}
                        </label>
                        <input
                          type="url"
                          id="twitter"
                          placeholder={t("e_g_paste_your_profile_link")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.twitter}
                          onChange={(e) => setUserData({ ...userData, twitter: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="instagram"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("instagram")}
                        </label>
                        <input
                          type="url"
                          id="instagram"
                          placeholder={t("e_g_paste_your_profile_link")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.instagram}
                          onChange={(e) => setUserData({ ...userData, instagram: e.target.value })}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="youtube"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("youtube")}
                        </label>
                        <input
                          type="url"
                          id="youtube"
                          placeholder={t("e_g_paste_your_profile_link")}
                          className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                          value={userData.youtube}
                          onChange={(e) => setUserData({ ...userData, youtube: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="aboutMe"
                        className="block text-sm font-medium text-gray-700 mb-1 requireField"
                      >
                        {t("about_me")}
                      </label>

                      <ReactQuill
                        placeholder={t("write_short_description")} className="bg-[#F8F8F9] w-full text-sm break-all"
                        value={userData.aboutMe} onChange={(content) => setUserData({ ...userData, aboutMe: content })}
                      />

                      <p className="text-xs text-gray-500 mt-1">
                        {t("max_150_characters_allowed")}
                      </p>
                    </div>

                    {/* bank details starts  */}
                    <div>
                      <label
                        htmlFor="bankHolderName"
                        className="block text-sm font-medium text-gray-700 mb-1 requireField"
                      >
                        {t("bank_holder_name")}
                      </label>
                      <input
                        type="text"
                        id="bankHolderName"
                        placeholder={t("e_g_john_doe")}
                        className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                        required
                        value={userData.bankHolderName}
                        onChange={(e) => setUserData({ ...userData, bankHolderName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bankAccNum"
                        className="block text-sm font-medium text-gray-700 mb-1 requireField"
                      >
                        {t("bank_account_number")}
                      </label>
                      <input
                        type="text"
                        id="bankAccNum"
                        placeholder="123457896548712"
                        className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                        required
                        value={userData.bankAccNum}
                        onChange={(e) => setUserData({ ...userData, bankAccNum: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bankName"
                        className="block text-sm font-medium text-gray-700 mb-1 requireField"
                      >
                        {t("bank_name")}
                      </label>
                      <input
                        type="text"
                        id="bankName"
                        placeholder={t("e_g_bank_name")}
                        className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                        required
                        value={userData.bankName}
                        onChange={(e) => setUserData({ ...userData, bankName: e.target.value })}
                      />
                    </div>
                    {/* NOTE: currently on backend side it's known as ifsc code but user can enter anything as he wants. In future needs to change from backend side */}
                    <div>
                      <p className="font-normal text-[16px] text-[#010211] mb-2">
                        {t("enter_other_details")} <span className="text-[#DB3D26]">*</span>
                      </p>
                      <textarea
                        value={userData.bankIfscCode}
                        onChange={(e) => setUserData({ ...userData, bankIfscCode: e.target.value })}
                        name="otherCode"
                        className={`w-full border rounded-md p-3 bg-[#F9F9F9] text-[14px] border-[#D8E0E6]`}
                        placeholder={t("ifsc_swift_bic_iban")}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-6">
                      {/* team section  */}
                      {
                        userDetails?.instructor_details?.type === "team" &&
                        <div className="space-y-6">
                          {/* team name  */}
                          <div>
                            <label
                              htmlFor="teamName"
                              className="block text-sm font-medium text-gray-700 mb-1 requireField"
                            >
                              {t("team_name")}
                            </label>
                            <input
                              type="text"
                              id="teamName"
                              placeholder={t("team_name")}
                              className="bg-[#F8F8F9] w-full p-3 border borderColor rounded-[4px] text-sm"
                              required
                              value={userData.teamName}
                              onChange={(e) => setUserData({ ...userData, teamName: e.target.value })}
                            />
                          </div>
                          {/* Team Logo Section */}
                          <div className="space-y-2">
                            <label
                              htmlFor="team-logo-upload-input"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              {t("team_logo")} <span className="text-red-500">*</span>
                            </label>
                            {/* Drag and drop area */}
                            {
                              !userData.teamLogo &&
                              <div className="flex flex-col items-center justify-center w-full gap-2">
                                <label
                                  htmlFor="team-logo-upload-input"
                                  className="flex flex-col items-center justify-center w-full h-16 border border-gray-300 rounded-[4px] cursor-pointer bg-[#F8F8F9]"
                                >
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <p className="text-sm text-gray-500">
                                      <span className="font-semibold">
                                        {t("drag_and_drop_your_file_here_or_click_to")}
                                      </span>{" "}
                                      <span className="primaryColor underline">
                                        {t("browse")}
                                      </span>
                                    </p>
                                  </div>
                                  <input
                                    id="team-logo-upload-input"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => { handleFileInputChange(e, "teamLogo") }}
                                  />
                                </label>
                                <p className="font-normal text-[14px] leading-[18px] tracking-normal text-gray-500 justify-start w-full">
                                  {t("Upload_logo_Suggestion")}
                                </p>
                              </div>
                            }
                            {/* Team logo Preview Area */}
                            {
                              userData.teamLogo &&
                              <div className="mt-4 border borderColor rounded-[4px] w-full sm:w-max md:w-[300px] inline-block">
                                <p className="text-sm font-medium border-b borderColor px-4 py-2 text-gray-700 mb-2">
                                  {t("team_logo")}
                                </p>

                                <div className="relative mx-auto w-full sm:w-[280px] h-[200px] rounded-[4px] overflow-hidden flex items-center justify-center">
                                  <CustomImageTag src={userData.teamLogo} alt={userData.teamName} className="object-cover w-full h-full" />
                                </div>
                                {/* Delete Button Area - Centered below preview */}
                                <div className="flex border-t borderColor justify-end mt-2 px-2 py-2">
                                  <button className="p-1 font-semibold"
                                    onClick={() => {
                                      // Clear preview URL and file object
                                      if (userData.teamLogo && userData.teamLogo.startsWith('blob:')) {
                                        URL.revokeObjectURL(userData.teamLogo);
                                      }
                                      setUserData({ ...userData, teamLogo: "" });
                                      // Destructure to remove teamLogo from fileObjects - intentionally unused variable
                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                      const { teamLogo: _teamLogo, ...rest } = fileObjects;
                                      setFileObjects(rest);
                                    }}
                                  >
                                    <IoTrashOutline />
                                  </button>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                      {/* Preview Video Section  */}
                      <div className="space-y-2">
                        <label
                          htmlFor="preview-video-upload-input"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("preview_video")}
                        </label>
                        {/* Drag and drop area */}
                        {
                          !userData.previewVideo &&
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="preview-video-upload-input"
                              className="flex flex-col items-center justify-center w-full h-16 border border-gray-300 rounded-[4px] cursor-pointer bg-[#F8F8F9]"
                            >
                              <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    {t("drag_and_drop_your_file_here_or_click_to")}
                                  </span>{" "}
                                  <span className="primaryColor underline">
                                    {t("browse")}
                                  </span>
                                </p>
                              </div>
                              <input
                                id="preview-video-upload-input"
                                type="file"
                                className="sr-only"
                                accept={allowedVideoTypes?.join(",")}
                                onChange={(e) => { handleFileInputChange(e, "previewVideo") }}
                              />
                            </label>
                          </div>
                        }

                        {/* Preview Video Preview Area */}
                        {
                          userData.previewVideo &&
                          <div className="mt-4 border borderColor rounded-[4px] w-full sm:w-max md:w-[300px] inline-block">
                            <p className="text-sm font-medium border-b borderColor px-4 py-2 text-gray-700 mb-2">
                              {t("preview_video")}
                            </p>

                            <div className="relative mx-auto w-full sm:w-[280px] h-[200px] rounded-[4px] overflow-hidden flex items-center justify-center">
                              <ReactPlayer src={userData.previewVideo} controls={true} className="w-full h-full" width="100%" height="100%" />
                            </div>
                            {/* Delete Button Area - Centered below preview */}
                            <div className="flex border-t borderColor justify-end mt-2 px-2 py-2">
                              <button className="p-1 font-semibold"
                                onClick={() => {
                                  // Clear preview URL and file object
                                  if (userData.previewVideo && userData.previewVideo.startsWith('blob:')) {
                                    URL.revokeObjectURL(userData.previewVideo);
                                  }
                                  setUserData({ ...userData, previewVideo: "" });
                                  // Destructure to remove previewVideo from fileObjects - intentionally unused variable
                                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                  const { previewVideo: _previewVideo, ...rest } = fileObjects;
                                  setFileObjects(rest);
                                }}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                          </div>
                        }
                      </div>

                      {/* ID Proof Section - Replicated from Image */}
                      <div className="space-y-2">
                        <label
                          htmlFor="id-proof-upload-input"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("id_proof")} <span className="text-red-500">*</span>
                        </label>
                        {/* Drag and drop area */}
                        {
                          !userData.idProof &&
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="id-proof-upload-input"
                              className="flex flex-col items-center justify-center w-full h-16 border border-gray-300 rounded-[4px] cursor-pointer bg-[#F8F8F9]"
                            >
                              <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">
                                    {t("drag_and_drop_your_file_here_or_click_to")}
                                  </span>{" "}
                                  <span className="primaryColor underline">
                                    {t("browse")}
                                  </span>
                                </p>
                              </div>
                              <input
                                id="id-proof-upload-input"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={(e) => { handleFileInputChange(e, "idProof") }}
                              />
                            </label>
                          </div>
                        }
                        {
                          userData.idProof &&
                          <div className="mt-4 border borderColor rounded-[4px] w-full sm:w-max md:w-[300px] inline-block">
                            <p className="text-sm font-medium border-b borderColor px-4 py-2 text-gray-700 mb-2">
                              {t("id_proof")}
                            </p>

                            {/* IdProof Preview Area */}
                            <div className="relative mx-auto w-full sm:w-[280px] h-[200px] rounded-[4px] overflow-hidden flex items-center justify-center">
                              <CustomImageTag src={userData.idProof} alt={userData.teamName} className="object-cover w-full h-full" />
                            </div>
                            {/* Delete Button Area - Centered below preview */}
                            <div className="flex border-t borderColor justify-end mt-2 px-2 py-2">
                              <button className="p-1 font-semibold"
                                onClick={() => {
                                  // Clear preview URL and file object
                                  if (userData.idProof && userData.idProof.startsWith('blob:')) {
                                    URL.revokeObjectURL(userData.idProof);
                                  }
                                  setUserData({ ...userData, idProof: "" });
                                  // Destructure to remove idProof from fileObjects - intentionally unused variable
                                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                  const { idProof: _idProof, ...rest } = fileObjects;
                                  setFileObjects(rest);
                                }}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>

                  </div>
                </div>
              }

              {/* Custom Fields Section */}
              {userDetails?.is_instructor && setting?.data?.instructor_mode == "multi" && customFields && customFields.length > 0 && (
                <div className="bg-white border borderColor rounded-[10px] overflow-hidden m-6 mt-0">
                  <h3 className="text-base font-semibold text-gray-800 sectionBg py-3 px-6 border-b borderColor">
                    {t("additional_information")}
                  </h3>
                  <div className="p-3 space-y-6">
                    {customFields.map((field) => renderCustomField(field))}
                  </div>
                </div>
              )}

              <div className="flex justify-center mb-4">
                <button
                  type="submit"
                  className={`primaryBg hover:primaryBg text-white py-2 px-4 rounded-[4px] transition-colors ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isUpdating}
                >
                  {t("update_profile")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div >
    </Layout >
  );
}
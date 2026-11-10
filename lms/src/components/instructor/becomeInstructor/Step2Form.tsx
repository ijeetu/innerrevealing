"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { BecomeInstructorDataType, CustomFormField } from "@/types/instructorTypes/instructorTypes";
import { BiCloudUpload } from "react-icons/bi";
import { IoIosCloseCircle } from "react-icons/io";
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { becomeInstructorDataSelector, setBecomeInstructorData, setSocialMedia, setCustomFieldData } from "@/redux/instructorReducers/becomeInstructor";
import { userDataSelector } from "@/redux/reducers/userSlice";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { useTranslation } from "@/hooks/useTranslation";
import { translate } from "@/utils/helpers";

// Dynamically import ReactQuill with SSR disabled to prevent "document is not defined" error
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Define Zod schema for become instructor validation
const becomeInstructorSchema = z.object({
  qualification: z.any().optional(),
  experience: z.union([z.string(), z.number()]).optional().refine((val) => {
    if (val === undefined || val === null || val === '') return true;
    return Number(val) >= 0;
  }, translate("experience_cannot_be_negative")),
  skills: z.any().optional(),
  bankName: z.string().min(1, translate("bank_name_required")),
  bankHolderName: z.string().min(1, translate("bank_holder_name_required")),
  // Bank Account Number validation: digits only (supports international formats)
  bankAccNum: z
    .string()
    .min(1, translate("bank_account_number_required")),
  // IFSC Code validation: alphanumeric format (supports international bank codes)
  bankIfscCode: z
    .string()
    .min(1, translate("bank_ifsc_code_required"))
    .regex(/^[A-Z0-9]+$/, translate("bank_ifsc_code_invalid_format")),
  idProof: z.any().refine((val) => val !== null, translate("id_proof_required")),
  // previewVideo: z.any().refine((val) => val !== null, translate("preview_video_required")),
  aboutMe: z.string().min(1, translate("about_me_section_required")),
  teamName: z.string().optional(),
  teamLogo: z.any().optional(),
});

// Define team-specific schema
const teamInstructorSchema = becomeInstructorSchema.extend({
  teamName: z.string().min(1, translate("team_name_required")),
  teamLogo: z.any().refine((val) => val !== null, translate("team_logo_required")),
});

// Define a type for form errors
type FormErrors = Partial<Record<keyof BecomeInstructorDataType, string>>;

interface FileUploadProps {
  label: string;
  required?: boolean;
  description?: string;
  currentFile?: File | null;
  existingFileUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  required,
  currentFile,
  existingFileUrl,
  onFileSelected,
  error,
}) => {
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  // Update file preview when currentFile changes
  useEffect(() => {
    if (currentFile && currentFile.type?.includes('image')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(currentFile);
    } else {
      setFileDataUrl(null);
    }
  }, [currentFile]);

  // Generate ID for the input field
  const inputId = `file-upload-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Determine if this is a video upload field
  const isVideoUpload = label.toLowerCase()?.includes('video');

  // Setup react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: isVideoUpload
      ? {
        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'video/quicktime': ['.mov'],
        'video/x-msvideo': ['.avi'],
        'video/mpeg': ['.mpeg', '.mpg']
      }
      : {
        'image/png': ['.png'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'application/pdf': ['.pdf']
      },
    onDrop: acceptedFiles => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];

        // Check file size for videos (10MB limit)
        if (isVideoUpload && uploadedFile.size > 10 * 1024 * 1024) {
          toast.error(t("video_file_exceeds_the_maximum_size_of_10mb"));
          return;
        }

        onFileSelected(uploadedFile);

        // Create preview for images
        if (uploadedFile.type?.includes('image')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFileDataUrl(reader.result as string);
          };
          reader.readAsDataURL(uploadedFile);
        } else {
          setFileDataUrl(null);
        }
      }
    },
    multiple: false
  });

  // Handle file removal
  const handleFileRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileDataUrl(null);
    onFileSelected(null);
  };

  return (
    <div className="mb-6">
      <label className={`block text-sm font-medium text-black mb-1 ${required && 'requireField'}`}>
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`mt-1 flex justify-center items-center px-6 py-8 border-2 border-dashed rounded-lg sectionBg dark:bg-gray-800 transition-colors ${isDragActive
          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400"
          : "border-gray-300 dark:border-gray-600"
          }`}
      >
        <input {...getInputProps()} id={inputId} name={inputId} required={required} />

        {currentFile ? (
          <div className="space-y-3 text-center w-full break-all">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {t("file_selected")}: {currentFile.name}
            </p>

            {fileDataUrl && currentFile.type?.includes('image') && (
              <div className="mt-2 max-w-xs mx-auto flexCenter">
                <img
                  src={fileDataUrl}
                  alt="Preview"
                  className="max-h-40 object-contain"
                />
              </div>
            )}

            {currentFile.type === "application/pdf" && (
              <div className="mt-2">
                <p className="text-gray-600 dark:text-gray-400">{t("pdf_file_selected")}</p>
              </div>
            )}

            {currentFile.type?.includes('video') && (
              <div className="mt-2">
                <p className="text-green-600 font-medium">{t("video_file_selected")}</p>
                <p className="text-sm text-gray-500">
                  {(currentFile.size / (1024 * 1024)).toFixed(2)} MB · {currentFile.type.split('/')[1].toUpperCase()}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleFileRemove}
              className="commonBtn !bg-transparent primaryColor border !primaryBorder hover:!bg-transparent flex items-center justify-center gap-2 mx-auto"
            >
              {t("remove_file")}
              <IoIosCloseCircle className="ms-1" size={20} />
            </button>
          </div>
        ) : existingFileUrl ? (
          <div className="space-y-3 text-center w-full break-all">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {t("existing_file") || "Existing File"}: <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600" onClick={(e) => e.stopPropagation()}>{t("view_file") || "View File"}</a>
            </p>
            <div className="mt-2 max-w-xs mx-auto flexCenter">
              {/\.(mp4|webm|mov|avi|mpeg|mpg)(\?.*)?$/i.test(existingFileUrl) ? (
                <video src={existingFileUrl} controls className="max-h-40 w-full rounded" onClick={(e) => e.stopPropagation()} />
              ) : (
                <img
                  src={existingFileUrl}
                  alt="Existing Preview"
                  className="max-h-40 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {t("drag_and_drop_or_click_to_replace") || "Drag and drop or click to replace"}
            </div>
            <button
              type="button"
              className="commonBtn !bg-transparent primaryColor border !primaryBorder hover:!bg-transparent my-2"
            >
              {t("choose_new_file") || "Choose New File"}
            </button>
          </div>
        ) : (
          <div className="space-y-5 text-center">
            <div className="flexCenter">
              <div className="flexCenter w-14 h-14 bg-white rounded-[8px]">
                <BiCloudUpload size={40} color="#000" />
              </div>
            </div>
            <div className="mb-2 text-black dark:text-gray-300">
              {isDragActive
                ? t("drop_your_file_here")
                : isVideoUpload
                  ? t("choose_a_video_file_or_drag_and_drop_it_here")
                  : t("choose_a_file_or_drag_and_drop_it_here")}
            </div>
            <button
              type="button"
              // onClick={(e) => e.stopPropagation()}
              className="commonBtn !bg-transparent primaryColor border !primaryBorder hover:!bg-transparent my-2"
            >
              {t("choose_file")}
            </button>
            {isVideoUpload && (
              <p className="text-xs text-gray-500">
                {t("supported_formats")}
              </p>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

interface InputFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  name: string;
  error?: string;
  min?: string | number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = "text",
  required,
  value,
  onChange,
  name,
  error,
  min,
}) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className={`block text-sm font-medium text-black ${required ? 'requireField' : ''}`}
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      className={`mt-1 block w-full px-3 py-2 bg-white text-black border rounded-md focus:outline-none focus:primaryBorder sm:text-sm ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">{error}</p>
    )}
  </div>
);

interface Step2FormProps {
  customFields: CustomFormField[];
  instructorType: string | undefined;
  isValidate?: boolean;
  setIsStep2FormValid?: (isValid: boolean) => void;
  setIsValidating?: (isValidating: boolean) => void;
}

export default function Step2Form({
  customFields,
  instructorType,
  isValidate,
  setIsStep2FormValid,
  setIsValidating,
}: Step2FormProps) {

  const dispatch = useDispatch();

  // Get data from Redux store
  const becomeInstructorData = useSelector(becomeInstructorDataSelector);
  const userData = useSelector(userDataSelector) as UserDetails;

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  // Custom field validation errors: fieldId -> error message
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<number, string>>({});

  const { t } = useTranslation();
  const validateForm = () => {
    let zodPassed = true;
    let newErrors: FormErrors = {};

    try {
      const validationData: any = { ...becomeInstructorData };

      // Temporarily populate existing URL strings to bypass zod 'null' requirement for required files
      if (userData?.instructor_details?.personal_details?.id_proof && !validationData.idProof) {
        validationData.idProof = userData.instructor_details.personal_details.id_proof;
      }
      if (userData?.instructor_details?.personal_details?.team_logo && !validationData.teamLogo) {
        validationData.teamLogo = userData.instructor_details.personal_details.team_logo;
      }

      const schema = instructorType === 'team' ? teamInstructorSchema : becomeInstructorSchema;
      schema.parse(validationData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0] as keyof FormErrors;
            newErrors[fieldName] = err.message;
          }
        });
        setErrors(newErrors);
        zodPassed = false;
      }
    }

    // Validate required custom fields
    const newCustomFieldErrors: Record<number, string> = {};
    customFields.forEach((field) => {
      if (field.is_required === 1) {
        const value = becomeInstructorData.customFieldsData?.[field.id];
        let isEmpty = value === null || value === undefined || value === '';

        // If currently empty but user has pre-existing value/file in server for this, it is not actually empty
        if (isEmpty) {
          const originalDetail = userData?.instructor_details?.other_details?.find(
            (detail) => detail.custom_form_field_id === field.id
          );
          if (originalDetail?.value) {
            isEmpty = false;
          }
        }

        if (isEmpty) {
          newCustomFieldErrors[field.id] = `${field.name} ${t('is_required')}`;
        }
      }
    });
    setCustomFieldErrors(newCustomFieldErrors);

    const customFieldsPassed = Object.keys(newCustomFieldErrors).length === 0;

    if (!zodPassed || !customFieldsPassed) {
      toast.error(t("please_fix_the_validation_errors_before_continuing"));
      return false;
    }

    return true;
  };

  // Handle custom fields input change - Update Redux store
  const handleCustomFieldChange = (
    fieldId: number,
    value: string | File | null
  ) => {
    dispatch(setCustomFieldData({ fieldId, value }));
    // Clear per-field error when user provides a value
    if (value !== null && value !== undefined && value !== '') {
      setCustomFieldErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
    }
  };

  // Handle custom file upload - Update Redux store
  const handleCustomFileUpload = (fieldId: number, file: File | null) => {
    if (file && file.type?.includes('video') && file.size > 10 * 1024 * 1024) {
      toast.error(t("video_file_exceeds_the_maximum_size_of_10mb"));
      return;
    }
    handleCustomFieldChange(fieldId, file);
    // Clear per-field error when file is selected
    if (file) {
      setCustomFieldErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
    }
  };

  const renderCustomField = (field: CustomFormField) => {
    const fieldError = customFieldErrors[field.id];

    // Find any previously submitted file URL for this custom field
    const originalDetail = userData?.instructor_details?.other_details?.find(
      (detail) => detail.custom_form_field_id === field.id
    );
    const existingCustomFileUrl = originalDetail?.value || undefined;

    // customFieldsData may hold a URL string (pre-filled from server) or a File (new upload)
    const rawFieldValue = becomeInstructorData?.customFieldsData?.[field?.id || 0];
    const currentFileObject = rawFieldValue instanceof File ? rawFieldValue : null;
    // If server URL was stored in Redux as string, prefer that over originalDetail (more current)
    const existingFilePreviewUrl = rawFieldValue instanceof File
      ? existingCustomFileUrl
      : (typeof rawFieldValue === 'string' && rawFieldValue ? rawFieldValue : existingCustomFileUrl);

    switch (field.type) {
      case 'text':
        if (field?.name?.toLowerCase()?.includes('photo') ||
          field?.name?.toLowerCase()?.includes('image') ||
          field?.name?.toLowerCase()?.includes('picture') ||
          field?.name?.toLowerCase()?.includes('video') ||
          field?.name?.toLowerCase()?.includes('document') ||
          field?.name?.toLowerCase()?.includes('file')) {
          return (
            <FileUpload
              key={field?.id || Math.random()}
              label={field?.name || ''}
              required={field?.is_required === 1}
              description={`Upload your ${field?.name || ''}`}
              currentFile={currentFileObject}
              existingFileUrl={existingFilePreviewUrl}
              onFileSelected={(file) => handleCustomFileUpload(field?.id || 0, file)}
              error={fieldError}
            />
          );
        } else {
          return (
            <InputField
              key={field?.id || Math.random()}
              label={field?.name || ''}
              name={`custom-${field?.id || ''}`}
              placeholder={`${t('enter_your')} ${field?.name || ''}`}
              required={field?.is_required === 1}
              value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              error={fieldError}
            />
          );
        }

      case 'textarea':
        return (
          <div className="mb-4" key={field?.id || Math.random()}>
            <label
              htmlFor={`custom-textarea-${field?.id || ''}`}
              className={`block text-sm font-medium text-black mb-2 ${field?.is_required === 1 && 'requireField'}`}
            >
              {field?.name || ''}
            </label>
            <textarea
              id={`custom-textarea-${field?.id || ''}`}
              name={`custom-textarea-${field?.id || ''}`}
              value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              placeholder={`${t('enter_your')} ${field?.name || ''}`}
              required={field?.is_required === 1}
              rows={4}
              className={`mt-1 block w-full px-3 py-2 bg-white text-black border rounded-md focus:outline-none focus:primaryBorder sm:text-sm ${fieldError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        );

      case 'number':
        return (
          <InputField
            key={field?.id || Math.random()}
            label={field?.name || ''}
            name={`custom-${field?.id || ''}`}
            placeholder={`${t('enter_your')} ${field?.name || ''}`}
            type="number"
            required={field?.is_required === 1}
            value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
            onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
            error={fieldError}
          />
        );

      case 'email':
        return (
          <InputField
            key={field?.id || Math.random()}
            label={field?.name || ''}
            name={`custom-${field?.id || ''}`}
            placeholder={`${t('enter_your')} ${field?.name || ''}`}
            type="email"
            required={field?.is_required === 1}
            value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
            onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
            error={fieldError}
          />
        );

      case 'date':
        return (
          <InputField
            key={field?.id || Math.random()}
            label={field?.name || ''}
            name={`custom-${field?.id || ''}`}
            placeholder={`${t('select_your')} ${field?.name || ''}`}
            type="date"
            required={field?.is_required === 1}
            value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
            onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
            error={fieldError}
          />
        );

      case 'radio':
        return (
          <div className="mb-4" key={field?.id || Math.random()}>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <div className="flex flex-wrap gap-4 max-[374px]:flex-col max-[374px]:gap-2">
              {field.options && field.options.map((option) => (
                <label key={option.id} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`custom-radio-${field?.id || ''}`}
                    value={option.option}
                    checked={becomeInstructorData?.customFieldsData?.[field?.id || 0] === option.option}
                    onChange={() => handleCustomFieldChange(field?.id || 0, option.option)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    required={field?.is_required === 1}
                  />
                  <span className="ltr:ml-2 rtl:mr-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.option}
                  </span>
                </label>
              ))}
            </div>
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        );

      case 'dropdown':
      case 'select':
        return (
          <div className="mb-4" key={field?.id || Math.random()}>
            <label
              htmlFor={`custom-select-${field?.id || ''}`}
              className={`block text-sm font-medium text-black mb-2 ${field?.is_required === 1 && 'requireField'}`}
            >
              {field?.name || ''}
            </label>
            <select
              id={`custom-select-${field?.id || ''}`}
              name={`custom-select-${field?.id || ''}`}
              value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
              onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
              required={field?.is_required === 1}
              className={`mt-1 block w-full px-3 py-2 bg-white text-black border rounded-md focus:outline-none focus:primaryBorder sm:text-sm ${fieldError ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">{t('select')} {field?.name || t('an_option')}</option>
              {field.options && field.options.map((option) => (
                <option key={option.id} value={option.option}>
                  {option.option}
                </option>
              ))}
            </select>
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        );

      case 'checkbox': {
        const checkboxValue = becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || '';
        const selectedValues = checkboxValue ? checkboxValue.split(',') : [];

        const handleCheckboxChange = (optionValue: string, isChecked: boolean) => {
          const updated = isChecked
            ? [...selectedValues, optionValue]
            : selectedValues.filter((v) => v !== optionValue);
          handleCustomFieldChange(field?.id || 0, updated.join(','));
        };

        return (
          <div className="mb-4" key={field?.id || Math.random()}>
            <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${field?.is_required === 1 && 'requireField'}`}>
              {field?.name || ''}
            </label>
            <div className="flex flex-col space-y-2">
              {field.options && field.options.map((option) => (
                <label key={option.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={`custom-checkbox-${field?.id || ''}-${option.id}`}
                    value={option.option}
                    checked={selectedValues.includes(option.option)}
                    onChange={(e) => handleCheckboxChange(option.option, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 rounded"
                  />
                  <span className="ltr:ml-2 rtl:mr-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.option}
                  </span>
                </label>
              ))}
            </div>
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        );
      }

      case 'file':
        return (
          <FileUpload
            key={field?.id || Math.random()}
            label={field?.name || ''}
            required={field?.is_required === 1}
            description={`${t('upload_your')} ${field?.name || ''}`}
            currentFile={currentFileObject}
            existingFileUrl={existingFilePreviewUrl}
            onFileSelected={(file) => handleCustomFileUpload(field?.id || 0, file)}
            error={fieldError}
          />
        );

      default:
        return (
          <InputField
            key={field?.id || Math.random()}
            label={field?.name || ''}
            name={`custom-${field?.id || ''}`}
            placeholder={`${t('enter_your')} ${field?.name || ''}`}
            required={field?.is_required === 1}
            value={becomeInstructorData?.customFieldsData?.[field?.id || 0] as string || ''}
            onChange={(e) => handleCustomFieldChange(field?.id || 0, e.target.value)}
            error={fieldError}
          />
        );
    }
  };

  // Handle bank account number input - only allow digits
  const handleBankAccNumChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Remove any non-digit characters
    // const digitsOnly = value.replace(/\D/g, '');
    dispatch(setBecomeInstructorData({ [name]: value }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle experience input - prevent negative numbers
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Allow only digits (removes minus sign and other characters)
    const digitsOnly = value.replace(/\D/g, '');
    dispatch(setBecomeInstructorData({ [name]: digitsOnly }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle IFSC code input - auto-convert to uppercase and restrict format
  const handleIfscCodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert to uppercase and remove any spaces
    const upperValue = value.toUpperCase().replace(/\s/g, '');
    // Only allow alphanumeric characters
    const alphanumericOnly = upperValue.replace(/[^A-Z0-9]/g, '');
    dispatch(setBecomeInstructorData({ [name]: alphanumericOnly }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle other input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(setBecomeInstructorData({ [name]: value }));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleAboutMeChange = (content: string) => {
    dispatch(setBecomeInstructorData({ aboutMe: content }));

    // Clear error when user types in About Me
    if (errors.aboutMe) {
      setErrors({ ...errors, aboutMe: "" });
    }
  };

  // Handle file uploads - Update Redux store with file data
  const handleIdProofUpload = (file: File | null) => {
    dispatch(setBecomeInstructorData({ idProof: file }));

    // Clear error when file is uploaded
    if (errors.idProof) {
      setErrors({ ...errors, idProof: "" });
    }
  };

  const handlePreviewVideoUpload = (file: File | null) => {
    dispatch(setBecomeInstructorData({ previewVideo: file }));

    // Clear error when file is uploaded
    if (errors.previewVideo) {
      setErrors({ ...errors, previewVideo: "" });
    }
  };

  const handleTeamLogoUpload = (file: File | null) => {
    dispatch(setBecomeInstructorData({ teamLogo: file }));

    // Clear error when file is uploaded
    if (errors.teamLogo) {
      setErrors({ ...errors, teamLogo: "" });
    }
  };

  const handleSocialsMediaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(setSocialMedia({ key: name as keyof BecomeInstructorDataType['socialMedia'], value }));
  };

  useEffect(() => {
    if (isValidate) {
      const isValid = validateForm();
      setIsStep2FormValid?.(isValid);
      setIsValidating?.(false);
    }
  }, [isValidate]);

  return (
    <div  >
      <div className="bg-white border border-gray-200 rounded-lg space-y-6">
        {/* Team section (conditional) */}
        {instructorType === 'team' && (
          <div>
            <h3 className="text-lg sectionBg font-medium leading-6 text-gray-900 dark:text-white p-4">
              {t("team_information")}
            </h3>
            <hr className="border-gray-300" />
            <div className="p-4">
              <InputField
                label={t("team_name")}
                name="teamName"
                placeholder={t("enter_your_team_name")}
                required
                value={becomeInstructorData.teamName || ''}
                onChange={handleInputChange}
                error={errors.teamName}
              />
              {/* Team Logo Upload */}
              <FileUpload
                label={t("team_logo")}
                required
                description={t("upload_your_team_logo")}
                currentFile={becomeInstructorData.teamLogo}
                existingFileUrl={userData?.instructor_details?.personal_details?.team_logo}
                onFileSelected={handleTeamLogoUpload}
                error={errors.teamLogo}
              />
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg sectionBg font-medium leading-6 text-gray-900 dark:text-white p-4">
            {t("personal_information")}
          </h3>
          <hr className="border-gray-300" />
          <div className="p-4">
            <InputField
              label={t("qualifications")}
              name="qualification"
              placeholder={t("eg_degree_name")}
              value={becomeInstructorData.qualification}
              onChange={handleInputChange}
              error={errors.qualification}
            />
            <InputField
              label={t("years_of_experience")}
              name="experience"
              placeholder={t("eg_3")}
              type="number"
              min="0"
              value={becomeInstructorData.experience}
              onChange={handleExperienceChange}
              error={errors.experience}
            />
            <InputField
              label={t("skills")}
              name="skills"
              placeholder={t("eg_javascript_react_web_development")}
              value={becomeInstructorData.skills}
              onChange={handleInputChange}
              error={errors.skills}
            />
            <InputField
              label={t("bank_name")}
              name="bankName"
              placeholder={t("enter_your_bank_name")}
              value={becomeInstructorData.bankName}
              required
              onChange={handleInputChange}
              error={errors.bankName}
            />
            <InputField
              label={t("bank_holder_name")}
              name="bankHolderName"
              placeholder={t("enter_your_bank_holder_name")}
              value={becomeInstructorData.bankHolderName}
              required
              onChange={handleInputChange}
              error={errors.bankHolderName}
            />
            <InputField
              label={t("bank_account_number")}
              name="bankAccNum"
              placeholder={t("enter_your_bank_account_number")}
              value={becomeInstructorData.bankAccNum}
              required
              onChange={handleBankAccNumChange}
              error={errors.bankAccNum}
            />
            <InputField
              label={t("enter_other_details")}
              name="bankIfscCode"
              placeholder={t("ifsc_swift_bic_iban")}
              value={becomeInstructorData.bankIfscCode}
              required
              onChange={handleIfscCodeChange}
              error={errors.bankIfscCode}
            />
            {/* ID Proof Upload */}
            <FileUpload
              label={t('id_proof')}
              required
              description={t("please_upload_a_valid_id_proof_document")}
              currentFile={becomeInstructorData.idProof}
              existingFileUrl={userData?.instructor_details?.personal_details?.id_proof}
              onFileSelected={handleIdProofUpload}
              error={errors.idProof}
            />

            {/* Preview Video Upload */}
            <FileUpload
              label={t("preview_video")}
              // required
              description={t("upload_a_short_introduction_video_max_10mb")}
              currentFile={becomeInstructorData.previewVideo}
              existingFileUrl={userData?.instructor_details?.personal_details?.preview_video}
              onFileSelected={handlePreviewVideoUpload}
              error={errors.previewVideo}
            />
          </div>
        </div>



        {/* About Me Section */}
        <div>
          <h3 className="text-lg sectionBg font-medium leading-6 text-gray-900 dark:text-white p-4">
            {t("about_me")}
          </h3>
          <hr className="border-gray-300" />
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 requireField">
              {t("tell_us_about_yourself")}
            </label>
            <div className="prose prose-sm max-w-none sectionBg">
              <ReactQuill className="text-black" value={becomeInstructorData.aboutMe} onChange={handleAboutMeChange} />
            </div>
            {errors.aboutMe && (
              <p className="text-red-500 text-sm mt-1">{errors.aboutMe}</p>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg sectionBg font-medium leading-6 text-gray-900 dark:text-white p-4">
            {t("social_media_links")}
          </h3>
          <hr className="border-gray-300" />
          <div className="p-4">
            <InputField
              label={t("facebook")}
              name="facebook"
              placeholder="https://facebook.com/username"
              value={becomeInstructorData?.socialMedia?.facebook}
              onChange={handleSocialsMediaChange}
            />
            <InputField
              label={t("linkedin")}
              name="linkedin"
              placeholder="https://linkedin.com/in/username"
              value={becomeInstructorData?.socialMedia?.linkedin}
              onChange={handleSocialsMediaChange}
            />
            {/* NOTE: currently changed from frontend side need to change from backend side */}
            <InputField
              label={t("x")}
              name="twitter"
              placeholder="https://x.com/username"
              value={becomeInstructorData?.socialMedia?.twitter}
              onChange={handleSocialsMediaChange}
            />
            <InputField
              label={t("instagram")}
              name="instagram"
              placeholder="https://instagram.com/username"
              value={becomeInstructorData?.socialMedia?.instagram}
              onChange={handleSocialsMediaChange}
            />
            <InputField
              label={t("youtube")}
              name="youtube"
              placeholder="https://youtube.com/channel/channelid"
              value={becomeInstructorData?.socialMedia?.youtube}
              onChange={handleSocialsMediaChange}
            />
          </div>
        </div>

        {/* Custom Fields */}
        {customFields && customFields.length > 0 && (
          <div>
            <h3 className="text-lg sectionBg font-medium leading-6 text-gray-900 dark:text-white p-4">
              {t("additional_information")}
            </h3>
            <hr className="border-gray-300" />
            <div className="p-4">
              {customFields.map((field) => renderCustomField(field))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

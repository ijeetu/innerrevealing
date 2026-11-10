"use client";
import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { resourcesDataSelector, setResourcesData, curriculamDataSelector, setIsCurriculumCreated } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { dataSelector } from "@/redux/reducers/userSlice";
import { ResourcesTabDataType } from "@/types/instructorTypes/instructorTypes";
import { createCurriculumWithData, CurriculumCreationFormData } from "@/utils/api/instructor/createCourseApis/create-course/createCurriculum";
import { updateResourceWithData, ResourceUpdateFormData } from "@/utils/api/instructor/editCourse/editResource";
import toast from "react-hot-toast";
import { TabType } from "../ContentTabs";
import { allowedDocTypes, allowedVideoTypes, instructorResourceTypes } from "@/utils/helpers";
import { isEditCurriculumSelector, isUpdateFileSelector, lectureTypeIdSelector, setIsUpdateFile } from "@/redux/reducers/helpersReducer";
import UpdateFIleBtn from "@/components/commonComp/UpdateFIleBtn";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useTranslation } from "@/hooks/useTranslation";

// Define Zod schema for resources form validation
// This schema validates all required fields and resource type specific requirements
const resourcesFormSchema = z.object({
  resource_type: z.string().min(1, "Please select a resource type"),
  resource_title: z.string().min(1, "Resource title is required").max(100, "Title must be less than 100 characters"),
  resource_short_description: z.string().max(150, "Description must be less than 150 characters").optional(),
  resource_url: z.string().optional(),
  resource_file: z.any().optional(),
}).refine((data) => {
  // Validate URL requirement for youtube_url and external_url types
  if ((data.resource_type === "external_url") && (!data.resource_url || data.resource_url.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please provide a URL for External URL resources",
  path: ["resource_url"]
}).refine((data) => {
  // Validate file requirement for image, audio, video, and document types
  if ((data.resource_type === "image" || data.resource_type === "audio" || data.resource_type === "video" || data.resource_type === "document") && !data.resource_file) {
    return false;
  }
  return true;
}, {
  message: "Please select a file for image/audio/video/document resources",
  path: ["resource_file"]
}).refine((data) => {
  // Additional validation for resource_short_description based on type
  // All types require a description
  if (!data.resource_short_description || data.resource_short_description.trim() === "") {
    return false;
  }
  return true;
}, {
  message: "Resource description is required",
  path: ["resource_short_description"]
});

// Define a type for form errors
type FormErrors = Partial<Record<keyof ResourcesTabDataType, string>>;

// File input component for resources form
const ResourceFileInput: React.FC<{
  resourceType: string;
  selectedFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  isUpdateFile: boolean;
}> = ({ resourceType, selectedFile, handleFileChange, error, isUpdateFile }) => {
  // Dynamically set accepted file types based on resource type
  const getAcceptType = () => {
    if (resourceType === "image") return "image/*";
    if (resourceType === "audio") return "audio/*";
    if (resourceType === "video") return allowedVideoTypes?.join(",");
    if (resourceType === "document") return allowedDocTypes?.join(",");
    if (resourceType === "external_url") return ""; // No file input for external URLs
    return "";
  };

  const getFileLabel = () => {
    if (resourceType === "image") return "Image";
    if (resourceType === "audio") return "Audio";
    if (resourceType === "video") return "Video";
    if (resourceType === "document") return "Document";
    if (resourceType === "external_url") return "External URL"; // No file upload for external URLs
    return "Upload File";
  };

  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label htmlFor="resourceFileInput" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211] flex items-center justify-between">
        <span>
          {t("upload")} {getFileLabel()} <span className="text-red-500">*</span>
        </span>
        {
          isUpdateFile &&
          <UpdateFIleBtn />
        }
      </Label>
      <>
        {
          !isUpdateFile ?
            <>
              <div
                className={`block bg-[#F8F8F9] rounded-[8px] p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors ${error ? "border-red-500" : ""}`}
                onClick={() => document.getElementById('resourceFileInput')?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  if (droppedFiles.length > 0) {
                    const file = droppedFiles[0];
                    // Create a mock event object for the file change handler
                    const mockEvent = {
                      target: { files: [file] }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileChange(mockEvent);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  id="resourceFileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept={getAcceptType()}
                />
                <p className="text-gray-600">
                  {selectedFile ? (
                    <>
                      {t("selected")}: {" "}
                      <span className="text-[var(--primary-color)] font-medium">
                        {selectedFile.name}
                      </span>
                    </>
                  ) : (
                    <>
                      {t("drag_and_drop_your")} {resourceType === "image" ? "image" : resourceType === "audio" ? "audio" : resourceType === "video" ? "video" : resourceType === "document" ? "document" : resourceType === "external_url" ? "URL" : "file"} {t("here_or_click_to")} {" "}
                      <span className="text-[var(--primary-color)]">{t("browse")}</span>.
                    </>
                  )}
                </p>
              </div>
            </>
            :
            <>
              {
                resourceType === "image" ? (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      {/* <CustomImageTag src={selectedFile as unknown as string} alt={'Resource File'} /> */}
                      {selectedFile ? (
                        <CustomImageTag src={selectedFile as unknown as string} alt={'Resource File'} className="aspect-[20/12]" />
                      ) : (
                        <p className="text-gray-400 text-center py-4">No image selected</p>
                      )}
                    </div>
                  </div>
                ) : resourceType === "audio" ? (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      {/* <audio src={selectedFile as unknown as string} controls /> */}
                      {selectedFile ? (
                        <audio src={selectedFile as unknown as string} controls />
                      ) : (
                        <p className="text-gray-400 text-center py-4">No audio selected</p>
                      )}
                    </div>
                  </div>
                ) : resourceType === "video" ? (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      {/* <video src={selectedFile as unknown as string} controls /> */}
                      {selectedFile ? (
                        <video src={selectedFile as unknown as string} controls />
                      ) : (
                        <p className="text-gray-400 text-center py-4">No video selected</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      {/* <a href={selectedFile as unknown as string} download>{t("Download")}</a> */}
                      {selectedFile ? (
                        <a href={selectedFile as unknown as string} download>{t("Download")}</a>
                      ) : (
                        <p className="text-gray-400 text-center py-4">{t('no_document_selected')}</p>
                      )}
                    </div>
                  </div>
                )
              }
            </>
        }
      </>
      {/* {selectedFile && (
        <p className="text-xs text-gray-500">
          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      )} */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default function ResourcesForm({ setActiveTab }: { setActiveTab: (tab: TabType) => void }) {
  const dispatch = useDispatch();
  const resourcesData = useSelector(resourcesDataSelector) as ResourcesTabDataType;
  const curriculamData = useSelector(curriculamDataSelector);
  const isEditCurriculum = useSelector(isEditCurriculumSelector);
  const isResourcesEdit = isEditCurriculum === 'resources';
  const isUpdateFile = useSelector(isUpdateFileSelector);
  const documentTypeId = useSelector(lectureTypeIdSelector);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const { t } = useTranslation();

  // Validate form using Zod
  // This function validates the form data against the Zod schema and sets error states
  const validateForm = () => {
    try {
      // Validate form data with Zod schema
      resourcesFormSchema.parse(resourcesData);

      // Clear all errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format for display in UI
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const fieldName = err.path[0] as keyof FormErrors;
            newErrors[fieldName] = err.message;
          }
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors before submitting");
      }
      return false;
    }
  };

  // Direct Redux state access - no local useState needed
  const resourceType = resourcesData?.resource_type || "";
  const resourceTitle = resourcesData?.resource_title || "";
  const resourceDescription = resourcesData?.resource_short_description || "";
  const resourceDuration = resourcesData?.resource_duration || "";
  const selectedFile = resourcesData?.resource_file || null;


  // Handle file change and update resourcesData
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    dispatch(setResourcesData({ ...resourcesData, resource_file: file }));

    // Clear file-related errors when file is selected
    if (file && errors.resource_file) {
      setErrors({ ...errors, resource_file: "" });
    }
  };

  // Handle input change and clear errors
  // This function updates the form data and clears any existing errors for the field
  const handleInputChange = (field: keyof ResourcesTabDataType, value: string | number | File | null) => {
    dispatch(setResourcesData({ ...resourcesData, [field]: value }));

    // Clear error for this field when user types to provide immediate feedback
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form using Zod
      if (!validateForm()) {
        return;
      }

      // Additional validation for required context
      if (!curriculamData.chapterId) {
        toast.error("Chapter ID is missing. Please select a chapter first.");
        return;
      }

      setIsSubmitting(true);

      // Create curriculum data based on resource type
      const curriculumData: CurriculumCreationFormData = {
        chapter_id: curriculamData.chapterId,
        type: "document",
        qa_required: 0,
        document_type: resourcesData.resource_type === 'url' || resourcesData.resource_type === 'external_url' ? 'url' : 'file',
        document_title: resourceTitle,
        document_description: resourceDescription,
        document_duration: resourceDuration ? Number(resourceDuration) : null,
        document_file: (resourceType === "image" || resourceType === "audio" || resourceType === "video" || resourceType === "document") ? selectedFile || undefined : undefined,
        // Required assignment fields (ignored for document type)
        assignment_title: '',
        assignment_points: 0,
        assignment_description: '',
        assignment_media: new File([], ''),
        assignment_allowed_file_types: [],
        document_url: resourcesData.resource_url,
      };

      // Call the createCurriculumWithData API
      const response = await createCurriculumWithData(curriculumData, false);

      if (response.success) {
        toast.success("Resource created successfully!");
        dispatch(setIsCurriculumCreated(true));
        setActiveTab(null);
        // Reset form after successful submission
        dispatch(setResourcesData({
          resource_type: "",
          resource_title: "",
          resource_short_description: "",
          resource_duration: null,
          resource_file: null,
          resource_url: "",
        }));
      } else {
        toast.error(response.error || "Failed to create resource");
        console.error("Resource creation failed:", response);
      }

    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error("Error creating resource. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      // Validate required data
      if (!documentTypeId) {
        toast.error("Resource ID is missing");
        return;
      }

      if (!curriculamData.chapterId) {
        toast.error("Chapter ID is missing");
        return;
      }

      setIsSubmitting(true);


      // Create resource update data according to API structure
      const resourceUpdateData: ResourceUpdateFormData = {
        document_type_id: documentTypeId,
        chapter_id: curriculamData.chapterId,
        is_active: 1,
        type: 'resource',
        document_type: resourcesData.resource_type === 'url' || resourcesData.resource_type === 'external_url' ? 'url' : 'file',
        document_title: resourcesData.resource_title,
        document_description: resourcesData.resource_short_description || '',
        document_duration: resourcesData.resource_duration ? Number(resourcesData.resource_duration) : null,
        document_file: resourcesData.resource_file instanceof File ? resourcesData.resource_file : undefined,
        document_url: resourcesData.resource_url,
      };

      // Call the update resource API
      const response = await updateResourceWithData(resourceUpdateData);

      if (response.success) {
        toast.success("Resource updated successfully!");
        setActiveTab(null);
        // Reset form after successful submission
        dispatch(setResourcesData({
          resource_type: "",
          resource_title: "",
          resource_short_description: "",
          resource_duration: null,
          resource_file: null,
          resource_url: "",
        }));
        dispatch(setIsCurriculumCreated(true));
        dispatch(setIsUpdateFile({ curriculum: false }));

      } else {
        toast.error(response.error || "Failed to update resource");
        console.error("Resource update failed:", response);
      }

    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("An unexpected error occurred while updating the resource");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="bg-white  w-full h-full flex flex-col overflow-hidden ">
      <div className="h-[50px] border-b border-[#D8E0E6] flex items-center px-4">
        <h2 className="text-[14px] font-semibold leading-[18px] text-[#011B33]">
          {isResourcesEdit ? "Edit Resources" : "Add Resources"}
        </h2>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Resource Type */}
        <div className="space-y-2">
          <Label htmlFor="resourceType" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211]">
            {t("resource_type")} <span className="text-red-500">*</span>
          </Label>
          <Select value={resourceType} onValueChange={(value) => handleInputChange("resource_type", value)}>
            <SelectTrigger className={`w-full h-[36px] bg-[#F8F8F9] border-[#E8E8EC] rounded-[4px] px-3 py-[6px] gap-3 font-geist text-[14px] text-[#010211] data-[placeholder]:text-[#A2A2A5] data-[placeholder]:text-[14px] data-[placeholder]:leading-[24px] ${errors.resource_type ? "border-red-500" : ""}`}>
              <SelectValue placeholder={t("select_type")} className="text-[#A2A2A5] text-[14px]" />
            </SelectTrigger>
            <SelectContent>
              {instructorResourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.resource_type && (
            <p className="text-red-500 text-sm">{errors.resource_type}</p>
          )}
        </div>

        {/* Resource Title */}
        <div className="space-y-2">
          <Label htmlFor="resourceTitle" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211]">
            {t("resource_title")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="resourceTitle"
            placeholder={t("resource_text")}
            value={resourceTitle}
            className={`h-[36px] bg-[#F8F8F9] border-[#E8E8EC] rounded-[4px] px-3 py-[6px] gap-3 font-geist text-[14px] text-[#010211] placeholder:text-[#A2A2A5] placeholder:text-[14px] placeholder:leading-[24px] ${errors.resource_title ? "border-red-500" : ""}`}
            onChange={(e) => handleInputChange("resource_title", e.target.value)}
          />
          {errors.resource_title && (
            <p className="text-red-500 text-sm">{errors.resource_title}</p>
          )}
        </div>

        {/* Resource Description */}
        <div className="space-y-2">
          <Label htmlFor="resourceDescription" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211]">
            {t("resource_short_description")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="resourceDescription"
            placeholder={t("backend_assignment_description")}
            className={`bg-[#F8F8F9] border-[#E8E8EC] rounded-[4px] px-3 py-[6px] font-geist text-[14px] text-[#010211] placeholder:text-[#A2A2A5] placeholder:text-[14px] placeholder:leading-[24px] min-h-[80px] ${errors.resource_short_description ? "border-red-500" : ""}`}
            value={resourceDescription}
            onChange={(e) => handleInputChange("resource_short_description", e.target.value)}
          />
          <p className="text-sm text-gray-500">{t("max_150_characters_allowed")}</p>
          {errors.resource_short_description && (
            <p className="text-red-500 text-sm">{errors.resource_short_description}</p>
          )}
        </div>

        {resourceType === "video" && <div className="space-y-2">
          <Label htmlFor="resourceDuration" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211]">
            {t("resource_duration")}
          </Label>
          <Input
            id="resourceDuration"
            placeholder={t("resource_duration_placeholder")}
            value={resourceDuration}
            type="number"
            className={`h-[36px] bg-[#F8F8F9] border-[#E8E8EC] rounded-[4px] px-3 py-[6px] gap-3 font-geist text-[14px] text-[#010211] placeholder:text-[#A2A2A5] placeholder:text-[14px] placeholder:leading-[24px] ${errors.resource_duration ? "border-red-500" : ""}`}
            onChange={(e) => handleInputChange("resource_duration", e.target.value)}
          />
          {errors.resource_duration && (
            <p className="text-red-500 text-sm">{errors.resource_duration}</p>
          )}
        </div>}


        {/* Upload File for Image, Audio, or Video */}
        {resourceType !== "external_url" && (
          <ResourceFileInput
            resourceType={resourceType}
            selectedFile={selectedFile as File | null}
            handleFileChange={handleFileChange}
            error={errors.resource_file}
            isUpdateFile={isUpdateFile.curriculum}
          />
        )}

        {/* YouTube URL input for YouTube type */}
        {resourceType === "youtube_url" && (
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211]">
              {t('youtube_url')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="youtubeUrl"
              placeholder="https://youtube.com/watch?v=..."
              value={resourcesData.resource_url || ""}
              className={`h-[36px] bg-[#F8F8F9] border-[#E8E8EC] rounded-[4px] px-3 py-[6px] gap-3 font-geist text-[14px] text-[#010211] placeholder:text-[#A2A2A5] placeholder:text-[14px] placeholder:leading-[24px] ${errors.resource_url ? "border-red-500" : ""}`}
              onChange={(e) => handleInputChange("resource_url", e.target.value)}
            />
            {errors.resource_url && (
              <p className="text-red-500 text-sm">{errors.resource_url}</p>
            )}
          </div>
        )}

        {/* External URL input for External URL type */}
        {resourceType === "external_url" && (
          <div className="space-y-2">
            <Label htmlFor="externalUrl" className="text-[14px] font-normal leading-[18px] font-geist text-[#010211]">
              {t("external_url")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="externalUrl"
              placeholder="https://example.com/resource"
              value={resourcesData.resource_url || ""}
              className={`h-[36px] bg-[#F8F8F9] border-[#E8E8EC] rounded-[4px] px-3 py-[6px] gap-3 font-geist text-[14px] text-[#010211] placeholder:text-[#A2A2A5] placeholder:text-[14px] placeholder:leading-[24px] ${errors.resource_url ? "border-red-500" : ""}`}
              onChange={(e) => handleInputChange("resource_url", e.target.value)}
            />
            {errors.resource_url && (
              <p className="text-red-500 text-sm">{errors.resource_url}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={isResourcesEdit ? handleUpdate : handleSubmit}
          disabled={isSubmitting}
          className="commonBtn primaryBg hover:hoverBgColor"
        >
          {isSubmitting ? isResourcesEdit ? t("updating_resource") : t("creating_resource") : isResourcesEdit ? t("update_resource") : t("create_resource")}
        </Button>
      </div>
    </div>
  );
}

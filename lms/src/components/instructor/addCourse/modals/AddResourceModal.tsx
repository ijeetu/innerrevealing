"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lectureDataSelector, setLectureData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { useDispatch, useSelector } from "react-redux";
import { LectureTabDataType, ResourcesTabDataType } from "@/types/instructorTypes/instructorTypes";
import { allowedDocTypes, allowedVideoTypes, fileToBase64, getFileType, instructorResourceTypes } from "@/utils/helpers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

// Local schema mirrors ResourcesForm validation rules so both flows behave the same.
// This keeps modal inline checks in sync with the existing resources tab logic.
const resourceModalSchema = z.object({
  resource_type: z.string().min(1, "Please select a resource type"),
  resource_title: z.string().min(1, "Resource title is required").max(100, "Title must be less than 100 characters"),
  resource_url: z.string().optional(),
  resource_file: z.any().optional(),
}).refine((data) => {
  if (data.resource_type === "external_url" && (!data.resource_url || data.resource_url.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please provide a URL for External URL resources",
  path: ["resource_url"],
}).refine((data) => {
  if (data.resource_type !== "external_url" && !data.resource_file) {
    return false;
  }
  return true;
}, {
  message: "Please select a file for this resource",
  path: ["resource_file"],
});

interface FormErrors {
  resource_type?: string;
  resource_title?: string;
  resource_url?: string;
  resource_file?: string;
}

interface AddResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editResource: {
    isEditResource: boolean;
    resource: ResourcesTabDataType | null;
  };
}

export default function AddResourceModal({
  open,
  onOpenChange,
  editResource,
}: AddResourceModalProps) {

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const lectureData = useSelector(lectureDataSelector) as LectureTabDataType;

  const [resourceType, setResourceType] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // Clear only the targeted error so user feedback stays focused.
  const clearError = (field: keyof FormErrors) => {
    if (!errors[field]) {
      return;
    }
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // Validate current modal inputs before dispatching them into Redux.
  // This prevents incomplete resources from being attached to lectures.
  const validateResource = () => {
    const existingFile = editResource.isEditResource ? editResource.resource?.resource_file : null;
    const validationPayload = {
      resource_type: resourceType,
      resource_title: resourceTitle,
      resource_url: resourceUrl,
      resource_file: resourceType === "external_url" ? null : (files[0] || existingFile || null),
    };
    // console.log("validationPayload : ", validationPayload);
    // console.log("validation resource_file :  ", validationPayload.resource_file);

    const result = resourceModalSchema.safeParse(validationPayload);
    if (result.success) {
      setErrors({});
      return true;
    }

    const newErrors: FormErrors = {};
    result.error.errors.forEach((issue) => {
      const field = issue.path[0] as keyof FormErrors;
      newErrors[field] = issue.message;
    });
    setErrors(newErrors);
    toast.error("Please fix the validation errors before submitting");
    return false;
  };

  const handleAddResource = async () => {
    if (!validateResource()) {
      return;
    }
    try {
      let resourceFileContent = null;
      if (resourceType !== "external_url" && files.length > 0) {
        resourceFileContent = await fileToBase64(files[0]);
      }

      // Create the resource object with serializable data
      const mappedResource = {
        resource_type: resourceType,
        resource_title: resourceTitle,
        resource_url: resourceType === "external_url" ? resourceUrl : undefined,
        resource_file: resourceFileContent,
        id: Date.now(), // Temporary ID for local identification
      };

      dispatch(setLectureData({
        ...lectureData,
        resources: [...lectureData.resources, mappedResource]
      }));

      // Reset the form
      setResourceType("");
      setResourceTitle("");
      setResourceUrl("");
      setFiles([]);
      setErrors({});

      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files. Please try again.");
    }
  };

  const handleEditResource = async () => {
    if (!validateResource()) {
      return;
    }
    try {
      let resourceFileContent = editResource.resource?.resource_file || null;

      // If a new file is selected, convert it to base64
      if (resourceType !== "external_url" && files.length > 0) {
        resourceFileContent = await fileToBase64(files[0]);
      }

      // Create the resource object with serializable data
      const mappedResource = {
        resource_type: resourceType,
        resource_title: resourceTitle,
        resource_url: resourceType === "external_url" ? resourceUrl : undefined,
        resource_file: resourceType !== "external_url" ? resourceFileContent : null,
        // Keep the original ID for editing
        id: editResource.resource?.id,
      };

      const updatedResources = lectureData.resources.map(resource => {
        return resource.id === editResource.resource?.id ? mappedResource : resource;
      });

      dispatch(setLectureData({
        ...lectureData,
        resources: updatedResources
      }));

      // Reset the form
      setResourceType("");
      setResourceTitle("");
      setResourceUrl("");
      setFiles([]);
      setErrors({});

      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files. Please try again.");
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    clearError("resource_file");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      clearError("resource_file");
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (editResource.isEditResource) {
      onOpenChange(true)
      setFiles([]);
      // Populate form with existing resource data for editing
      if (editResource.resource) {
        setResourceTitle(editResource.resource.resource_title);

        let resType = editResource.resource.resource_type;
        // Handle cases where the type might be generic 'file' or 'url' from API
        if (resType === 'url') {
          resType = 'external_url';
        } else if (resType === 'file' && typeof editResource.resource.resource_file === 'string' && editResource.resource.resource_file.startsWith('data:')) {
          // Attempt to extract type from base64 if it's generic 'file'
          const mime = editResource.resource.resource_file.match(/data:([^;]+);base64/)?.[1];
          if (mime?.startsWith('image/')) resType = 'image';
          else if (mime?.startsWith('video/')) resType = 'video';
          else if (mime?.startsWith('audio/')) resType = 'audio';
          else if (mime) resType = 'document';
        }

        setResourceType(resType);
        setResourceUrl(editResource.resource.resource_url || "");
      }
    } else {
      // Clear form when switching to add mode
      setResourceType("")
      setResourceTitle("")
      setResourceUrl("")
      setFiles([])
      setErrors({})
    }
  }, [editResource]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editResource.isEditResource ? t("edit_resource") : t("add_resource")}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resource Type */}
          <div className="space-y-2">
            <Label htmlFor="resourceType">
              {t("resource_type")}<span className="text-red-500">*</span>
            </Label>
            <Select value={resourceType} onValueChange={(value) => {
              setResourceType(value);
              clearError("resource_type");
            }}>
              <SelectTrigger className={`sectionBg ${errors.resource_type ? "border-red-500" : ""}`}>
                <SelectValue placeholder={t("select_type")} />
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
            <Label htmlFor="resourceTitle">
              {t("resource_title")}<span className="text-red-500">*</span>
            </Label>
            <Input
              className={`sectionBg ${errors.resource_title ? "border-red-500" : ""}`}
              id="resourceTitle"
              placeholder={t("resource_text")}
              value={resourceTitle}
              onChange={(e) => {
                setResourceTitle(e.target.value);
                clearError("resource_title");
              }}
            />
            {errors.resource_title && (
              <p className="text-red-500 text-sm">{errors.resource_title}</p>
            )}
          </div>

          {/* Resource URL - Only show for external_url type & Preview */}
          {resourceType === "external_url" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resourceUrl">
                  {t("resource_url")}<span className="text-red-500">*</span>
                </Label>
                <Input
                  className={`sectionBg ${errors.resource_url ? "border-red-500" : ""}`}
                  id="resourceUrl"
                  placeholder="https://example.com/resource"
                  value={resourceUrl}
                  onChange={(e) => {
                    setResourceUrl(e.target.value);
                    clearError("resource_url");
                  }}
                />
                {errors.resource_url && (
                  <p className="text-red-500 text-sm">{errors.resource_url}</p>
                )}
              </div>

              {/* External URL Preview */}
              {resourceUrl && !errors.resource_url && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-xs font-medium text-blue-700 mb-1">{t("external_link_preview")}:</p>
                  <a href={resourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline break-all flex items-center gap-2">
                    {resourceUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Resource Files - Show for image, audio, video, and document types */}
          {resourceType !== "external_url" && (
            <div className="space-y-2">
              <Label htmlFor="resourceFiles">
                {t("resource_files")}<span className="text-red-500">*</span>
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${errors.resource_file ? "border-red-500" : "border-gray-300"}`}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  disabled={!resourceType}
                  accept={
                    resourceType === "image" ? "image/*" :
                      resourceType === "audio" ? "audio/*" :
                        resourceType === "video" ? allowedVideoTypes?.join(",") :
                          resourceType === "document" ? allowedDocTypes?.join(",") :
                            ""
                  }
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="text-gray-600">
                  {t("drag_and_drop_your")} {resourceType === "image" ? "image" : resourceType === "audio" ? "audio" : resourceType === "video" ? "video" : resourceType === "document" ? "document" : "file"} {t("here_or")}{" "}
                  <span className="text-blue-600 underline">{t("browse")}</span>
                </p>
              </div>


              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">{t("preview")}:</p>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    {resourceType === "image" && (
                      <CustomImageTag src={URL.createObjectURL(files[0])} alt="preview" className="max-h-60 object-contain mx-auto rounded shadow-sm" />
                    )}
                    {resourceType === "audio" && (
                      <audio src={URL.createObjectURL(files[0])} controls className="w-full" />
                    )}
                    {resourceType === "video" && (
                      <video src={URL.createObjectURL(files[0])} controls className="max-h-60 mx-auto rounded shadow-sm" />
                    )}
                    {resourceType === "document" && (
                      <div className="text-sm text-gray-600 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{files[0].name}</span>
                          <span className="text-xs text-gray-500">({(files[0].size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <a
                          href={URL.createObjectURL(files[0])}
                          download={files[0].name}
                          className="text-xs text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                        >
                          {t("download_preview_to_check")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Existing Edit Preview */}
              {editResource.isEditResource && files.length === 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">{t("current_resource")}:</p>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    {resourceType === "image" ? (
                      <CustomImageTag src={editResource.resource?.resource_file as string} alt={resourceTitle} className="max-h-60 object-contain mx-auto rounded shadow-sm" />
                    ) : resourceType === "audio" ? (
                      <audio src={editResource.resource?.resource_file as string} controls className="w-full" />
                    ) : resourceType === "video" ? (
                      <video src={editResource.resource?.resource_file as string} controls className="max-h-60 mx-auto rounded shadow-sm" />
                    ) : (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-700 font-medium">{resourceTitle}</p>
                        <a
                          href={editResource.resource?.resource_file as string}
                          download={`${resourceTitle}`}
                          className="text-sm text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                        >
                          {t("download_current_document")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {errors.resource_file && (
                <p className="text-red-500 text-sm mt-2">{errors.resource_file}</p>
              )}
            </div>
          )}

          <button
            onClick={editResource.isEditResource ? handleEditResource : handleAddResource}
            className="w-full mt-4 commonBtn py-2.5 rounded-lg active:scale-95 transition-transform"
          >
            {editResource.isEditResource ? t("update_resource") : t("add_resource")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BiPlus,
  BiEditAlt,
  BiSolidTrash,
  BiFile,
} from "react-icons/bi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LectureVideoPreviewModal from "./LectureVideoPreviewModal";
import { FaPaperclip } from "react-icons/fa6";
import { CurriculumTabDataType, LectureTabDataType, ResourcesTabDataType } from "@/types/instructorTypes/instructorTypes";
import AddResourceModal from "../modals/AddResourceModal";
import { useDispatch, useSelector } from "react-redux";
import { curriculamDataSelector, lectureDataSelector, setIsCurriculumCreated, setLectureData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { createCurriculumWithData, CurriculumCreationFormData } from "@/utils/api/instructor/createCourseApis/create-course/createCurriculum";
import { updateLectureWithData, LectureUpdateFormData } from "@/utils/api/instructor/editCourse/editLecture";
import toast from "react-hot-toast";
import { isEditCurriculumSelector, lectureTypeIdSelector, setIsEditCurriculum } from "@/redux/reducers/helpersReducer";
import { TabType } from "../ContentTabs";
import { useTranslation } from "@/hooks/useTranslation";
import FormSubmitLoader from "@/components/Loaders/FormSubmitLoader";
import { allowedDocTypes, allowedVideoTypes, base64ToFile } from "@/utils/helpers";
import {
  uploadFileInChunks,
  ChunkUploadProgress as ChunkUploadProgressType,
} from "@/utils/api/instructor/createCourseApis/create-course/chunkedUpload";
import ChunkUploadProgressBar from "./ChunkUploadProgressBar";
import { dataSelector, } from "@/redux/reducers/userSlice";
import { settingsSelector } from "@/redux/reducers/settingsSlice";


const hours = Array.from({ length: 25 }, (_, i) => ({
  value: i.toString(),
  label: i === 1 ? `${i} hour` : `${i} hours`,
}));

const minutes = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString(),
  label: i === 1 ? `${i} minute` : `${i} minutes`,
}));

const seconds = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString(),
  label: i === 1 ? `${i} second` : `${i} seconds`,
}));

const extractVideoDuration = (file: File): Promise<{ hours: string; minutes: string; seconds: string }> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const total = Math.floor(video.duration);
      video.src = '';
      URL.revokeObjectURL(url);
      resolve({
        hours: Math.floor(total / 3600).toString(),
        minutes: Math.floor((total % 3600) / 60).toString(),
        seconds: (total % 60).toString(),
      });
    };
    video.onerror = () => { video.src = ''; URL.revokeObjectURL(url); reject(); };
    video.src = url;
  });

const extractYoutubeVideoId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const getYoutubeDuration = (videoId: string): Promise<{ hours: string; minutes: string; seconds: string }> =>
  new Promise((resolve, reject) => {
    const tryCreate = () => {
      const div = document.createElement('div');
      div.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
      document.body.appendChild(div);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const player = new (window as any).YT.Player(div, {
        videoId,
        events: {
          onReady: () => {
            const dur = Math.floor(player.getDuration());
            player.destroy();
            div.remove();
            if (dur > 0) {
              resolve({
                hours: Math.floor(dur / 3600).toString(),
                minutes: Math.floor((dur % 3600) / 60).toString(),
                seconds: (dur % 60).toString(),
              });
            } else {
              reject(new Error('Could not get duration'));
            }
          },
          onError: () => { player.destroy(); div.remove(); reject(new Error('Player error')); },
        },
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT?.Player) {
      tryCreate();
    } else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prev = (window as any).onYouTubeIframeAPIReady;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        tryCreate();
      };
    }
    setTimeout(() => reject(new Error('Timeout')), 15000);
  });

// Define Zod schema for lecture form validation
// This schema validates all required fields and lecture type specific requirements
// Accepts translated messages so error strings can be localised
const createLectureFormSchema = (t: (key: string) => string) =>
  z.object({
    lectureTitle: z
      .string()
      .min(1, t('lecture_title_is_required'))
      .max(100, t('title_must_be_less_than_100_characters')),
    lectureDescription: z.string().optional(),
    lectureType: z.string().min(1, t('please_select_a_lecture_type')),
    lectureHours: z.string().optional(),
    lectureMinutes: z.string().optional(),
    lectureSeconds: z.string().optional(),
    lectureFreePreview: z.string().optional(),
    lectureFile: z.any().optional(),
    lectureUrl: z.string().optional(),
    lectureYoutubeUrl: z.string().optional(),
    resources: z.array(z.any()).optional(),
  }).refine((data) => {
    // Validate lecture type specific requirements
    // Each lecture type has different required fields
    if (data.lectureType === 'video' && !data.lectureFile) {
      return false;
    }
    if (data.lectureType === 'youtube' && (!data.lectureYoutubeUrl || data.lectureYoutubeUrl.trim() === '')) {
      return false;
    }
    if (data.lectureType === 'document' && !data.lectureFile) {
      return false;
    }
    return true;
  }, {
    message: t('please_provide_required_content_for_lecture_type') || 'Please provide the required content for the selected lecture type',
    path: ['lectureType'],
  });

// Define a type for form errors
type FormErrors = Partial<Record<keyof LectureTabDataType, string>>;

// File input component for lecture form
// File input component for lecture form
const LectureFileInput: React.FC<{
  lectureType: string;
  // UPDATE 1: Allow selectedFile to be a string (URL) as well as a File or null
  selectedFile: File | string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}> = ({ lectureType, selectedFile, handleFileChange, error }) => {
  // Dynamically set accepted file types
  const getAcceptType = () => {
    if (lectureType === "file") return allowedVideoTypes?.join(",");
    if (lectureType === "document") return allowedDocTypes?.join(",");
    return "";
  };
  const { t } = useTranslation();

  // UPDATE 2: Helper function to safely get the file name
  const getFileName = () => {
    if (!selectedFile) return "";
    // If it's a File object (new upload), return its name
    if (selectedFile instanceof File) return selectedFile.name;
    // If it's a string (existing URL), return the URL or extract the filename
    if (typeof selectedFile === 'string') return selectedFile;
    return "";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="lectureFileInput" className="text-sm font-medium">
        {t("upload_file")} <span className="text-red-500">*</span>
      </Label>
      <label htmlFor="lectureFileInput" className={`block bg-[#F8F8F9] rounded-[8px] p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors ${error ? "border-red-500" : ""}`}>
        <input
          id="lectureFileInput"
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept={getAcceptType()}
        />
        <p className="text-gray-600">
          {selectedFile ? (
            <>
              {t("selected")}: {" "}
              <span className="text-[var(--primary-color)] font-medium break-all">
                {/* UPDATE 3: Use the helper function to display the name */}
                {getFileName()}
              </span>
            </>
          ) : (
            <>
              {t("drag_and_drop_your_file_here_or_click_to")} {" "}
              <span className="text-[var(--primary-color)]">{t("browse")}</span>.
            </>
          )}
        </p>
      </label>

      {selectedFile instanceof File && (
        <p className="text-xs text-gray-500">
          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default function LectureForm({ setActiveTab }: { setActiveTab: (tab: TabType) => void }) {

  const dispatch = useDispatch();
  const lectureData = useSelector(lectureDataSelector) as LectureTabDataType;
  const curriculamData = useSelector(curriculamDataSelector) as CurriculumTabDataType;
  const settingData = useSelector(settingsSelector);
  const { chapterId } = curriculamData;
  const lectureTypeId = useSelector(lectureTypeIdSelector);

  const isEditCurriculum = useSelector(isEditCurriculumSelector);
  const isLectureEdit = isEditCurriculum === 'lecture';
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Chunk upload state
  const [chunkProgress, setChunkProgress] = useState<ChunkUploadProgressType | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (lectureData.lectureType !== 'youtube_url' || !lectureData.lectureYoutubeUrl) return;
    const videoId = extractYoutubeVideoId(lectureData.lectureYoutubeUrl);
    if (!videoId) return;
    const timer = setTimeout(() => {
      setYoutubeLoading(true);
      getYoutubeDuration(videoId)
        .then((dur) => {
          dispatch(setLectureData({ ...lectureData, lectureHours: dur.hours, lectureMinutes: dur.minutes, lectureSeconds: dur.seconds }));
        })
        .catch(() => { /* silently fail */ })
        .finally(() => setYoutubeLoading(false));
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureData.lectureYoutubeUrl, lectureData.lectureType]);


  // Helper to get the correct URL for preview (handles both File objects and URL strings)
  const previewUrl = React.useMemo(() => {
    if (lectureData.lectureFile instanceof File) {
      return URL.createObjectURL(lectureData.lectureFile);
    }
    return lectureData.lectureFile as string;
  }, [lectureData.lectureFile]);

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const { t } = useTranslation();

  const [editResource, setEditResource] = useState({
    isEditResource: false,
    resource: null as ResourcesTabDataType | null,
  })

  // Validate form using Zod
  // This function validates the form data against the Zod schema and sets error states
  const validateForm = () => {
    try {
      // Build schema with translated messages and validate
      const lectureFormSchema = createLectureFormSchema(t);
      lectureFormSchema.parse(lectureData);

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
        toast.error(t('please_fix_the_validation_errors_before_continuing') || 'Please fix the validation errors before submitting');
      }
      return false;
    }
  };

  // Handle file change — auto-detect duration then upload (sequential to avoid file handle conflict)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxSize = settingData?.data?.max_chunk_size;
    const file = e.target.files?.[0] || null;
    dispatch(setLectureData({ ...lectureData, lectureFile: file }));

    if (file && errors.lectureFile) {
      setErrors({ ...errors, lectureFile: "" });
    }

    setUploadedVideoName(null);
    setChunkProgress(null);

    if (file && lectureData.lectureType === 'file') {
      try {
        const dur = await extractVideoDuration(file);
        dispatch(setLectureData({ ...lectureData, lectureFile: file, lectureHours: dur.hours, lectureMinutes: dur.minutes, lectureSeconds: dur.seconds }));
      } catch {
        // duration extraction failed, proceed without it
      }

      const abortController = new AbortController();
      uploadAbortControllerRef.current = abortController;
      setIsUploading(true);

      const result = await uploadFileInChunks(file, (progress) => setChunkProgress(progress), maxSize, abortController.signal);
      uploadAbortControllerRef.current = null;
      setIsUploading(false);

      if (result.cancelled) {
        setChunkProgress(null);
        dispatch(setLectureData({ ...lectureData, lectureFile: null, lectureHours: '', lectureMinutes: '', lectureSeconds: '' }));
      } else if (result.success && result.videoName) {
        setUploadedVideoName(result.videoName);
        toast.success(t("video_uploaded_successfully") || "Video uploaded successfully!");
      } else {
        toast.error(result.error || t("video_upload_failed") || "Video upload failed. Please try again.");
        setChunkProgress(null);
      }
    }
  };

  const handleCancelUpload = () => {
    uploadAbortControllerRef.current?.abort();
  };

  // Handle input change and clear errors
  // This function updates the form data and clears any existing errors for the field
  const handleInputChange = (field: keyof LectureTabDataType, value: string | number | File | null) => {
    dispatch(setLectureData({ ...lectureData, [field]: value }));

    // Clear error for this field when user types to provide immediate feedback
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const courseTypes = [
    { value: "file", label: "Video" },
    { value: "youtube_url", label: "Youtube" },
    { value: "document", label: "Document" }
  ];

  const handleDeleteResource = (title: string) => {
    dispatch(setLectureData({ ...lectureData, resources: lectureData.resources.filter((resource) => resource.resource_title !== title) }));
  };

  const submitLectureData = async () => {
    // Validate form using Zod
    if (!validateForm()) {
      return;
    }

    // Additional validation for required context
    if (!chapterId) {
      toast.error("Chapter ID is missing");
      return;
    }

    // For video type: ensure the video has been uploaded first
    if (lectureData.lectureType === 'file' && !uploadedVideoName) {
      if (isUploading) {
        toast.error(t("please_wait_for_video_upload") || "Please wait for the video upload to complete.");
      } else {
        toast.error(t("please_upload_video_first") || "Please upload a video file first.");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Resolve lecture file only for non-video types (documents)
      let resolvedLectureFile: File | undefined;
      if (lectureData.lectureType === 'document') {
        if (lectureData.lectureFile instanceof File) {
          resolvedLectureFile = lectureData.lectureFile;
        } else if (
          typeof lectureData.lectureFile === 'string' &&
          (lectureData.lectureFile as string).startsWith('data:')
        ) {
          resolvedLectureFile = base64ToFile(lectureData.lectureFile, lectureData.lectureTitle) || undefined;
        }
      }

      // Create curriculum data object
      const curriculumData: CurriculumCreationFormData = {
        chapter_id: chapterId,
        type: 'lecture',
        lecture_title: lectureData.lectureTitle,
        lecture_description: lectureData.lectureDescription || '',
        lecture_type: lectureData.lectureType === 'document' ? 'file' : lectureData.lectureType as 'youtube_url' | 'file',
        lecture_hours: lectureData.lectureHours || '0',
        lecture_minutes: lectureData.lectureMinutes || '0',
        lecture_seconds: lectureData.lectureSeconds || '0',
        lecture_free_preview: lectureData.lectureFreePreview || '0',
        // For videos: don't send file (already uploaded), send video name instead
        // For documents: send file normally
        lecture_file: resolvedLectureFile,
        lecture_video_name: uploadedVideoName || undefined,
        lecture_youtube_url: lectureData.lectureType === 'youtube_url'
          ? (lectureData.lectureYoutubeUrl || lectureData.lectureUrl)
          : undefined,
        resource_status: lectureData.resources.length > 0 ? 1 : 0,
        // Required assignment fields (ignored for lecture type)
        assignment_title: '',
        assignment_points: 0,
        assignment_description: '',
        assignment_media: new File([], ''),
        assignment_allowed_file_types: [],
        resource_data: lectureData.resources.map((resource) => {
          // Normalize resource type for API
          const typeForApi = resource.resource_type === "external_url" || resource.resource_type === "url"
            ? "url"
            : "file";

          // Create base resource object
          const baseResource = {
            id: resource.id || undefined,
            resource_type: typeForApi as "url" | "file",
            resource_title: resource.resource_title,
          };

          // For URL resources, only include resource_url
          if (typeForApi === "url") {
            return {
              ...baseResource,
              resource_url: resource.resource_url || "",
            };
          }

          // For file/media resources, include resource_file
          return {
            ...baseResource,
            resource_file: resource.resource_file instanceof File
              ? resource.resource_file
              : (typeof resource.resource_file === 'string' && resource.resource_file.startsWith('data:')
                ? base64ToFile(resource.resource_file, resource.resource_title) || undefined
                : undefined),
          };
        })
      };

      // Call the createCurriculum API
      const response = await createCurriculumWithData(curriculumData);

      if (response.success) {
        toast.success("Lecture created successfully!");
        dispatch(setIsCurriculumCreated(true));

        // Reset form data after successful submission
        dispatch(setLectureData({
          lectureTitle: "",
          lectureDescription: "",
          lectureHours: "",
          lectureMinutes: "",
          lectureSeconds: "",
          lectureFreePreview: "0",
          lectureType: "",
          lectureUrl: "",
          lectureFile: null,
          lectureYoutubeUrl: "",
          resources: []
        }));
        setActiveTab(null);
        setChunkProgress(null);
        setUploadedVideoName(null);
      } else {
        toast.error(response.error || "Failed to create lecture");
        console.error("Lecture creation failed:", response);
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error("An unexpected error occurred while creating the lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditLectureData = async () => {
    // Validate form using Zod
    if (!validateForm()) {
      return;
    }

    // Additional validation for required context
    if (!chapterId) {
      toast.error("Chapter ID is missing");
      return;
    }

    // For video type with a new file selected: ensure upload is done
    if (
      lectureData.lectureType === 'file' &&
      lectureData.lectureFile instanceof File &&
      !uploadedVideoName
    ) {
      if (isUploading) {
        toast.error(t("please_wait_for_video_upload") || "Please wait for the video upload to complete.");
      } else {
        toast.error(t("please_upload_video_first") || "Please upload a video file first.");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Resolve lecture file only for non-video types (documents)
      let resolvedLectureFile: File | undefined;
      if (
        lectureData.lectureType === 'document' &&
        lectureData.lectureFile instanceof File
      ) {
        resolvedLectureFile = lectureData.lectureFile;
      }

      const lectureUpdateData: LectureUpdateFormData = {
        lecture_type_id: lectureTypeId!,
        chapter_id: chapterId,
        is_active: 1,
        type: 'lecture',
        lecture_title: lectureData.lectureTitle,
        lecture_description: lectureData.lectureDescription || '',
        lecture_type: lectureData.lectureType === 'document' ? 'file' : lectureData.lectureType as 'youtube_url' | 'file',
        lecture_youtube_url: lectureData.lectureType === 'youtube_url' ? (lectureData.lectureYoutubeUrl || lectureData.lectureUrl) : undefined,
        // For videos: don't send file (already uploaded), send video name instead
        // For documents: send file normally
        lecture_file: resolvedLectureFile,
        lecture_video_name: uploadedVideoName || undefined,
        lecture_hours: parseInt(lectureData.lectureHours || '0'),
        lecture_minutes: parseInt(lectureData.lectureMinutes || '0'),
        lecture_seconds: parseInt(lectureData.lectureSeconds || '0'),
        lecture_free_preview: lectureData.lectureFreePreview === '1' ? 1 : 0,
        resource_status: lectureData.resources.length > 0 ? 1 : 0,
        resource_data: lectureData.resources.map((resource) => {
          // Normalize resource type for API
          const typeForApi = resource.resource_type === "external_url" || resource.resource_type === "url"
            ? "url"
            : "file";

          // Create base resource object
          const baseResource = {
            id: resource.id || undefined,
            resource_type: typeForApi as "url" | "file",
            resource_title: resource.resource_title,
          };

          // For URL resources, include resource_url
          if (typeForApi === "url") {
            return {
              ...baseResource,
              resource_url: resource.resource_url || "",
            };
          }

          // For file/media resources, include resource_file
          return {
            ...baseResource,
            resource_file: resource.resource_file instanceof File
              ? resource.resource_file
              : (typeof resource.resource_file === 'string' && resource.resource_file.startsWith('data:')
                ? base64ToFile(resource.resource_file, resource.resource_title) || undefined
                : undefined),
          };
        })
      };

      // Call the updateLecture API
      const response = await updateLectureWithData(lectureUpdateData);

      if (response.success) {
        toast.success("Lecture updated successfully!");
        dispatch(setIsCurriculumCreated(true));
        dispatch(setIsEditCurriculum(null));

        // Reset form data after successful submission
        dispatch(setLectureData({
          lectureTitle: "",
          lectureDescription: "",
          lectureHours: "",
          lectureMinutes: "",
          lectureSeconds: "",
          lectureFreePreview: "0",
          lectureType: "video",
          lectureUrl: "",
          lectureFile: null,
          lectureYoutubeUrl: "",
          resources: []
        }));
        setActiveTab(null);
        setChunkProgress(null);
        setUploadedVideoName(null);
      } else {
        toast.error(response.error || "Failed to update lecture");
        console.error("Lecture update failed:", response);
      }
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error("An unexpected error occurred while updating the lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="sm:text-lg font-semibold">{isEditCurriculum ? t("edit_lecture") : t("add_lecture")}</h3>
      <div className="space-y-2">
        <Label htmlFor="lectureTitle" className="text-sm font-medium">
          {t("lecture_title")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lectureTitle"
          placeholder={t("introduction_to_interaction_design")}
          value={lectureData.lectureTitle}
          className={errors.lectureTitle ? "border-red-500" : ""}
          onChange={(e) => handleInputChange("lectureTitle", e.target.value)}
        />
        <p className="text-xs text-gray-500">{t("max_100_characters")}</p>
        {errors.lectureTitle && (
          <p className="text-red-500 text-sm">{errors.lectureTitle}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="courseType" className="text-sm font-medium">
          {t("lecture_type")} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={lectureData.lectureType}
          onValueChange={(value) => {
            dispatch(setLectureData({ ...lectureData, lectureType: value, lectureHours: '', lectureMinutes: '', lectureSeconds: '' }));
            if (errors.lectureType) setErrors({ ...errors, lectureType: "" });
          }}
        >
          <SelectTrigger className={`w-full ${errors.lectureType ? "border-red-500" : ""}`}>
            <SelectValue placeholder={t("select_type")} />
          </SelectTrigger>
          <SelectContent>
            {courseTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.lectureType && (
          <p className="text-red-500 text-sm">{errors.lectureType}</p>
        )}
      </div>

      {/* Course duration — manual only for document type */}
      {lectureData.lectureType === 'document' && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours" className="text-sm font-medium">
              {t("hours")} <span className="text-red-500">*</span>
            </Label>
            <Select value={lectureData.lectureHours} onValueChange={(value) => handleInputChange("lectureHours", value)}>
              <SelectTrigger className={`w-full ${errors.lectureHours ? "border-red-500" : ""}`}>
                <SelectValue placeholder={t("select_hours")} />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour.value} value={hour.value}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes" className="text-sm font-medium">
              {t("minutes")} <span className="text-red-500">*</span>
            </Label>
            <Select value={lectureData.lectureMinutes} onValueChange={(value) => handleInputChange("lectureMinutes", value)}>
              <SelectTrigger className={`w-full ${errors.lectureMinutes ? "border-red-500" : ""}`}>
                <SelectValue placeholder={t("select_minutes")} />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute.value} value={minute.value}>
                    {minute.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seconds" className="text-sm font-medium">
              {t("seconds")} <span className="text-red-500">*</span>
            </Label>
            <Select value={lectureData.lectureSeconds} onValueChange={(value) => handleInputChange("lectureSeconds", value)}>
              <SelectTrigger className={`w-full ${errors.lectureSeconds ? "border-red-500" : ""}`}>
                <SelectValue placeholder={t("select_seconds")} />
              </SelectTrigger>
              <SelectContent>
                {seconds.map((second) => (
                  <SelectItem key={second.value} value={second.value}>
                    {second.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Upload File for Video or Document */}
      {(lectureData.lectureType === "file" || lectureData.lectureType === "document") && (
        <div className="space-y-4 ">
          <LectureFileInput
            lectureType={lectureData.lectureType}
            selectedFile={lectureData.lectureFile as File | string | null}
            handleFileChange={handleFileChange}
            error={errors.lectureFile}
          />

          {/* Chunk upload progress bar — shown during upload */}
          {chunkProgress && (
            <ChunkUploadProgressBar progress={chunkProgress} />
          )}

          {/* Cancel upload button */}
          {isUploading && (
            <button
              type="button"
              onClick={handleCancelUpload}
              className="text-sm text-red-500 hover:text-red-700 underline"
            >
              {t("cancel_upload") || "Cancel Upload"}
            </button>
          )}

          {/* Auto-detected duration info for video */}
          {lectureData.lectureType === 'file' && lectureData.lectureHours !== '' && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              {t("duration_auto_detected") || "Duration auto-detected"}: {lectureData.lectureHours}h {lectureData.lectureMinutes}m {lectureData.lectureSeconds}s
            </p>
          )}

          {/* Upload success indicator */}
          {uploadedVideoName && chunkProgress?.status === 'completed' && (
            <p className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-1">
              {t("video_uploaded_ready") || "Video uploaded and ready. Fill in the details and submit."}
            </p>
          )}

          {isMounted && isLectureEdit && lectureData.lectureType === "file" && lectureData.lectureFile && (
            <LectureVideoPreviewModal previewUrl={previewUrl} />
          )}
        </div>
      )}

      {/* Youtube URL input for Youtube type */}
      {lectureData.lectureType === "youtube_url" && (
        <div className="space-y-2">
          <Label htmlFor="youtubeUrl" className="text-sm font-medium">
            {t("youtube_url")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="youtubeUrl"
            placeholder={t("youtube_url_placeholder")}
            value={lectureData.lectureYoutubeUrl}
            className={errors.lectureYoutubeUrl ? "border-red-500" : ""}
            onChange={(e) => handleInputChange("lectureYoutubeUrl", e.target.value)}
          />
          {errors.lectureYoutubeUrl && (
            <p className="text-red-500 text-sm">{errors.lectureYoutubeUrl}</p>
          )}
          {youtubeLoading && (
            <p className="text-xs text-gray-500">{t("detecting_video_duration") || "Detecting video duration..."}</p>
          )}
          {!youtubeLoading && lectureData.lectureHours !== '' && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              {t("duration_auto_detected") || "Duration auto-detected"}: {lectureData.lectureHours}h {lectureData.lectureMinutes}m {lectureData.lectureSeconds}s
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id="allowPreview"
          checked={lectureData.lectureFreePreview === "1"}
          onCheckedChange={(checked) => handleInputChange("lectureFreePreview", checked ? "1" : "0")}
        />
        <Label
          htmlFor="allowPreview"
          className="text-sm font-medium cursor-pointer"
        >
          {t("check_this_to_allow_students_to_preview_this_lecture")}
        </Label>
      </div>

      <div className="pt-3">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            setEditResource({ isEditResource: false, resource: null });
            setAddResourceModalOpen(true);
          }}
        >
          <BiPlus className="h-4 w-4" /> {t("add_resources")}
        </Button>
        {/* Add Resource Modal */}
        <AddResourceModal
          open={addResourceModalOpen}
          onOpenChange={setAddResourceModalOpen}
          editResource={editResource}
        />
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{t("resources")}</h3>

        {lectureData.resources.length > 0 ? (
          <div className="space-y-2">
            {lectureData.resources.map((resource, idx) => (
              <div
                key={resource.resource_title + idx}
                className="flex items-center justify-between p-3 border borderColor rounded-md"
              >

                <div className="flex items-center">
                  {/* Use resource_type for icon logic */}
                  {resource.resource_type === "document" ? (
                    <span className="h-7 w-7 primaryColor mr-2 flexCenter primaryLightBg text-xl rounded-[4px]">
                      <BiFile className="" />
                    </span>
                  ) : (
                    <span className="h-7 w-7 primaryColor mr-2 flexCenter primaryLightBg text-xl rounded-[4px]">
                      <FaPaperclip className="-rotate-45" />
                    </span>
                  )}
                  {/* Use resource_title for display */}
                  <span>{resource.resource_title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditResource({ isEditResource: true, resource: resource })}>
                    <BiEditAlt className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteResource(resource.resource_title)}
                  >
                    <BiSolidTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("no_resources_added_yet")}</p>
        )}
      </div>

      <div className="pt-4 border-t borderColor space-y-4">
        <Button
          onClick={() => isLectureEdit ? submitEditLectureData() : submitLectureData()}
          className="primaryBg hover:hoverBgColor"
          disabled={isSubmitting || isUploading}
        >
          {isUploading
            ? (t("uploading_video") || "Uploading video...")
            : isSubmitting
              ? `${isLectureEdit ? t("updating_lecture") : t("creating_lecture")}`
              : isLectureEdit ? t("update_lecture") : t("submit_lecture")
          }
          {
            (isSubmitting || isUploading) && (
              <FormSubmitLoader />
            )
          }
        </Button>
      </div>
    </div >
  );
}

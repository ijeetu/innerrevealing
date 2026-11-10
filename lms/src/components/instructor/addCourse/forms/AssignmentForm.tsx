"use client";
import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { assignmentDataSelector, setAssignmentData, curriculamDataSelector, setIsCurriculumCreated } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import { AssignmentTabDataType, CurriculumTabDataType } from "@/types/instructorTypes/instructorTypes";
import { createCurriculumWithData, CurriculumCreationFormData } from "@/utils/api/instructor/createCourseApis/create-course/createCurriculum";
import { updateAssignmentWithData, AssignmentUpdateFormData } from "@/utils/api/instructor/editCourse/editAssignment";
import toast from "react-hot-toast";
import { TabType } from "../ContentTabs";
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { isEditCurriculumSelector, isUpdateFileSelector, lectureTypeIdSelector, setIsUpdateFile } from "@/redux/reducers/helpersReducer";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { convertDateToDueDays, convertDueDaysToDate } from "@/utils/helpers";
import UpdateFIleBtn from "@/components/commonComp/UpdateFIleBtn";
import { useTranslation } from "@/hooks/useTranslation";



const assignmentFormSchema = z.object({
  assignment_title: z.string()
    .min(1, "Assignment title is required")
    .max(100, "Title must be less than 100 characters"),
  assignment_short_description: z.string()
    .min(1, "Assignment description is required")
    .max(500, "Description must be less than 500 characters"),
  assignment_media: z.any()
    .optional()
    .refine((file) => {
      if (!file || !(file instanceof File)) return true; // Optional — skip validation if not provided
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    }, {
      message: "File size must be less than 10MB"
    })
    .refine((file) => {
      if (!file || !(file instanceof File)) return true; // Optional — skip validation if not provided
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'application/zip',
        'application/x-rar-compressed'
      ];
      return allowedTypes.includes(file.type);
    }, {
      message: "File type not supported. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP, RAR"
    }),
  assignment_points: z.number({
    required_error: "Points is required",
    invalid_type_error: "Points must be a number",
  })
    .min(1, "Points must be at least 1")
    .max(1000, "Points cannot exceed 1000")
});

// Define a type for form errors
type FormErrors = Partial<Record<keyof AssignmentTabDataType, string>>;

// Assignment types array - moved outside component to prevent recreation on every render
const assignmentTypes = [
  { id: 3, name: "Image" },
  { id: 2, name: "Video" },
  { id: 1, name: "Audio" },
  { id: 4, name: "Document" },
];

// Multi-select component for assignment types
const AssignmentTypeMultiSelect = ({
  assignmentTypes,
  selectedTypeIds,
  onTypeChange,
  placeholder = "Select Assignment Types",
  className = ""
}: {
  assignmentTypes: { id: number; name: string }[];
  selectedTypeIds: number[];
  onTypeChange: (typeIds: number[]) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleMultiSelectChange = (typeId: number) => {
    const newTypeIds = selectedTypeIds.includes(typeId)
      ? selectedTypeIds.filter(id => id !== typeId)
      : [...selectedTypeIds, typeId];

    onTypeChange(newTypeIds);
  };

  // Get selected type names for display
  const selectedTypeNames = selectedTypeIds.map(id => {
    const type = assignmentTypes.find(t => t.id === id);
    return type ? type.name : `Type ${id}`;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="hover:!bg-white bg-white">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${selectedTypeIds.length > 0 ? 'text-black hover:text-black' : 'text-gray-400 !font-[500] hover:text-gray-400'} ${className}`}
        >
          {selectedTypeIds.length > 0 ? selectedTypeNames.join(", ") : placeholder}
          <FaAngleDown className="!h-3 !w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className='w-full'>
          <CommandList>
            <CommandEmpty>{t("no_assignment_types_found")}</CommandEmpty>
            <CommandGroup>
              {assignmentTypes?.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.name}
                  onSelect={() => handleMultiSelectChange(type.id)}
                  className="w-full"
                >
                  <FaCheck
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTypeIds.includes(type.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {type.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function AssignmentForm({ setActiveTab }: { setActiveTab: (tab: TabType) => void }) {

  const dispatch = useDispatch();
  const assignmentData = useSelector((assignmentDataSelector)) as AssignmentTabDataType;
  const curriculamData = useSelector(curriculamDataSelector) as CurriculumTabDataType;

  const isEditCurriculum = useSelector(isEditCurriculumSelector);
  const isAssignmentEdit = isEditCurriculum === 'assignment';
  const isUpdateFile = useSelector(isUpdateFileSelector);
  const assignmentTypeId = useSelector(lectureTypeIdSelector);


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedAssignmentTypes, setSelectedAssignmentTypes] = useState<number[]>([]);

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});

  const { t } = useTranslation();

  // Handle due_days conversion when editing
  useEffect(() => {
    // Check if we have a submission date that looks like a number (due_days)
    if (assignmentData.assignment_submission_date &&
      !isNaN(Number(assignmentData.assignment_submission_date)) &&
      Number(assignmentData.assignment_submission_date) >= 0) {

      const dueDays = Number(assignmentData.assignment_submission_date);
      const actualDate = convertDueDaysToDate(dueDays);

      // Update the assignment data with the actual date
      dispatch(setAssignmentData({
        assignment_submission_date: actualDate
      }));
    }
  }, [assignmentData.assignment_submission_date, dispatch]);


  // Initialize selected assignment types from existing data
  useEffect(() => {
    if (assignmentData.assignment_allowed_file_types && Array.isArray(assignmentData.assignment_allowed_file_types)) {
      const typeIds = assignmentData.assignment_allowed_file_types.map(typeName => {
        const type = assignmentTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase());
        return type ? type.id : null;
      }).filter(id => id !== null) as number[];

      setSelectedAssignmentTypes(typeIds);
    }
  }, [assignmentData.assignment_allowed_file_types]);

  // Validate form using Zod
  // This function validates the form data against the Zod schema and sets error states
  const validateForm = () => {
    try {
      // Validate form data with Zod schema
      assignmentFormSchema.parse(assignmentData);

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    dispatch(setAssignmentData({ assignment_media: file }));

    // Clear file-related errors when file is selected
    if (file && errors.assignment_media) {
      setErrors({ ...errors, assignment_media: "" });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      dispatch(setAssignmentData({ assignment_media: file }));

      // Clear file-related errors when file is dropped
      if (file && errors.assignment_media) {
        setErrors({ ...errors, assignment_media: "" });
      }
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      // Calculate due days from submission date
      const dueDays = convertDateToDueDays(assignmentData.assignment_submission_date);

      // Format assignment data according to API structure
      const curriculumData: CurriculumCreationFormData = {
        chapter_id: curriculamData.chapterId,
        type: 'assignment',
        qa_required: 0,
        assignment_title: assignmentData.assignment_title,
        assignment_due_days: dueDays,
        assignment_description: assignmentData.assignment_short_description,
        assignment_media: assignmentData.assignment_media as File,
        assignment_points: assignmentData.assignment_points || 0,
        assignment_can_skip: assignmentData.assignment_can_skip ? 1 : 0,
        assignment_allowed_file_types: assignmentData.assignment_allowed_file_types || []
      };

      // Call the createCurriculumWithData API
      const response = await createCurriculumWithData(curriculumData, false);

      if (response.success) {
        toast.success("Assignment created successfully!");
        dispatch(setIsCurriculumCreated(true));
        setActiveTab(null);
        // Reset form after successful submission
        dispatch(setAssignmentData({
          assignment_title: "",
          assignment_submission_date: "",
          assignment_short_description: "",
          assignment_media: null,
          assignment_points: 0,
          assignment_allowed_file_types: []
        }));
        setSelectedFile(null);
        setSelectedAssignmentTypes([]);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(response.error || "Failed to create assignment");
        console.error("Assignment creation failed:", response);
      }

    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("An unexpected error occurred while creating the assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeAllowedFileTypes = (typeIds: number[]) => {
    setSelectedAssignmentTypes(typeIds);
    // Update the assignment data with the selected types
    const selectedTypeNames = typeIds.map(id => {
      const type = assignmentTypes.find(t => t.id === id);
      return type ? type.name.toLowerCase() : '';
    });
    dispatch(setAssignmentData({
      assignment_allowed_file_types: selectedTypeNames
    }));
    // Clear error when user selects types
    if (errors.assignment_allowed_file_types) {
      setErrors({ ...errors, assignment_allowed_file_types: "" });
    }
  };


  const handleUpdateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validate form using Zod (same as create flow)
      if (!validateForm()) {
        return;
      }

      // Validate required data
      if (!assignmentTypeId) {
        toast.error("Assignment ID is missing");
        return;
      }

      if (!curriculamData.chapterId) {
        toast.error("Chapter ID is missing");
        return;
      }

      setIsSubmitting(true);

      // Calculate due days from submission date
      const dueDays = convertDateToDueDays(assignmentData.assignment_submission_date);

      // Create assignment update data according to API structure
      const assignmentUpdateData: AssignmentUpdateFormData = {
        assignment_type_id: assignmentTypeId,
        chapter_id: curriculamData.chapterId,
        is_active: 1,
        type: 'assignment',
        assignment_title: assignmentData.assignment_title,
        assignment_points: assignmentData.assignment_points || 0,
        assignment_description: assignmentData.assignment_short_description,
        assignment_instructions: '', // Instructions field not available in current type
        assignment_due_days: dueDays,
        assignment_can_skip: assignmentData.assignment_can_skip ? 1 : 0,
        assignment_allowed_file_types: assignmentData.assignment_allowed_file_types || [],
        assignment_media: selectedFile || undefined,
      };


      // Call the update assignment API
      const response = await updateAssignmentWithData(assignmentUpdateData);

      if (response.success) {
        toast.success("Assignment updated successfully!");
        dispatch(setIsUpdateFile({ curriculum: false }));
        setActiveTab(null);
        // Reset the form and update state
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        dispatch(setAssignmentData({
          assignment_title: "",
          assignment_submission_date: "",
          assignment_short_description: "",
          assignment_media: null,
          assignment_points: 0,
          assignment_allowed_file_types: []
        }));

        // Dispatch to refresh curriculum list
        dispatch(setIsCurriculumCreated(true));

        // Reset update file flag
        dispatch(setIsUpdateFile({ curriculum: false }));

      } else {
        toast.error(response.error || "Failed to update assignment");
        console.error("Assignment update failed:", response);
      }

    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("An unexpected error occurred while updating the assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="sm:text-lg font-semibold">{isAssignmentEdit ? t("edit_assignment") : t("add_assignment")}</h2>

      {/* divider */}
      <div className="w-full h-[1px] bg-gray-200"></div>

      <form onSubmit={isAssignmentEdit ? handleUpdateAssignment : handleSubmitAssignment} className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="assignment-title" className="block">
            {t("assignment_title")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="assignment-title"
            value={assignmentData.assignment_title}
            onChange={(e) => {
              dispatch(setAssignmentData({ assignment_title: e.target.value }));
              // Clear error when user starts typing
              if (errors.assignment_title) {
                setErrors({ ...errors, assignment_title: "" });
              }
            }}
            placeholder={t("assignment_title")}
            className={`w-full bg-[#F8F8F9] ${errors.assignment_title ? "border-red-500" : ""}`}
          />
          {errors.assignment_title && (
            <p className="text-red-500 text-sm">{errors.assignment_title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignment-description" className="block">
            {t("assignment_short_description")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="assignment-description"
            value={assignmentData.assignment_short_description}
            onChange={(e) => {
              dispatch(setAssignmentData({ assignment_short_description: e.target.value }));
              // Clear error when user starts typing
              if (errors.assignment_short_description) {
                setErrors({ ...errors, assignment_short_description: "" });
              }
            }}
            placeholder={t("backend_assignment_description")}
            className={`w-full min-h-[100px] bg-[#F8F8F9] ${errors.assignment_short_description ? "border-red-500" : ""}`}
          />
          <p className="text-sm text-gray-500">{t("max_500_characters_allowed")}</p>
          {errors.assignment_short_description && (
            <p className="text-red-500 text-sm">{errors.assignment_short_description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignment-media" className="flex items-center justify-between">
            {/* <div>
              {t("assignment_media")} <span className="text-red-500">*</span>
            </div> */}
            {
              isUpdateFile.curriculum &&
              <UpdateFIleBtn />
            }
          </Label>
          {
            !isUpdateFile.curriculum ?
              <>
                <div
                  onClick={handleFileClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`rounded-md p-6 sectionBg text-center cursor-pointer hover:bg-slate-100 transition-colors ${errors.assignment_media ? "border-red-500 border-2 border-dashed" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    id="assignment-media"
                  />
                  <p className="text-sm text-gray-500">
                    {selectedFile ? (
                      <>{t("selected_files")}: {selectedFile.name}</>
                    ) : (
                      <>
                        {t("drag_and_drop_your_file_here_or_click_to")}{" "}
                        <span className="primaryColor underline">
                          {t("browse")}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                {errors.assignment_media && (
                  <p className="text-red-500 text-sm">{errors.assignment_media}</p>
                )}
                {/* Preview for newly uploaded file */}
                {selectedFile && (() => {
                  try {
                    const mediaUrl = URL.createObjectURL(selectedFile);
                    const type = selectedFile.type || "";
                    const isImage = type.startsWith("image/");
                    const isVideo = type.startsWith("video/");
                    const isAudio = type.startsWith("audio/");

                    if (isImage) {
                      return (
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                            <CustomImageTag src={mediaUrl} alt={"Assignment Media"} className="w-full object-contain h-[150px] m-auto" />
                          </div>
                        </div>
                      );
                    } else if (isAudio) {
                      return (
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                            <audio src={mediaUrl} controls className="w-full" />
                          </div>
                        </div>
                      );
                    } else if (isVideo) {
                      return (
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                            <video src={mediaUrl} controls className="w-full max-h-[150px]" />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  } catch (e) {
                    return null;
                  }
                })()}
              </>
              :
              <>
                {(() => {
                  const mediaData = assignmentData.media_url || assignmentData.assignment_media;
                  if (!mediaData || typeof mediaData !== 'string') return null;

                  const mediaUrl = mediaData as string;
                  const extStr = (assignmentData as any).media_extension || "";
                  const lowerUrl = mediaUrl.toLowerCase();

                  const isImage = extStr.match(/^(jpeg|jpg|gif|png|webp|svg)$/i) || lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i);
                  const isVideo = extStr.match(/^(mp4|webm|ogg)$/i) || lowerUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                  const isAudio = extStr.match(/^(mp3|wav)$/i) || lowerUrl.match(/\.(mp3|wav)(\?.*)?$/i);

                  if (isImage) {
                    return (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                          <CustomImageTag src={mediaUrl} alt={"Assignment Media"} className="w-full object-contain h-[150px] m-auto" />
                        </div>
                      </div>
                    );
                  } else if (isAudio) {
                    return (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                          <audio src={mediaUrl} controls className="w-full" />
                        </div>
                      </div>
                    );
                  } else if (isVideo) {
                    return (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                          <video src={mediaUrl} controls className="w-full max-h-[150px]" />
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                          <a href={mediaUrl} download className="text-blue-500 hover:underline">{t("Download")}</a>
                        </div>
                      </div>
                    );
                  }
                })()}
              </>
          }
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignmentTypes" className="text-sm font-medium">
            {t("allowed_submission_file_types")} <span className="text-red-500">*</span>
          </Label>
          <AssignmentTypeMultiSelect
            assignmentTypes={assignmentTypes}
            selectedTypeIds={selectedAssignmentTypes}
            onTypeChange={(typeIds) => { handleChangeAllowedFileTypes(typeIds); }}
            placeholder={t("select_allowed_file_types")}
            className={errors.assignment_allowed_file_types ? "border-red-500" : ""}
          />
          {errors.assignment_allowed_file_types && (
            <p className="text-red-500 text-sm">{errors.assignment_allowed_file_types}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="points" className="block">
            {t("points")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="points"
            type="number"
            value={assignmentData.assignment_points ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              dispatch(setAssignmentData({ assignment_points: val === "" ? (null as unknown as number) : Number(val) }));
              // Clear error when user changes points
              if (errors.assignment_points) {
                setErrors({ ...errors, assignment_points: "" });
              }
            }}
            placeholder={t("points")}
            className={`w-full sectionBg ${errors.assignment_points ? "border-red-500" : ""}`}
          />
          {errors.assignment_points && (
            <p className="text-red-500 text-sm">{errors.assignment_points}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableSkip"
            checked={assignmentData.assignment_can_skip}
            onCheckedChange={(checked) =>
              dispatch(setAssignmentData({ assignment_can_skip: checked as boolean }))
            }
            className="h-5 w-5 rounded-sm primaryBorder data-[state=checked]:primaryBg data-[state=checked]:text-white"
          />
          <Label htmlFor="enableSkip" className="text-sm cursor-pointer">
            {t("check_this_if_you_want_to_allow_users_to_skip_the_assignment")}
          </Label>
        </div>

        <Button
          className="commonBtn primaryBg hover:hoverBgColor"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? isAssignmentEdit ? t("updating_assignment") : t("creating_assignment") : isAssignmentEdit ? t("update_assignment") : t("submit_assignment")}
        </Button>
      </form>
    </div>
  );
}

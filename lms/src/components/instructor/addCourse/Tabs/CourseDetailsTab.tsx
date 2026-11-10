"use client";
import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BiSolidUserPlus } from "react-icons/bi";
import { useCourseTab } from "@/contexts/CourseTabContext";
import { FaAngleRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { CoInstructorType, CourseDetailsDataType, TagsAndLanguagesType } from "@/types/instructorTypes/instructorTypes";
import { TeamMemberDataType } from "@/utils/api/instructor/team-member/getTeamMembers";
import toast from "react-hot-toast";
import { getTags } from "@/utils/api/instructor/createCourseApis/getTags";
// import TagsSelect from "../TagsSelect";
import { IoCloseSharp } from "react-icons/io5";
import { teamMemberDataSelector, teamMemberLimit, totalTeamMembers } from "@/redux/instructorReducers/teamMemberSlice";
import { setTeamMemberOffset, extractErrorMessage, allowedVideoTypes } from "@/utils/helpers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import InviteTeamMemberModal from "../../addTeamMember/InviteTeamMemberModal";

// new code from here
import { addCourseDataSelector, setCourseDetailsData } from "@/redux/instructorReducers/AddCourseSlice";
import { getCourseLanguages, CourseLanguage } from "@/utils/api/general/getCourseLanguages";
import { isUpdateFileSelector } from "@/redux/reducers/helpersReducer";
import ReactPlayer from "react-player";
import UpdateFIleBtn from "@/components/commonComp/UpdateFIleBtn";
import RemoveFIleBtn from "@/components/commonComp/RemoveFIleBtn";
import { useTranslation } from "@/hooks/useTranslation";
import { Category, getCategories } from "@/utils/api/instructor/course/getCategories";
import { userDataSelector } from "@/redux/reducers/userSlice";
import { usePathname } from "next/navigation";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { isRTLSelector } from "@/redux/reducers/languageSlice";

// Define Zod schema for course details validation
const courseDetailsSchema = z.object({
  title: z.string().min(1, "Course title is required").max(100, "Title must be less than 100 characters"),
  shortDescription: z.string().min(1, "Short description is required").max(500, "Description must be less than 500 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  difficultyLevel: z.string().min(1, "Please select difficulty level"),
  languageId: z.string().min(1, "Please select a language"),
  courseTag: z.array(z.string()).refine((val) => val.length > 0, "At least one tag is required"),
  whatYoullLearn: z.array(z.object({ title: z.string() })).min(1, "At least one learning objective is required"),
  requirements: z.array(z.object({ requirement: z.string() })).min(1, "At least one requirement is required"),
  instructor: z.array(z.string()).optional(),
  thumbnail: z.any().optional().refine((val) => val !== null, "Thumbnail is required"),
  video: z.any().optional().refine((val) => val !== null, "Video is required"),
});

// Define a type for form errors
type FormErrors = Partial<Record<keyof CourseDetailsDataType, string>>;

const CourseDetailsTab: React.FC = () => {

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const pathname = usePathname();
  const isEditCourse = pathname.includes('edit-course');

  // selectors
  const userData = useSelector(userDataSelector) as UserDetails;
  const createCourseData = useSelector(addCourseDataSelector);
  const { courseDetailsData } = createCourseData;

  const teamMembers = useSelector(teamMemberDataSelector) as TeamMemberDataType[]
  const teamMemberLimitValue = useSelector(teamMemberLimit);
  const totalTeamMembersCount = useSelector(totalTeamMembers);
  const [coInstructors, setCoInstructors] = useState<CoInstructorType[]>([]);
  const isUpdateFile = useSelector(isUpdateFileSelector)
  const isRTL = useSelector(isRTLSelector);

  const { setActiveTab } = useCourseTab();

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});

  const [learnPoints, setLearnPoints] = useState<string>("")
  const [requirements, setRequirements] = useState<string>("")

  const [isCoInstructorDialogOpen, setIsCoInstructorDialogOpen] = useState<boolean>(false);

  // File upload states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<File | null>(null);

  // Refs for file inputs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [tags, setTags] = useState<TagsAndLanguagesType[]>([])
  const [languages, setLanguages] = useState<CourseLanguage[]>([])

  // Tag suggestion states
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<TagsAndLanguagesType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState<string>('');

  // Categories states
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);

  // Initialize selected tags from courseDetailsData when it changes
  useEffect(() => {
    if (courseDetailsData.courseTag && Array.isArray(courseDetailsData.courseTag)) {
      // Handle API format: [{id: 7, name: "test"}, {id: 8, name: "44"}]
      if (courseDetailsData.courseTag.length > 0 && typeof courseDetailsData.courseTag[0] === 'object' && 'name' in courseDetailsData.courseTag[0]) {
        const tagNames = courseDetailsData.courseTag.map((tag: { name: string } | string) => typeof tag === 'object' ? tag.name : tag);
        setSelectedTags(tagNames);
      }
      // Handle string array format: ["tag1", "tag2"]
      else if (courseDetailsData.courseTag.length > 0 && typeof courseDetailsData.courseTag[0] === 'string') {
        setSelectedTags(courseDetailsData.courseTag);
      }
    }
  }, [courseDetailsData.courseTag]);


  const handleContinue = () => {
    if (languages.length === 0) {
      toast.error(t("languages_required"));
      return;
    }
    if (categoriesData.length === 0) {
      toast.error(t("categories_required"));
      return;
    }
    if (validateForm()) {
      setActiveTab("pricing")
    }
  }

  // Validate form using Zod
  const validateForm = () => {
    try {
      // Prepare data for validation - convert instructor array from numbers to strings if needed
      const validationData = {
        ...courseDetailsData,
        instructor: courseDetailsData.instructor?.map(id => id.toString()) || []
      };

      // Validate form data with Zod schema
      courseDetailsSchema.parse(validationData);

      // Clear all errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const fieldName = err.path[0] as keyof FormErrors;
            newErrors[fieldName] = err.message;
          }
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors before continuing");
      }
      return false;
    }
  };


  const fetchLanguages = async () => {
    try {
      const response = await getCourseLanguages();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data && response.data.length > 0) {
            setLanguages(response.data);
          } else {
            setLanguages([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch languages");
          setLanguages([]);
        }
      } else {
        console.log("response is null in component", response);
        setLanguages([]);
      }
    } catch (error) {
      extractErrorMessage(error);
      setLanguages([]);
    }
  }

  const fetchTags = async () => {
    try {
      const response = await getTags();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data && response.data.length > 0) {
            // Convert the API tags to the expected format for the component
            const formattedTags: TagsAndLanguagesType[] = response.data.map(tag => ({
              id: tag.id,
              tag: tag.tag,
              slug: tag.slug,
              is_active: tag.is_active,
              created_at: new Date(tag.created_at),
              updated_at: new Date(tag.updated_at),
              deleted_at: null // TagsAndLanguagesType expects null, not Date | null
            }));

            setTags(formattedTags);
          } else {
            setTags([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch tags");
          setTags([]);
        }
      } else {
        console.log("response is null in component", response);
        setTags([]);
      }
    } catch (error) {
      extractErrorMessage(error);
      setTags([]);
    }
  };

  // fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response) {
        if (!response.error) {
          if (response.data && response.data.length > 0) {
            setCategoriesData(response.data);
          } else {
            setCategoriesData([]);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch categories");
          setCategoriesData([]);
        }
      }
    } catch (error) {
      extractErrorMessage(error);
      setCategoriesData([]);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(setCourseDetailsData({ [name]: value } as unknown as CourseDetailsDataType));

    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    dispatch(setCourseDetailsData({ [name]: value } as unknown as CourseDetailsDataType));
    if (errors.categoryId) {
      setErrors({ ...errors, categoryId: "" });
    }
    if (errors.difficultyLevel) {
      setErrors({ ...errors, difficultyLevel: "" });
    }
    if (errors.languageId) {
      setErrors({ ...errors, languageId: "" });
    }
  };


  const handleAddLearnPointAndRequirements = (type: "learn" | "requirements") => {
    if (type === "learn") {
      dispatch(setCourseDetailsData({ whatYoullLearn: [...courseDetailsData.whatYoullLearn, { title: learnPoints }] } as unknown as CourseDetailsDataType));
      setLearnPoints("")
    } else {
      dispatch(setCourseDetailsData({ requirements: [...courseDetailsData.requirements, { requirement: requirements }] } as unknown as CourseDetailsDataType));
      setRequirements("")
    }
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTagInputValue(inputValue);

    // Filter existing tags based on input
    if (inputValue.trim()) {
      setFilteredTags(
        tags.filter((tag) =>
          tag.tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag.tag)
        )
      );
    } else {
      setFilteredTags([]);
    }
    setShowTagSuggestions(true);
  };

  const handleSelectExistingTag = (tag: TagsAndLanguagesType) => {
    // Add to selected tags if not already selected
    if (!selectedTags.includes(tag.tag)) {
      const newSelectedTags = [...selectedTags, tag.tag];
      setSelectedTags(newSelectedTags);
      // Update courseDetailsData with string array format for consistency
      dispatch(setCourseDetailsData({ courseTag: newSelectedTags } as unknown as CourseDetailsDataType));
    }
    // Clear the input field
    setTagInputValue('');
    setFilteredTags([]);
    setShowTagSuggestions(false);
  };

  const handleCreateNewTag = (tagName: string) => {
    // Add "new__" prefix to the tag name
    const newTagName = `new__${tagName}`;

    const newTag: TagsAndLanguagesType = {
      id: tags.length + 1,
      tag: newTagName,
      slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    // Add to tags list and selected tags
    setTags([...tags, newTag]);
    const newSelectedTags = [...selectedTags, newTagName];
    setSelectedTags(newSelectedTags);
    // Update courseDetailsData with string array format for consistency
    dispatch(setCourseDetailsData({ courseTag: newSelectedTags } as unknown as CourseDetailsDataType));
    // Clear the input field
    setTagInputValue('');
    setFilteredTags([]);
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (index: number) => {
    const newSelectedTags = selectedTags.filter((_, i) => i !== index);
    setSelectedTags(newSelectedTags);
    // Update courseDetailsData with string array format for consistency
    dispatch(setCourseDetailsData({ courseTag: newSelectedTags } as unknown as CourseDetailsDataType));
  };

  const handleRemoveLearnPointAndRequirements = (type: "learn" | "requirements", index: number) => {
    if (type === "learn") {
      dispatch(setCourseDetailsData({ whatYoullLearn: courseDetailsData.whatYoullLearn.filter((_, i) => i !== index) } as unknown as CourseDetailsDataType));
    } else {
      dispatch(setCourseDetailsData({ requirements: courseDetailsData.requirements.filter((_, i) => i !== index) } as unknown as CourseDetailsDataType));
    }
  }

  // Update individual learn point when editing
  // Preserve the id field and other properties to ensure backend recognizes it as an update, not a new item
  const handleUpdateLearnPoint = (index: number, newValue: string) => {
    const updatedLearnPoints = courseDetailsData.whatYoullLearn.map((point, i) =>
      i === index ? { ...point, title: newValue } : point
    );
    dispatch(setCourseDetailsData({ whatYoullLearn: updatedLearnPoints } as unknown as CourseDetailsDataType));
  }

  // Update individual requirement point when editing
  // Preserve the id field and other properties to ensure backend recognizes it as an update, not a new item
  const handleUpdateRequirement = (index: number, newValue: string) => {
    const updatedRequirements = courseDetailsData.requirements.map((req, i) =>
      i === index ? { ...req, requirement: newValue } : req
    );
    dispatch(setCourseDetailsData({ requirements: updatedRequirements } as unknown as CourseDetailsDataType));
  }

  // Add co-instructor function
  const addCoInstructor = (instructor: { name: string; initials: string, id: number, profile: string }) => {
    if (!coInstructors.some((i) => i.id === instructor.id)) {
      setCoInstructors([...coInstructors, instructor]);
      dispatch(setCourseDetailsData({ instructor: [...courseDetailsData.instructor, instructor.id] } as unknown as CourseDetailsDataType));
    }
  };

  // Remove co-instructor function
  const removeCoInstructor = (instructorId: number) => {
    setCoInstructors(coInstructors.filter((i) => i.id !== instructorId));
    dispatch(setCourseDetailsData({ instructor: courseDetailsData.instructor.filter((i) => i !== instructorId) } as unknown as CourseDetailsDataType));
  };

  useEffect(() => {
  }, [coInstructors])


  // Handle 
  const handleSequentialAccessToggle = (checked: boolean) => {
    dispatch(setCourseDetailsData({ isSequentialAccess: checked } as unknown as CourseDetailsDataType));

    // Clear errors when toggling
    if (errors.price || errors.discount || errors.isSequentialAccess) {
      setErrors({});
    }
  };

  // File handling functions
  const handleThumbnailClick = () => {
    thumbnailInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);

      // Convert file to base64 data URL for Redux persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        dispatch(setCourseDetailsData({ thumbnail: base64String } as unknown as CourseDetailsDataType));
        console.log("handleThumbnailChange - file converted to base64");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewVideo(file);

      // Convert file to base64 data URL for Redux persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        dispatch(setCourseDetailsData({ video: base64String } as unknown as CourseDetailsDataType));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setThumbnailFile(file);

      // Convert file to base64 data URL for Redux persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        dispatch(setCourseDetailsData({ thumbnail: base64String } as unknown as CourseDetailsDataType));
        console.log("handleThumbnailDrop - file converted to base64");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setPreviewVideo(file);

      // Convert file to base64 data URL for Redux persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        dispatch(setCourseDetailsData({ video: base64String } as unknown as CourseDetailsDataType));
        console.log("handleVideoDrop - file converted to base64");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchTags()
    fetchLanguages()
  }, [])


  useEffect(() => {
  }, [languages])

  useEffect(() => {
    if (courseDetailsData.instructor && Array.isArray(courseDetailsData.instructor) && courseDetailsData.instructor.length > 0) {
      // Map instructor IDs to CoInstructorType format
      // Filter out undefined values when team member is not found
      const mappedInstructors: CoInstructorType[] = courseDetailsData.instructor
        .map((instructorId: number) => {
          // Find the team member with matching ID
          const teamMember = teamMembers.find(member => member.user?.id === instructorId);
          if (teamMember) {
            return {
              id: teamMember.user?.id || instructorId,
              name: teamMember.user?.name || 'Unknown',
              initials: teamMember.user?.name?.charAt(0) || 'U',
              profile: teamMember.user?.profile || ''
            };
          }
          // Return undefined for non-matching members (will be filtered out)
          return undefined;
        })
        .filter((instructor): instructor is CoInstructorType => instructor !== undefined);
      setCoInstructors(mappedInstructors);
    } else {
      setCoInstructors([]);
    }
  }, [courseDetailsData.instructor, teamMembers])


  const handleRemoveFile = (fileType: 'thumbnail' | 'video') => {
    if (fileType === 'thumbnail') {
      setThumbnailFile(null);
      dispatch(setCourseDetailsData({ thumbnail: null } as unknown as CourseDetailsDataType));
    } else if (fileType === 'video') {
      setPreviewVideo(null);
      dispatch(setCourseDetailsData({ video: null } as unknown as CourseDetailsDataType))
    }
  }

  useEffect(() => {
    if (!isUpdateFile.courseThumbnail && !thumbnailFile && courseDetailsData?.thumbnail) {
      setThumbnailFile(courseDetailsData.thumbnail as File);
    }
    if (!isUpdateFile.coursePreviewVideo && !previewVideo && courseDetailsData?.video) {
      setPreviewVideo(courseDetailsData.video as File);
    }
  }, [courseDetailsData, isUpdateFile.courseThumbnail, isUpdateFile.coursePreviewVideo])


  const renderTree = (items: Category[], level = 0) =>
    items.map((cat: Category) => (
      <React.Fragment key={cat.id}>
        <SelectItem
          value={cat.id.toString()}
          data-label={cat.name} // clean text used for selected value
        >
          <span style={{ paddingInlineStart: `${level * 12}px` }}>
            {cat.name}
          </span>
        </SelectItem>

        {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 &&
          renderTree(cat.subcategories as [], level + 1)}
      </React.Fragment>
    ));




  return (
    <div className="flex flex-col gap-6">
      <Card className="">
        <div className="p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-medium">{t("course_details")}</h2>
        </div>
        <hr className="w-full h-[1px] border borderColor" />

        <div className="p-3 sm:p-4">
          {/* Course Title */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium mb-1 requireField">
              {t("course_title")}
            </label>
            <Input
              placeholder={t("course_title_placeholder")}
              className={`w-full bg-[#F8F8F9] text-sm ${errors.title ? "border-red-500" : ""}`}
              value={courseDetailsData.title}
              id="title"
              name="title"
              onChange={(e) => handleInputChange(e)}
            />
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {t("max_100_characters")}
            </p>
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Course Short Description */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium mb-1 requireField">
              {t("course_short_description")}
            </label>
            <Textarea
              placeholder={t("write_short_description")}
              className={`w-full min-h-[80px] sm:min-h-[100px] bg-[#F8F8F9] shadow-none text-sm ${errors.shortDescription ? "border-red-500" : ""}`}
              value={courseDetailsData.shortDescription}
              id="shortDescription"
              name="shortDescription"
              onChange={(e) => handleInputChange(e)}
            />
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {t("max_500_characters_allowed")}
            </p>
            {errors.shortDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>
            )}
          </div>

          {/* Category and Difficulty Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 requireField">
                {t("category")}
              </label>

              <Select
                value={courseDetailsData.categoryId}
                name="categoryId"
                onValueChange={(value) => handleSelectChange(value, "categoryId")}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <SelectTrigger
                  className={`bg-[#F8F8F9] text-sm ${errors.categoryId ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder={t("select_category")} />
                </SelectTrigger>

                <SelectContent className="">
                  {renderTree(categoriesData as Category[])}
                </SelectContent>
              </Select>

              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 requireField">
                {t("difficulty_level")}
              </label>
              <Select value={courseDetailsData.difficultyLevel} name="difficultyLevel" onValueChange={(value) => {
                handleSelectChange(value, "difficultyLevel");
              }}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <SelectTrigger className={`bg-[#F8F8F9] text-sm ${errors.difficultyLevel ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={t("select_level")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">{t("beginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("intermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("advanced")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficultyLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.difficultyLevel}</p>
              )}
            </div>
          </div>

          {/* Language and Course Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 requireField">
                {t("language_mode_in")}
              </label>
              <Select value={courseDetailsData.languageId} name="languageId" onValueChange={(value) => {
                handleSelectChange(value, "languageId");
              }}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <SelectTrigger className={`bg-[#F8F8F9] text-sm ${errors.languageId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={t("select_language")} />
                </SelectTrigger>
                <SelectContent>
                  {
                    languages.map((language) => (
                      <SelectItem key={language?.id} value={language?.id.toString()}>{language?.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {errors.languageId && (
                <p className="text-red-500 text-sm mt-1">{errors.languageId}</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                {t("course_tag")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  placeholder={t("type_to_search_or_create_tags")}
                  className="w-full bg-[#F8F8F9] text-sm pe-10"
                  id="courseTag"
                  value={tagInputValue}
                  onChange={(e) => handleTagInputChange(e)}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInputValue.trim()) {
                      e.preventDefault();
                      if (filteredTags.length > 0) {
                        handleSelectExistingTag(filteredTags[0]);
                      } else {
                        handleCreateNewTag(tagInputValue);
                      }
                    }
                  }}
                />
                {showTagSuggestions && (tagInputValue || filteredTags.length > 0) && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredTags.length > 0 && (
                      <div className="p-2 border-b border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">{t("existing_tags")}:</div>
                        {filteredTags.map((tag) => (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                            onClick={() => handleSelectExistingTag(tag)}
                          >
                            <span className="text-sm">{tag.tag.replace('new__', '')}</span>
                            <span className="text-xs text-gray-400">{t("click_to_select")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {tagInputValue && !filteredTags.some(tag => tag.tag.toLowerCase() === tagInputValue.toLowerCase()) && (
                      <div className="p-2">
                        <div className="text-xs text-gray-500 mb-1">{t("create_new_tag")}:</div>
                        <div
                          className="flex items-center justify-between p-2 hover:primaryLightBg cursor-pointer rounded primaryBorder"
                          onClick={() => handleCreateNewTag(tagInputValue)}
                        >
                          <span className="text-sm font-medium primaryColor">"{tagInputValue}"</span>
                          <span className="text-xs primaryColor">{t("click_to_create")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Show selected tags */}
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flexCenter gap-1 px-2 py-1 primaryLightBg primaryColor rounded-full text-sm font-medium"
                    >
                      <span>{tag.replace('new__', '')}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="primaryColor"
                      >
                        <IoCloseSharp />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Show error message for courseTag */}
              {errors.courseTag && (
                <p className="text-red-500 text-sm mt-1">{errors.courseTag}</p>
              )}
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium mb-2 requireField">
              {t("what_youll_learn")}
            </label>

            <div className="space-y-2">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    •
                  </span>
                  <Input
                    placeholder={t("point")}
                    value={learnPoints}
                    className="flex-1 bg-[#F8F8F9] pl-8 text-sm"
                    onChange={(e) => setLearnPoints(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddLearnPointAndRequirements("learn");
                      }
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] bg-[var(--primary-color)] text-white p-0 flex items-center justify-center hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAddLearnPointAndRequirements("learn")}
                  disabled={!learnPoints.trim()}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              {
                courseDetailsData?.whatYoullLearn && courseDetailsData?.whatYoullLearn?.map((point, index) => (
                  <div key={`learn-${index}`} className="flex items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        •
                      </span>
                      <Input
                        placeholder={t("point")}
                        value={point.title}
                        className="flex-1 bg-[#F8F8F9] pl-8 text-sm"
                        readOnly={!isEditCourse}
                        onChange={(e) => isEditCourse && handleUpdateLearnPoint(index, e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] text-red-500 bg-red-100 hover:bg-red-200"
                      onClick={() => handleRemoveLearnPointAndRequirements("learn", index)}
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                ))}
            </div>
            {errors.whatYoullLearn && (
              <p className="text-red-500 text-sm mt-1">{errors.whatYoullLearn}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium mb-2 requireField">
              {t("requirements")}
            </label>

            <div className="space-y-2">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    •
                  </span>
                  <Input
                    placeholder={t("point")}
                    value={requirements}
                    className="flex-1 bg-[#F8F8F9] pl-8 text-sm"
                    onChange={(e) => setRequirements(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLearnPointAndRequirements("requirements");
                      }
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] bg-[var(--primary-color)] text-white p-0 flex items-center justify-center hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAddLearnPointAndRequirements("requirements")}
                  disabled={!requirements.trim()}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              {
                courseDetailsData?.requirements && courseDetailsData?.requirements?.map((point, index) => (
                  <div key={`learn-${index}`} className="flex items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        •
                      </span>
                      <Input
                        placeholder={t("point")}
                        value={point.requirement}
                        className="flex-1 bg-[#F8F8F9] pl-8 text-sm"
                        readOnly={!isEditCourse}
                        onChange={(e) => isEditCourse && handleUpdateRequirement(index, e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] text-red-500 bg-red-100 hover:bg-red-200"
                      onClick={() => handleRemoveLearnPointAndRequirements("requirements", index)}
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                ))}
            </div>
            {errors.requirements && (
              <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>
            )}
          </div>

          {/* Co-Instructor */}
          {
            userData?.instructor_details?.type === "team" &&
            <div>
              {
                teamMembers.length > 0 ? (
                  <div className="mb-4 sm:mb-5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-2 sm:mb-3 ring-[1px] ring-gray-500 rounded-md py-1 px-2 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1"
                      onClick={() => setIsCoInstructorDialogOpen(true)}
                    >
                      <BiSolidUserPlus size={20} /> {t("add_co_instructor")}
                    </Button>
                    {
                      coInstructors && coInstructors.length > 0 &&
                      <div className="flex flex-wrap gap-2">
                        {coInstructors.map((instructor, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-1 sm:p-2 border border-gray-300 rounded-full"
                          >
                            {
                              instructor?.profile ? (
                                <div className=" bg-gray-400 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                                  <CustomImageTag src={instructor?.profile} alt="profile" className="rounded-full h-full w-full" />
                                </div>
                              ) : (
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-400">
                                  <div className="bg-gray-400 rounded-full h-full w-full flex items-center justify-center overflow-hidden">
                                    <span className="text-[8px] sm:text-[10px] text-white">
                                      {instructor?.initials}
                                    </span>
                                  </div>
                                </Avatar>
                              )
                            }

                            <div className="">
                              <span className="text-xs sm:text-sm font-medium capitalize">
                                {instructor?.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 sm:w-auto sm:h-auto"
                              onClick={() => removeCoInstructor(instructor?.id)}
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    }

                    {/* Co-Instructor Selection Dialog */}
                    <Dialog
                      open={isCoInstructorDialogOpen}
                      onOpenChange={setIsCoInstructorDialogOpen}
                    >
                      <DialogContent className="sm:max-w-md p-0 w-[95%] max-w-[500px] max-h-[450px] md:max-h-[600px] overflow-y-auto customScrollbar">
                        <DialogHeader className="p-3 pb-0">
                          <DialogTitle className="text-lg sm:text-xl font-semibold">
                            {t("co_instructor")}
                          </DialogTitle>
                        </DialogHeader>

                        {/* divider */}
                        <div className="h-[1px] bg-gray-200" />

                        <div className="p-2 pt-0">
                          {teamMembers.map((instructor, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 sm:py-3 px-2"
                            >
                              <div className="flex items-center">
                                {
                                  instructor?.user?.profile ? (
                                    <div className=" bg-gray-400 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                                      <CustomImageTag src={instructor.user.profile} alt="profile" className="rounded-full h-full w-full" />
                                    </div>
                                  ) : (
                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-300">
                                      <div className="bg-gray-300 rounded-full h-full w-full flex items-center justify-center overflow-hidden">
                                        <span className="text-xs sm:text-sm text-white">
                                          {instructor?.user?.name.charAt(0)}
                                        </span>
                                      </div>
                                    </Avatar>
                                  )}
                                <div className="ms-2 sm:ms-3">
                                  <p className="text-xs sm:text-sm font-medium">
                                    {instructor?.user?.name}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-[var(--primary-color)]">
                                    {t("co_instructor")}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                className="bg-black text-white hover:bg-gray-800 rounded-md px-3 sm:px-4 py-1 h-7 sm:h-8 text-xs sm:text-sm"
                                onClick={() => {
                                  addCoInstructor({ name: instructor?.user?.name, initials: instructor?.user?.name.charAt(0), id: instructor?.user?.id, profile: instructor?.user?.profile });
                                  setIsCoInstructorDialogOpen(false);
                                }}
                              >
                                {courseDetailsData.instructor.includes(instructor?.user?.id) ? t("added") : t("add")}
                              </Button>
                            </div>
                          ))}
                          {
                            totalTeamMembersCount > teamMemberLimitValue && totalTeamMembersCount !== teamMembers?.length && (
                              <div className="flexCenter">
                                <button className="primaryBg text-white p-1.5 rounded text-sm" onClick={() => setTeamMemberOffset(1)}>{t("load_more")}</button>
                              </div>
                            )
                          }
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )
                  :
                  <div className="my-6">
                    <InviteTeamMemberModal />
                  </div>
              }

            </div>
          }

          {/* Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                {t("meta_tag")}
              </label>
              <Input placeholder={t("meta_tag")} className="w-full bg-[#F8F8F9] text-sm" value={courseDetailsData.metaTag} id="metaTag" name="metaTag" onChange={(e) => handleInputChange(e)} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                {t("meta_title")}
              </label>
              <Input
                placeholder={t("meta_title")}
                className="w-full bg-[#F8F8F9] text-sm"
                value={courseDetailsData.metaTitle}
                id="metaTitle"
                name="metaTitle"
                onChange={(e) => handleInputChange(e)}
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium mb-1">
              {t("meta_description")}
            </label>
            <Textarea
              placeholder={t("write_meta_description")}
              className="w-full min-h-[60px] sm:min-h-[80px] bg-[#F8F8F9]"
              value={courseDetailsData.metaDescription}
              id="metaDescription"
              name="metaDescription"
              onChange={(e) => handleInputChange(e)}
            />
          </div>

          {/* Course Media */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            {/* Thumbnail */}
            <div className="w-full">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <label className="text-xs sm:text-sm font-medium requireField">
                  {t("course_thumbnail_image")}
                </label>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {
                    thumbnailFile &&
                    <RemoveFIleBtn handleRemoveFile={() => handleRemoveFile('thumbnail')} />
                  }
                  {
                    isUpdateFile.courseThumbnail && courseDetailsData.thumbnail &&
                    <UpdateFIleBtn thumbanil={true} />
                  }
                </div>
              </div>
              {
                isUpdateFile.courseThumbnail && courseDetailsData.thumbnail ?
                  <>
                    <CustomImageTag src={courseDetailsData.thumbnail as string} alt="Course Thumbnail" className="w-full object-contain max-575:h-[180px] between-768-991:h-[200px] between-1200-1399:h-[250px] between-992-1199:h-[200px] h-full max-h-[350px] m-auto rounded" />
                  </>
                  :
                  <>
                    <div
                      className={`${!thumbnailFile && !courseDetailsData.thumbnail && 'sectionBg  p-4 sm:p-6'} rounded-md flex flex-col items-center justify-center cursor-pointer min-h-[200px] border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors`}
                      onClick={handleThumbnailClick}
                      onDragOver={handleDragOver}
                      onDrop={handleThumbnailDrop}
                    >
                      {thumbnailFile instanceof File ? (
                        <CustomImageTag src={URL.createObjectURL(thumbnailFile)} alt="Course Thumbnail" className="w-full object-contain max-575:h-[180px] between-768-991:h-[200px] between-1200-1399:h-[250px] between-992-1199:h-[200px] h-full max-h-[350px] m-auto rounded" />
                      ) : courseDetailsData.thumbnail && typeof courseDetailsData.thumbnail === 'string' ? (
                        <CustomImageTag src={courseDetailsData.thumbnail} alt="Course Thumbnail" className="w-full object-contain max-575:h-[180px] between-768-991:h-[200px] between-1200-1399:h-[250px] between-992-1199:h-[200px] h-full max-h-[350px] m-auto rounded" />
                      ) : (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">
                            {t("drag_and_drop_your_file_here_or_click_to")}
                          </p>
                          <span className="text-xs sm:text-sm primaryColor underline font-medium block">
                            {t("browse")}
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={thumbnailInputRef}
                        onChange={handleThumbnailChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </>
              }
              {errors.thumbnail && (
                <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
              )}
            </div>
            {/* Video */}
            <div className="w-full">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <label className="text-xs sm:text-sm font-medium requireField">
                  {t("course_preview_video")}
                </label>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {
                    previewVideo &&
                    <RemoveFIleBtn handleRemoveFile={() => handleRemoveFile('video')} />
                  }
                  {
                    isUpdateFile.coursePreviewVideo && courseDetailsData.video &&
                    <UpdateFIleBtn video={true} />
                  }
                </div>
              </div>
              {
                isUpdateFile.coursePreviewVideo && courseDetailsData.video ?
                  <>
                    <ReactPlayer src={courseDetailsData.video as string} controls={true} className="w-full max-575:h-[180px] between-768-991:h-[200px] between-1200-1399:h-[250px] between-992-1199:h-[200px] h-full max-h-[350px] m-auto rounded" />
                  </>
                  :
                  <>
                    <div
                      className={`${!previewVideo && 'sectionBg  p-4 sm:p-6'} rounded-md flex flex-col items-center justify-center cursor-pointer min-h-[200px] border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors`}
                      onClick={handleVideoClick}
                      onDragOver={handleDragOver}
                      onDrop={handleVideoDrop}
                    >
                      {previewVideo instanceof File ? (
                        <div className="flex flex-col items-center">
                          <video src={URL.createObjectURL(previewVideo)} controls className="w-full max-575:h-[180px] between-768-991:h-[200px] between-1200-1399:h-[250px] between-992-1199:h-[200px] h-full max-h-[350px] m-auto rounded" />
                        </div>
                      ) : courseDetailsData.video && typeof courseDetailsData.video === 'string' ? (
                        <div className="flex flex-col items-center">
                          <video src={courseDetailsData.video} controls className="w-full max-575:h-[180px] between-768-991:h-[200px] between-1200-1399:h-[250px] between-992-1199:h-[200px] h-full max-h-[350px] m-auto rounded" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">
                            {t("drag_and_drop_your_file_here_or_click_to")}
                          </p>
                          <span className="text-xs sm:text-sm primaryColor underline font-medium block">
                            {t("browse")}
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoChange}
                        className="hidden"
                        accept={allowedVideoTypes.join(",")}
                      />
                    </div>
                  </>
              }
              {errors.video && (
                <p className="text-red-500 text-sm mt-1">{errors.video}</p>
              )}
            </div>
          </div>

          {/* Free course toggle */}
          <div className={`flex items-center justify-between gap-2 mb-4 sm:mb-5 ${((isUpdateFile.courseThumbnail && courseDetailsData.thumbnail) || (isUpdateFile.coursePreviewVideo && courseDetailsData.video)) ? 'mt-8 sm:mt-12' : ''}`}>
            <label
              htmlFor="sequential_access"
              className="text-sm md:text-base cursor-pointer select-none"
            >
              {t("enable_this_if_you_want_users_to_complete_the_course_in_sequence")}
            </label>
            <Switch
              id="sequential_access"
              checked={courseDetailsData?.isSequentialAccess}
              onCheckedChange={handleSequentialAccessToggle}
            />
          </div>

        </div>
      </Card>
      {/* Action Button */}
      < div className="flex justify-end" >
        <Button
          onClick={handleContinue}
          className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm py-2 h-8 sm:h-auto"
        >
          {t("continue")} <FaAngleRight className={`h-3.5 w-3.5 md:h-4 md:w-4 ms-1.5 md:ms-2 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
      </div >
    </div >
  );
};

export default CourseDetailsTab;
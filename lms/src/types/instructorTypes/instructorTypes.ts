export interface AssignmentType {
  id: number;
  name: string;
  dueDate: string;
  chapterName: string;
  lectureName: string;
  totalPoints: number;
}

export interface StudentType {
  id: number;
  name: string;
  email: string;
  file: {
    name: string;
    path: string;
  };
  submissionDate: string;
  status: "Approved" | "Rejected" | "Re-submit" | "Pending";
  earnedPoints: number | string;
}

export interface QuizType {
  id: number;
  name: string;
  totalQuestions: number;
  courseName: string;
  chapterName: string;
}

export interface StudentAttemptType {
  id: number;
  name: string;
  email: string;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  earnedPoints: number;
  status: "Pass" | "Fail";
  attemptDate: string;
}

export interface NotificationType {
  id: number;
  title: string;
  description: string;
  time: string;
}

export interface TagsAndLanguagesType {
  id: number;
  tag: string;
  name?: string;
  slug: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
}

export interface ContentItem {
  id: string;
  type: "lecture" | "quiz" | "resources" | "assignment";
  title: string;
  icon?: React.ReactNode;
  order?: number;
}

export interface AddedCourseChaptersType {
  id: number,
  user_id: number,
  course_id: number,
  title: string,
  slug: string,
  description: string | null,
  is_active: boolean,
  order: number,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date | null,
  curriculum_data: ContentItem[], // updated to correct type
  total_duration: number,
  isOpen: boolean
}

export interface CoInstructorType {
  name: string,
  initials: string,
  id: number,
  profile: string
}

export interface LectureTabDataType {
  lectureTitle: string,
  lectureDescription: string,
  lectureHours: string,
  lectureMinutes: string,
  lectureSeconds: string,
  lectureFreePreview: string,
  lectureType: string,
  lectureUrl: string,
  lectureFile: File | null | string,
  lectureYoutubeUrl: string,
  resources: ResourcesTabDataType[];
}

export interface QuizQuestionType {
  question_id: number | undefined,
  question: string,
  option_data: [
    {
      option_id: number | undefined,
      option: string,
      is_correct: number,
    },
  ],
}

export interface QuizTabDataType {
  quiz_title: string,
  quiz_total_points: number,
  quiz_passing_score: number,
  quiz_can_skip: boolean,
}

export interface AssignmentTabDataType {
  assignment_title: string,
  assignment_submission_date: string,
  assignment_short_description: string,
  assignment_media: File | null | string,
  assignment_allowed_file_types: string[],
  assignment_can_skip: boolean,
  assignment_points: number | null,
  media_url?: string,

}

export interface ResourcesTabDataType {
  id?: number | null,
  resource_type: string,
  resource_title: string,
  resource_short_description?: string | null,
  resource_file: File | null | string,
  resource_url?: string,
  resource_duration?: number | null,
}


export interface CurriculumTabDataType {
  chapterId: number | null,
  type: string,
  isCurriculumCreated: boolean,
  lectureData?: LectureTabDataType,
  quizData?: QuizTabDataType,
  assignmentData?: AssignmentTabDataType,
  resourcesData?: ResourcesTabDataType,
}

export interface CustomFormField {
  id: number;
  name: string;
  type: string;
  is_required: number;
  sort_order: number;
  options: CustomFormFieldOption[];
}

export interface CustomFormFieldOption {
  id: number;
  custom_form_field_id: number;
  option: string;
}

export interface BecomeInstructorDataType {
  instructorType: string,
  qualification: string,
  experience: string,
  skills: string,
  bankName: string,
  bankHolderName: string,
  bankAccNum: string,
  bankIfscCode: string,
  idProof: File | null,
  previewVideo: File | null,
  teamName?: string,
  teamLogo?: File | null,
  aboutMe: string,
  socialMedia: {
    facebook: string,
    instagram: string,
    twitter: string,
    linkedin: string,
    youtube: string,
  },
  customFields: CustomFormField[],
  customFieldsData: Record<string, string | File | null>, // Store custom field values
  agreementAccepted: boolean,
}

export interface AddCourseDataType {
  courseDetailsData: CourseDetailsDataType,
  isLessonAdded: boolean,
}

export interface CourseDetailsDataType {
  title: string,
  shortDescription: string,
  categoryId: string,
  difficultyLevel: string,
  languageId: string,
  courseTag: string[],
  metaTag: string,
  metaTitle: string,
  metaDescription: string,
  whatYoullLearn: whatYoullLearn[], // Initialize with one empty string
  requirements: requirements[], // Initialize with one empty string
  instructor: number[],
  thumbnail: File | null | string,
  video: File | null | string,
  price: number | null,
  discount: number | null,
  isFree: boolean,
  isSequentialAccess: boolean,
  certificateEnabled: boolean,
  certificateAmount: number | null,
  status: string,
}

export interface whatYoullLearn {
  id?: number,
  title: string,
}
export interface requirements {
  id?: number,
  requirement: string,
}

export interface isUpdateFile {
  courseThumbnail: boolean,
  coursePreviewVideo: boolean,
  curriculum: boolean,
}

// Common API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Generic pagination data structure - can be used for any paginated API response
export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  is_withdrawal_request_pending?: boolean | null;
}

// Generic paginated API response structure - can be used for any paginated API response
export interface PaginatedApiResponse<T> {
  error: boolean;
  message: string;
  data: PaginatedData<T>;
  code: number;
}

export interface SearchParamsProps {
  searchParams?: {
    lang?: string;
  };
}

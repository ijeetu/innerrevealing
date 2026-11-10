import axiosClient from "../axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { getCourseApiRoute } from "@/utils/apiRoutes";

// Interface for learning objectives
export interface Learning {
  id: number;
  course_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for course requirements
export interface Requirement {
  id: number;
  course_id: number;
  requirement: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for course reviews
export interface Review {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
}

// Interface for course tags
export interface Tag {
  id: number;
  tag: string;
  slug: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  pivot: {
    course_id: number;
    tag_id: number;
  };
}

// Interface for preview videos
export interface PreviewVideo {
  title: string;
  thumbnail: string;
  video: string;
  type: string;
  chapter_title?: string;
  free_preview: boolean;
  file?: string;
  youtube_url?: string;
  file_type?: string;
  file_url?: string;
}

// Interface for instructor social media
export interface InstructorSocialMedia {
  [key: string]: string;
}

// Interface for instructor reviews
export interface InstructorReviews {
  total_reviews: number;
  average_rating: number;
  reviews_list: Record<string, string | number>[];
}

// Interface for course instructors
export interface Instructor {
  id: number;
  name: string;
  slug: string;
  email: string;
  avatar: string | null;
  about_me: string | null;
  qualification: string | null;
  skills: string | null;
  preview_video: string | null;
  social_media: InstructorSocialMedia | null;
  reviews: InstructorReviews | null;
  instructor_type: 'individual' | 'team';
  team_name: string | null;
  team_members: TeamMember[]
}

export interface TeamMember {
  id: number;
  icon: string;
  slug: string;
  name: string;
}

// Interface for quiz options
export interface QuizOption {
  id: number;
  option: string;
  is_correct: boolean;
  order: number | null;
  is_active: boolean;
}

// Interface for quiz questions
export interface QuizQuestion {
  id: number;
  question: string;
  points: string;
  order: number;
  is_active: boolean;
  options: QuizOption[];
}

// Interface for curriculum items (unified structure for lectures, documents, quizzes, assignments)
// This replaces the separate lectures, resources, assignments, and quizzes arrays
// Each curriculum item has a 'type' field to distinguish between different content types
export interface CurriculumItem {
  id: number;
  type: 'lecture' | 'document' | 'quiz' | 'assignment';
  title: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  chapter_order: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;

  // Lecture-specific properties
  lecture_type?: string;
  file?: string | null;
  url?: string | null;
  youtube_url?: string | null;
  file_type?: string;
  file_url?: string;
  duration?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  duration_formatted?: string;
  free_preview?: number;
  has_resources?: boolean;
  resources?: Record<string, string | number>[];

  // Document-specific properties
  file_extension?: string;

  // Quiz-specific properties
  time_limit?: number;
  total_points?: number;
  passing_score?: number;
  can_skip?: boolean;
  has_questions?: boolean;
  questions?: QuizQuestion[];

  // Assignment-specific properties
  instructions?: string;
  due_days?: number;
  max_file_size?: number | null;
  allowed_file_types?: string[];
  media?: string | null;
  media_extension?: string | null;
  media_url?: string | null;
  points?: string;
  submission_status?: string | null;
  submission_id?: number | null;
  is_submitted?: boolean;
  next_curriculum_id?: number | null;
  next_curriculum_type?: string | null;
}

// Interface for course chapter
// Updated to match new API structure with unified curriculum array
// Removed separate lectures, resources, assignments, quizzes arrays
export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
  chapter_order: number;
  lecture_count: number;
  duration: number;
  duration_formatted: string;
  total_content: number;
  lectures_count: number;
  quizzes_count: number;
  assignments_count: number;
  documents_count: number;
  curriculum: CurriculumItem[];
  created_at: string;
  updated_at: string;
  locked: boolean;
}

export interface CurrentCurriculum {
  id: number;
  curriculum_name: string;
  model_id: number;
  model_type: string;
  chapter_id: number;
  completed_at: string;
  completed_at_human: string;
}

// Interface for single course data structure
export interface Course {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  description: string | null;
  image: string;
  category_id: number;
  category_name: string;
  level: string;
  course_type: string;
  sequential_access: boolean;
  certificate_enabled: boolean;
  certificate_fee: number | null;
  ratings: number;
  average_rating: number;
  author_name: string;
  // old
  price: number;
  discount_price: number;
  total_tax_percentage: number;
  // tax_amount: number;
  tax_type: string;

  // new
  original_price: number;
  course_discount: number;
  subtotal: number;
  promo_discount: number;
  taxable_amount: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  discount_percentage: number;



  is_purchased: boolean;
  is_wishlist: boolean;
  enroll_students: number;
  last_updated: string;
  meta_title: string;
  meta_description: string;
  meta_image: string;
  learnings: Learning[];
  requirements: Requirement[];
  reviews: Review[];
  tags: Tag[];
  language: string;
  instructor: Instructor;
  chapters: Chapter[];
  chapter_count: number;
  lecture_count: number;
  total_curriculum_count: number;
  completed_curriculum_count: number;
  progress_percentage: number;
  total_duration: number;
  total_duration_formatted: string;
  preview_videos: PreviewVideo[];
  current_curriculum: CurrentCurriculum;

}

// Interface for get course request parameters
export interface GetCourseParams {
  slug?: string;
  id?: number;
  authToken?: string; // Add authentication token parameter
}

// Use the common ApiResponse interface for consistent response handling
export type GetCourseResponse = ApiResponse<Course>;

/**
 * Fetch a single course from the API by slug or ID
 * @param params - Parameters for fetching the course (slug or id)
 * @returns Promise with course response or null
 */
export const getCourse = async (params?: GetCourseParams): Promise<GetCourseResponse | null> => {
  try {
    // Extract authToken from params and prepare query parameters
    const { authToken, ...queryParams } = params || {};

    // Build query parameters object (excluding authToken)
    const queryParamsObj: Record<string, string | number> = {};

    if (queryParams?.slug) queryParamsObj.slug = queryParams.slug;
    if (queryParams?.id) queryParamsObj.id = queryParams.id;

    // Prepare headers with optional authentication
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    // Add authorization header if token is provided
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axiosClient.get<GetCourseResponse>(getCourseApiRoute, {
      headers,
      params: queryParamsObj,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: GetCourseResponse } };
    console.log("Error in getCourse:", axiosError?.response?.data);
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }
    return null;
  }
};
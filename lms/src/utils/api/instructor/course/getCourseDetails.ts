import { whatYoullLearn, ApiResponse, requirements } from "@/types/instructorTypes/instructorTypes";
import axiosClient from "@/utils/api/axiosClient";
import { Chapter } from "@/utils/api/user/getCourse";
import { getCourseDetailsApiRoute } from "@/utils/apiRoutes";

export interface CourseDetail {
  course_details: {
    id: number;
    slug: string;
    title: string;
    short_description: string;
    description: string | null;
    thumbnail: string;
    price: number;
    discounted_price: number;
    discount_percentage: number;
    course_type: string;
    level: string;
    duration: string | null;
    is_active: boolean;
    status: string;
    approval_status: string | null;
    sequential_access: boolean;
    certificate_enabled: boolean;
    certificate_fee: number | null;
    category: Category;
    author: Author;
    language: Language;
    tags: Tag[];
    ratings: Ratings;
    is_purchased: boolean;
    created_at: string;
    updated_at: string;
    meta_title: string,
    meta_description: string,
    meta_tags: string,
    preview_video: string,
    co_instructors: Record<string, string | number>[],
    learnings?: whatYoullLearn[]
    requirements?: requirements[]
    chapters: Chapter[]
  };
  statistics: Statistics;
  quiz_reports: QuizReports;
  discussions: Discussions;
  assignments: Assignment[];
  assignment_details: AssignmentDetail[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: null;
  total_marks: null;
  sort: null;
  is_completed: boolean;
  has_resources: boolean;
  user_submission: null;
  resources: Record<string, string | number>[];
}

export interface Lecture {
  id: number;
  title: string;
  description: null;
  lecture_type: null;
  file: null;
  url: string;
  youtube_url: null;
  hours: number;
  minutes: number;
  seconds: number;
  sort: null;
  is_completed: boolean;
  has_resources: boolean;
  resources: Resource[];
}

export interface Resource {
  id: number;
  title: null | string;
  file: null | string;
  file_type: null;
  file_size: null;
  created_at: Date;
  updated_at: Date;
}

export interface Quiz {
  id: number;
  title: string;
  description: null;
  duration: null;
  total_marks: null;
  passing_marks: null;
  sort: null;
  is_completed: boolean;
  has_resources: boolean;
  questions_count: number;
  resources: Record<string, string | number>[];
  questions: Question[];
}

export interface Question {
  id: number;
  question: string;
  question_type: null;
  marks: null;
  sort: null;
  options: Option[];
}

export interface Option {
  id: number;
  option: string;
  is_correct: boolean;
  sort: null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Author {
  id: number;
  name: string;
  email: string;
  profile: string;
}

interface Language {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Ratings {
  count: number;
  average: number;
}

/* ---------- STATISTICS ---------- */
interface Statistics {
  analytics: Analytics;
  content_statistics: ContentStatistics;
  sales_chart_data: SalesChartData;
}

interface Analytics {
  total_earnings: Earnings;
  total_enrolled_users: CountLabel;
  total_reviews: CountLabel;
  total_sales: CountLabel;
}

interface Earnings {
  amount: number;
  formatted: string;
  label: string;
}

interface CountLabel {
  count: number;
  label: string;
}

interface ContentStatistics {
  chapters: number;
  lectures: number;
  quizzes: number;
  assignments: number;
  total_duration: TotalDuration;
  content_breakdown: ContentBreakdown;
}

interface TotalDuration {
  seconds: number;
  formatted: string;
}

interface ContentBreakdown {
  lectures_percentage: number;
  quizzes_percentage: number;
  assignments_percentage: number;
}
interface SalesDataItem {
  name: string;
  sales: number;
  revenue: number;
  profit: number;
}
export interface SalesChartData {
  yearly: SalesDataItem[];
  monthly: SalesDataItem[];
  weekly: SalesDataItem[];
}
/* ---------- QUIZ REPORTS ---------- */
interface QuizReports {
  total_quizzes: number;
  total_attempts: number;
  average_score: number;
  pass_rate: number;
  quiz_details: QuizDetail[];
  student_attempts: StudentAttempt[];
  message: string;
}

interface QuizDetail {
  // structure unknown (empty array in example)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface StudentAttempt {
  // structure unknown (empty array in example)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/* ---------- DISCUSSIONS ---------- */
interface Discussions {
  total_discussions: number;
  discussions: Discussion[];
  summary: DiscussionSummary;
  message: string;
}

interface Discussion {
  // structure unknown (empty array in example)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface DiscussionSummary {
  total_posts: number;
  total_replies: number;
  active_users: number;
  latest_activity: string | null;
}

interface AssignmentDetail {
  // structure unknown (empty array in example)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}



export interface GetCourseDetailsParams {
  statistics?: number;
  course_details?: number;
  student_enrolled?: number;
  assignment_list?: number;
  assignment_details?: number;
  assignment_id?: number;
  quiz_reports?: number;
  quiz_id?: number;
  attempt_id?: number;
  discussion?: number;
  slug?: string;
}


// Use the common ApiResponse interface with CourseDetail
export type CourseDetailsResponse = ApiResponse<CourseDetail>;



export const getCourseDetails = async (
  params?: GetCourseDetailsParams
): Promise<CourseDetailsResponse | null> => {
  try {
    // Build query parameters, filtering out undefined/null values
    const queryParams: Record<string, string | number> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = value;
        }
      });
    }

    // Send the GET request to the backend API with query parameters
    const response = await axiosClient.get<CourseDetailsResponse>(getCourseDetailsApiRoute, { params: queryParams });
    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CourseDetailsResponse } };
    console.log("Error in getCourseDetails:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};

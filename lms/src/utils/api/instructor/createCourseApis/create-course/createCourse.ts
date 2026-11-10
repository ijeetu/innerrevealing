
import axiosClient from "../../../axiosClient";
import { createCourseApiRoute } from '@/utils/apiRoutes';


// Standardized response structure for consistent error handling
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
  code?: number;
}

// Interface for course creation form data structure
export interface CourseCreationFormData {
  title: string;
  short_description: string;
  level: string;
  course_type: string;
  price: string;
  discount_price?: string;
  category_id: string;
  is_active: string;
  meta_tags?: string;
  meta_title?: string;
  meta_description?: string;
  language_id?: string;
  status?: string;
  thumbnail: File;
  intro_video: File;
  meta_image?: File;
  course_tags?: Array<{ id: number; name: string }>;
  learnings_data: Array<{ id: number; title: string }>;
  requirements_data: Array<{ id: number; title: string }>;
  instructors?: Array<{ id: number; name: string }>;
  certificate_enabled: string;
  sequential_access: string;
}

// Interface for course creation submission response structure
export interface CourseCreationSubmissionResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

// Interface for the API response structure
export interface CourseCreationApiResponse {
  error: boolean;
  message: string;
  details?: string;
  code?: number;
  data?: Record<string, string | number>;
}

/**
 * Helper function to get file extension from MIME type
 */
const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };

  return extensions[mimeType] || 'bin';
};

/**
 * Create course form data to the backend API
 * @param formData - FormData object containing course creation details
 * @returns Promise with standardized API response structure
 */
export const createCourse = async (
  formData: FormData,
): Promise<ApiResponse<CourseCreationSubmissionResponse>> => {
  try {


    // Create the API URL for course creation
    const apiUrl = createCourseApiRoute;

    // Create a new FormData object for the backend API
    const apiFormData = new FormData();

    // Map all the course creation form fields - basic course fields
    const basicFields = [
      'title', 'short_description', 'level', 'course_type',
      'price', 'discount_price', 'category_id', 'is_active', 'meta_tags',
      'meta_title', 'meta_description', 'language_id', 'status', 'sequential_access', 'certificate_enabled'
    ];

    basicFields.forEach(field => {
      const value = formData.get(field);
      if (value) {
        apiFormData.append(field, value);
      }
    });

    // Handle course tags array
    const entries = Array.from(formData.entries());
    const courseTagsEntries = entries.filter(([key]) => key.startsWith('course_tags['));
    if (courseTagsEntries.length > 0) {
      courseTagsEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle learning objectives array
    const learningsEntries = entries.filter(([key]) => key.startsWith('learnings_data['));
    if (learningsEntries.length > 0) {
      learningsEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle requirements array
    const requirementsEntries = entries.filter(([key]) => key.startsWith('requirements_data['));
    if (requirementsEntries.length > 0) {
      requirementsEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle instructors array
    const instructorsEntries = entries.filter(([key]) => key.startsWith('instructors['));
    if (instructorsEntries.length > 0) {
      instructorsEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle tax_ids array
    const taxIdsEntries = entries.filter(([key]) => key.startsWith('tax_ids['));
    if (taxIdsEntries.length > 0) {
      taxIdsEntries.forEach(([key, value]) => {
        apiFormData.append(key, value);
      });
    }

    // Handle file uploads - course media files
    const fileFields = ['thumbnail', 'intro_video', 'meta_image'];
    for (const fileField of fileFields) {
      const file = formData.get(fileField);
      if (file && file instanceof Blob) {
        // For browser FormData, we can append the file directly
        const fileName = (file as File).name || `${fileField}.${getFileExtension(file.type)}`;
        apiFormData.append(fileField, file, fileName);
      }
    }

    // Send the form data to the backend API
    // Set a longer timeout (10 minutes) for large video file uploads
    // This prevents timeout errors when uploading large lecture videos
    const response = await axiosClient.post(apiUrl, apiFormData, {
      timeout: 600000, // 10 minutes (600000ms) - sufficient for large video uploads
    });

    // Check if the API response indicates an error
    if (response.data.error) {
      return {
        success: false,
        data: null,
        error: response.data.message || "Course creation failed",
        message: response.data.message || "Course creation failed",
        code: response.data.code || 400
      };
    }

    // Return successful response
    return {
      success: true,
      data: response.data,
      error: null,
      message: response.data.message || "Course created successfully",
      code: response.data.code || 200
    };

  } catch (error) {
    console.error(
      "Create Course API request failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to create course",
      code: errorCode
    };
  }
}


/**
 * Alternative function that accepts individual form fields instead of FormData
 * @param courseData - Object containing course creation details
 * @returns Promise with standardized API response structure
 */
export const createCourseWithData = async (
  courseData: CourseCreationFormData,
): Promise<ApiResponse<CourseCreationSubmissionResponse>> => {
  try {
    // Create FormData from the provided course data
    const formData = new FormData();

    // Add basic course fields
    formData.append("title", courseData.title);
    formData.append("short_description", courseData.short_description);
    formData.append("level", courseData.level);
    formData.append("course_type", courseData.course_type);
    formData.append("price", courseData.price);
    formData.append("category_id", courseData.category_id);
    formData.append("is_active", courseData.is_active);

    // Add optional fields if provided
    if (courseData.discount_price) {
      formData.append("discount_price", courseData.discount_price);
    }
    if (courseData.meta_tags) {
      formData.append("meta_tags", courseData.meta_tags);
    }
    if (courseData.meta_title) {
      formData.append("meta_title", courseData.meta_title);
    }
    if (courseData.meta_description) {
      formData.append("meta_description", courseData.meta_description);
    }
    if (courseData.language_id) {
      formData.append("language_id", courseData.language_id);
    }
    if (courseData.status) {
      formData.append("status", courseData.status);
    }

    // Handle file uploads if provided
    if (courseData.thumbnail) {
      formData.append("thumbnail", courseData.thumbnail);
    }
    if (courseData.intro_video) {
      formData.append("intro_video", courseData.intro_video);
    }
    if (courseData.meta_image) {
      formData.append("meta_image", courseData.meta_image);
    }

    // Handle course tags array
    if (courseData.course_tags && courseData.course_tags.length > 0) {
      courseData.course_tags.forEach((tag, index) => {
        formData.append(`course_tags[${index}][id]`, tag.id.toString());
        formData.append(`course_tags[${index}][name]`, tag.name);
      });
    }

    // Handle learning objectives array
    if (courseData.learnings_data && courseData.learnings_data.length > 0) {
      courseData.learnings_data.forEach((learning, index) => {
        formData.append(`learnings_data[${index}][id]`, learning.id.toString());
        formData.append(`learnings_data[${index}][learning]`, learning.title);
      });
    }

    // Handle requirements array
    if (courseData.requirements_data && courseData.requirements_data.length > 0) {
      courseData.requirements_data.forEach((requirement, index) => {
        formData.append(`requirements_data[${index}][id]`, requirement.id.toString());
        formData.append(`requirements_data[${index}][requirement]`, requirement.title);
      });
    }

    // Handle instructors array
    if (courseData.instructors && courseData.instructors.length > 0) {
      courseData.instructors.forEach((instructor, index) => {
        formData.append(`instructors[${index}]`, instructor.id.toString());
      });
    }

    if (courseData.certificate_enabled) {
      formData.append("certificate_enabled", courseData.certificate_enabled);
    }

    // Use the main submission function
    return await createCourse(formData);

  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.response?.status || 500;

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: "Failed to create course",
      code: errorCode
    };
  }
}

import { StaticImageData } from "next/image";


export interface journeyDataType {
    id: number;
    count: number;
    label: string;
    prefix?: string;
    suffix?: string;
    duration?: number;
}

export interface categoriesDataType {
    id: number,
    img: StaticImageData,
    title: string,
    coursesCount: string
}

// commom interface for courseCard
export interface Course {
    id: number;
    slug: string;
    image: string;
    category_id: number;
    category_name: string;
    course_type: string;
    level: string;
    sequential_access?: boolean;
    certificate_enabled?: boolean;
    certificate_fee?: number | null;
    ratings: number;
    review_count?: number;
    average_rating: number;
    title: string;
    short_description: string;
    author_id?: number;
    author_name: string;
    author_slug?: string;
    price: number;
    // discounted_price?: number;
    discount_price?: number;
    discount_percentage: number;
    total_tax_percentage?: number;
    // tax_amount?: number;
    is_wishlisted: boolean;
    is_enrolled: boolean;

    // new
    original_price: number;
    course_discount: number;
    subtotal: number;
    promo_discount: number;
    taxable_amount: number;
    tax_percentage: number;
    tax_amount: number;
    total: number;

    // for my learning
    enrolled_at?: string;
    total_chapters?: number;
    completed_chapters?: number;
    total_curriculum_items?: number;
    completed_curriculum_items?: number;
    progress_percentage?: number;
    progress_status?: "all" | "in_progress" | "completed";

    current_chapter_name?: string;
}


export interface instructorCommmDataType {
    stepNumber: number;
    title: string;
    description: string;
    imageSrc: string;
}

export interface educatorCardDataTypes {
    slug: string;
    name: string;
    title: string;
    average_rating: number;
    review_count: number;
    active_courses_count: number;
    student_enrolled_count: number;
    profile: string;
    qualification: string;
    type: string;
    team_name: string
}

export interface faqsDataTypes {
    id: number,
    question: string,
    answer: string,
}

// ===================================================== static data types ends here ====================================================================

// categories data types
export interface CategoryDataType {
    id: number;
    name: string;
    image: string;
    parent_category_id: null;
    description: string | null;
    status: boolean;
    slug: string;
    subcategories_count: number;
    parent_category_count: number;
    courses_count: number;
    has_subcategory: boolean;
    has_parent_category: boolean;
    subcategories?: SubCategoriesDataType[];
}

export interface SubCategoriesDataType {
    id: number;
    sequence: null;
    name: string;
    image: string;
    parent_category_id: number;
    description: null;
    status: boolean;
    slug: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    has_subcategory: boolean;
    has_parent_category: boolean;
}

export interface CourseDataTypes {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    thumbnail: string;
    intro_video: string | null;
    user_id: number;
    level: string;
    course_type: string;
    price: string | null;
    discount_price: string | null;
    category_id: number;
    is_active: boolean;
    language_id: number;
    meta_title: string;
    meta_image: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    category: {
        id: number;
        sequence: number | null;
        name: string;
        image: string;
        parent_category_id: number | null;
        description: string | null;
        status: boolean;
        slug: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        has_subcategory: boolean;
        has_parent_category: boolean;
    };
    user: {
        id: number;
        name: string;
        slug: string;
        email: string;
        mobile: string | null;
        country_code: string | null;
        email_verified_at: string | null;
        profile: string | null;
        is_active: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    };
    learnings: Array<{
        id: number;
        course_id: number;
        title: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    }>;
    requirements: Array<{
        id: number;
        course_id: number;
        requirement: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    }>;
    tags: Array<{
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
        }
    }>;
    language: {
        id: number;
        name: string;
        slug: string;
        is_active: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    };
    instructors: Array<{
        id: number;
        name: string;
        slug: string;
        email: string;
        mobile: string | null;
    }>; // this instructor type is given just to prevent build any type error change it as per api response once api is ready
    // Optional fields that might be calculated or added later
    rating?: number;
    review_count?: number;
    enrolled_students?: number;
    duration_hours?: number;
}

export interface SidebarFilterTypes {
    level: string;
    language: string;
    duration: string | number; // Can be a number (single selection) or string (comma-separated for multiple selections)
    price: string;
    rating: string;
    category: string;
    feature_section?: string;
    feature_section_slug?: string
}

export interface ReviewType {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    timestamp: string;
    content: string;
    replyCount: number;
    rating: number;
}

interface ContactPoint {
    "@type": "ContactPoint";
    telephone: string;
    email: string;
    contactType: string;
    areaServed: string[];
}

export interface SchemaJsonLdType {
    "@context": "https://schema.org";
    "@type": "Course";
    name: string;
    url: string;
    logo: string;
    description: string;
    contactPoint: ContactPoint[];
    sameAs: string[];
}
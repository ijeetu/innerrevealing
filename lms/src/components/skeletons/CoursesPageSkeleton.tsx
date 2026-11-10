import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";
import CategorySwiperSkeleton from "@/components/skeletons/CategorySwiperSkeleton";

export default function CoursesPageSkeleton() {
    return (
        <Layout>
            <div className="commonGap min-h-[70vh]">
                <div>
                    {/* Hero Section */}
                    <div className="sectionBg py-8 md:py-12">
                        <div className="container px-4 md:px-8 space-y-6">
                            {/* Breadcrumbs */}
                            <Skeleton className="h-8 w-48 rounded-full" />
                            
                            {/* Title & Description */}
                            <div className="flexColCenter items-start gap-4">
                                <Skeleton className="h-10 w-3/4 max-w-2xl" />
                                <Skeleton className="h-6 w-full max-w-2xl" />
                            </div>
                        </div>
                    </div>
                    {/* Category Swiper Skeleton */}
                    <div className="mt-8">
                        <CategorySwiperSkeleton />
                    </div>
                </div>

                {/* Course Content Grid Skeleton */}
                <div className="container mt-12 mb-12">
                    {/* Header + Filter row skeleton */}
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-32 hidden sm:block" />
                            <Skeleton className="h-10 w-32 hidden sm:block" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <CourseCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

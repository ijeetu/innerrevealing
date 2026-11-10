import CourseDetailsSkeleton from "@/components/skeletons/CourseDetailsSkeleton";

export default function Loading() {
    return <div className="h-screen overflow-hidden">
        <CourseDetailsSkeleton />
    </div>;
}

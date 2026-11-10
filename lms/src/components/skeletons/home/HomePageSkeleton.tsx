import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import CourseSectionSkeleton from "@/components/skeletons/home/CourseSectionSkeleton";
import MobileCategorySkeleton from "@/components/skeletons/MobileCategorySkeleton";

export default function HomePageSkeleton() {
    return (
        <Layout>
            <div className="">
                {/* Hero Sect Skeleton */}
                <Skeleton className="w-full h-[180px] xs:h-[220px] sm:h-[260px] md:h-[500px] lg:h-[600px] xl:h-[700px] rounded-none" />

                {/* Top Categories Skeleton */}
                <div className="sectionBg py-6 sm:py-8 md:py-16">
                    <div className="container px-4 sm:px-6">
                        <div className="flex flex-col gap-2 mb-6 sm:mb-8 md:mb-12">
                            <Skeleton className="h-7 sm:h-9 md:h-10 w-40 sm:w-52 md:w-64" />
                            <Skeleton className="h-4 sm:h-5 md:h-6 w-56 sm:w-72 md:w-96 mt-1 sm:mt-2" />
                        </div>

                        {/* Categories Desktop Skeleton */}
                        <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>

                        {/* Categories Mobile Skeleton */}
                        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {[...Array(4)].map((_, i) => (
                                <MobileCategorySkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Sections Skeleton */}
                <div className="grid grid-cols-1 gap-8 sm:gap-10 md:gap-14 lg:gap-20 commonMT commonMB px-4 sm:px-6 md:px-0">
                    {[...Array(4)].map((_, index) => (
                        <CourseSectionSkeleton key={index} horizontalCard={index % 2 === 0} />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
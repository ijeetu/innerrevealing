import Layout from "@/components/layout/Layout";
import InstructorSkeleton from "@/components/skeletons/InstructorSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorPageSkeleton() {
    return (
        <Layout>
            <div className="commonGap min-h-[70vh]">
                {/* Hero / Breadcrumb Skeleton equivalent */}
                <div className="bg-[#010211] py-8 md:py-12 mb-8">
                    <div className="container">
                        <Skeleton className="h-8 w-64 rounded-full bg-white/20" />
                    </div>
                </div>

                <div className="container grid grid-cols-12 gap-6 mb-12">
                    {/* Sidebar skeleton */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                        <Skeleton className="h-8 w-40 rounded mb-6" />
                        <div className="space-y-4">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-6 w-full rounded" />
                            ))}
                        </div>
                    </div>

                    {/* Content skeleton */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
                        <Skeleton className="h-8 w-64 rounded mb-6" />
                        
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <InstructorSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

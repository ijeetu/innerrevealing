import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout/Layout";

export default function CourseDetailsSkeleton() {
    return (
        <Layout>
            <div className="commonGap min-h-[100vh]">
                <div
                    className="bg-cover bg-center"
                >
                    <div className="bg-[#010211CC] py-8 md:py-12">
                        <div className="container space-y-6">
                            {/* Breadcrumbs */}
                            <Skeleton className="h-8 w-64 rounded-full bg-white/20" />

                            {/* Title and Description */}
                            <div className="flex flex-col gap-4">
                                <Skeleton className="h-10 w-3/4 max-w-2xl bg-white/20" />
                                <Skeleton className="h-6 w-full max-w-3xl bg-white/20" />
                                <Skeleton className="h-6 w-5/6 max-w-3xl bg-white/20" />
                            </div>

                            {/* Meta Info (Instructor, Level, etc) */}
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 border-t border-white/20 pt-4">
                                <Skeleton className="h-10 w-48 bg-white/20" />
                                <Skeleton className="h-10 w-32 hidden sm:block bg-white/20" />
                                <Skeleton className="h-10 w-32 hidden sm:block bg-white/20" />
                                <Skeleton className="h-10 w-32 hidden sm:block bg-white/20" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mb-12">
                    <div className="grid grid-cols-12 gap-6 mt-8">
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-40" />
                                <Skeleton className="h-40 w-full" />
                            </div>
                        </div>

                        {/* Right Content (Purchase Card) */}
                        <div className="col-span-12 lg:col-span-4">
                            <Skeleton className="h-[400px] w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

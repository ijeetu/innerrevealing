import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyProfileSkeleton() {
    return (
        <Layout>
            <div className="min-h-[70vh]">
                {/* Hero Banner Skeleton */}
                <div className="sectionBg py-8 md:py-12 border-b borderColor">
                    <div className="container space-y-4">
                        <div className="flexColCenter items-start gap-2">
                            <Skeleton className="h-8 sm:h-10 w-40 sm:w-48" />
                        </div>
                        <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 rounded-full" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="sectionBg">
                    <div className="container py-8 md:py-12">
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Sidebar Skeleton */}
                            <div className="w-full lg:w-[30%] xl:w-[25%] flex-shrink-0">
                                <Skeleton className="h-[400px] sm:h-[500px] w-full rounded-2xl" />
                            </div>

                            {/* Content Area Skeleton */}
                            <div className="flex-1 w-full bg-white p-4 sm:p-6 rounded-2xl border borderColor shadow-sm">
                                <div className="space-y-6">
                                    {/* Header */}
                                    <Skeleton className="h-6 sm:h-8 w-1/3 sm:w-1/4" />
                                    <hr className="borderColor" />
                                    
                                    {/* Profile Meta Area */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                        <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
                                        <div className="flex-1 space-y-2 text-center sm:text-left w-full mt-2 sm:mt-0">
                                            <Skeleton className="h-4 sm:h-5 w-3/4 sm:w-1/2 mx-auto sm:mx-0" />
                                            <Skeleton className="h-3 sm:h-4 w-full sm:w-3/4 mx-auto sm:mx-0" />
                                        </div>
                                    </div>
                                    
                                    {/* Form Fields Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                                                <Skeleton className="h-10 sm:h-12 w-full" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Full Width Box */}
                                    <div className="space-y-2 pt-4">
                                        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                                        <Skeleton className="h-24 sm:h-32 w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

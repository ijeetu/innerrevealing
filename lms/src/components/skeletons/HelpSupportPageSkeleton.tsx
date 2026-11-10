import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import JoinConversationCardSkeleton from "@/components/skeletons/help-support/JoinConversationCardSkeleton";
import FaqsSkeleton from "@/components/skeletons/FaqsSkeleton";

export default function HelpSupportPageSkeleton() {
    return (
        <Layout>
            <div className="commonGap min-h-[70vh]">
                {/* Hero Section Skeleton */}
                <div className="bg-[#010211] pt-6 sm:pt-8 md:pt-20 pb-12 sm:pb-16 md:pb-40 text-white relative">
                    <div className="container px-4 sm:px-6 space-y-4">
                        {/* Breadcrumb Skeleton */}
                        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 rounded-full bg-white/20" />

                        {/* Title and Description Skeleton */}
                        <div className="flexColCenter items-start gap-2 mb-4 sm:mb-6 md:mb-12">
                            <Skeleton className="h-8 sm:h-10 w-full max-w-[280px] sm:max-w-sm md:max-w-lg bg-white/20" />
                            <Skeleton className="h-4 sm:h-5 md:h-6 w-full max-w-xs sm:max-w-sm md:max-w-xl bg-white/20 mt-2" />
                            <Skeleton className="h-4 sm:h-5 md:h-6 w-4/5 max-w-[240px] sm:max-w-xs md:max-w-xl bg-white/20" />
                        </div>

                        {/* Search Bar Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 relative">
                            <Skeleton className="h-11 sm:h-12 md:h-14 w-full bg-white/20 rounded-[4px]" />
                        </div>
                    </div>
                </div>

                <div className="sectionBg">
                    {/* UpperCardSect Skeleton */}
                    <div className="container px-4 sm:px-6">
                        <div className="-mt-10 sm:-mt-14 md:-mt-[124px] bg-white shadow-[0px_2px_12px_0px_#ADB3B829] rounded-xl sm:rounded-2xl relative p-3 sm:p-4 md:p-8 lg:p-12 mb-8 sm:mb-10 md:mb-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-3 sm:p-4 lg:p-6 bg-[#F2F5F7] rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4"
                                    >
                                        <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <Skeleton className="h-5 sm:h-6 w-3/4" />
                                            <Skeleton className="h-3 sm:h-4 w-full" />
                                            <Skeleton className="h-3 sm:h-4 w-5/6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* JoinConversation Skeleton */}
                    <div className="py-6 sm:py-8 md:py-12 lg:py-16">
                        <div className="container px-4 sm:px-6">
                            <div className="flex flex-col gap-2 mb-6 sm:mb-8 md:mb-12">
                                <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
                                <Skeleton className="h-4 sm:h-6 w-64 sm:w-96" />
                            </div>
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 between-992-1199:grid-cols-3 between-1200-1399:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <JoinConversationCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQs Skeleton */}
                <FaqsSkeleton />
            </div>
        </Layout>
    );
}
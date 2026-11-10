import { Skeleton } from "@/components/ui/skeleton";

export function UserBillingDetailsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-center justify-between">
                {/* Title */}
                <Skeleton className="h-4 w-36" />

                {/* Arrow Button */}
                <Skeleton className="h-9 w-9 rounded-[4px]" />
            </div>

            {/* ================= Billing Details (Full Section) ================= */}
            <div className="border border-gray-200 rounded-xl bg-white p-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                </div>

                {/* Details Rows */}
                <div className="mt-4 space-y-3">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center gap-4"
                        >
                            {/* Label */}
                            <Skeleton className="h-4 w-32" />

                            {/* Value */}
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

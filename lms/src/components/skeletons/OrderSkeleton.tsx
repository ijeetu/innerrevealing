import React from 'react'
import { Skeleton } from "@/components/ui/skeleton";

const OrderSkeleton = () => {
    return (
        <div
            className="min-w-[900px] mt-2"
            style={{
                height: "42px",
                padding: "0px 16px",
                borderRadius: "4px",
                background: "#F2F5F7",
                display: "grid",
                gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                gap: "2rem",
                alignItems: "center",
            }}
        >
            {/* Course Name */}
            <Skeleton className="h-4 w-28 rounded-sm" />
            {/* Transaction ID */}
            <Skeleton className="h-4 w-32 rounded-sm" />
            {/* Date */}
            <Skeleton className="h-4 w-20 rounded-sm" />
            {/* Amount */}
            <Skeleton className="h-4 w-16 rounded-sm" />
            {/* Payment Mode */}
            <Skeleton className="h-4 w-20 rounded-sm" />
            {/* Status */}
            <Skeleton className="h-5 w-16 rounded-sm" />
            {/* Action 1 */}
            <Skeleton className="h-7 w-full rounded-sm" />
            {/* Action 2 */}
            <Skeleton className="h-7 w-full rounded-sm" />
        </div>
    )
}

export default OrderSkeleton

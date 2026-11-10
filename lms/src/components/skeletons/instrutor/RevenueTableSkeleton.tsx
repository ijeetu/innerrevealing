import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueTableSkeletonProps {
    rows?: number;
}

export default function RevenueTableSkeleton({ rows = 10 }: RevenueTableSkeletonProps) {
    return (
        <React.Fragment>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                    {/* Index */}
                    <TableCell>
                        <Skeleton className="h-4 w-6 rounded" />
                    </TableCell>

                    {/* Course */}
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-[45px] w-[80px] rounded" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-[200px] rounded" />
                                <Skeleton className="h-3 w-[120px] rounded" />
                            </div>
                        </div>
                    </TableCell>

                    {/* Enrolled Students */}
                    <TableCell>
                        <div className="flex flex-col items-center gap-2">
                            <Skeleton className="h-4 w-8 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                        </div>
                    </TableCell>

                    {/* Pending Amount */}
                    <TableCell>
                        <div className="flex justify-center">
                            <Skeleton className="h-4 w-16 rounded" />
                        </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                        <Skeleton className="h-[38px] w-[38px] rounded-[4px] mx-auto" />
                    </TableCell>
                </TableRow>
            ))}
        </React.Fragment>
    );
}

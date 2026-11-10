import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface RefundTableSkeletonProps {
    rows?: number;
}

export default function RefundTableSkeleton({ rows = 10 }: RefundTableSkeletonProps) {
    return (
        <React.Fragment>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                    {/* Index */}
                    <TableCell>
                        <Skeleton className="h-4 w-6 !bg-gray-500 rounded" />
                    </TableCell>

                    {/* Student */}
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full !bg-gray-500" />
                            <Skeleton className="h-4 w-[140px] !bg-gray-500 rounded" />
                        </div>
                    </TableCell>

                    {/* Course */}
                    <TableCell>
                        <Skeleton className="h-4 w-[220px] !bg-gray-500 rounded" />
                    </TableCell>

                    {/* Enrollment Date */}
                    <TableCell>
                        <Skeleton className="h-4 w-[120px] !bg-gray-500 rounded" />
                    </TableCell>

                    {/* Progress */}
                    <TableCell>
                        <Skeleton className="h-10 w-10 rounded-full !bg-gray-500" />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                        <Skeleton className="h-6 w-[90px] rounded-md !bg-gray-500" />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                        <Skeleton className="h-8 w-[80px] rounded-md mx-auto !bg-gray-500" />
                    </TableCell>
                </TableRow>
            ))}
        </React.Fragment>
    );
}

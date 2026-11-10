"use client";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletHistorySkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-t border-[#D8E0E6]">
          {/* Course Name */}
          <td className="p-4">
            <Skeleton className="h-4 w-36 rounded-md" />
          </td>

          {/* Transaction ID */}
          <td className="p-4">
            <Skeleton className="h-4 w-28 rounded-md" />
          </td>

          {/* Type */}
          <td className="p-4">
            <Skeleton className="h-4 w-20 rounded-md" />
          </td>

          {/* Date */}
          <td className="p-4">
            <Skeleton className="h-4 w-24 rounded-md" />
          </td>

          {/* Amount */}
          <td className="p-4">
            <Skeleton className="h-4 w-16 rounded-md" />
          </td>

          {/* Status badge */}
          <td className="p-4">
            <Skeleton className="h-6 w-20 rounded-md" />
          </td>

          {/* Action button */}
          <td className="p-4">
            <Skeleton className="h-8 w-24 rounded-md" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

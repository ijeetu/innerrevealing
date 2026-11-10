import React from 'react'
import { Badge } from "@/components/ui/badge";
import { getStatus } from '@/utils/helpers';

const CourseBadge = ({ status }: { status: string }) => {
    return (
        <Badge
            className={`
                h-[26px] w-[100px] flexCenter text-sm rounded-[4px]
                ${status.toLowerCase() === "publish"
                    ? "bg-[#83B8071F] text-[#83B807]"
                    : status.toLowerCase() === "pending"
                        ? "bg-[#0186D81F] text-[#0186D8]"
                        : status.toLowerCase() === "rejected"
                            ? "bg-[#FF00001F] text-[#FF0000]"
                            : status.toLowerCase() === "draft"
                                ? "bg-[#6F42C11F] text-[#6F42C1]"
                                : "bg-[#0000001F] text-[#000000]"
                }
      `}
        >
            {getStatus(status)}
        </Badge>
    )
}

export default CourseBadge

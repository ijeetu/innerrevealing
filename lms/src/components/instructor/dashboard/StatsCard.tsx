import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrencySymbol } from "@/utils/helpers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string | { src: string };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  className,
}) => {
  return (
    <Card className={`bg-white rounded-xl ${className}`}>
      <CardContent className="flex items-center justify-between p-2 sm:p-4 flex-col">
        {icon && (
          <div className="h-14 w-14 rounded-full primaryColor bg-[#01021114] flex items-center justify-center">
            <CustomImageTag src={icon} alt="icon" className="h-8 w-8 object-contain" />
          </div>
        )}
        <div className="space-y-1 flex flex-col items-center justify-center mt-4">
          <p className="text-lg md:text-xl font-semibold">{title === 'Total Earnings' ? getCurrencySymbol() : ''}{value}</p>
          <p className="text-center">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

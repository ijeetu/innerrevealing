'use client'
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type RevenueChart } from '@/utils/api/instructor/earnings/getEarnings';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrencySymbol } from '@/utils/helpers';


interface RevenueChartProps {
    revenueData: RevenueChart;
}

// Custom tooltip types and components
export interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        name: string;
        dataKey: string;
    }>;
    label?: string;
}


const RevenueChart = ({ revenueData }: RevenueChartProps) => {

    const { t } = useTranslation();

    const timePeriodFilterOptions = [
        {
            label: t("yearly"),
            value: "yearly",
        },
        {
            label: t("monthly"),
            value: "monthly",
        },
        {
            label: t("weekly"),
            value: "weekly",
        },
    ];

    const [selectedTimePeriod, setSelectedTimePeriod] = useState("yearly");
    const [isRtl, setIsRtl] = useState(false);

    useEffect(() => {
        const checkRtl = () => {
            const dir = document.documentElement.dir || document.body.dir || 'ltr';
            setIsRtl(dir === 'rtl');
        };

        checkRtl();

        const observer = new MutationObserver(checkRtl);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
        
        return () => observer.disconnect();
    }, []);


    // Custom tooltip for bar chart
    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded-md shadow-sm text-xs" dir={isRtl ? "rtl" : "ltr"}>
                    <p className="font-semibold mb-1">{label}</p>
                    <p className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                        <span>{t("revenue")}: {getCurrencySymbol()}{payload[0].value}</span>
                    </p>
                    <p className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                        <span>{t("commission")}: {getCurrencySymbol()}{payload[1].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="md:col-span-2 h-full">
            <Card className="p-4 md:p-6 rounded-2xl h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-base md:text-base">{t("revenue")}</h3>
                    {/* Time period filter dropdown */}
                    <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                        <SelectTrigger className="h-8 px-2 md:px-3 text-xs w-[90px] md:w-[100px]">
                            <SelectValue placeholder={t("time_period")} />
                        </SelectTrigger>
                        <SelectContent>
                            {timePeriodFilterOptions?.map((filter) => (
                                <SelectItem key={filter.value} value={filter.value}>
                                    {filter.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Bar Chart */}
                <div className="h-48 md:h-64" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={selectedTimePeriod === "yearly" ? revenueData.yearly : selectedTimePeriod === "monthly" ? revenueData.monthly : revenueData.weekly}
                            margin={{ top: 20, right: isRtl ? 0 : 30, left: isRtl ? 30 : 0, bottom: 25 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} reversed={isRtl} />
                            <YAxis tick={{ fontSize: 10 }} orientation={isRtl ? "right" : "left"} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="revenue"
                                fill="#5850EC"
                                radius={[2, 2, 0, 0]}
                                barSize={8}
                            />
                            <Bar
                                dataKey="commission"
                                fill="#EC4899"
                                radius={[2, 2, 0, 0]}
                                barSize={8}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex gap-4 md:gap-6 mt-3 md:mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500"></div>
                        <span className="text-xs md:text-sm text-muted-foreground">
                            {t("revenue")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-500"></div>
                        <span className="text-xs md:text-sm text-muted-foreground">
                            {t("commission")}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default RevenueChart

'use client'
import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { TooltipProps } from './RevenueChart';
import { useTranslation } from '@/hooks/useTranslation';
import { type EarningsChart } from '@/utils/api/instructor/earnings/getEarnings';
import { getCurrencySymbol } from '@/utils/helpers';

interface EarningsChartProps {
    earningsData: EarningsChart;
}

const EarningsChart = ({ earningsData }: EarningsChartProps) => {

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

    // Custom tooltip for line chart
    const EarningsTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded-md shadow-sm text-xs" dir={isRtl ? "rtl" : "ltr"}>
                    <p className="font-semibold">{label}</p>
                    <p className="flex items-center gap-1 mt-1">
                        <span>{t("earnings")}: {getCurrencySymbol()}{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="font-semibold text-base md:text-base">{t("earnings")}</h3>
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

            <div className="h-60 md:h-80" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={selectedTimePeriod === "yearly" ? earningsData.yearly : selectedTimePeriod === "monthly" ? earningsData.monthly : earningsData.weekly}
                        margin={{
                            top: 10,
                            right: isRtl ? 0 : 30,
                            left: isRtl ? 30 : 0,
                            bottom: 25,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} reversed={isRtl} />
                        <YAxis tick={{ fontSize: 10 }} orientation={isRtl ? "right" : "left"} />
                        <Tooltip content={<EarningsTooltip />} />
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8bc34a" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8bc34a" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="earning"
                            stroke="#8bc34a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEarnings)"
                            activeDot={{
                                r: 8,
                                stroke: "#8bc34a",
                                strokeWidth: 2,
                                fill: "white",
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}

export default EarningsChart

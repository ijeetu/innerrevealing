"use client";
import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesChartData } from "@/utils/api/instructor/course/getCourseDetails";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrencySymbol, getDirection } from "@/utils/helpers";

// Define proper types for the tooltip
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

interface SalesChartDataProps {
  data: SalesChartData
}

const SalesStatisticsChart: React.FC<SalesChartDataProps> = ({ data }) => {

  const { t } = useTranslation();
  const direction = getDirection();
  const isRTL = direction === "rtl";
  const chartData = data;

  // Custom tooltip to match the image
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-none shadow-lg rounded-lg overflow-hidden min-w-[140px]" dir={isRTL ? "rtl" : "ltr"}>
          <div className="bg-slate-100 px-3 py-1.5 border-b border-gray-100">
            <p className="text-gray-900 font-semibold text-sm">{label}</p>
          </div>
          <div className="p-3 space-y-2">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-xs text-gray-600 font-medium">
                    {entry.name} :
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {entry.name === t("sales")
                    ? entry.value
                    : `${getCurrencySymbol()}${entry.value.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const [period, setPeriod] = useState("yearly");

  const handlePeriodChange = (value: string): void => {
    setPeriod(value);
  };

  return (
    <Card className="bg-white rounded-xl">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-medium flex items-center justify-between border-b borderColor pb-4">
          <span className="font-semibold">{t("sales_statistics")}</span>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[110px] md:w-[200px] text-sm bg-[#F8F8F9]">
                <SelectValue placeholder={t("period")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">{t("yearly")}</SelectItem>
                <SelectItem value="monthly">{t("monthly")}</SelectItem>
                <SelectItem value="weekly">{t("weekly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <CardDescription>
          <div className={`flex items-center gap-4 ${isRTL ? "justify-start" : "justify-end"} py-4 px-4 overflow-x-auto`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0186D8]"></span>
              <span className="text-xs font-medium text-gray-600">{t("profit")}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00E396]"></span>
              <span className="text-xs font-medium text-gray-600">{t("revenue")}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEB019]"></span>
              <span className="text-xs font-medium text-gray-600">{t("sales")}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={period === "yearly" ? chartData?.yearly : period === "monthly" ? chartData?.monthly : chartData?.weekly}
              margin={{ 
                top: 10, 
                right: isRTL ? 40 : 10, 
                bottom: 0, 
                left: isRTL ? 10 : 0 
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E396" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#00E396" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FEB019" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FEB019" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="#F1F1F1"
                strokeDasharray="3 3"
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                interval={period === "monthly" ? "preserveStartEnd" : 0}
                minTickGap={15}
                tick={{ fontSize: 11, fill: '#666' }}
                height={60}
                angle={isRTL ? 45 : -45}
                textAnchor={isRTL ? "start" : "end"}
                dy={5}
                reversed={isRTL}
              />
              <YAxis
                orientation={isRTL ? "right" : "left"}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
                tick={{ fontSize: 12, fill: '#333' }}
                tickFormatter={(value) => {
                  if (value === 0) return "0";
                  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
                  return value.toString();
                }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: '#E2F2FF', opacity: 0.4 }}
              />
              <Bar
                dataKey="profit"
                fill="#0186D8"
                radius={[4, 4, 0, 0]}
                barSize={12}
                name={t("profit")}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00E396"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{ r: 4, fill: '#00E396', strokeWidth: 0 }}
                name={t("revenue")}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#FEB019"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
                dot={false}
                activeDot={{ r: 4, fill: '#FEB019', strokeWidth: 0 }}
                name={t("sales")}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesStatisticsChart;

'use client'
import React from 'react'
import { Card } from "@/components/ui/card";
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import icon1 from '@/assets/images/instructorPanel/earnings/revenue.svg';
import icon2 from '@/assets/images/instructorPanel/earnings/comission.svg';
import icon3 from '@/assets/images/instructorPanel/earnings/earnings.svg';
import {
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts";
import { SummaryCardType } from '@/utils/api/instructor/earnings/getEarnings';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrencySymbol } from '@/utils/helpers';
import ThemeSvg from '@/components/commonComp/customImage/ThemeSvg';


interface SummaryCardsProps {
    summaryCards: SummaryCardType;
}

const SummaryCards = ({ summaryCards }: SummaryCardsProps) => {

    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Revenue Card */}
            <Card className="flex flex-col gap-3 md:gap-4 rounded-2xl primaryBottomBorder border-b-3 shadow-[0px_7px_28px_2px_#ADB3B83D]">
                <div className="flex gap-3 md:gap-4 items-center border-b-2 border-gray-200 p-4 md:p-6 border-dashed">
                    <div className="w-8 h-8 md:w-20 md:h-20 primaryLightBg rounded flexCenter">
                        <ThemeSvg
                            src={icon1}
                            alt="Total Revenue"
                            className="w-8 h-8 md:w-10 md:h-10"
                            colorMap={{
                                "#5A5BB5": "var(--primary-color)",
                                "#04294C": "var(--hover-color)",
                                "#EEF2FA": "var(--primary-light-color)",
                            }}
                        />
                    </div>
                    <div className="flex-1 h-8 md:h-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summaryCards.total_revenue.chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="earning"
                                    stroke="indigo"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <p className="text-xs md:text-base font-semibold text-[#010211]">
                        {t("total_revenue")}
                    </p>
                    <p className="text-lg md:text-xl font-semibold primaryColor">
                        {getCurrencySymbol()}{summaryCards.total_revenue.value}
                    </p>
                </div>
            </Card>

            {/* Total Commission Card */}
            <Card className="flex flex-col gap-3 md:gap-4 rounded-2xl primaryBottomBorder border-b-3 shadow-[0px_7px_28px_2px_#ADB3B83D]">
                <div className="flex gap-3 md:gap-4 items-center border-b-2 border-gray-200 p-4 md:p-6 border-dashed">
                    <div className="w-8 h-8 md:w-20 md:h-20 primaryLightBg rounded flexCenter">
                        <ThemeSvg
                            src={icon2}
                            alt="Total Revenue"
                            className="w-8 h-8 md:w-10 md:h-10"
                            colorMap={{
                                "#5A5BB5": "var(--primary-color)",
                                "#04294C": "var(--hover-color)",
                                "#EEF2FA": "var(--primary-light-color)",
                            }}
                        />
                    </div>
                    <div className="flex-1 h-8 md:h-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summaryCards.total_commission.chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="earning"
                                    stroke="pink"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <p className="text-xs md:text-base font-semibold text-[#010211]">
                        {t("platform_commission")}
                    </p>
                    <p className="text-lg md:text-xl font-semibold primaryColor">
                        {getCurrencySymbol()}{summaryCards.total_commission.value}
                    </p>
                </div>
            </Card>

            {/* Total Earning Card */}
            <Card className="flex flex-col gap-3 md:gap-4 rounded-2xl primaryBottomBorder border-b-3 shadow-[0px_7px_28px_2px_#ADB3B83D]">
                <div className="flex gap-3 md:gap-4 items-center border-b-2 border-gray-200 p-4 md:p-6 border-dashed">
                    <div className="w-8 h-8 md:w-20 md:h-20 primaryLightBg  rounded flexCenter">
                        <ThemeSvg
                            src={icon3}
                            alt="Total Revenue"
                            className="w-8 h-8 md:w-10 md:h-10"
                            colorMap={{
                                "#5A5BB5": "var(--primary-color)",
                                "#04294C": "var(--hover-color)",
                                "#EEF2FA": "var(--primary-light-color)",
                            }}
                        />
                    </div>
                    <div className="flex-1 h-8 md:h-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summaryCards.total_earning.chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="earning"
                                    stroke="green"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <p className="text-xs md:text-base font-semibold text-[#010211]">
                        {t("total_earning")}
                    </p>
                    <p className="text-lg md:text-xl font-semibold primaryColor">
                        {getCurrencySymbol()}{summaryCards.total_earning.value}
                    </p>
                </div>
            </Card>

            {/* Amount On Hold */}
            <Card className="flex flex-col gap-3 md:gap-4 rounded-2xl primaryBottomBorder border-b-3 shadow-[0px_7px_28px_2px_#ADB3B83D]">
                <div className="flex gap-3 md:gap-4 items-center border-b-2 border-gray-200 p-4 md:p-6 border-dashed">
                    <div className="w-8 h-8 md:w-20 md:h-20 primaryLightBg  rounded flexCenter">
                        <ThemeSvg
                            src={icon3}
                            alt="Total Revenue"
                            className="w-8 h-8 md:w-10 md:h-10"
                            colorMap={{
                                "#5A5BB5": "var(--primary-color)",
                                "#04294C": "var(--hover-color)",
                                "#EEF2FA": "var(--primary-light-color)",
                            }}
                        />
                    </div>
                    <div className="flex-1 h-8 md:h-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summaryCards.total_earning.chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="earning"
                                    stroke="green"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <p className="text-xs md:text-base font-semibold text-[#010211]">
                        {t("amount_on_hold")}
                    </p>
                    <p className="text-lg md:text-xl font-semibold primaryColor">
                        {getCurrencySymbol()}{summaryCards?.amount_on_hold?.value}
                    </p>
                </div>
            </Card>
        </div>
    )
}

export default SummaryCards

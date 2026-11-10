'use client'
import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { ActionCardType } from '@/utils/api/instructor/earnings/getEarnings';
import { FaArrowRight } from 'react-icons/fa6';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrencySymbol } from '@/utils/helpers';
import icon1 from '@/assets/images/instructorPanel/earnings/availableWithdrawal.svg';
import icon2 from '@/assets/images/instructorPanel/earnings/totalWithdrawal.svg';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';

interface WithdrawlsCardsProps {
    withdrawlsData: ActionCardType;
}

const WithdrawlsCards = ({ withdrawlsData }: WithdrawlsCardsProps) => {

    const { t } = useTranslation();
    const router = useRouter();

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

    return (
        <div className="flex flex-col md:flex-row lg:flex-col gap-4">
            {/* Available to Withdraw Card */}
            <Card className="p-5 md:p-6 bg-[#0B0F19] border-none text-white w-full rounded-[20px] md:rounded-2xl flex flex-col">
                {/* Mobile: icon + info row | md+: icon+button row */}
                <div className="flex items-center gap-4 mb-5 md:hidden mt-1">
                    <div className="w-16 h-16 bg-white rounded-[12px] flexCenter shrink-0">
                        <CustomImageTag src={icon1.src} alt="icon" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[14px] font-medium text-gray-300 mb-1 leading-none">{t("available_to_withdraw")}</p>
                        <p className="text-[28px] font-bold leading-none">
                            {getCurrencySymbol()}{withdrawlsData?.available_to_withdraw.value || "0.00"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-100 hover:text-black w-full h-[48px] rounded-[10px] md:hidden text-[15px] font-semibold border-none mb-1"
                    onClick={() => router.push("/instructor/earnings/withdraw-details")}
                >
                    {t("withdraw")} <FaArrowRight className={isRtl ? "mr-2 rotate-180" : "ml-2"} />
                </Button>

                {/* md+ original layout */}
                <div className="hidden md:flex justify-between items-start mb-12">
                    <div className="w-16 h-16 bg-white rounded-[12px] flexCenter">
                        <CustomImageTag src={icon1.src} alt="icon" className="w-8 h-8" />
                    </div>
                    <Button
                        variant="outline"
                        className="bg-white text-black hover:bg-gray-100 hover:text-black border-none rounded-[10px]"
                        onClick={() => router.push("/instructor/earnings/withdraw-details")}
                    >
                        {t("withdraw")} <FaArrowRight className={isRtl ? "mr-1 rotate-180" : "ml-1"} />
                    </Button>
                </div>
                <div className="hidden md:block">
                    <p className="text-sm text-gray-300 mb-2">{t("available_to_withdraw")}</p>
                    <p className="text-[32px] md:text-4xl font-bold leading-none">
                        {getCurrencySymbol()}{withdrawlsData?.available_to_withdraw.value || "0.00"}
                    </p>
                </div>
            </Card>

            {/* Total Withdrawal Card */}
            <Card className="p-5 md:p-6 w-full rounded-[20px] md:rounded-2xl flex flex-col border shadow-sm">
                {/* Mobile: icon + info row | md+: icon+button row */}
                <div className="flex items-center gap-4 mb-5 md:hidden mt-1">
                    <div className="w-16 h-16 bg-[#0B0F19] rounded-[12px] flexCenter shrink-0">
                        <CustomImageTag src={icon2.src} alt="icon" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[14px] font-medium text-muted-foreground mb-1 leading-none">{t("total_withdrawal")}</p>
                        <p className="text-[28px] font-bold leading-none text-[#0B0F19]">
                            {getCurrencySymbol()}{withdrawlsData?.total_withdrawal.value || "0.00"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="bg-[#0B0F19] text-white hover:bg-[#0B0F19]/90 hover:text-white w-full h-[48px] rounded-[10px] md:hidden text-[15px] font-semibold border-none mb-1"
                    onClick={() => router.push("/instructor/earnings/withdraw-details")}
                >
                    {t("view_history")} <FaArrowRight className={isRtl ? "mr-2 rotate-180" : "ml-2"} />
                </Button>

                {/* md+ original layout */}
                <div className="hidden md:flex justify-between items-start mb-12">
                    <div className="w-16 h-16 bg-[#0B0F19] rounded-[12px] flexCenter">
                        <CustomImageTag src={icon2.src} alt="icon" className="w-8 h-8" />
                    </div>
                    <Button
                        variant="outline"
                        className="bg-[#0B0F19] text-white hover:bg-[#0B0F19]/90 hover:text-white border-none rounded-[10px]"
                        onClick={() => router.push("/instructor/earnings/withdraw-details")}
                    >
                        {t("view_history")} <FaArrowRight className={isRtl ? "mr-1 rotate-180" : "ml-1"} />
                    </Button>
                </div>
                <div className="hidden md:block">
                    <p className="text-sm text-muted-foreground mb-2">
                        {t("total_withdrawal")}
                    </p>
                    <p className="text-[32px] md:text-4xl font-bold leading-none text-[#0B0F19]">
                        {getCurrencySymbol()}{withdrawlsData?.total_withdrawal.value || "0.00"}
                    </p>
                </div>
            </Card>
        </div>
    )
}

export default WithdrawlsCards
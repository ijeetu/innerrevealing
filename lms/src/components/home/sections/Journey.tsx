'use client'
import React, { useState, useEffect } from 'react';
import { CountsData, getCounts } from '@/utils/api/user/getCounts';
import toast from 'react-hot-toast';
import { extractErrorMessage, formatCount } from '@/utils/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import icon1 from '@/assets/images/homePage/journeyIcons/icon1.svg';
import icon2 from '@/assets/images/homePage/journeyIcons/icon2.svg';
import icon3 from '@/assets/images/homePage/journeyIcons/icon3.svg';
import icon4 from '@/assets/images/homePage/journeyIcons/icon4.svg';
import { useTranslation } from '@/hooks/useTranslation';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';

const Journey: React.FC = () => {
    const { t } = useTranslation();
    const settings = useSelector(settingsSelector);
    const companyName = settings?.data?.app_name || process.env.NEXT_PUBLIC_WEB_NAME || 'eLMS';
    const [loadingCounts, setLoadingCounts] = useState(true);
    const [stats, setStats] = useState<CountsData | null>(null);

    const fetchCounts = async () => {
        try {
            setLoadingCounts(true);
            const response = await getCounts();
            if (response) {
                if (!response.error) {
                    if (response.data) {
                        const data = response.data as CountsData;
                        setStats(data);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch counts");
                    setStats(null);
                }
            } else {
                console.log("response is null in component", response);
                setStats(null);
            }
        }
        catch (error) {
            extractErrorMessage(error);
            setStats(null);
        }
        finally {
            setLoadingCounts(false);
        }
    }

    useEffect(() => {
        fetchCounts();
    }, []);

    return (
        <div className="w-full bg-black text-white py-8 md:py-12">
            <div className="container">
                <div className="grid grid-cols-12 items-center max-1199:gap-y-8 gap-5">
                    <div className="max-1199:col-span-12 col-span-2 flexColCenter gap-3 sm:items-start">
                        <span className="bg-white text-black px-4 py-2 rounded-[2px] text-sm font-medium text-center">
                            {t("start_your_journey")}
                        </span>
                        <h1 className="text-lg md:text-xl lg:text-2xl font-bold mt-2 max-[400px]:text-center break-all">
                            {t("achieve_goals_with_elms")}{" "}{companyName}
                        </h1>
                    </div>

                    {
                        loadingCounts ?
                            <div className="max-1199:col-span-12 col-span-10 grid grid-cols-2 lg:grid-cols-4 gap-4 between-1200-1399:gap-4 md:gap-12 h-fit">
                                {[...Array(4)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#2A2A37] rounded-[16px] p-3 md:p-4 flex items-center gap-4 flex-wrap"
                                    >
                                        <Skeleton className="w-full h-full bg-gray-400" />
                                    </div>
                                ))}
                            </div>
                            :
                            <div className="max-1199:col-span-12 col-span-10 grid grid-cols-2 lg:grid-cols-4 gap-4 between-1200-1399:gap-4 md:gap-12 h-fit">
                                <div
                                    className="bg-[#2A2A37] rounded-[16px] p-3 md:p-4 flex items-center gap-4 flex-wrap"
                                >
                                    <div className="w-[72px] between-1200-1399:w-[60px] h-[72px] between-1200-1399:h-[60px] rounded-[8px] flexCenter bg-white">
                                        <CustomImageTag src={icon1} alt={t("online_courses")} className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <div className="text-xl md:text-2xl font-semibold">
                                            {stats?.course_count ?? 0}
                                        </div>
                                        <div className="text-gray-300 text-sm sm:text-base">{t("online_courses")}</div>
                                    </div>
                                </div>
                                <div
                                    className="bg-[#2A2A37] rounded-[16px] p-3 md:p-4 flex items-center gap-4 flex-wrap"
                                >
                                    <div className="w-[72px] between-1200-1399:w-[60px] h-[72px] between-1200-1399:h-[60px] rounded-[8px] flexCenter bg-white">
                                        <CustomImageTag src={icon2} alt={t("expert_instructor")} className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <div className="text-xl md:text-2xl font-semibold">
                                            {stats?.instructor_count ?? 0}
                                        </div>
                                        <div className="text-gray-300 text-sm sm:text-base">{t("expert_instructor")}</div>
                                    </div>
                                </div>
                                <div
                                    className="bg-[#2A2A37] rounded-[16px] p-3 md:p-4 flex items-center gap-4 flex-wrap"
                                >
                                    <div className="w-[72px] between-1200-1399:w-[60px] h-[72px] between-1200-1399:h-[60px] rounded-[8px] flexCenter bg-white">
                                        <CustomImageTag src={icon3} alt={t("student_enrolled")} className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <div className="text-xl md:text-2xl font-semibold">
                                            {stats?.student_enroll_count ?? 0}
                                        </div>
                                        <div className="text-gray-300 text-sm sm:text-base">{t("student_enrolled")}</div>
                                    </div>
                                </div>
                                <div
                                    className="bg-[#2A2A37] rounded-[16px] p-3 md:p-4 flex items-center gap-4 flex-wrap"
                                >
                                    <div className="w-[72px] between-1200-1399:w-[60px] h-[72px] between-1200-1399:h-[60px] rounded-[8px] flexCenter bg-white">
                                        <CustomImageTag src={icon4} alt={t("positive_feedback")} className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <div className="text-xl md:text-2xl font-semibold">
                                            {formatCount(stats?.positive_feedback_count ?? 0)}
                                        </div>
                                        <div className="text-gray-300 text-sm sm:text-base ">{t("positive_feedback")}</div>
                                    </div>
                                </div>
                            </div>
                    }

                </div>
            </div>
        </div>
    );
};

export default Journey;
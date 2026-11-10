import { Card } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation';
import { QuizInfoType, QuizStatisticsType } from '@/utils/api/instructor/quiz/getQuizReportDetails';
import React from 'react'
import { GoArrowLeft } from "react-icons/go";
import icon1 from "@/assets/images/instructorPanel/quizReport/passingPoints.svg";
import icon2 from "@/assets/images/instructorPanel/quizReport/totalPoints.svg";
import icon3 from "@/assets/images/instructorPanel/quizReport/totalAttempts.svg";
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';

interface QuizInfoProps {
    onBackClick?: () => void;
    quizInfo: QuizInfoType;
    quizStatistics: QuizStatisticsType;
    studentReportPage?: boolean;
}

const StatCard = ({
    icon,
    value,
    label,
    borderColor,
    bgColor,
    studentReportPage,
}: {
    icon: string | { src: string };
    value: string | number;
    label: string;
    borderColor: string;
    bgColor: string;
    studentReportPage: boolean;
}) => {
    if (studentReportPage) {
        // Student report: stacked vertical layout
        return (
            <div className="flex items-center gap-3 p-4 lg:flex-col flex-row lg:justify-center bg-white justify-start text-start lg:text-center lg:gap-12 rounded-md">
                <div className={`w-16 h-16 rounded-[8px] flexCenter`} style={{ backgroundColor: bgColor }}>
                    <CustomImageTag src={icon} alt="icon" className="w-10 h-10 object-contain" />
                </div>
                <div>
                    <div className="font-bold">{value}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                </div>
            </div>
        );
    }

    // Instructor / course detail page: horizontal layout matching Figma
    return (
        <div className="flex items-center gap-3 p-4 sectionBg rounded-xl">
            {/* Icon box: solid colored bg so white SVG icons are visible */}
            <div
                className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: borderColor }}
            >
                <CustomImageTag src={icon} alt="icon" className="w-8 h-8 object-contain" />
            </div>
            {/* Text */}
            <div>
                <div className="font-bold text-base">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </div>
    );
};

const QuizInfo = ({ onBackClick, studentReportPage = true, quizInfo, quizStatistics }: QuizInfoProps) => {

    const { t } = useTranslation();

    return (
        <div>
            <div className={`${studentReportPage
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4 my-6'
                : 'bg-white grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 m-4 md:m-6'
                }`}>

                {/* ── Left: Quiz identity card ── */}
                <Card className={`grid items-start p-4 md:p-6 ${studentReportPage && 'border-none'}`}>

                    {/* Back button + quiz number + title row */}
                    <div className="flex items-center gap-3 md:gap-5 mb-6">
                        {!studentReportPage && (
                            <button
                                onClick={onBackClick}
                                className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full"
                                aria-label="Go back"
                            >
                                <GoArrowLeft size={24} />
                            </button>
                        )}

                        {/* Quiz number badge */}
                        <div className="flex-shrink-0 text-center flexCenter flex-col w-14 md:w-16 h-16 primaryBg text-white rounded-md shadow-sm">
                            <span className="text-lg font-bold leading-tight">{quizInfo?.quiz_number?.replace(/\s*quiz\s*/i, '').trim()}</span>
                            <span className="text-[11px] leading-tight opacity-90">Quiz</span>
                        </div>

                        {/* Quiz title + question count */}
                        <div className="flex flex-col justify-center">
                            <h2 className="text-base md:text-lg font-semibold leading-snug">
                                {quizInfo?.quiz_title}
                            </h2>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {quizInfo?.total_questions} {t("total_questions")}
                            </p>
                        </div>
                    </div>

                    {/* Course and Chapter details */}
                    <div className="grid gap-5 text-sm border-t pt-5 borderColor">
                        <p>
                            <span className="text-gray-500">{t("course_name")} :</span>
                            <br />
                            <span className="font-semibold">{quizInfo?.course_name}</span>
                        </p>
                        <p>
                            <span className="text-gray-500">{t("chapter_name")} :</span>
                            <br />
                            <span className="font-semibold">{quizInfo?.chapter_name}</span>
                        </p>
                    </div>
                </Card>

                {/* ── Right: Statistics cards ── */}
                <Card className={`${studentReportPage
                    ? 'grid grid-cols-1  xl:grid-cols-3  border-none shadow-none w-full sectionBg gap-4'
                    : 'flex flex-col gap-3 border-none shadow-none'
                    }`}>

                    <StatCard
                        icon={icon1}
                        value={quizStatistics?.passing_points}
                        label={t("passing_points")}
                        borderColor="#83B807"
                        bgColor="#F3F9E6"
                        studentReportPage={studentReportPage}
                    />

                    <StatCard
                        icon={icon2}
                        value={quizStatistics?.total_points}
                        label={t("total_points")}
                        borderColor="#DB9305"
                        bgColor="#FDF5E6"
                        studentReportPage={studentReportPage}
                    />

                    <StatCard
                        icon={icon3}
                        value={quizStatistics?.total_attempts}
                        label={t("total_attempts")}
                        borderColor="#0186D8"
                        bgColor="#E6F4FD"
                        studentReportPage={studentReportPage}
                    />
                </Card>
            </div>
        </div>
    )
}

export default QuizInfo

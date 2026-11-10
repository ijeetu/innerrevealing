"use client"
import { useTranslation } from '@/hooks/useTranslation';
export default function SwitchAccountSteps({ currentStep2 }: { currentStep2?: boolean }) {
    const { t } = useTranslation();
    return (
        <>
            {/* Steps */}
            < div className="sm:flex gap-6">
                {/* Step 1 */}
                <div className="flex sm:flex-col max-[640px]:gap-3 sm:w-full sm:space-y-3">
                    <div className="flex flex-col sm:flex-row items-center">
                        {/* Circle */}
                        <div className="border border-dashed rounded-full p-1">
                            <div className="max-[400px]:w-7 max-[400px]:h-7 w-8 h-8 rounded-full bg-[#010211] flex items-center justify-center">
                                <p className="text-white max-[400px]:text-[14px] text-xl font-normal">1</p>
                            </div>
                        </div>

                        {/* Line */}
                        <div className="flex-1 h-px bg-[#D8E0E6] sm:block hidden"></div>
                        <div className="w-px max-[583px]:h-13 h-10 bg-[#D8E0E6] sm:hidden block"></div>
                    </div>
                    <div>
                        <p className="font-semibold max-[368px]:text-sm text-base">
                            {t("account_type_confirmation")}
                        </p>
                        <p className="text-sm text-gray-600">
                            {t("review_the_commission_structure_and_team_permissions_before_confirming_the_switch")}
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex sm:flex-col max-[640px]:gap-3 w-full sm:space-y-3">
                    <div className="flex flex-col sm:flex-row items-center">
                        <div className="border border-dashed rounded-full p-1">
                            <div className={`max-[400px]:w-7 max-[400px]:h-7 w-8 h-8 rounded-full ${currentStep2 ? "bg-[#010211]" : "bg-gray-200"} flex items-center justify-center`}>
                                <p className={`${currentStep2 ? "text-white" : "text-[#555555]"} max-[400px]:text-[14px] text-xl font-normal`}>2</p>
                            </div>
                        </div>

                        <div className="flex-1 h-px bg-[#D8E0E6] sm:block hidden"></div>
                    </div>
                    <div>
                        <p className="font-semibold max-[368px]:text-sm text-base">
                            {t("set_up_your_team")}
                        </p>
                        <p className="text-sm text-gray-600">
                            {t("add_your_team_name_and_logo_to_continue_setting_up_your_team_account")}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
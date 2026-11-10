"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from '@/hooks/useTranslation';
import { DialogClose } from "@radix-ui/react-dialog";
import { useSelector } from "react-redux";
import { userDataSelector } from "@/redux/reducers/userSlice";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import SetUpYourTeam from "./SetUpYourTeam";
import SwitchAccountSteps from "@/components/commonComp/SwitchAccountSteps";
import { switchInstructorType } from "@/utils/api/user/switch-instructor/switchInstructorType";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import RichTextContent from "@/components/commonComp/RichText";
import toast from "react-hot-toast";

export default function SwitchAccountModal() {
    const [checked, setChecked] = useState(false);
    const userDetails = useSelector(userDataSelector) as UserDetails;
    const [openSwitchModal, setOpenSwitchModal] = useState(false);
    const [openTeamModal, setOpenTeamModal] = useState(false);
    const instructorType = userDetails?.instructor_details?.type;
    const settings = useSelector(settingsSelector);

    const instructorCommisionRate = instructorType === "individual" ? userDetails.instructor_details?.team_commision_rate : userDetails.instructor_details?.individual_commision_rate;

    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();

    const isStatusDisabled = ["pending", "suspended", "rejected"].includes(userDetails?.instructor_process_status || "");

    const handleConfirm = async () => {
        if (instructorType === "individual") {
            setOpenSwitchModal(false);
            setOpenTeamModal(true);
        } else {
            setLoading(true);
            try {
                const response = await switchInstructorType();
                if (response && !response.error) {
                    toast.success(response.message || t("switched_to_individual_account_successfully"));
                    setOpenSwitchModal(false);
                    window.location.reload();
                } else {
                    toast.error(response?.message || t("something_went_wrong"));
                }
            } catch (error) {
                console.error("Error switching to individual:", error);
                toast.error(t("something_went_wrong"));
            } finally {
                setLoading(false);
            }
        }
        setChecked(false);
    }


    return (
        <>
            <Dialog open={openSwitchModal} onOpenChange={setOpenSwitchModal}>
                <DialogTrigger asChild>
                    <button
                        disabled={isStatusDisabled}
                        onClick={() => !isStatusDisabled && setOpenSwitchModal(true)}
                        className={`max-[335px]:text-[14px] rounded-[4px] md:text-lg px-3 py-1 bg-[#000000] text-white text-base ${isStatusDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {instructorType === "individual" ? t('switch_to_team') : t('switch_to_individual')}
                    </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">
                    {/* Header */}
                    <DialogHeader className="max-[368px]:px-3 px-4 py-4 sm:py-6 ltr:text-start rtl:text-right border-b border-[#E8E8EC]">
                        <DialogTitle className="text-xl font-semibold leading-none">
                            {t("switch_account_type")}
                        </DialogTitle>

                        <p className="text-sm text-gray-600 leading-tight mt-1">
                            {t("review_commission_before_change")}
                        </p>
                    </DialogHeader>

                    {/* Body */}
                    <div className="max-[368px]:px-3 px-4 sm:py-3 space-y-5 max-h-[calc(100vh-270px)] overflow-y-auto customScrollbar">
                        {instructorType === "individual" && (
                            <>
                                <SwitchAccountSteps />
                            </>
                        )}
                        {/* Info Box */}
                        <div className="bg-gray-100 rounded-xl max-[368px]:p-3 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {t("current_account_type")}
                                </span>
                                <span className="font-semibold max-[368px]:text-[14px] text-base">
                                    {instructorType === 'individual' ? t('individual') : t('team')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {t("switching_to_account_type")}
                                </span>
                                <span className="font-semibold max-[368px]:text-[14px] text-base">
                                    {instructorType === 'individual' ? t('team') : t('individual')}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {t("instructor_earnings")}
                                </span>
                                <span className="font-semibold max-[368px]:text-[14px] text-base">{Number(instructorCommisionRate)}%</span>
                            </div>
                        </div>

                        {/* Note */}
                        <p className="text-sm text-gray-600 leading-tight">
                            <span className="font-medium">{t("note")}:</span>{" "}
                            {t("switching_to_account_type_will_update_your_commission_structure")}
                        </p>

                        {/* Terms */}
                        <div className="max-[368px]:p-3 border border-[#D8E0E6] rounded-xl p-5 min-[500px]:max-h-[350px] max-h-[300px] overflow-y-auto customScrollbar space-y-6">
                            {instructorType === "individual" ? (
                                <RichTextContent content={settings?.data?.team_instructor_terms} />
                            ) : (
                                <RichTextContent content={settings?.data?.individual_instructor_terms} />
                            )}
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="agree"
                                checked={checked}
                                className="max-[368px]:w-[20px] max-[368px]:h-[20px] w-[24px] h-[24px] shrink-0"
                                onCheckedChange={(val) => setChecked(!!val)}
                            />

                            <label
                                htmlFor="agree"
                                className="text-sm text-gray-700 leading-tight cursor-pointer"
                            >
                                {t("i_agree_to_the_updated_commission_structure_and_account_terms")}
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="max-[368px]:flex-col flex gap-3 px-4 pb-6">
                        <DialogClose asChild>
                            <button className="flex-1 primaryColor border primaryBorder rounded-[4px] py-2 bg-white">
                                {t("cancel")}
                            </button>
                        </DialogClose>

                        <button
                            disabled={!checked || loading}
                            className={`commonBtn md:text-lg flex-1 ${!checked || loading ? "cursor-not-allowed opacity-50" : ""}`}
                            onClick={handleConfirm}
                        >
                            {t("confirm_switch")}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Team Modal */}
            <SetUpYourTeam
                open={openTeamModal}
                onOpenChange={setOpenTeamModal}
            />
        </>
    );
}
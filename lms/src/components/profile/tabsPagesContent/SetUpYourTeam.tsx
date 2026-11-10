"use client";
import React, { useEffect, useState } from "react";
import SwitchAccountSteps from "@/components/commonComp/SwitchAccountSteps";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import z from "zod";
import toast from "react-hot-toast";
import { switchInstructorType } from "@/utils/api/user/switch-instructor/switchInstructorType";
import { extractErrorMessage } from "@/utils/helpers";
import { PiUploadSimpleBold } from "react-icons/pi";
import { PiTrashBold } from "react-icons/pi";

type TeamInfo = {
    team_name: string;
    team_logo: File | null;
};

export default function SetUpYourTeam({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { t } = useTranslation();

    const schema = z.object({
        team_name: z.string().min(1, t("team_name_is_required")),
        team_logo: z
            .instanceof(File, { message: t("team_logo_is_required") })
            .refine((file) => file.size <= 10 * 1024 * 1024, {
                message: t("file_size_should_be_less_than_10mb"),
            }),
    });

    // state for formData
    const [formData, setFormData] = useState<TeamInfo>({
        team_name: "",
        team_logo: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const resetForm = () => {
        setFormData({
            team_name: "",
            team_logo: null,
        });

        setErrors({});
        setLoading(false);
        setIsDragging(false);
    };

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, files, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files?.[0] ?? null : value,
        }));

        // remove error instantly
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                team_logo: file,
            }));
            setErrors((prev) => ({
                ...prev,
                team_logo: "",
            }));
        }
    };


    const validateForm = () => {
        try {
            schema.parse(formData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};

                err.errors.forEach((error) => {
                    const field = error.path[0] as string;
                    newErrors[field] = error.message;
                });

                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await switchInstructorType({
                team_name: formData.team_name,
                team_logo: formData.team_logo,
            })
            if (response && !response.error) {
                toast.success(response.message || t("switched_to_team_account_successfully"));
                resetForm();
                onOpenChange(false);
                window.location.reload();
            } else {
                toast.error(response?.message || t("something_went_wrong"));
            }
        } catch (error) {
            extractErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-2xl w-[95vw] sm:w-full p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh] flex flex-col">

                {/* HEADER */}
                <DialogHeader className="px-4 py-5 border-b border-[#E8E8EC] text-start shrink-0">
                    <DialogTitle className="text-xl font-semibold">
                        {t("switch_account_type")}
                    </DialogTitle>

                    <p className="text-sm text-gray-600">
                        {t("review_commission_before_change")}
                    </p>
                </DialogHeader>

                {/* BODY */}
                <div className="px-4 py-5 space-y-6 overflow-y-auto customScrollbar flex-1">

                    <SwitchAccountSteps currentStep2={true} />

                    {/* TEAM NAME */}
                    <div>
                        <label className="text-base">
                            {t("team_name")}{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <input
                            name="team_name"
                            type="text"
                            value={formData.team_name}
                            onChange={handleInputChange}
                            placeholder={t('team_name')}
                            className={`w-full h-11 px-3 rounded-lg bg-[#F8F8F9] border outline-none mt-2
                            ${errors.team_name ? "border-red-500" : "border-[#E8E8EC]"}`}
                        />

                        {errors.team_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.team_name}
                            </p>
                        )}
                    </div>

                    {/* TEAM LOGO */}
                    <div className="space-y-2">
                        <label className="text-base">
                            {t("team_logo")}{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 mt-2 text-center transition-all duration-200 ease-in-out
                            ${isDragging
                                    ? "border-[#1E293B] bg-[#E2E8F0] scale-[1.01]"
                                    : "border-[#E8E8EC] bg-[#F8F8F9] "
                                } 
                            ${errors.team_logo ? "border-red-500" : ""}`}
                        >
                            <input
                                name="team_logo"
                                type="file"
                                accept=".jpeg,.jpg,.png,.gif,.svg"
                                className="hidden"
                                id="teamLogo"
                                onChange={handleInputChange}
                            />

                            <label
                                htmlFor="teamLogo"
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                    <PiUploadSimpleBold size={24} />
                                </div>
                                <div>
                                    {t("drag_and_drop_your_file_here_or_click_to")}{" "}
                                    <span className="primaryColor underline font-medium">
                                        {t("browse")}
                                    </span>
                                </div>
                            </label>
                        </div>
                        {formData.team_logo ? (
                            <div className="flex items-center gap-3 p-2 bg-[#F8F8F9] border border-[#E8E8EC] rounded-lg mt-2">
                                <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 bg-white">
                                    <img
                                        src={URL.createObjectURL(formData.team_logo)}
                                        alt="Team Logo Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col flex-1 truncate">
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                        {formData.team_logo.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {(formData.team_logo.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, team_logo: null }))}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Remove Logo"
                                >
                                    <PiTrashBold size={20} />
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-[#595B6C]">
                                {t(
                                    "upload_a_logo_48x48_px_in_a_square_format_for_best_display"
                                )}
                            </p>
                        )}

                        {errors.team_logo && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.team_logo}
                            </p>
                        )}
                    </div>
                </div>
                <div className="border-t border-[#E8E8EC] flex gap-3 px-4 py-4 shrink-0">

                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className={`primaryBg w-full text-white py-2 rounded-md
                        ${loading && "opacity-50 cursor-not-allowed"}`}
                    >
                        {t("continue")}
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
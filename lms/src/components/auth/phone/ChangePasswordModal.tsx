"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { mobileResetPassword } from "@/utils/api/auth/mobile-reset-password/mobileResetPassword";
import {
    isMobileResetPasswordResponseSuccess,
    extractResetPasswordData,
    extractErrorMessage,
    validateMobileResetPasswordData
} from "@/utils/api/auth/mobile-reset-password/mobileResetPassHelpers";
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { getDirection } from "@/utils/helpers";


// Zod schema for password reset form
const formSchema = z
    .object({
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters." }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

interface ChangePasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    token: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onOpenChange, token }) => {
    const { t } = useTranslation();
    const settingsData = useSelector(settingsSelector);
    const companyName = settingsData?.data?.app_name;
    // State for password visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // React Hook Form setup
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });


    const handleResetPassword = async () => {
        try {
            // Prepare reset password data
            const resetData = {
                firebase_token: token,
                password: form.getValues().password,
                confirm_password: form.getValues().confirmPassword
            };

            // Validate reset password data before sending
            const validation = validateMobileResetPasswordData(resetData);
            if (!validation.isValid) {
                toast.error(validation.errorMessage);
                return;
            }

            // Call the mobile reset password function
            const response = await mobileResetPassword(resetData);

            // Check if reset password was successful
            if (isMobileResetPasswordResponseSuccess(response)) {
                const resetResult = extractResetPasswordData(response);

                if (resetResult) {
                    // Show success message
                    toast.success(response.message || t("password_reset_successful"));

                    // Reset form and close modal
                    form.reset();
                    onOpenChange(false);
                } else {
                    toast.error(t("password_reset_no_response_data"));
                }
            } else {
                // Handle reset password failure
                const errorMessage = extractErrorMessage(response);
                toast.error(errorMessage);
                console.error('Password reset error:', response);
            }
        } catch (error) {
            // Handle unexpected errors
            console.error('Mobile reset password error:', error);
            toast.error(t("unexpected_error_try_again"));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 bg-white rounded-xl shadow-xl">
                {/* Header */}
                <DialogHeader className="px-3 py-4 sm:p-6 !pb-0 gap-1">
                    <DialogTitle className="text-start text-xl font-semibold text-gray-900">
                        {t("create_new_password")}
                    </DialogTitle>
                    <DialogDescription className="text-start text-sm text-gray-500">
                        {t("enter_confirm_new_password")}
                    </DialogDescription>
                </DialogHeader>

                {/* divider */}
                <hr className=" border-gray-200" />

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleResetPassword)}
                        className="space-y-5 px-3 sm:px-6 py-2"
                        autoComplete="off"
                    >
                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm sm:text-base font-medium text-gray-700 requireField block">
                                        {t("password")}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="w-full px-4 py-2.5 h-12 border border-gray-300 rounded-md bg-[#F8F8F9]"
                                            />
                                            <button
                                                type="button"
                                                className={`absolute  top-1/2 transform -translate-y-1/2 ${getDirection() === "rtl" ? "left-3" : "right-3"}`}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Confirm Password field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm sm:text-base font-medium text-gray-700 requireField block">
                                        {t("confirm_password")}{" "}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="w-full px-4 py-2.5 h-12 border border-gray-300 rounded-md bg-[#F8F8F9]"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Reset Password Button */}
                        <Button
                            type="submit"
                            className="w-full primaryBg text-white font-normal py-2.5 h-12 rounded-md hover:hoverBgColor transition-all duration-300 md:text-xl"
                        >
                            {t("reset_password")}
                        </Button>
                    </form>
                </Form>

                {/* divider */}
                <hr className="borderColor mt-2" />

                <div className="px-6 pb-6 text-center flex flex-col gap-1 font-semibold text-sm sm:text-base">
                    <p className="!font-normal text-sm">
                        {t("by_creating_account_agree")} {" "} {companyName}
                    </p>
                    <div className="flex justify-center gap-1">
                        <Link
                            href="/terms-of-service"
                            className="primaryColor hover:underline"
                        >
                            {t("terms_of_service")}
                        </Link>
                        <span className="">{t("and")}</span>
                        <Link
                            href="/privacy-policy"
                            className="primaryColor hover:underline"
                        >
                            {t("privacy_policy")}
                        </Link>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordModal;

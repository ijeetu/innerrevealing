"use client"
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/utils/api/auth/changePassword";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { isRTLSelector } from "@/redux/reducers/languageSlice";


export default function AccountSecurityPage() {

  const { t } = useTranslation();
  const isRTL = useSelector(isRTLSelector);

  const [showPassword, setShowPassword] = useState({
    old_password: false,
    new_password: false,
    new_password_confirmation: false,
  });

  // Zod schema for password change form validation
  const changePasswordSchema = z
    .object({
      old_password: z.string().min(1, t("old_password_required")),
      new_password: z
        .string()
        .min(8, t("password_min_length_8")).regex(/(?=.*[A-Z])/, {
          message: t("password_uppercase_required"),
        })
        .regex(/(?=.*\d)/, {
          message: t("password_number_required"),
        })
        .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, {
          message: t("password_special_char_required"),
        }),
      new_password_confirmation: z.string().min(8, t("password_min_length_8")).regex(/(?=.*[A-Z])/, {
        message: t("password_uppercase_required"),
      })
        .regex(/(?=.*\d)/, {
          message: t("password_number_required"),
        })
        .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, {
          message: t("password_special_char_required"),
        }),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
      message: t("new_passwords_dont_match"),
      path: ["new_password_confirmation"],
    });

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  // Function to handle change password
  // This follows the same simple pattern as handleStartQuiz in StartQuiz.tsx
  const handleChangePassword = async (
    values: z.infer<typeof changePasswordSchema>
  ) => {
    try {
      // Call the changePassword API
      const response = await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      });

      if (response) {
        // Check if API returned an error
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to change password");
        } else {
          // Success - password changed successfully
          toast.success(response.message || "Password changed successfully!");

          // Reset form after successful password change
          form.reset();
        }
      } else {
        console.log("response is null in component", response);
        toast.error("Failed to change password. Please try again.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    }
  }

  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("account_security")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 flex-wrap inline-flex items-center gap-1 max-w-full">
            <Link href={"/"} className="primaryColor" title="Home">
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("account_security")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar />

            <div className="bg-white flex-1 w-full space-y-8 rounded-[10px]">
              <h2 className="text-xl font-semibold text-gray-800 py-4 px-6 mb-0">
                {t("account_security")}
              </h2>

              <hr className="border-gray-200 mb-2" />

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleChangePassword)}
                  className="px-6 py-3 space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="old_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-[#010211] requireField">
                            {t("old_password")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword.old_password ? "text" : "password"}
                                placeholder={t("enter_old_password")}
                                className={`w-full sectionBg rounded-[5px] p-3 ${isRTL ? "pl-10 text-right" : "pr-10 text-left"} border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, old_password: !showPassword.old_password })}
                                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-500 bg-[#F8F8F9]`}
                              >
                                {showPassword.old_password ? (
                                  <IoEyeOutline size={20} />
                                ) : (
                                  <IoEyeOffOutline size={20} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-[#010211] requireField">
                            {t("new_password")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword.new_password ? "text" : "password"}
                                placeholder={t("enter_new_password")}
                                className={`sectionBg w-full rounded-[5px] p-3 ${isRTL ? "pl-10 text-right" : "pr-10 text-left"} border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, new_password: !showPassword.new_password })}
                                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-500 bg-[#F8F8F9]`}
                              >
                                {showPassword.new_password ? (
                                  <IoEyeOutline size={20} />
                                ) : (
                                  <IoEyeOffOutline size={20} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="new_password_confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-[#010211] requireField">
                            {t("re_enter_new_password")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword.new_password_confirmation ? "text" : "password"}
                                placeholder={t("re_enter_new_password")}
                                className={`sectionBg w-full rounded-[5px] p-3 ${isRTL ? "pl-10 text-right" : "pr-10 text-left"} border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, new_password_confirmation: !showPassword.new_password_confirmation })}
                                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-500 bg-[#F8F8F9]`}
                              >
                                {showPassword.new_password_confirmation ? (
                                  <IoEyeOutline size={20} />
                                ) : (
                                  <IoEyeOffOutline size={20} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-center mb-4">
                    <button
                      type="submit"
                      className="commonBtn max-[400px]:w-full"
                    >
                      {t("change_password")}
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

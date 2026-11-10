"use client";
import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegEnvelope } from "react-icons/fa6";
import { FiPhoneCall } from "react-icons/fi";
import { useTranslation } from '@/hooks/useTranslation';
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { contactUs } from "@/utils/api/user/contactUs";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { isLoginSelector } from "@/redux/reducers/userSlice";

// Form error type - matches the ask-question pattern
type FormErrors = {
  firstName?: string;
  email?: string;
  message?: string;
};

export default function ContactUs() {

  const { t, currentLanguage } = useTranslation();
  const settings = useSelector(settingsSelector);
  const currentLanguageCode = useSelector(currentLanguageSelector)

  // Zod schema for validation - matches the ask-question pattern
  // NOTE: .trim() ensures inputs with only spaces are treated as empty
  // const contactFormSchema = z.object({
  //   firstName: z
  //     .string()
  //     .trim()
  //     .min(1, t("first_name_required"))
  //     .max(100, t("first_name_max")),
  //   email: z
  //     .string()
  //     .trim()
  //     .min(1, t("email_required"))
  //     .email(t("email_invalid"))
  //     .max(255, t("email_max")),
  //   message: z
  //     .string()
  //     .trim()
  //     .min(1, t("message_required"))
  //     .max(2000, t("message_max")),
  // });

  const contactFormSchema = useMemo(() => z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t("first_name_required"))
      .max(100, t("first_name_max")),
    email: z
      .string()
      .trim()
      .min(1, t("email_required"))
      .email(t("email_invalid"))
      .max(255, t("email_max")),
    message: z
      .string()
      .trim()
      .min(1, t("message_required"))
      .max(2000, t("message_max")),
  }), [t]); 

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Single state object for form - matches the ask-question pattern
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const isLogin = useSelector(isLoginSelector);
  const dispatch = useDispatch();

  // Handle input change - matches the ask-question pattern
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form - matches the ask-question pattern
  const validateForm = () => {
    try {
      contactFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const fieldName = err.path[0] as keyof FormErrors;
            newErrors[fieldName] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error(t("fix_validation_errors"));
      }
      return false;
    }
  };

  // Handle form submission - matches the ask-question pattern
  const handleSubmitContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent default HTML form submission
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await contactUs({
        first_name: formData.firstName,
        email: formData.email,
        message: formData.message,
      });

      if (response.success) {
        toast.success(response.message || t("message_sent_successfully"));
        // Reset form after successful submission
        setFormData({
          firstName: "",
          email: "",
          message: "",
        });
      } else {
        toast.error(response.error || t("failed_to_send_message"));
      }
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast.error(t("error_sending_message"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isClient &&
    <Layout>
      <div className="sectionBg py-10 pb-16 md:py-18">
        <div className="container space-y-4">
          <div className="bg-white rounded-full py-2 px-4 w-max flexCenter gap-1">
            <Link href={`/?lang=${currentLanguageCode}`} className="primaryColor" title={t("home")}>
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("contact_us")}</span>
          </div>
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("contact_us")}
            </h1>
            <p className="sectionPara lg:w-[52%]">
              {t("contact_description")}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12 mt-[-90px] md:mt-[-100px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-[0px_7px_28px_2px_#ADB3B83D] flex items-center gap-4 border borderColor">
            <div className="bg-black p-3 rounded-full">
              <IoLocationOutline size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("address")}</h3>
              <p className="text-gray-600 text-sm">
                {settings?.data?.contact_address}
              </p>
            </div>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-[0px_7px_28px_2px_#ADB3B83D] flex items-center gap-4 border borderColor">
            <div className="bg-black p-3 rounded-full">
              <FaRegEnvelope size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("mail_us")}</h3>
              <Link
                href={`mailto:${settings?.data?.contact_email}`}
                className="text-gray-600 text-sm"
              >
                {settings?.data?.contact_email}
              </Link>
            </div>
          </div>
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-[0px_7px_28px_2px_#ADB3B83D] flex items-center gap-4 border borderColor">
            <div className="bg-black p-3 rounded-full">
              <FiPhoneCall size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("call_us")}</h3>
              <Link href={`tel:${settings?.data?.contact_phone}`} className="text-gray-600 text-sm">
                {settings?.data?.contact_phone}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <div className="bg-[#5A5BB51F] rounded-full py-2 px-4 w-max flex items-center gap-2">
              <span className="h-px w-4 bg-gray-700"></span>
              <span className="text-sm text-gray-900">{t("contact_us")}</span>
              <span className="h-px w-4 bg-gray-700"></span>
            </div>
            <h2 className="font-semibold text-2xl sm:text-3xl">
              {t("send_us_a_message")}
            </h2>
            <p className="text-gray-600">
              {t("contact_form_description")}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmitContact}>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm md:text-[16px]  text-gray-700 mb-1 font-semibold"
              >
                {t("first_name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder={t("name")}
                className={`w-full px-4 py-3 border border-gray-200 rounded-md sectionBg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? "border-red-500" : ""}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm md:text-[16px]  text-gray-700 mb-1 font-semibold"
              >
                {t("email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@gmail.com"
                className={`w-full px-4 py-3 border border-gray-200 rounded-md sectionBg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm md:text-[16px]  text-gray-700 mb-1 font-semibold"
              >
                {t("message")} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder={t("type_your_message")}
                className={`w-full px-4 py-3 border border-gray-200 rounded-md sectionBg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.message ? "border-red-500" : ""}`}
              ></textarea>
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="commonBtn w-full md:w-max"
              >
                {isLoading ? t("sending") : t("send_message")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

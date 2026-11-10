"use client";
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { BiArrowBack, BiSend } from "react-icons/bi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/community/PageHeader";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  extractErrorMessage,
  isPostQuestionResponseSuccess
} from "@/utils/api/user/helpdesk/question/postQuestionHelper";
import { postQuestion } from "@/utils/api/user/helpdesk/question/postQuestion";
import { useTranslation } from "@/hooks/useTranslation";
import dynamic from 'next/dynamic';
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { isLoginSelector } from "@/redux/reducers/userSlice";

// Dynamically import ReactQuill with SSR disabled to prevent "document is not defined" error
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Zod schema for validation (moved inside validateForm to use translation)

// Form error type
type FormErrors = {
  questionTitle?: string;
  questionDescription?: string;
  groupSlug?: string;
};

export default function AskQuestionPage() {

  const currentLanguageCode = useSelector(currentLanguageSelector)
  const { slug } = useParams();
  const currentSlug = typeof slug === "string" ? slug : "";

  // Single state object for form
  const [formData, setFormData] = useState({
    questionTitle: "",
    questionDescription: "",
    groupSlug: currentSlug,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const { t } = useTranslation();

  const isLogin = useSelector(isLoginSelector);

  const router = useRouter();
  // Handle input change
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const questionFormSchema = z.object({
      questionTitle: z.string().min(1, t("question_title_required")).max(200, t("question_title_max_length")),
      questionDescription: z.string().min(1, t("question_description_required")).max(2000, t("question_description_max_length")),
      groupSlug: z.string().min(1, t("group_slug_required")),
    });

    try {
      questionFormSchema.parse(formData);
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

  // Handle publish
  const handlePublishQuestion = async () => {
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await postQuestion({
        group_slug: formData.groupSlug,
        title: formData.questionTitle,
        description: formData.questionDescription,
        is_private: false,
      });

      if (isPostQuestionResponseSuccess(response)) {
        toast.success(response.data?.message || "Question Posted Successfully!");
        router.push(`/help-support/support-group/${formData.groupSlug}?lang=${currentLanguageCode}`);
      } else {
        const errorMessage = extractErrorMessage(response);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error posting question:", error);
      toast.error("Something went wrong while posting your question.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title={t("ask_question")}
        breadcrumbs={[
          { label: t("home"), href: `/?lang=${currentLanguageCode}` },
          { label: t("help_support"), href: `/help-support?lang=${currentLanguageCode}` },
          { label: currentSlug, href: `/help-support/support-group/${currentSlug}?lang=${currentLanguageCode}` },
          { label: t("ask_question") },
        ]}
      />

      <div className="sectionBg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-0">
            <CommunitySidebar currentSlug={currentSlug} />

            <div className="flex-grow">
              <div className="p-4 md:p-6 bg-white">
                <div className="mb-4">
                  <Link
                    href={`/help-support/support-group/${currentSlug}?lang=${currentLanguageCode}`}
                    className="flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <BiArrowBack size={24} className="sectionBg p-1 rounded-full mr-3 rtl:rotate-180 rtl:mr-0 rtl:ml-3" />
                    {t("back_to_discussions")}
                  </Link>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="space-y-4 sectionBg p-4 rounded-md">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("title")} <span className="text-red-500">*</span>

                    </label>
                    <input style={{ lineBreak: 'anywhere' }}
                      type="text"
                      id="title"
                      value={formData.questionTitle}
                      onChange={(e) => handleInputChange("questionTitle", e.target.value)}
                      placeholder={t("e_g_how_to_add_videos")}
                      className={`w-full p-3 bg-white border border-gray-300 rounded-md ${errors.questionTitle ? "border-red-500" : ""}`}
                    />
                    {errors.questionTitle && <p className="text-red-500 text-sm mt-1">{errors.questionTitle}</p>}
                  </div>

                  <div style={{ lineBreak: 'anywhere' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discussion_topic")} <span className="text-red-500">*</span>

                    </label>
                    <textarea
                      placeholder={t("e_g_i_dont_understand_your_video_properly")}
                      className={`w-full bg-white rounded-md mt-2 p-3 border border-gray-300  ${errors.questionDescription ? "border-red-500" : ""}`}
                      value={formData.questionDescription}
                      rows={10}
                      onChange={(e) => handleInputChange("questionDescription", e.target.value)} />

                    {errors.questionDescription && <p className="text-red-500 text-sm mt-1">{errors.questionDescription}</p>}
                  </div>

                  <div className="flex justify-end gap-3 mt-4 items-center">
                    <Link href={`/help-support/support-group/${currentSlug}?lang=${currentLanguageCode}`}>
                      <Button
                        variant={"outline"}
                        className="bg-transparen border-0 lg:text-[20px] text-[#010211] shadow-none font-normal">
                        {t("cancel_button")}
                      </Button>
                    </Link>
                    <button
                      onClick={handlePublishQuestion}
                      disabled={isLoading}
                      className="commonBtn flexCenter gap-1">
                      {isLoading ? t("publishing") : t("publish")} <BiSend size={18} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

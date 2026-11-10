"use client";
import React, { useState } from 'react'
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

// Define Zod schema for reply form validation
const replyFormSchema = z.object({
  replyText: z.string()
    .min(1, "Reply message is required")
    .max(1000, "Reply message cannot exceed 1000 characters")
});

// Define a type for form errors
type FormErrors = {
  replyText?: string;
};

interface ReplyFormProps {
  onCancel: () => void;
  onSubmit: (replyText: string) => void;
  isLoading?: boolean; // Add loading state prop
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onCancel, onSubmit, isLoading = false }) => {

  const { t } = useTranslation();
  const [replyText, setReplyText] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // This function validates the form data against the Zod schema and sets error states
  const validateForm = (): boolean => {
    try {
      // Validate form data with Zod schema
      replyFormSchema.parse({ replyText });

      // Clear all errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format for display in UI
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const fieldName = err.path[0] as keyof FormErrors;
            newErrors[fieldName] = err.message;
          }
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors before submitting");
      }
      return false;
    }
  };

  const handleSubmit = () => {
    // Prevent submission if loading
    if (isLoading) {
      return;
    }

    // Validate form data using Zod
    if (!validateForm()) {
      return;
    }

    onSubmit(replyText);
    setReplyText('');
    setErrors({}); // Clear errors after successful submission
  };

  // Handle text change and clear errors when user starts typing
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
    // Clear errors when user starts typing
    if (errors.replyText) {
      setErrors({});
    }
  };

  return (
    <div className="bg-[#F2F5F7] p-4 rounded-xl mb-4">
      <h3 className="font-medium text-base mb-4">{t("reply")}</h3>

      <textarea
        className={`w-full border rounded-md p-4 min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 ${errors.replyText ? 'border-red-500' : 'borderColor'}`}
        placeholder={t("write_reply")}
        value={replyText}
        onChange={handleTextChange}
        disabled={isLoading}
      ></textarea>

      {/* Display validation errors */}
      {errors.replyText && <p className="text-red-500 text-sm mb-4">{errors.replyText}</p>}

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {t("cancel")}
        </button>

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? t("posting") : t("add")}
        </button>
      </div>
    </div>
  )
}

export default ReplyForm 
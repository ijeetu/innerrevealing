"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import { createCouponWithData, CouponCreationFormData } from "@/utils/api/instructor/coupon/createCoupon";
import toast from "react-hot-toast";
import CourseMultiSelect from "./CourseMultiSelect";
import { useTranslation } from "@/hooks/useTranslation";
import { Switch } from "@/components/ui/switch";

// Define a type for form errors
// Maps form field names to error messages
type FormErrors = Record<string, string>;

export default function AddNewCoupon() {

  const { t } = useTranslation();
  const router = useRouter();


  // Zod schema for form validation
  // This schema validates only the fields that are present in the form
  const couponFormSchema = z.object({
    coupon_code: z.string()
      .min(1, t("coupon_code_is_required"))
      .max(50, t("coupon_code_must_be_less_than_50_characters"))
      .regex(/^[A-Z0-9]+$/, t("coupon_code_must_contain_only_uppercase_letters_and_numbers")),
    message: z.string()
      .min(1, t("message_is_required"))
      .max(200, t("message_must_be_less_than_200_characters")),
    start_date: z.string()
      .min(1, t("start_date_is_required")),
    end_date: z.string()
      .min(1, t("end_date_is_required")),
    discount: z.number()
      .min(1, t("discount_must_be_greater_than_0")),
    course_ids: z.array(z.number())
      .min(1, t("please_select_at_least_one_course"))
      .max(50, t("cannot_select_more_than_50_courses")),
    coupon_usage_limit: z.number()
      .min(0, t("coupon_usage_limit_must_be_0_or_greater"))
      .optional(),
    user_usage_limit: z.number().min(0).optional(),
    min_order_amount: z.number().min(0).optional(),
    discount_type: z.enum(["percentage", "amount"], {
      required_error: t("discount_type_is_required"),
    }),
  }).refine((data) => {
    // Ensure start date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.start_date) {
      const startDate = new Date(data.start_date);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= today;
    }
    return true;
  }, {
    message: t("start_date_cannot_be_in_past"),
    path: ["start_date"]
  }).refine((data) => {
    // Ensure end date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.end_date) {
      const endDate = new Date(data.end_date);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= today;
    }
    return true;
  }, {
    message: t("end_date_cannot_be_in_past"),
    path: ["end_date"]
  }).refine((data) => {
    // Validate that end date is after start date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate > startDate;
    }
    return true;
  }, {
    message: t("end_date_must_be_after_start_date"),
    path: ["end_date"]
  }).refine((data) => {
    // Ensure discount does not exceed 100 if type is percentage
    if (data.discount_type === "percentage" && data.discount >= 100) {
      return false;
    }
    return true;
  }, {
    message: t("discount_cannot_exceed_100"),
    path: ["discount"]
  }).refine((data) => {
    if (data.discount_type === "amount" && data.min_order_amount && data.min_order_amount > 0) {
      return data.min_order_amount > data.discount;
    }
    return true;
  }, {
    message: t("minimum_order_amount_must_be_greater_than_discount"),
    path: ["min_order_amount"]
  });

  const todayISO = new Date().toISOString().split("T")[0];

  // Form state - only fields that are in the form
  // Note: We use 'coupon_code' in form but map to 'promo_code' when submitting to API
  const [formData, setFormData] = useState({
    coupon_code: "",
    message: "",
    start_date: "",
    end_date: "",
    discount: 0,
    course_ids: [] as number[],
    coupon_usage_limit: 0,
    user_usage_limit: 0,
    min_order_amount: 0,
    discount_type: "percentage" as "percentage" | "amount"
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCouponLimited, setIsCouponLimited] = useState(false);
  const [isUserLimited, setIsUserLimited] = useState(false);

  // Validate form using Zod
  // This function validates the form data against the Zod schema and sets error states
  const validateForm = () => {
    try {
      // Validate form data with Zod schema
      couponFormSchema.parse(formData);

      // Clear all errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format for display in UI
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0] as string;
            newErrors[fieldName] = err.message;
          }
        });

        setErrors(newErrors);
        // Show the specific error from Zod instead of a generic message
        if (error.errors.length > 0) {
          toast.error(error.errors[0].message);
        } else {
          toast.error(t("please_fill_all_the_required_fields"));
        }
      }
      return false;
    }
  };

  // Handle input changes
  // Handles changes to form fields and clears errors when user starts typing
  const handleInputChange = (field: keyof typeof formData, value: string | number | number[] | "percentage" | "amount") => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field as string]: ""
      }));
    }
  };

  // Handle form submission
  // Maps form data to API format and submits the coupon creation request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using Zod
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const apiFormData: CouponCreationFormData = {
        promo_code: formData.coupon_code.toUpperCase(),
        message: formData.message,
        start_date: formData.start_date,
        end_date: formData.end_date,
        discount: formData.discount,
        course_ids: formData.course_ids,
        discount_type: formData.discount_type,
        ...(isCouponLimited && { total_usage_limit: formData.coupon_usage_limit }),
        ...(isUserLimited && { total_usage_per_user_limit: formData.user_usage_limit }),
        ...(formData.discount_type === "amount" && { minimum_order_amount: formData.min_order_amount }),
      };

      // Call coupon creation API
      const response = await createCouponWithData(apiFormData);

      // Handle null responses (network failure or unexpected issue)
      if (!response) {
        console.log("createCouponWithData returned null", response);
        toast.error(t("something_went_wrong"));
        return;
      }

      // Success state mirrors quiz flow logic
      if (response.success) {
        toast.success(response.message || t("promo_created_success"));
        router.push("/instructor/coupon");
        return;
      }

      // API returned an error: show message and log for debugging
      console.log("Coupon creation failed:", response);
      toast.error(response.error || response.message || t("promo_creation_failed"));
    } catch (error) {
      console.error("Error creating promo code:", error);
      toast.error(t("unexpected_error"));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full">

      <DashboardBreadcrumb title={t("coupon")} firstElement={t("coupon")} firstElementLink="/instructor/coupon" secondElement={t("add_new_coupon")} />

      {/* Main Content */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-6 text-start">{t("add_new_coupon")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1 - Promo Code and Message */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="couponCode" className="block requireField">
                {t("coupon_code")}
              </Label>
              <Input
                id="couponCode"
                placeholder="e.g SAVE5009"
                className={`w-full text-start ${errors.coupon_code ? 'border-red-500' : ''} uppercase`}
                value={formData.coupon_code.toUpperCase()}
                onChange={(e) => handleInputChange('coupon_code', e.target.value.toUpperCase())}
              // required
              />
              {errors.coupon_code && <p className="text-red-500 text-sm">{errors.coupon_code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon_title" className="block requireField">
                {t("coupon_title")}
              </Label>
              <Input
                id="coupon_title"
                placeholder="e.g Get 50% off this course!"
                className={`w-full text-start ${errors.message ? 'border-red-500' : ''}`}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              // required
              />
              {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            </div>
          </div>

          {/* Row 2 - Select Course and Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="selectCourse" className="block requireField">
                {t("select_courses")}
              </Label>
              <CourseMultiSelect
                selectedCourseIds={formData.course_ids}
                onCourseChange={(courseIds) => handleInputChange('course_ids', courseIds)}
                className={errors.course_ids ? 'border-red-500' : ''}
              />
              {errors.course_ids && <p className="text-red-500 text-sm">{errors.course_ids}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="block requireField">
                {t("start_date")}
              </Label>
              <Input
                id="startDate"
                type="date"
                dir="ltr"
                className={`w-full text-right ${errors.start_date ? 'border-red-500' : ''}`}
                min={todayISO}
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              // required
              />
              {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
            </div>
          </div>

          {/* Row 3 - End Date and Discount Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="endDate" className="block requireField">
                {t("end_date")}
              </Label>
              <Input
                id="endDate"
                type="date"
                dir="ltr"
                className={`w-full text-right ${errors.end_date ? 'border-red-500' : ''}`}
                min={todayISO}
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
              // required
              />
              {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountType" className="block requireField">
                {t("select_discount_type")}
              </Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: "percentage" | "amount") => handleInputChange('discount_type', value)}
              >
                <SelectTrigger className={`w-full ${errors.discount_type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={t("select_discount_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">{t("percentage")}</SelectItem>
                  <SelectItem value="amount">{t("fixed")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.discount_type && <p className="text-red-500 text-sm">{errors.discount_type}</p>}
            </div>
          </div>

          {/* Row 4 - Discount and Minimum Order Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="discount" className="block requireField">
                {formData.discount_type === "percentage" ? t("discount_percentage") : t("discount_amount")} {formData.discount_type === "percentage" ? ` (${t("in")} %)` : ""}
              </Label>
              <Input
                id="discount"
                type="number"
                placeholder="e.g 50"
                className={`w-full text-start ${errors.discount ? 'border-red-500' : ''}`}
                value={formData.discount || ''}
                onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
              />
              {errors.discount && <p className="text-red-500 text-sm">{errors.discount}</p>}
            </div>
            {formData.discount_type === "amount" && (
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount" className="block requireField">
                  {t("minimum_order_amount")}
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  placeholder="e.g 500"
                  className={`w-full text-start ${errors.min_order_amount ? 'border-red-500' : ''}`}
                  value={formData.min_order_amount || ''}
                  onChange={(e) => handleInputChange('min_order_amount', parseInt(e.target.value) || 0)}
                />
                {errors.min_order_amount && <p className="text-red-500 text-sm">{errors.min_order_amount}</p>}
              </div>
            )}
          </div>

          {/* Row 5 - Coupon Usage Limit and User-wise Usage Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coupon Usage Limit Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="block">
                  {t("coupon_usage_limit")}
                </Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!isCouponLimited ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {t("unlimited")}
                  </span>
                  <Switch
                    checked={isCouponLimited}
                    onCheckedChange={(checked) => {
                      setIsCouponLimited(checked);
                      if (!checked) handleInputChange('coupon_usage_limit', 0);
                    }}
                  />
                  <span className={`text-sm ${isCouponLimited ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {t("limited")}
                  </span>
                </div>
              </div>
              {isCouponLimited && (
                <Input
                  id="noOfRepeatUsage"
                  type="number"
                  placeholder="e.g 100"
                  className="w-full text-start"
                  value={formData.coupon_usage_limit || ''}
                  onChange={(e) => handleInputChange('coupon_usage_limit', parseInt(e.target.value) || 0)}
                />
              )}
            </div>

            {/* User-wise Usage Limit Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="block">
                  {t("user_usage_limit")}
                </Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!isUserLimited ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {t("unlimited")}
                  </span>
                  <Switch
                    checked={isUserLimited}
                    onCheckedChange={(checked) => {
                      setIsUserLimited(checked);
                      if (!checked) handleInputChange('user_usage_limit', 0);
                    }}
                  />
                  <span className={`text-sm ${isUserLimited ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {t("limited")}
                  </span>
                </div>
              </div>
              {isUserLimited && (
                <Input
                  id="userUsageLimit"
                  type="number"
                  placeholder="e.g 1"
                  className="w-full text-start"
                  value={formData.user_usage_limit || ''}
                  onChange={(e) => handleInputChange('user_usage_limit', parseInt(e.target.value) || 0)}
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-start">
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? t("creating") + "..." : t("add_new_coupon")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

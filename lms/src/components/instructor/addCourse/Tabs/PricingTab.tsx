"use client";
import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCourseTab } from "@/contexts/CourseTabContext";
import { FaAngleRight } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addCourseDataSelector, setCourseDetailsData } from "@/redux/instructorReducers/AddCourseSlice";
import { CourseDetailsDataType } from "@/types/instructorTypes/instructorTypes";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrencySymbol } from "@/utils/helpers";
import { usePathname } from "next/navigation";
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { isRTLSelector } from "@/redux/reducers/languageSlice";

// Define Zod schema for pricing validation
const pricingSchema = z.object({
  isFree: z.boolean(),
  price: z.number().min(0, "Price must be 0 or greater").nullable(),
  discount: z.number().min(0, "Discount must be 0 or greater").nullable(),
}).refine((data) => {
  // If not free, price must be greater than 0
  if (!data.isFree && data.price && data.price <= 0) {
    return false;
  }
  return true;
}, {
  message: "Price must be greater than 0 for paid courses",
  path: ["price"]
}).refine((data) => {
  // Discount cannot be greater than price
  if (!data.isFree && data.discount && data.price && data.discount > data.price) {
    return false;
  }
  return true;
}, {
  message: "Discount cannot be greater than price",
  path: ["discount"]
});

// Define a type for form errors
type FormErrors = Partial<Record<keyof Pick<CourseDetailsDataType, 'price' | 'discount' | 'isFree'>, string>>;

interface PricingTabProps {
  handleCreateCourse: () => void;
  isCourseCreated: boolean;
}

const PricingTab: React.FC<PricingTabProps> = ({ handleCreateCourse, isCourseCreated }) => {

  const { goToPreviousTab } = useCourseTab();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const createCourseData = useSelector(addCourseDataSelector);
  const { courseDetailsData } = createCourseData;

  const pathname = usePathname();
  const isEditCourse = pathname.includes('edit-course');
  const isRTL = useSelector(isRTLSelector);

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [showWarning, setShowWarning] = useState(false);

  // Validate form using Zod
  const validateForm = () => {
    try {
      // Validate form data with Zod schema
      pricingSchema.parse({
        isFree: courseDetailsData.isFree,
        price: courseDetailsData.price,
        discount: courseDetailsData.discount,
      });

      // Clear all errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const fieldName = err.path[0] as keyof FormErrors;
            newErrors[fieldName] = err.message;
          }
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors before continuing");
      }
      return false;
    }
  };

  // Handle price change with validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    dispatch(setCourseDetailsData({ price: value } as unknown as CourseDetailsDataType));

    // Clear error when user types
    if (errors.price) {
      setErrors({ ...errors, price: "" });
    }
  };

  // Handle discount change with validation
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    dispatch(setCourseDetailsData({ discount: value } as unknown as CourseDetailsDataType));

    // Clear error when user types
    if (errors.discount) {
      setErrors({ ...errors, discount: "" });
    }
  };

  // Handle free course toggle with validation
  const handleFreeToggle = (checked: boolean) => {
    dispatch(setCourseDetailsData({ isFree: checked } as unknown as CourseDetailsDataType));

    // Clear errors when toggling
    if (errors.price || errors.discount) {
      setErrors({});
    }
  };

  // Handle continue to next tab
  const handleContinue = () => {
    if (validateForm()) {
      setShowWarning(true);
      handleCreateCourse()
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

      <div className="space-y-3 md:space-y-4 lg:space-y-6 bg-white rounded-lg">
        {/* Heading */}
        <div className="p-3 md:p-4 lg:p-6 lg:pb-0 flex flex-col gap-2">
          <h1 className="text-base md:text-lg lg:text-xl font-medium">{t("pricing")}</h1>

          {showWarning && (
            <div className='border border-[#D8E0E6] flex items-start gap-2 p-2 rounded-[10px] bg-[#F9F9F9]'>
              <HiOutlineInformationCircle className='w-6 h-6 text-red-600 shrink-0' />
              <p className='text-[16px] font-normal text-red-600 break-all'>{t("course_preview_size_is_large_please_wait")}</p>
            </div>
          )}

        </div>
        <hr className="border-gray-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6 px-3 md:px-4 lg:px-6 pb-6">
          {/* Price Input */}
          <div className="space-y-2">
            <Label
              htmlFor="price"
              className="block text-sm md:text-base requireField"
            >
              {t("price")} ({getCurrencySymbol()})
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              placeholder={t("price")}
              disabled={courseDetailsData?.isFree}
              className={`w-full sectionBg text-sm md:text-base ${errors.price ? "border-red-500" : ""}`}
              value={courseDetailsData?.price || ""}
              onChange={handlePriceChange}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}

            {/* Free course toggle */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <Label
                htmlFor="free-course"
                className="text-xs md:text-sm text-muted-foreground"
              >
                {t("click_if_this_course_is_free")}
              </Label>
              <Switch
                id="free-course"
                checked={courseDetailsData?.isFree}
                onCheckedChange={handleFreeToggle}
              />
            </div>
          </div>

          {/* Discount Price Input */}
          <div className="space-y-2">
            <Label
              htmlFor="discountPrice"
              className="flex items-center text-sm md:text-base"
            >
              {t("discount_price")} ({getCurrencySymbol()})
            </Label>
            <Input
              id="discountPrice"
              type="number"
              min={0}
              placeholder={t('discount_price')}
              disabled={courseDetailsData?.isFree}
              className={`w-full sectionBg text-sm md:text-base ${errors.discount ? "border-red-500" : ""}`}
              value={courseDetailsData?.discount || ""}
              onChange={handleDiscountChange}
            />
            {errors.discount && (
              <p className="text-red-500 text-sm mt-1">{errors.discount}</p>
            )}
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {t("by_default_price_is_set_to")} {getCurrencySymbol()}0
            </p>
          </div>
        </div>
      </div>
      {/* Footer Navigation */}
      <div className="flex justify-end items-center gap-4 p-3 sectionBg">
        <Button
          variant="ghost"
          className="w-auto text-sm md:text-base"
          onClick={goToPreviousTab}
        >
          {t("previous")}
        </Button>
        <Button
          disabled={isCourseCreated}
          className="w-auto bg-black text-white hover:bg-black/90 px-4 md:px-6 text-sm md:text-base"
          onClick={handleContinue}
        >
          {t("save_and_continue")}
          <FaAngleRight className={`h-3.5 w-3.5 md:h-4 md:w-4 ms-1.5 md:ms-2 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
      </div>
    </div>
  );
}

export default PricingTab;
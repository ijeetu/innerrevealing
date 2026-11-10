"use client";
import { getFirebaseAuth, FIREBASE_UNAVAILABLE_MESSAGE } from "@/utils/Firebase";

import React, { useState, useMemo, useEffect } from "react";
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
// Import the VerifyEmailModal component
import VerifyEmailModal from "./VerifyEmailModal";
import toast from "react-hot-toast";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getAuthErrorMessage, getDirection } from "@/utils/helpers";
import AuthContinueWithBtn from "@/components/commonComp/AuthContinueWithBtn";
import { setUserName } from "@/redux/reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { FirebaseError } from "firebase/app";
import { useTranslation } from '@/hooks/useTranslation';
import { userSignup, UserSignupParams } from "@/utils/api/auth/user-signup/userSignupApi";
import { userExists } from "@/utils/api/auth/userExists/userExistsApi";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import PhoneInput from "react-phone-input-2";
import VerifyPhoneModal from "../phone/VerifyPhoneModal";
import Link from "next/link";
import { isRTLSelector } from "@/redux/reducers/languageSlice";
import ar from 'react-phone-input-2/lang/ar.json';

const createFormSchema = (
  registerWith: { email: boolean; phone: boolean },
  t: (key: string) => string
) => {
  return z
    .object({
      name: z.string().min(2, { message: t("name_min_length_2") }),
      // Email: always required and must be valid
      email: z.string(),
      // Phone: required only when registering with phone, optional when registering with email
      phone: z.string(),
      // CountryCode: required when registering with phone, optional when registering with email
      countryCode: registerWith.phone
        ? z.string().min(2, { message: t("country_min_length") })
        : z.string(),
      // countryName: z.string().min(2, { message: t("country_min_length") }),
      password: z
        .string()
        .min(8, { message: t("password_min_length_8") })
        .regex(/(?=.*[A-Z])/, { message: t("password_uppercase_required") })
        .regex(/(?=.*\d)/, { message: t("password_number_required") })
        .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, { message: t("password_special_char_required") }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwords_dont_match"),
      path: ["confirmPassword"],
    })
    // 1. Required check — only when registering with email
    .refine(
      (data) => {
        if (registerWith.email) {
          return !!(data.email && data.email.trim() !== "");
        }
        return true;
      },
      {
        message: t("email_required"), // shown when field is empty
        path: ["email"],
      }
    )
    // 2. Format check — when registering with email OR email is partially typed
    .refine(
      (data) => {
        // Skip format check if field is empty (required check handles that)
        if (!data.email || data.email.trim() === "") return true;
        return z.string().email().safeParse(data.email).success;
      },
      {
        message: t("email_invalid"), // shown when field has value but invalid format
        path: ["email"],
      }
    )
    .refine(
      (data) => {
        const actualNumber = data.phone
          ? data.phone.replace(data.countryCode, "").trim()
          : "";
        if (registerWith.phone) {
          return actualNumber !== "";
        }
        return true;
      },
      {
        message: t("mobile_number_required"),
        path: ["phone"],
      }
    );
};

interface RegisterModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  registerWith: {
    email: boolean;
    phone: boolean;
  };
  handleEmailClick: () => void;
  handlePhoneClick: () => void;
  onSignInClick: () => void;
  handleRegisterClick?: (modal: string) => void;
  handleMobileSignInClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onOpenChange,
  registerWith,
  handleEmailClick,
  handlePhoneClick,
  onSignInClick,
  handleRegisterClick,
  handleMobileSignInClick
}) => {

  const settingsData = useSelector(settingsSelector);
  const companyName = settingsData?.data?.app_name;
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Add state for the VerifyEmailModal visibility
  const [isVerifyEmailModalOpen, setIsVerifyEmailModalOpen] = useState(false);
  const [isVerifyPhoneModalOpen, setIsVerifyPhoneModalOpen] = useState(false);

  const dispatch = useDispatch();

  const isRTL = useSelector(isRTLSelector);

  const formSchema = useMemo(() => createFormSchema(registerWith, t), [registerWith, t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      countryCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  const auth = getFirebaseAuth()

  // Reset form and clear errors when modal is closed
  // This ensures that when the modal is reopened, there are no lingering validation errors
  useEffect(() => {
    if (!isOpen && !isVerifyPhoneModalOpen && !isVerifyEmailModalOpen) {
      // Reset form to default values and clear all errors
      form.reset({
        name: "",
        email: "",
        phone: "",
        countryCode: "",
        // countryName: "",
        password: "",
        confirmPassword: "",
      });
      // Clear all form errors
      form.clearErrors();
    }
  }, [isOpen, form, isVerifyPhoneModalOpen, isVerifyEmailModalOpen]);

  const handlePhoneNumber = (value: string,
    country: { dialCode: string; name: string; countryCode: string }) => {
    form.setValue("phone", value || "");
    form.setValue("countryCode", country.dialCode || "");
    // form.setValue("countryName", country.name || "");
  }

  const handleSetPhoneNumber = (phoneNumber: string, countryCode: string) => {
    form.setValue("phone", phoneNumber || "");
    form.setValue("countryCode", countryCode || "");
  };

  const handlePhoneChange = () => {
    setIsVerifyPhoneModalOpen(false);
    onOpenChange(true);
  };

  const mobileNumber = form.getValues().phone.replace(form.getValues().countryCode, '');

  const registerUser = async (userId: string, displayName: string, email: string, type: string, profile: string, idToken: string, password: string): Promise<boolean> => {
    try {
      const signupData: UserSignupParams = {
        name: displayName || form.getValues().name || '',
        country_calling_code: form.getValues().countryCode || '',
        mobile: mobileNumber || "",
        profile: profile as unknown as File,
        email: email,
        fcm_id: settingsData?.fcmtoken,
        firebase_id: userId,
        firebase_token: idToken,
        type: type,
        password: password,
        confirm_password: password,
      };

      const response = await userSignup(signupData);

      if (response) {
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to register user");
          return false;
        }
        return true;
      } else {
        console.log("response is null in component", response);
        toast.error("Failed to register user. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error(t("an_unexpected_error_occurred_during_registration"));
      return false;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    dispatch(setUserName(form.getValues().name))
    if (registerWith.email) {
      const email = form.getValues().email || "";

      const existsResult = await userExists({ email });
      if (!existsResult.success) {
        toast.error(existsResult.message || t("something_went_wrong"));
        return;
      }
      if (!existsResult.data?.data?.is_new_user) {
        toast.error(t("user_already_exists"));
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, values.password)
        const user = userCredential.user
        const idToken = await user.getIdToken();
        await sendEmailVerification(user)
        const success = await registerUser(user?.uid, user?.displayName || '', email, 'email', user?.photoURL || '', idToken, values?.password)
        if (!success) return;
        setIsVerifyEmailModalOpen(true);
        onOpenChange(false);
        form.reset();
      } catch (error) {
        handleError(error as FirebaseError)
      }
    }
    else {
      const mobile = form.getValues().phone.replace(form.getValues().countryCode, '');
      const countryCode = form.getValues().countryCode;

      const existsResult = await userExists({ mobile, country_calling_code: countryCode });
      if (!existsResult.success) {
        toast.error(existsResult.message || t("something_went_wrong"));
        return;
      }
      if (!existsResult.data?.data?.is_new_user) {
        toast.error(t("user_already_exists"));
        return;
      }

      setIsVerifyPhoneModalOpen(true);
      onOpenChange(false);
    }
  }

  const handleError = (error: FirebaseError) => {
    console.log(error);
    const errorCode = error.code;
    const errorMessage = getAuthErrorMessage(errorCode);
    toast.error(errorMessage);
  }

  const handleModalClose = () => {
    form.reset();
    onOpenChange(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-h-[calc(100vh-10px)] sm:max-w-[572px] p-0 bg-white rounded-2xl shadow-xl overflow-y-auto customScrollbar"
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
        >

          <DialogHeader className="px-3 pt-10 pb-4 sm:p-6 lg:pb-0! gap-1">
            <DialogTitle className="max-[368px]:text-[18px] text-start text-xl font-semibold text-gray-900">
              {t("sign_up_with")} {" "} {registerWith.email ? t("email") : t("phone_number")}
            </DialogTitle>
            <DialogDescription className="text-start text-sm text-gray-500 ">
              {t("create_acc_using")} {" "} {registerWith.email ? t("email_address") : <span className="lowercase">{t("mobile_number")}</span>}
            </DialogDescription>
          </DialogHeader>

          {/* divider */}
          <hr className=" border-gray-200" />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 px-3 sm:px-6"
            >
              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="gap-1">
                    <FormLabel className="text-sm sm:text-base font-medium text-gray-700 requireField block">
                      {t("name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("john")}
                        {...field}
                        className="w-full px-4 py-2.5 h-12 border border-gray-300 rounded-md bg-[#F8F8F9]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className={`flex ${registerWith.email ? 'flex-col' : 'flex-col-reverse'} gap-3`}>
                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className={`text-sm sm:text-base font-medium text-gray-700 block ${registerWith.email ? 'requireField' : ''}`}>
                        {t("email")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@gmail.com"
                          {...field}
                          className="w-full px-4 py-2.5 h-12 border border-gray-300 rounded-md bg-[#F8F8F9]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone field */}
                {/* Phone is required when registering with phone, optional when registering with email */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className={`text-sm sm:text-base font-medium text-gray-700 block ${registerWith.phone ? 'requireField' : ''}`}>
                        {t("phone_number")}
                      </FormLabel>
                      <FormControl>
                        <div className={isRTL ? "rtl-phone-input" : ""}>
                          <PhoneInput
                            inputStyle={{ direction: getDirection() as "ltr" | "rtl" }}
                            country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || "in"}
                            value={field.value || ""}
                            onChange={handlePhoneNumber}
                            // enableLongNumbers={true}
                            inputProps={{
                              name: "phone",
                              id: "phone",
                              required: registerWith.phone,
                              className: `w-full pl-10 px-4 py-2.5 h-12 border border-gray-300 rounded-md phone-input-custom ${isRTL ? "pr-14 pl-2 text-right" : "pl-12"}`,
                            }}
                            placeholder="1234567890"
                            localization={isRTL ? ar : undefined}
                          />
                        </div>

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="gap-1">
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
                  <FormItem className="gap-1">
                    <FormLabel className="text-sm sm:text-base font-medium text-gray-700 requireField block">
                      {t("confirm_password")}
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
                          className={`${getDirection() === "rtl" ? "left-3" : "right-3"} absolute  top-1/2 transform -translate-y-1/2`}
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

              <Button
                type="submit"
                className="w-full primaryBg text-white font-normal py-2.5 h-11 rounded-md hover:hoverBgColor transition-all duration-300 md:text-xl"
              >
                {t("sign_up")}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {t("already_have_account")}
                </span>{" "}
                <button
                  type="button"
                  className="text-sm primaryColor font-medium"
                  onClick={registerWith.email ? onSignInClick : handleMobileSignInClick}
                >
                  {t("sign_in")}
                </button>
              </div>
            </form>
          </Form>
          <hr className="borderColor mt-2" />

          <div className="px-6 pb-6 text-center flex flex-col gap-1 font-semibold text-sm sm:text-base">
            <p className="font-normal! text-sm">
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

      {/* Email Verification Modal */}
      <VerifyEmailModal
        isOpen={isVerifyEmailModalOpen}
        onOpenChange={setIsVerifyEmailModalOpen}
        email={form.getValues().email || ""}
        handlePhoneClick={handlePhoneClick}
        handleRegisterClick={handleRegisterClick}
      />

      {/* Phone Verification Modal */}
      <VerifyPhoneModal
        isOpen={isVerifyPhoneModalOpen}
        onOpenChange={setIsVerifyPhoneModalOpen}
        formValues={{
          phoneNumber: mobileNumber || "",
          email: form.getValues().email || "",
          countryCode: form.getValues().countryCode,
          // countryName: form.getValues().countryName,
          password: form.getValues().password,
          confirmPassword: form.getValues().confirmPassword,
        }}
        handlePhoneClick={handlePhoneClick}
        handleEmailClick={handleEmailClick}
        handlePhoneChange={handlePhoneChange}
        setPhoneNumber={handleSetPhoneNumber}
      />
    </>
  );
};

export default RegisterModal;

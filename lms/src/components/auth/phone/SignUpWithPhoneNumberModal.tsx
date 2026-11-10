"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./phone-input.css";
import SignInWithEmailModal from "../email/SignInWithEmailModal";
import ForgotPasswordWithPhoneModal from "./ForgotPasswordWithPhoneModal";
import AuthContinueWithBtn from "@/components/commonComp/AuthContinueWithBtn";
import { useDispatch, useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { setToken } from "@/redux/reducers/userSlice";
import toast from "react-hot-toast";
import { mobileLogin } from "@/utils/api/auth/mobile-login/mobileLogin";
import {
  isMobileLoginResponseSuccess,
  extractUserLoginData,
  extractErrorMessage,
  validateMobileLoginData
} from "@/utils/api/auth/mobile-login/mobileLoginHelpers";
import { useTranslation } from "@/hooks/useTranslation";
import { getDirection } from '@/utils/helpers';
import { isRTLSelector } from '@/redux/reducers/languageSlice';
import ar from 'react-phone-input-2/lang/ar.json';

// Define the form schema using Zod

interface SignUpWithPhoneNumberModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  phoneNumber: string;
  countryCode: string;
  handlePhoneClick: () => void;
  handleEmailClick: () => void;
  setPhoneNumber: (phoneNumber: string, countryCode: string) => void;
  handleRegisterClick?: (modal: string) => void;
}

const SignUpWithPhoneNumberModal: React.FC<SignUpWithPhoneNumberModalProps> = ({
  isOpen,
  onOpenChange,
  phoneNumber,
  countryCode,
  handlePhoneClick,
  handleEmailClick,
  setPhoneNumber,
  handleRegisterClick
}) => {

  const [showPassword, setShowPassword] = useState(false);

  const [mobileNum, setMobileNum] = useState<{
    phone: string;
    number: string;
    countryCode: string;
  }>({
    phone: phoneNumber,
    number: phoneNumber.replace(countryCode, ""),
    countryCode: countryCode,
  });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const { t } = useTranslation();

  const settingsData = useSelector(settingsSelector);
  const dispatch = useDispatch();

  const formSchema = z.object({
    mobile: z.string().min(1, { message: t('mobile_number_required') }),
    password: z
      .string()
      .min(1, { message: t('password_required') }),
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });


  const isRTL = useSelector(isRTLSelector);

  useEffect(() => {
    setMobileNum({
      phone: phoneNumber,
      number: phoneNumber.replace(countryCode, ""),
      countryCode: countryCode,
    });
  }, [phoneNumber, countryCode]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setShowPassword(false);
      setMobileNum({
        phone: "",
        number: "",
        countryCode: "",
      });
    }
  }, [isOpen, form]);

  const handleMobileLogin = async () => {
    try {
      const loginData = {
        country_calling_code: `+${mobileNum.countryCode}`,
        mobile: mobileNum.number,
        password: form.getValues().password,
        fcm_id: settingsData?.fcmtoken
      };

      // Validate login data before sending
      const validation = validateMobileLoginData(loginData);
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        return;
      }

      // Call the mobile login function
      const response = await mobileLogin(loginData);

      // Check if login was successful
      if (isMobileLoginResponseSuccess(response)) {
        const userData = extractUserLoginData(response);

        if (userData) {
          // Store token in Redux

          // Show success message
          toast.success(response.message || t('login_successful'));

          // Reset form and close modal
          setPhoneNumber('', '');
          form.reset();
          onOpenChange(false);
          dispatch(setToken(userData.token || ''));
        } else {
          toast.error(t('login_successful_but_no_user_data_received'));
        }
      } else {
        // Handle login failure
        const errorMessage = extractErrorMessage(response);
        toast.error(errorMessage);
        console.error('Login error:', response);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Mobile login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handlePhoneChange = (value: string,
    country: { dialCode: string; name: string; countryCode: string }) => {

    // Remove the country code from the value to get just the phone number
    let phoneNumberWithoutCode = value;
    if (country.dialCode && value.startsWith(country.dialCode)) {
      phoneNumberWithoutCode = value.slice(country.dialCode.length);
    }

    setMobileNum({
      phone: value,
      number: phoneNumberWithoutCode || "",
      countryCode: country.dialCode || "",
    });
    form.setValue("mobile", phoneNumberWithoutCode, {
      shouldValidate: true
    });
  }

  const handleForgotPasswordClick = () => {
    setIsForgotPasswordOpen(true);
    onOpenChange(false);
  };

  const handleModalClose = () => {
    form.reset();
    setShowPassword(false)
    setMobileNum({
      phone: "",
      number: "",
      countryCode: "",
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <>

      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[450px] p-0 bg-white rounded-2xl shadow-xl"
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogTitle className="sr-only">{t("sign_up_with_phone_number")}</DialogTitle>

          <div className="p-4 pt-10 pb-0! flex justify-between items-center sm:pt-4">
            <div className="w-full">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("sign_in_with_phone_number")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("sign_in_using_your_registered_phone_number_and_password_to_access_your_account")}
              </p>
            </div>
          </div>
          {/* divider */}
          <hr className="border-gray-200" />

          <div className="px-4 space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => handleMobileLogin())} className="space-y-4">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium text-gray-700 requireField block">
                        {t("phone_number")}
                      </FormLabel>
                      <div className={isRTL ? "rtl-phone-input flex" : "flex"}>
                        <PhoneInput
                          // enableLongNumbers={true}
                          inputStyle={{ direction: getDirection() as "ltr" | "rtl" }}
                          country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || "in"}
                          value={mobileNum.phone}
                          onChange={(value, country) => {
                            handlePhoneChange(value, country as any);
                          }}
                          enableSearch={true}
                          disableCountryCode={false}
                          countryCodeEditable={true}
                          localization={isRTL ? ar : undefined}
                          inputProps={{
                            name: "contactNumber",
                            id: "contactNumber",
                            className: `w-full border border-gray-300 rounded-md phone-input-custom ${isRTL ? "pr-14 pl-2 text-right" : "pl-12"} focus:outline-transparent visible-outline bg-[#F8F8F9]`,
                          }}
                          placeholder="1234567890"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Password field */}
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
                            className={`absolute top-1/2 transform -translate-y-1/2 ${getDirection() === "rtl" ? "left-3" : "right-3"}`}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Eye className={`h-5 w-5 text-gray-400`} />
                            ) : (
                              <EyeOff className={`h-5 w-5 text-gray-400`} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end mt-1">
                  <button
                    onClick={() => handleForgotPasswordClick()}
                    className="text-sm primaryColor font-medium"
                  >
                    {t("forgot_password")}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full primaryBg text-white font-normal py-2.5 h-12 rounded-md hover:hoverBgColor transition-all duration-300 md:text-xl"
                >
                  {t("continue")}
                </Button>

                <div className="flexCenter gap-1 ">
                  {t('don_t_have_an_account')} <span className="primaryColor font-semibold cursor-pointer" onClick={() => handleRegisterClick?.("phone")}> {t('register_now')}</span>
                </div>

              </form>
            </Form>


            <AuthContinueWithBtn onOpenChange={onOpenChange} handlePhoneClick={handlePhoneClick} isMobileModal={true} handleEmailClick={handleEmailClick} />

          </div>
        </DialogContent>
      </Dialog>

      <SignInWithEmailModal
        isOpen={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        handlePhoneClick={handlePhoneClick}
        handleRegisterClick={handleRegisterClick}
      />

      <ForgotPasswordWithPhoneModal
        isOpen={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        setSignInOpen={onOpenChange}
      />
    </>
  );
};

export default SignUpWithPhoneNumberModal;

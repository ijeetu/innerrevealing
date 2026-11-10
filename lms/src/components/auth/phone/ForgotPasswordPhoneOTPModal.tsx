"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { FirebaseError } from "firebase/app";
import FirebaseData, { FIREBASE_UNAVAILABLE_MESSAGE } from "@/utils/Firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import ChangePasswordModal from "./ChangePasswordModal";
import { useTranslation } from '@/hooks/useTranslation';
import { getAuthErrorMessage } from "@/utils/helpers";


interface ForgotPasswordPhoneOTPModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  phoneNumber: string;
  countryCode: string;
  changePhoneNumber: (isOpen: boolean) => void;
}

const ForgotPasswordPhoneOTPModal: React.FC<
  ForgotPasswordPhoneOTPModalProps
> = ({ isOpen, onOpenChange, phoneNumber, changePhoneNumber }) => {
  const { t } = useTranslation();
  // State for OTP inputs
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [timeLeft, setTimeLeft] = useState(56); // 00:56 in seconds

  const [token, setToken] = useState<string>('')
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isOpen]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(0, 1); // Take only the first character
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted content is all numbers and has a valid length
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.substring(0, 6).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = digit;
        }
      }
    });

    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    if (nextEmptyIndex < 6) {
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  // const handleVerify = () => {
  //   const otpValue = otp.join("");
  //   console.log("Verifying OTP:", otpValue);
  //   // Open the reset password modal and close this one
  //   onOpenChange(false);
  // };

  const handleVerify = () => {
    submitOTP({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>)
    // On successful verification, open the sign up modal
    // setIsSignUpModalOpen(true);
    onOpenChange(false);
  };

  // const handleResendCode = () => {
  //   console.log("Resending verification code to:", phoneNumber);
  //   if (phoneNumber !== null) {
  //     generateOTP(phoneNumber)
  //     // setResendTimer(60);
  //   }
  //   // Reset OTP fields
  //   setOtp(Array(6).fill(""));
  //   // Focus the first input
  //   inputRefs.current[0]?.focus();
  // };

  const { authentication } = FirebaseData()


  const generateRecaptcha = () => {
    if (!authentication) return;
    if (typeof window !== 'undefined') {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(authentication, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('recaptcha resolved..')
          }
        });
      }
    }
  }

  const generateOTP = async (phonenum: string) => {
    if (!authentication) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    if ((window as any).isGeneratingOTP) return;
    (window as any).isGeneratingOTP = true;
    console.log('generateOTP', phonenum)
    try {
      // OTP Generation
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier as RecaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(authentication, '+' + phonenum, appVerifier);
      window.confirmationResult = confirmationResult;
      toast.success(`${t("otp_sent_to")} +${phonenum}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorCode = error.code || 'unknown-error';
      const errorMessage = getAuthErrorMessage(errorCode);
      toast.error(errorMessage || "Unknown authentication error (" + errorCode + ")");
    } finally {
      (window as any).isGeneratingOTP = false;
    }
  }


  useEffect(() => {
    if (isOpen && phoneNumber !== null) {
      generateOTP(phoneNumber)
    }
    // eslint-disable-next-line
  }, [isOpen, phoneNumber])

  const recaptchaClear = async () => {
    // Left empty: ReCaptcha should persist per-session to prevent initialization glitches
  }

  // Handle OTP verification error codes with appropriate error messages
  const handleAuthenticationError = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/missing-verification-code':
        toast.error(t("missing_verification_code_please_enter_the_code"))
        break

      case 'auth/code-expired':
        toast.error(t("verification_code_expired"))
        break

      case 'auth/invalid-verification-code':
        toast.error(t("invalid_verification_code"))
        break

      case 'auth/invalid-verification-id':
        toast.error(t("invalid_verification_id"))
        break

      case 'auth/session-expired':
        toast.error(t("the_session_has_expired_please_sign_in_again"))
        break

      case 'auth/quota-exceeded':
        toast.error(t("quota_exceeded_error"))
        break

      default:
        toast.error(t("an_unknown_authentication_error_occurred"))
        break
    }
  }

  const submitOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const confirmationResult = window.confirmationResult

    if (!confirmationResult) {
      console.error("No confirmationResult found!");
      toast.error("Process expired or invalid state. Please resend the code.");
      return;
    }

    try {
      const response = await confirmationResult.confirm(otp.join(""))
      const idToken = await response.user.getIdToken(); // 👈 fetch idToken
      recaptchaClear()
      if (response.user.phoneNumber) {
        // resetPasswordApi(idToken)
        setToken(idToken)
        setChangePasswordModalOpen(true)
        onOpenChange(false)
      }
    } catch (error: any) {
      console.error("OTP verification failed", error);
      handleAuthenticationError(error.code || 'auth/unknown-error')
    }
  }


  const handlePhoneChange = () => {
    changePhoneNumber(true);
    onOpenChange(false);
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    if (timeLeft > 0) return;

    // Simulate API call for resending OTP

    setTimeLeft(56); // Reset timer to 56 seconds
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] p-0 bg-white rounded-2xl shadow-xl">
          <DialogHeader className="px-3 py-4 sm:p-6 !pb-0 gap-1">
            <DialogTitle className="text-start text-xl font-semibold text-gray-900">
              {t("forgot_your_password")}
            </DialogTitle>
            <DialogDescription className="text-start text-sm text-gray-500">
              {t("forgot_password_we_ll_help_you_reset_it")}
            </DialogDescription>
          </DialogHeader>

          {/* divider */}
          <hr className="border-gray-200 -mt-4" />

          {/* Phone number display */}
          <div className="px-3 sm:px-6 flex flex-col gap-1">
            <span className="text-sm text-gray-500">{t("we_have_sent_a_verification_code_to")}</span>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">+{phoneNumber}</span>
              <button
                className="text-sm primaryColor font-medium"
                onClick={handlePhoneChange}
              >
                {t("change")}
              </button>
            </div>
          </div>

          {/* OTP Input */}
          <div className="px-3 sm:px-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("enter_verification_code")}
            </label>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-md bg-[#F8F8F9]"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <div className="px-3 sm:px-6">
            <Button
              onClick={handleVerify}
              className="w-full primaryBg text-white font-normal py-2.5 h-12 rounded-md hover:hoverBgColor transition-all duration-300 md:text-xl"
              disabled={otp.join("").length !== 6}
            >
              {t("continue")}
            </Button>
            {/* Resend Code */}
            <div className="text-center my-4 ">
              <button
                onClick={handleResendOTP}
                disabled={timeLeft > 0}
                className="text-gray-600"
              >
                {timeLeft > 0
                  ? <span> {t("resend_otp_in")}: <span className="font-semibold">{formatTime(timeLeft)}</span></span>
                  : <span>{t("resend_otp")}</span>}
              </button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onOpenChange={setChangePasswordModalOpen}
        token={token}
      />

    </>
  );
};

export default ForgotPasswordPhoneOTPModal;

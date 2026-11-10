"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from '@/hooks/useTranslation';

interface ForgotPasswordOTPModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  email: string;
}

const ForgotPasswordOTPModal: React.FC<ForgotPasswordOTPModalProps> = ({
  isOpen,
  onOpenChange,
  email,
}) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(56); // 00:56 in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { t } = useTranslation();


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

  // Focus first input on open
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value === "" || /^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if value is entered
      if (value !== "" && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle key down event for backspace to move to previous input
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste functionality
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d+$/.test(pastedData) && pastedData.length <= otp.length) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < otp.length) {
          newOtp[i] = pastedData[i];
        }
      }
      setOtp(newOtp);

      // Focus the next empty input or the last one if all filled
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
      if (nextEmptyIndex >= 0) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[otp.length - 1]?.focus();
      }
    }
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    if (timeLeft > 0) return;

    // Simulate API call for resending OTP
    console.log("Resending OTP to:", email);
    setTimeLeft(56); // Reset timer to 56 seconds
  };

  // Handle verify OTP
  const handleVerifyOTP = () => {
    const otpValue = otp.join("");
    console.log("Verifying OTP:", otpValue);

    // Simulate verification
    // In a real app, you would call an API to verify the OTP
    if (otpValue.length === otp.length) {
      onOpenChange(false); // Close the modal after successful verification
    }
  };

  // Handle changing email
  const handleChangeEmail = () => {
    onOpenChange(false); // Close the OTP modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 bg-white rounded-2xl shadow-xl"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogTitle className="sr-only">{t("verify_OTP")}</DialogTitle>

        <div className="p-4 !pb-0 flex justify-between items-center">
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("forgot_your_password")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("forgot_password_we_ll_help_you_reset_it")}
            </p>
          </div>
        </div>

        {/* divider */}
        <hr className=" border-gray-200" />

        <div className="px-4 ">
          <p className="text-sm text-gray-600">
            {t("we_have_sent_a_verification_code_to")}
          </p>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">{email}</span>
            <button
              onClick={handleChangeEmail}
              className="text-sm primaryColor font-medium"
            >
              {t("change")}
            </button>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="flex gap-2 justify-between mb-5">
            {otp.map((digit, index) => (
              <div key={index} className="w-full">
                <Input
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="h-[46px] text-center border-[1px] border-gray-300 rounded-sm bg-[#F8F8F9]"
                  style={{ width: "100%", maxWidth: "50px" }}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleVerifyOTP}
            className="w-full primaryBg text-white font-normal py-2.5 h-12 rounded-md hover:hoverBgColor transition-all duration-300 md:text-xl"
            disabled={otp.some((digit) => digit === "")}
          >
            {t("continue")}
          </Button>

          <div className="text-center mt-3">
            <button
              onClick={handleResendOTP}
              disabled={timeLeft > 0}
              className="text-sm primaryColor font-medium"
            >
              {timeLeft > 0
                ? `Resend OTP In: ${formatTime(timeLeft)}`
                : "Resend OTP"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordOTPModal;

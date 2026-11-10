"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import mailVerificationSvg from "@/assets/images/mail-verification.svg";
import SignInWithEmailModal from "./SignInWithEmailModal";
import { useTranslation } from '@/hooks/useTranslation';

interface VerifyEmailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  email: string;
  handlePhoneClick: () => void;
  handleRegisterClick?: (modal: string) => void;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({
  isOpen,
  onOpenChange,
  email,
  handlePhoneClick,
  handleRegisterClick
}) => {
  const { t } = useTranslation();
  const [isVerified, setIsVerified] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // Simulating verification success on component mount
  React.useEffect(() => {
    // This simulates email verification success
    // In a real app, you would check if the email was verified
    if (isOpen && !isVerified) {
      const timer = setTimeout(() => {
        setIsVerified(true);
        setIsSignInOpen(true);
        onOpenChange(false); // Close the verification modal
      }, 2000); // Simulating a delay

      return () => clearTimeout(timer);
    }
  }, [isOpen, isVerified, onOpenChange]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] p-0 bg-white rounded-2xl shadow-xl">
          {/* DialogTitle for accessibility */}
          <DialogTitle className="sr-only">{t("verify_your_email")}</DialogTitle>

          {/* divider */}
          <hr className=" border-gray-200" />

          <div className="px-3 pt-10 pb-4 sm:p-6 flex flex-col items-center text-center">
            {/* SVG image */}
            <div className="w-[300px] h-[195px] relative my-4">
              <Image
                src={mailVerificationSvg}
                alt="Email Verification"
                fill
                sizes="300px"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            {/* Title and description - exactly as in the reference image */}
            <h2 className="text-xl font-semibold text-center">
              {t("verify_your_email")}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t("click_email_verify_account")}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign In with Email Modal */}
      <SignInWithEmailModal
        isOpen={isSignInOpen}
        onOpenChange={setIsSignInOpen}
        email={email}
        handlePhoneClick={handlePhoneClick}
        handleRegisterClick={handleRegisterClick}
      />
    </>
  );
};

export default VerifyEmailModal;

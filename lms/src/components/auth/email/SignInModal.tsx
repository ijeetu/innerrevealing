"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import RegisterModal from "./RegisterModal";
import SignInWithEmailModal from "./SignInWithEmailModal";
import SignUpWithPhoneNumberModal from "../phone/SignUpWithPhoneNumberModal";
import { useTranslation } from '@/hooks/useTranslation';
import { useDispatch } from "react-redux";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import RegistrationOptionsModal from "../RegistrationOptionsModal";


// Define the form schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

interface SignInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  setIsRegisterOptionModalOpen: (isOpen: boolean) => void;
  isRegisterOptionModalOpen: boolean;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onOpenChange, setIsRegisterOptionModalOpen, isRegisterOptionModalOpen }) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerWith, setRegisterWith] = useState({
    email: false,
    phone: false,
  });

  const [isSignUpWithPhoneNumberOpen, setIsSignUpWithPhoneNumberOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState({
    number: "",
    countryCode: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle toggling between sign-in and register modals
  const handleSignInClick = () => {
    setIsRegisterModalOpen(false);
    onOpenChange(true);
  };

  const handleMobileSignInClick = () => {
    setIsSignUpWithPhoneNumberOpen(true)
    setIsRegisterModalOpen(false)
    onOpenChange(false)
  }



  // Handle opening phone modal
  const handlePhoneClick = () => {
    setIsSignUpWithPhoneNumberOpen(true);
    onOpenChange(false);
  };

  // Handle opening email modal
  const handleEmailClick = () => {
    onOpenChange(true);
    setIsSignUpWithPhoneNumberOpen(false);
  };

  const handleRegisterClick = (modal: string) => {
    setRegisterWith({
      email: modal === 'email' ? true : false,
      phone: modal === 'phone' ? true : false,
    });
    setIsRegisterModalOpen(true);
    setIsSignUpWithPhoneNumberOpen(false);
    onOpenChange(false);
  };



  const handleResetMainModal = () => {
    form.reset();
  }

  useEffect(() => {
    if (!isOpen) {
      dispatch(setIsLoginModalOpen(false));
    }
  }, [isOpen]);


  return (
    <>
      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        registerWith={registerWith}
        onSignInClick={handleSignInClick}
        handleEmailClick={handleEmailClick}
        handlePhoneClick={handlePhoneClick}
        handleRegisterClick={handleRegisterClick}
        handleMobileSignInClick={handleMobileSignInClick}
      />

      <RegistrationOptionsModal
        isOpen={isRegisterOptionModalOpen}
        onOpenChange={setIsRegisterOptionModalOpen}
        handleRegisterClick={(modal: string) => handleRegisterClick(modal)}
        onSignInClick={handleSignInClick}
      />

      <SignInWithEmailModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        email={form.getValues().email}
        handlePhoneClick={handlePhoneClick}
        handleResetMainModal={handleResetMainModal}
        handleRegisterClick={handleRegisterClick}
      />

      {/* SignUpWithPhoneNumberModal */}
      <SignUpWithPhoneNumberModal
        isOpen={isSignUpWithPhoneNumberOpen}
        onOpenChange={setIsSignUpWithPhoneNumberOpen}
        phoneNumber={phoneNumber.number}
        countryCode={phoneNumber.countryCode}
        setPhoneNumber={(num, code) => setPhoneNumber({ number: num, countryCode: code })}
        handlePhoneClick={handlePhoneClick}
        handleEmailClick={handleEmailClick}
        handleRegisterClick={handleRegisterClick}
      />
    </>
  );
};

export default SignInModal;

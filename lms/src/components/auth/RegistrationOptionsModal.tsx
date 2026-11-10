"use client";
import { getFirebaseAuth, FIREBASE_UNAVAILABLE_MESSAGE } from "@/utils/Firebase";
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { PiEnvelopeSimpleBold } from "react-icons/pi";
import { Smartphone } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { userSignup, UserSignupParams } from '@/utils/api/auth/user-signup/userSignupApi';
import { setToken, setFirebaseToken } from '@/redux/reducers/userSlice';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import toast from 'react-hot-toast';

interface RegistrationOptionsModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    handleRegisterClick?: (modal: string) => void;
    onSignInClick?: () => void;
}

export default function RegistrationOptionsModal({
    isOpen,
    onOpenChange,
    handleRegisterClick,
    onSignInClick
}: RegistrationOptionsModalProps) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const settingsData = useSelector(settingsSelector);
    const companyName = settingsData?.data?.app_name;
    const auth = getFirebaseAuth();

    const registerUser = async (userId: string, displayName: string, email: string, type: string, profile: string, idToken: string) => {
        try {
            const signupData: UserSignupParams = {
                name: displayName,
                email: email,
                fcm_id: settingsData?.fcmtoken,
                firebase_id: userId,
                firebase_token: idToken,
                type: type,
            };

            const response = await userSignup(signupData);

            if (response) {
                if (response.error) {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to register user");
                } else if (response.data) {
                    toast.success(response.message || 'Registration successful!');
                    if (response.data.token) {
                        dispatch(setToken(response.data.token));
                    }
                    onOpenChange(false);
                }
            } else {
                toast.error("Failed to register user. Please try again.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            toast.error(t("an_unexpected_error_occurred_during_registration"));
        }
    };

    const signInWithGoogle = async () => {
        if (!auth) {
            toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
            return;
        }
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider)
            .then(async response => {
                onOpenChange(false);
                const idToken = await response?.user?.getIdToken();
                dispatch(setFirebaseToken(idToken || ''));
                await registerUser(response?.user?.uid, response?.user?.displayName || '', response?.user?.email || '', 'google', response?.user?.photoURL || '', idToken || '');
            })
            .catch(err => {
                console.log(err.message);
            });
    };

    const handleRegisterModalClick = (modal: string) => {
        handleRegisterClick?.(modal);

        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[530px] p-0 bg-white rounded-2xl shadow-xl overflow-hidden gap-0 max-h-[calc(100vh-220px)] overflow-y-auto customScrollbar"
                onInteractOutside={(e) => {
                    e.preventDefault()
                }}
            >
                <DialogHeader className="px-6 py-4 border-b border-[#D8E0E6]">
                    <DialogTitle className="text-xl font-bold text-gray-900 ltr:text-left rtl:text-right">
                        {t("registration_options")}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-[16px] font-semibold text-[#010211]">
                            {t("select_sign_up_option")}
                        </h3>
                        <p className="text-[14px] text-[#010211] font-normal leading-relaxed">
                            {t("pick_preferred_sign_up_option")} {companyName} {t("account")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            className="shadow-none w-full h-12 px-4 text-base font-normal text-[#010211] border border-[#E8E8EC] hover:bg-gray-50  flex items-center justify-center gap-3 transition-none rounded-[4px]"
                            onClick={() => handleRegisterModalClick('email')}
                        >
                            <PiEnvelopeSimpleBold className="size-5 shrink-0 text-[#010211]" />
                            {t("continue_with_email")}
                        </button>

                        <button
                            className="shadow-none w-full h-12 px-4 text-base font-normal text-[#010211] border border-[#E8E8EC] hover:bg-gray-50  flex items-center justify-center gap-3 transition-none rounded-[4px]"
                            onClick={() => handleRegisterModalClick('phone')}
                        >
                            <Smartphone className="size-5 shrink-0 text-[#010211]" />
                            {t("continue_with_phone")}
                        </button>

                        {/* <button
                            className="shadow-none w-full h-12 px-4 text-base font-normal text-[#010211] border border-[#E8E8EC] hover:bg-gray-50  flex items-center justify-center gap-3 transition-none rounded-[4px]"
                            onClick={() => { }}
                        >
                            <FaApple className="size-5 shrink-0 text-[#000000]" />
                            {t("continue_with_apple")}
                        </button> */}

                        <button
                            className="shadow-none w-full h-12 px-4 text-base font-normal text-[#010211] border border-[#E8E8EC] hover:bg-gray-50 flex items-center justify-center gap-3 transition-none rounded-[4px]"
                            onClick={signInWithGoogle}
                        >
                            <FcGoogle className="size-5 shrink-0" />
                            {t("continue_with_google")}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-[16px] font-normal text-[#000000]">
                            {t("already_have_account")} {" "}
                        </span>
                        <button
                            onClick={onSignInClick}
                            className="text-[16px] font-semibold primaryColor"
                        >
                            {t("sign_in")}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
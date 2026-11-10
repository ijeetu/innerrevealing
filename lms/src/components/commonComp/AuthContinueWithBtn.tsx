'use client'
import { getFirebaseAuth, FIREBASE_UNAVAILABLE_MESSAGE } from "@/utils/Firebase";
import React from 'react'
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { IoIosMail } from "react-icons/io";
import { Smartphone } from "lucide-react";
import { userSignup, UserSignupParams } from '@/utils/api/auth/user-signup/userSignupApi';
import { useDispatch, useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import toast from 'react-hot-toast';
import { setFirebaseToken, setToken } from '@/redux/reducers/userSlice';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';


interface AuthContinueWithBtnProps {
    onOpenChange: (isOpen: boolean) => void;
    handlePhoneClick: () => void;
    isMobileModal?: boolean;
    handleEmailClick?: () => void;
}


const AuthContinueWithBtn: React.FC<AuthContinueWithBtnProps> = ({ onOpenChange, handlePhoneClick, isMobileModal, handleEmailClick }) => {

    const dispatch = useDispatch();
    const settingsData = useSelector(settingsSelector);
    const companyName = settingsData?.data?.app_name;
    const auth = getFirebaseAuth()
    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);

    const registerUser = async (userId: string, displayName: string, email: string, type: string, profile: string, idToken: string) => {
        try {
            // Prepare signup data
            const signupData: UserSignupParams = {
                name: displayName,
                email: email,
                fcm_id: settingsData?.fcmtoken,
                firebase_id: userId,
                firebase_token: idToken,
                type: type,
                // Note: profile is a URL string from Firebase, not a File
                // The API will handle this appropriately
            };

            // Call the userSignup API
            const response = await userSignup(signupData);

            if (response) {
                // Check if API returned an error
                if (response.error) {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to register user");
                } else if (response.data) {
                    // Success - user registered successfully
                    // Show success message
                    toast.success(response.message || 'Registration successful!');

                    // Store authentication token from response data
                    if (response.data.token) {
                        dispatch(setToken(response.data.token));
                    }

                    // Close modal
                    onOpenChange(false);
                }
            } else {
                console.log("response is null in component", response);
                toast.error("Failed to register user. Please try again.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            toast.error(t("an_unexpected_error_occurred_during_registration"));
        }
    };


    // sign in google
    const signInWithGoogle = async () => {
        if (!auth) {
            toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
            return;
        }
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
            .then(async response => {
                onOpenChange(false)
                const idToken = await response?.user?.getIdToken(); // 👈 fetch idToken
                dispatch(setFirebaseToken(idToken || ''));
                await registerUser(response?.user?.uid, response?.user?.displayName || '', response?.user?.email || '', 'google', response?.user?.photoURL || '', idToken || '')
            })
            .catch(err => {
                console.log(err.message)
            })
    }

    return (
        <>
            {/* OR separator */}
            <div className="relative flex items-center mx-6 overflow-hidden">
                <div className="absolute left-0 right-0 border-t-2 border-gray-200 border-dashed"></div>
                <div className="relative z-[1] mx-auto bg-white px-4">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-full">
                        {t("or")}
                    </span>
                </div>
            </div>
             <div className="space-y-3 px-6">
                <Button
                    variant="outline"
                    className="sm:!text-base w-full flex items-center justify-center gap-2 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-normal rounded-md"
                    onClick={() => signInWithGoogle()}
                >
                    <FcGoogle className="h-6 w-6" />
                    {t("continue_with_google")}
                </Button>
                {
                    isMobileModal ?
                        <Button
                            variant="outline"
                            className="sm:!text-base w-full flex items-center justify-center gap-2 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-normal rounded-md"
                            onClick={() => handleEmailClick?.()}
                        >
                            <IoIosMail className="h-6 w-6 left-0" />
                            {t("continue_with_email")}
                        </Button>
                        :
                        <Button
                            variant="outline"
                            className="sm:!text-base w-full flex items-center justify-center gap-2 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-normal rounded-md"
                            onClick={() => handlePhoneClick()}
                        >
                            <Smartphone className="h-6 w-6" />
                            {t("continue_with_phone")}
                        </Button>
                }
            </div>
            {/* divider */}
            <hr className="borderColor mt-2" />

            <div className="px-6 pb-6 text-center flex flex-col gap-1 font-semibold text-sm sm:text-base">
                <p className="!font-normal text-sm">
                    {t("by_creating_account_agree")}{" "} {companyName}
                </p>
                <div className="flex justify-center gap-1">
                    <Link
                        href={`/terms-and-conditions?lang=${currentLanguageCode}`}
                        className="primaryColor hover:underline"
                    >
                        {t("terms_condition")}
                    </Link>
                    <span className="">{t("and")}</span>
                    <Link
                        href={`/privacy-policy?lang=${currentLanguageCode}`}
                        className="primaryColor hover:underline"
                    >
                        {t("privacy_policy")}
                    </Link>
                </div>
            </div>
        </>
    )
}

export default AuthContinueWithBtn

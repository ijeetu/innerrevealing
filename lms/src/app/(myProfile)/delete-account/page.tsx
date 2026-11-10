"use client";
import { getFirebaseAuth, FIREBASE_UNAVAILABLE_MESSAGE } from "@/utils/Firebase";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import { logoutSuccess, userDataSelector } from "@/redux/reducers/userSlice";
import { logoutSuccess as logoutSuccessCoupon } from "@/redux/reducers/couponSlice";
import { deleteAccount } from "@/utils/api/user/editProfile/deleteAcc";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { ConfirmationResult, EmailAuthProvider, GoogleAuthProvider, onAuthStateChanged, reauthenticateWithCredential, reauthenticateWithPhoneNumber, reauthenticateWithPopup, RecaptchaVerifier, signInWithPhoneNumber, signOut, User } from "firebase/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { resetTeamMemberData } from "@/redux/instructorReducers/teamMemberSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { clearBillingDetails } from "@/redux/reducers/billingDeatilsSlice";


export default function DeleteAccountPage() {


  const userData = useSelector(userDataSelector) as UserDetails;
  const isGoogleLogin = userData?.type === 'google';
  const isPhoneLogin = userData?.type === 'phone';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [googleFreshToken, setGoogleFreshToken] = useState("");
  const [isReauthing, setIsReauthing] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const firebaseUserRef = useRef<User | null>(null);
  const router = useRouter();

  const auth = getFirebaseAuth();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      firebaseUserRef.current = user;
    });
    return () => unsubscribe();
  }, [auth]);

  const dispatch = useDispatch();

  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await new Promise((resolve, reject) => {
        (auth ? signOut(auth) : Promise.resolve())
          .then(() => {
            dispatch(logoutSuccess())
            dispatch(logoutSuccessCoupon())
            dispatch(resetTeamMemberData())
            dispatch(clearBillingDetails())
            if (typeof window !== 'undefined') {
              window.recaptchaVerifier = null
            }
            resolve(void 0)
          })
          .catch(error => {
            toast.error(error)
            reject(error)
          })
      })
    } catch (error) {
      console.log('Oops errors!', error)
    }
  }

  const sendPhoneOtp = async () => {
    if (!auth) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    const user = firebaseUserRef.current;
    const countryCode = (userData?.country_calling_code || '').replace('+', '');
    const fullPhone = user?.phoneNumber ?? (userData?.mobile ? `+${countryCode}${userData.mobile}` : null);
    if (!fullPhone) {
      toast.error("Phone number not found");
      return;
    }
    setIsSendingOtp(true);
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container-delete', { size: 'invisible' });
      recaptchaVerifierRef.current = verifier;
      // Firebase session may have expired — fall back to signInWithPhoneNumber
      const result = user
        ? await reauthenticateWithPhoneNumber(user, fullPhone, verifier)
        : await signInWithPhoneNumber(auth, fullPhone, verifier);
      setConfirmationResult(result);
      setPhoneOtpSent(true);
      toast.success(t("otp_sent_to_number") + fullPhone);
    } catch (error) {
      console.log("Send OTP error:", error);
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      toast.error("Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const reauthAndGetFreshToken = async (userPassword?: string): Promise<string> => {
    const user = firebaseUserRef.current;
    if (confirmationResult && phoneOtp) {
      // phone flow — use token from credential directly (works even if user was null)
      const credential = await confirmationResult.confirm(phoneOtp);
      return await credential.user.getIdToken(true);
    }
    if (!user) throw new Error("No authenticated user");
    if (userPassword && user.email) {
      const emailCredential = EmailAuthProvider.credential(user.email, userPassword);
      await reauthenticateWithCredential(user, emailCredential);
    }
    return await user.getIdToken(true);
  };

  const handleGooglePreauth = async () => {
    if (!auth) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    const user = firebaseUserRef.current;
    if (!user) {
      toast.error("Please sign in again");
      return;
    }
    setIsReauthing(true);
    try {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
      const freshToken = await user.getIdToken(true);
      setGoogleFreshToken(freshToken);
      setIsModalOpen(true);
    } catch (error) {
      extractErrorMessage(error);
    } finally {
      setIsReauthing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    try {
      setIsDeleting(true);

      if (!isGoogleLogin && !isPhoneLogin && !password) {
        toast.error("Please enter your password");
        setIsDeleting(false);
        return;
      }

      if (isPhoneLogin && !phoneOtp) {
        toast.error(t("enter_verification_code"));
        setIsDeleting(false);
        return;
      }

      if (!isAgreed) {
        toast.error("Please confirm that you agree to delete your account");
        setIsDeleting(false);
        return;
      }


      const freshToken = await reauthAndGetFreshToken(password);

      const response = await deleteAccount({
        password: password,
        confirm_deletion: "1",
        firebase_token: freshToken,
      });

      if (response) {
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to delete account");
        } else {
          toast.success(response.message || "Account deleted successfully");
          await handleSignOut();
          setIsModalOpen(false);
          router.push("/");
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!auth) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    if (isGoogleLogin) {
      setIsDeleting(true);
      try {
        const response = await deleteAccount({
          password: "",
          confirm_deletion: "1",
          firebase_token: googleFreshToken,
        });
        if (response?.error) {
          toast.error(response.message || "Failed to delete account");
        } else {
          toast.success(response?.message || "Account deleted successfully");
          await handleSignOut();
          setIsModalOpen(false);
          router.push("/");
        }
      } catch (error) {
        extractErrorMessage(error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      handleDeleteAccount();
    }
  };

  const openDeleteModal = () => {
    if (!auth) {
      toast.error(FIREBASE_UNAVAILABLE_MESSAGE);
      return;
    }
    if (isGoogleLogin) {
      handleGooglePreauth();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <Layout>
      <div className="sectionBg py-8 md:py-12 border-b border-gray-200">
        <div className="container space-y-4">
          <div className="flexColCenter items-start gap-2">
            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
              {t("delete_account")}
            </h1>
          </div>
          <div className="bg-white rounded-full py-2 px-4 inline-flex items-center gap-1 max-w-full flex-wrap">
            <Link href={"/"} className="primaryColor" title="Home">
              {t("home")}
            </Link>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("my_profile")}</span>
            <span>
              <MdKeyboardArrowRight size={22} />
            </span>
            <span>{t("delete_account")}</span>
          </div>
        </div>
      </div>

      <div className="sectionBg">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileSidebar />

            <div className="bg-white flex-1 w-full rounded-[10px]">
              <h2 className="text-lg font-semibold text-gray-800 py-4 px-6 border-b border-gray-200 mb-0">
                {t("delete_account")}
              </h2>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("delete_account_permanently")}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("deleting_your_account_will_permanently_remove_all_your_enrolled_courses_and_created_content")}
                  </p>
                </div>

                {!isGoogleLogin && !isPhoneLogin && (
                  <div className="space-y-2 relative">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("password")}
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("e_g_test")}
                      className="sectionBg w-full rounded-[5px] px-4 py-2 border borderColor focus:outline-none"
                    />

                    <span
                      className="absolute ltr:right-3 rtl:left-3 top-[42px] cursor-pointer text-gray-500 sectionBg"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                )}

                {isPhoneLogin && (
                  <div className="space-y-2">
                    {!phoneOtpSent ? (
                      <Button
                        type="button"
                        onClick={sendPhoneOtp}
                        disabled={isSendingOtp}
                        className="primaryBg text-white font-semibold px-6 py-2 rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? t("sending") : t("we_will_sent_verification_code")}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <label
                          htmlFor="phone-otp"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("enter_verification_code")}
                        </label>
                        <input
                          type="text"
                          id="phone-otp"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="sectionBg w-full rounded-[5px] px-4 py-2 border borderColor focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div id="recaptcha-container-delete" />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="h-4 w-4 text-primaryColor border-gray-300 rounded focus:primaryColor"
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-700">
                    {t("agree_delete_account")}
                  </label>
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={openDeleteModal}
                    disabled={(!isGoogleLogin && !isPhoneLogin && !password) || (isPhoneLogin && !phoneOtp) || !isAgreed || isDeleting || isReauthing}
                    className="max-[400px]:w-full bg-red-600 text-white font-semibold px-6 py-2 rounded-[5px] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReauthing ? t("please_wait") : isDeleting ? t("deleting_account") : t("delete_account")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
}

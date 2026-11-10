"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LanguageModal from "../../modals/LanguageModal";
import MobileNav from "./MobileNav";
import { usePathname } from "next/navigation";
import SignInModal from "@/components/auth/email/SignInModal";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";
import ProfileDropdown from "@/components/dropdowns/ProfileDropdown";
import NotificationDropdown from "@/components/dropdowns/NotificationDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import CartDropdown from "@/components/dropdowns/CartDropdown";
import CategoriesDropdown from "@/components/dropdowns/CategoriesDropdown";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import SearchDropdown from "@/components/dropdowns/SearchDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { getCartItems } from "@/utils/api/user/get-cart/getCart";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { setCartData } from "@/redux/reducers/cartSlice";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { isLoginModalOpenSelector } from "@/redux/reducers/helpersReducer";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { PiUserBold } from "react-icons/pi";

const Header: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const settings = useSelector(settingsSelector);
  const logo = settings?.data?.horizontal_logo;
  const isLoginModalOpen = useSelector(isLoginModalOpenSelector);
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const isMobile = useIsMobile();

  const [isClient, setIsClient] = useState<boolean>(false);
  const [isRegisterOptionModalOpen, setIsRegisterOptionModalOpen] = useState(false);

  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // selectors
  const isLogin = useSelector(isLoginSelector);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const getAllCartItems = async () => {
    try {
      const response = await getCartItems();
      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            dispatch(setCartData(response.data));
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch cart items");
          dispatch(setCartData(null));
        }
      } else {
        console.log("response is null in component", response);
        dispatch(setCartData(null));
      }
    } catch (error) {
      extractErrorMessage(error);
      dispatch(setCartData(null));
    }
  };

  useEffect(() => {
    if (isLogin) {
      getAllCartItems();
    }
  }, [isLogin]);


  useEffect(() => {
    if (isLoginModalOpen) {
      setIsSignInOpen(true);
    }
  }, [isLoginModalOpen]);

  return (
    isClient && (
      <header className="bg-white pt-4 pb-0 md:pb-4 md:p-4 relative z-[4]">
        <div className="container space-y-4">
          <div className="flexCenter !justify-between">
            {/* navMenu */}
            <div className="flex items-center between-1200-1399:gap-8 gap-12">
              <div className="flexCenter gap-4">
                <div className="max-1199:block hidden">
                  <MobileNav
                    openSignInModal={() => setIsSignInOpen(true)}
                    openRegisterModal={() => setIsRegisterOptionModalOpen(true)}
                  />
                </div>
                <Link href={`/?lang=${currentLanguageCode}`} >
                  <div className="w-[112px] max-h-[48px] sm:w-[250px] sm:max-h-[64px] md:max-h-[80px] h-auto overflow-hidden">
                    <CustomImageTag
                      src={logo}
                      alt={t("logo")}
                      className="w-full h-full"
                    />
                  </div>
                </Link>
              </div>
              <ul className="max-1199:hidden flexCenter between-1200-1399:gap-3 gap-6">
                <Link
                  href={`/?lang=${currentLanguageCode}`}
                  className={`transition-all duration-300 hover:primaryColor ${pathname === "/"
                    ? "border-b-[2px] font-semibold primaryColor !primaryBorder pb-1"
                    : "font-normal"
                    } px-2`}
                  title={t("home")}
                >
                  {t("home")}
                </Link>

                <Link
                  href={`/courses?lang=${currentLanguageCode}`}
                  className={`transition-all duration-300 hover:primaryColor ${pathname === "/courses"
                    ? "border-b-[2px] font-semibold primaryColor !primaryBorder pb-1"
                    : "font-normal"
                    } px-2`}
                  title={t("courses")}
                >
                  {t("courses")}
                </Link>


                {settings?.data?.instructor_mode === 'multi' && (
                  <Link
                    href={`/instructors?lang=${currentLanguageCode}`}
                    className={`transition-all duration-300 hover:primaryColor ${pathname === "/instructors"
                      ? "border-b-[2px] font-semibold primaryColor !primaryBorder pb-1"
                      : "font-normal"
                      } px-2`}
                    title={t("instructor")}
                  >
                    {t("instructor")}
                  </Link>

                )}

                <Link
                  href={`/help-support?lang=${currentLanguageCode}`}
                  className={`transition-all duration-300 hover:primaryColor ${pathname === "/help-support"
                    ? "border-b-[2px] font-semibold primaryColor !primaryBorder pb-1"
                    : "font-normal"
                    } px-2`}
                  title={t("help_support")}
                >
                  {t("help_support")}
                </Link>
              </ul>
            </div>

            {/* language modal and profile dropdown */}
            <div className="hidden md:flex items-center between-1200-1399:gap-3 gap-4 overflow-hidden">
              <LanguageModal />
              <div className="h-[60px] border border-l borderColor"></div>
              {isLogin ? (
                <>
                  {/* profile dropdown */}
                  <ProfileDropdown />
                </>
              ) : (
                <>
                  {/* login/register button */}
                  <div className="flexCenter gap-4 borderColor h-full py-3">
                    <button
                      className="cursor-pointer"
                      onClick={() => setIsSignInOpen(true)}
                    >
                      {t("sign_in")}
                    </button>
                    <button
                      className="bg-black rounded-[4px] py-2 px-4 text-white cursor-pointer"
                      onClick={() => setIsRegisterOptionModalOpen(true)}
                    >
                      {t("register_now")}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="md:hidden flexCenter gap-1">
              <div className="flexCenter max-[400px]:gap-1 gap-3 h-[50px] relative">
                <>
                  {/* notification */}
                  {isLogin && (
                    <Link href={`/edit-profile?lang=${currentLanguageCode}`} className="max-[400px]:p-1 p-2">
                      <PiUserBold size={24} className="shrink-0 text-black" />
                    </Link>
                  )}
                  {isLogin && isMobile && (
                    <NotificationDropdown />
                  )}
                  {isMobile && <CartDropdown isMobileNav={true} />}
                </>
              </div>
            </div>
          </div>

          <hr className="border-t borderColor md:hidden" />

          <div className="relative lg:z-[4] border borderColor bg-[#F8F8F9] md:hidden flexCenter justify-start h-12 rounded-[4px] w-full ltr:pl-3 rtl:pr-3">
            <SearchDropdown />
          </div>

          <div className="relative hidden md:grid grid-cols-12 border-t borderColor gap-3 lg:gap-6 pt-4">
            <CategoriesDropdown />
            {/* search , notification and cart */}
            <div className="sm:col-span-12 lg:col-span-7 xl:col-span-9 2xl:col-span-10 between-1200-1399:col-span-9 col-span-10 flexCenter justify-between w-full gap-3 lg:gap-6">
              <div
                className="relative lg:z-[4] border borderColor bg-[#
F8F8F9] flexCenter justify-start h-12 rounded-[4px] w-full ltr:pl-3 rtl:pr-3"
              >
                <SearchDropdown />
              </div>
              {/* {
              isLogin && */}
              <>
                {/* notification */}
                {isLogin && !isMobile && (
                  <NotificationDropdown />
                )}
                {/* <NotificationDropdown /> */}
                {!isMobile && <CartDropdown />}
              </>
              {/* } */}
            </div>
          </div>
        </div>

        <SignInModal
          isOpen={isSignInOpen}
          onOpenChange={setIsSignInOpen}
          setIsRegisterOptionModalOpen={setIsRegisterOptionModalOpen}
          isRegisterOptionModalOpen={isRegisterOptionModalOpen}
        />

        <div id="recaptcha-container" className="fixed z-[99]"></div>
      </header>
    )
  );
};

export default Header;

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LanguageModal from "../../modals/LanguageModal";
import MobileNav from "./MobileNav";
import { usePathname } from "next/navigation";
import SignInModal from "@/components/auth/email/SignInModal";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import { useSelector } from "react-redux";
import ProfileDropdown from "@/components/dropdowns/ProfileDropdown";
import NotificationDropdown from "@/components/dropdowns/NotificationDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import BrandLogo from "./BrandLogo";
import SearchDropdown from "@/components/dropdowns/SearchDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { isLoginModalOpenSelector } from "@/redux/reducers/helpersReducer";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { PiUserBold } from "react-icons/pi";
import { ShoppingBag } from "lucide-react";

const Header: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
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


  useEffect(() => {
    if (isLoginModalOpen) {
      setIsSignInOpen(true);
    }
  }, [isLoginModalOpen]);

  const navigation = [
    { label: "Home", href: `/?lang=${currentLanguageCode}`, active: pathname === "/" },
    { label: "Practices", href: `/courses?lang=${currentLanguageCode}`, active: pathname.startsWith("/courses") || pathname.startsWith("/course-details") },
    { label: "Our Centre", href: "https://www.innerrevealing.com", active: false },
    { label: "Contact", href: `/contact-us?lang=${currentLanguageCode}`, active: pathname === "/contact-us" },
  ];

  return (
    isClient && (
      <header className="ir-lms-header relative z-[4]">
        <div className="container">
          <div className="ir-lms-masthead">
            <div className="ir-lms-navigation-group">
              <div className="ir-lms-brand-group">
                <div className="max-1199:block hidden">
                  <MobileNav
                    openSignInModal={() => setIsSignInOpen(true)}
                    openRegisterModal={() => setIsRegisterOptionModalOpen(true)}
                  />
                </div>
                <Link href={`/?lang=${currentLanguageCode}`} className="ir-lms-brand" aria-label="Inner Revealing home">
                  <BrandLogo />
                </Link>
              </div>
              <nav className="ir-lms-navigation max-1199:hidden" aria-label="Main navigation">
                {navigation.map((item) => (
                  <Link key={item.label} href={item.href} aria-current={item.active ? "page" : undefined}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4 shrink-0">
              <Link href="/cart" className="p-2" aria-label="Your cart"><ShoppingBag size={21} /></Link>
              <LanguageModal />
              <span className="ir-lms-header-divider" aria-hidden="true" />
              {isLogin ? <ProfileDropdown /> : (
                <div className="flexCenter gap-4">
                  <button className="ir-lms-sign-in" onClick={() => setIsSignInOpen(true)}>
                    {t("sign_in")}
                  </button>
                  <button className="ir-lms-register" onClick={() => setIsRegisterOptionModalOpen(true)}>
                    Join the practice
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden flexCenter gap-1 shrink-0">
              <Link href="/cart" className="p-2" aria-label="Your cart"><ShoppingBag size={21} /></Link>
              {isLogin && (
                <Link href={`/edit-profile?lang=${currentLanguageCode}`} className="hidden min-[400px]:flex p-1" aria-label="Your profile">
                  <PiUserBold size={22} className="secondaryColor" />
                </Link>
              )}
            </div>
          </div>

          <div className="ir-lms-search-row">
            <p className="ir-lms-header-note">A little more stillness. A little more you.</p>
            <div className="ir-lms-search-field relative lg:z-[4]">
              <SearchDropdown />
            </div>
            <div className="hidden md:flex items-center gap-4 shrink-0">
              {isLogin && !isMobile && <NotificationDropdown />}
            </div>
          </div>
        </div>

        <SignInModal
          isOpen={isSignInOpen}
          onOpenChange={setIsSignInOpen}
          setIsRegisterOptionModalOpen={setIsRegisterOptionModalOpen}
          isRegisterOptionModalOpen={isRegisterOptionModalOpen}
        />
      </header>
    )
  );
};

export default Header;

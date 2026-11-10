'use client'
import { logoutLocalSession } from "@/utils/localAuth";
import { setCartData } from "@/redux/reducers/cartSlice";
import React, { useState } from 'react'
import { RiEdit2Line } from "react-icons/ri";
import { BiBookAlt, BiLogOut } from "react-icons/bi";
import { FiUser } from "react-icons/fi";
import { FaRegCreditCard } from "react-icons/fa";
import { BsCart3, BsBookmark, BsBell } from "react-icons/bs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess, userDataSelector } from '@/redux/reducers/userSlice';
import { logoutSuccess as logoutSuccessCoupon } from "@/redux/reducers/couponSlice";
import { IoCaretDownSharp } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import CustomImageTag from '../commonComp/customImage/CustomImageTag';
import { LuBook, LuPencil } from 'react-icons/lu';
import { LuTrendingUp } from 'react-icons/lu';
import { TbDashboard } from 'react-icons/tb';
import { useTranslation } from '@/hooks/useTranslation';
import { UserDetails } from '@/utils/api/user/getUserDetails';
import { resetTeamMemberData } from '@/redux/instructorReducers/teamMemberSlice';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import { clearBillingDetails } from '@/redux/reducers/billingDeatilsSlice';
import { getDirection } from '@/utils/helpers';
import PurchaseCourseNegativeWalletBalanceModal from '../commonComp/PurchaseCourseNegativeWalletBalanceModal';
import AccessCourseNegativeWalletBalanceModal from '../commonComp/AccessCourseNegativeWalletBalanceModal';
import { settingsSelector } from '@/redux/reducers/settingsSlice';

const ProfileDropdown = ({ isMobileNav, isInstructor }: { isMobileNav?: boolean, isInstructor?: boolean }) => {

    const userData = useSelector(userDataSelector) as UserDetails

    const settings = useSelector(settingsSelector);
    const currentLanguageCode = useSelector(currentLanguageSelector)
    const router = useRouter()
    const dispatch = useDispatch()
    const { t } = useTranslation();

    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
    const [logoutConfrm, setLogoutConfrm] = useState<boolean>(false)
    const [imageError, setImageError] = useState<boolean>(false)
    const [showNegativeBalanceModal, setShowNegativeBalanceModal] = useState<boolean>(false)

    // Array of background colors for fallback avatar
    const avatarColors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-yellow-500',
        'bg-teal-500',
        'bg-orange-500',
        'bg-cyan-500'
    ];

    // Function to get initials from name
    const getInitials = (name: string): string => {
        if (!name) return 'U';

        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    // Function to get random color based on name
    const getAvatarColor = (name: string): string => {
        if (!name) return avatarColors[0];

        // Generate a consistent color based on name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % avatarColors.length;
        return avatarColors[index];
    };

    // Fallback Avatar Component
    const FallbackAvatar = ({ name }: { name: string }) => {
        const initials = getInitials(name);
        const bgColor = getAvatarColor(name);

        return (
            <div
                className={`${bgColor} rounded-full flex items-center justify-center text-white font-semibold w-full h-full !p-0`}
            >
                {initials}
            </div>
        );
    };

    // Reset image error when user data changes
    React.useEffect(() => {
        setImageError(false);
    }, [userData?.profile]);

    const handleSignOut = async () => {
        try {
            await new Promise((resolve, reject) => {
                logoutLocalSession()
                    .then(() => {
                        dispatch(logoutSuccess())
                        dispatch(logoutSuccessCoupon())
                        dispatch(resetTeamMemberData())
                        dispatch(clearBillingDetails())
                        dispatch(setCartData(null))
                        toast.success(t("logout_successfully"))
                        router.push(`/?lang=${currentLanguageCode}`)
                        setLogoutConfrm(false)
                        setIsProfileOpen(false)
                        resolve(void 0) // Resolve the promise when signOut is successful
                    })
                    .catch(error => {
                        toast.error(error instanceof Error ? error.message : "Could not sign out. Please try again.")
                        reject(error) // Reject the promise if there's an error
                    })
            })
        } catch (error) {
            console.log('Oops errors!', error)
        }
    }

    const handleAlert = async () => {
        setLogoutConfrm(true)
    }

    // Check if we should show fallback avatar
    const shouldShowFallback = !userData?.profile || imageError;

    const handleRedirectTo = (path: string) => {
        setIsProfileOpen(false)

        if (path === 'my-learnings' && userData?.total_balance !== undefined && userData?.total_balance !== null && userData.total_balance < 0) {
            setShowNegativeBalanceModal(true)
            return
        }

        if (path === 'home') {
            router.push(`/?lang=${currentLanguageCode}`)
        }
        else {
            router.push(`/${path}?lang=${currentLanguageCode}`)
        }
    }

    return (
        <div className="relative">
            <>
                {
                    isInstructor ?
                        <DropdownMenu
                            open={isProfileOpen}
                            onOpenChange={setIsProfileOpen}
                            dir={getDirection() as "ltr" | "rtl"}
                        >
                            <DropdownMenuTrigger asChild >
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <div className="h-12 w-12 rounded-full border borderColor p-1 flex items-center justify-center overflow-hidden">
                                        {shouldShowFallback ? (
                                            <FallbackAvatar name={userData?.name || 'User'} />
                                        ) : (
                                            <div className="h-12 w-12 !borderColor border rounded-full p-1 flexCenter shrink-0!">
                                                <CustomImageTag src={userData?.profile} alt={userData?.name} className="h-10 w-10 rounded-full shrink-0" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex items-center gap-1 break-all">
                                        {userData?.name} <IoCaretDownSharp size={12} />
                                    </span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-max py-2 !borderColor">
                                {/* User info with name and email */}
                                <div className="flex items-center px-4 py-2 gap-2">
                                    <div className="h-12 w-12 !borderColor border rounded-full p-1 flexCenter">
                                        <CustomImageTag src={userData?.profile} alt={userData?.name} className="h-10 w-10 rounded-full" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{userData?.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {userData?.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Switch to Student button */}
                                <div className="px-2 py-2">
                                    <Button asChild
                                        variant="outline"
                                        className="w-full justify-center hover:bg-black hover:text-white transition-all duration-300"
                                        onClick={() => handleRedirectTo('home')}
                                    >
                                        <span
                                            className="flexCenter gap-2"

                                        >
                                            {t("switch_to_student")}
                                        </span>
                                    </Button>
                                </div>

                                <DropdownMenuSeparator className="mt-2" />


                                {/* Profile section */}
                                <div className="px-4 pt-2 pb-1 text-sm text-muted-foreground">
                                    {t("profile")}
                                </div>
                                <DropdownMenuItem
                                    onClick={() => handleRedirectTo('edit-profile')}
                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                >
                                    <div className='flexCenter gap-2'>
                                        <span className="text-gray-500">
                                            <LuPencil className="mr-2 h-4 w-4" />
                                        </span>
                                        {t("edit_profile")}
                                    </div>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Activities section */}
                                <div className="px-4 pt-2 pb-1 text-sm text-muted-foreground">
                                    {t("activities")}
                                </div>
                                <DropdownMenuItem
                                    onClick={() => handleRedirectTo('instructor/dashboard')}
                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                >
                                    <div className='flexCenter gap-2'>
                                        <span className="text-gray-500">
                                            <TbDashboard className="mr-2 h-4 w-4" />
                                        </span>
                                        {t("dashboard")}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleRedirectTo('instructor/my-course')}
                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                >
                                    <div className='flexCenter gap-2'>
                                        <span className="text-gray-500">
                                            <LuBook className="mr-2 h-4 w-4" />
                                        </span>
                                        {t("my_course")}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleRedirectTo('instructor/earnings')}
                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                >
                                    <div className='flexCenter gap-2'>
                                        <span className="text-gray-500">
                                            <LuTrendingUp className="mr-2 h-4 w-4" />
                                        </span>
                                        {t("earnings")}
                                    </div>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Log Out option */}
                                <DropdownMenuItem
                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor" onClick={() => handleAlert()}>
                                    <div className='flexCenter gap-2'>
                                        <span className="text-gray-500">
                                            <BiLogOut size={18} />
                                        </span>
                                        <span>{t("log_out")}</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        :
                        <DropdownMenu
                            open={isProfileOpen}
                            onOpenChange={setIsProfileOpen}
                            dir={getDirection() as "ltr" | "rtl"}
                        >
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <div className="h-12 w-12 rounded-full border borderColor p-1 flex items-center justify-center overflow-hidden">
                                        {shouldShowFallback ? (
                                            <FallbackAvatar name={userData?.name || 'User'} />
                                        ) : (
                                            <div className="h-12 w-12 !borderColor border rounded-full p-1 flexCenter">
                                                <CustomImageTag src={userData?.profile} alt={userData?.name} className="h-10 w-10 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex items-center gap-1">
                                        {userData?.name} <IoCaretDownSharp size={12} />
                                    </span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[250px] sm:w-[350px] max-h-[450px] overflow-y-auto sm:max-h-full  max-575:absolute max-575:top-12 mt-1 border-none shadow-lg"
                                align={isMobileNav ? 'start' : 'end'}
                                side={isMobileNav ? 'left' : 'bottom'}
                                onMouseLeave={() => setIsProfileOpen(false)}
                            >
                                <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden border borderColor p-1">
                                        {shouldShowFallback ? (
                                            <FallbackAvatar name={userData?.name || 'User'} />
                                        ) : (
                                            <CustomImageTag
                                                src={userData?.profile}
                                                alt={userData?.name}
                                                className="h-10 w-10 rounded-full"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{userData?.name}</span>
                                        <span className="text-gray-500 text-sm break-all">
                                            {userData?.email}
                                        </span>
                                    </div>
                                </div>


                                {settings?.data?.instructor_mode === 'multi' && (
                                    <>
                                        <DropdownMenuLabel className="text-gray-500 text-sm px-4 py-2 font-normal">
                                            {t("instructor")}
                                        </DropdownMenuLabel>
                                        {(() => {
                                            const instructorStatus = userData?.instructor_process_status;
                                            const isInstructor = userData?.is_instructor;
                                            let href = "";
                                            let label = t("become_an_instructor");
                                            if (isInstructor && instructorStatus === "approved") {
                                                href = `instructor/dashboard`;
                                                label = t("switch_to_instructor");
                                            } else if (userData?.instructor_details) {
                                                href = `become-instructor/application`;
                                            } else {
                                                href = `become-instructor/process`;
                                            }

                                            return (
                                                <DropdownMenuItem
                                                    asChild
                                                    onClick={() => handleRedirectTo(href)}
                                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                                >
                                                    <div className='flex items-center justify-start gap-2'>
                                                        <span className="text-gray-500">
                                                            <FiUser size={18} />
                                                        </span>
                                                        <span>{label}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            );
                                        })()}

                                        <DropdownMenuSeparator />
                                    </>
                                )}


                                <DropdownMenuLabel className="text-gray-500 text-sm px-4 py-2 font-normal">
                                    {t("profile")}
                                </DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild
                                        className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                        onClick={() => handleRedirectTo('edit-profile')}
                                    >
                                        <div className='flex items-center justify-start gap-2'>
                                            <span className="text-gray-500">
                                                <RiEdit2Line size={18} />
                                            </span>
                                            <span>{t("edit_profile")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    {[{ path: "account-security", label: "Account security" }, { path: "delete-account", label: "Delete account" }].map((item) => (
                                        <DropdownMenuItem key={item.path} onClick={() => handleRedirectTo(item.path)} className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg">
                                            {item.label}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem asChild
                                        className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                        onClick={() => handleRedirectTo('transaction-history')}
                                    >
                                        <div className='flex items-center justify-start gap-2'>
                                            <span className="text-gray-500">
                                                <FaRegCreditCard size={18} />
                                            </span>
                                            <span>{t("my_purchases")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuLabel className="text-gray-500 text-sm px-4 py-2 font-normal">
                                    {t("activities")}
                                </DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild
                                        className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                        onClick={() => handleRedirectTo('my-learnings')}
                                    >
                                        <div className='flex items-center justify-start gap-2'>
                                            <span className="text-gray-500">
                                                <BiBookAlt size={18} />
                                            </span>
                                            <span>{t("my_learnings")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild
                                        className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                        onClick={() => handleRedirectTo('cart')}
                                    >
                                        <div className='flex items-center justify-start gap-2'>
                                            <span className="text-gray-500">
                                                <BsCart3 size={18} />
                                            </span>
                                            <span>{t("my_cart")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild
                                        className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                        onClick={() => handleRedirectTo('my-wishlist')}
                                    >
                                        <div className='flex items-center justify-start gap-2'>
                                            <span className="text-gray-500">
                                                <BsBookmark size={18} />
                                            </span>
                                            <span>{t("my_wishlist")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild
                                        className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor"
                                        onClick={() => handleRedirectTo('notifications')}
                                    >
                                        <div className='flex items-center justify-start gap-2'>
                                            <span className="text-gray-500">
                                                <BsBell size={18} />
                                            </span>
                                            <span>{t("notifications")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild
                                    className="px-4 py-2 cursor-pointer hover:!primaryColor hover:!primaryLightBg focus:!primaryColor" onClick={() => handleAlert()}>
                                    <div className='flex items-center justify-start gap-2'>
                                        <span className="text-gray-500">
                                            <BiLogOut size={18} />
                                        </span>
                                        <span>{t("log_out")}</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                }
            </>
            <div>
                {/* logout alert */}
                <AlertDialog open={logoutConfrm} onOpenChange={setLogoutConfrm}>
                    <AlertDialogContent className='bg-white'>
                        <AlertDialogHeader>
                            <AlertDialogTitle className='hidden'></AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className='text-center'>
                            {t("are_you_sure_you_want_to_log_out")}
                        </AlertDialogDescription>
                        <AlertDialogFooter className=''>
                            <AlertDialogAction className='primaryBg text-white' onClick={() => handleSignOut()}>{t("yes")}</AlertDialogAction>
                            <AlertDialogCancel onClick={() => setLogoutConfrm(false)}>{t("cancel")}</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            {showNegativeBalanceModal && (
                <AccessCourseNegativeWalletBalanceModal
                    forceOpen={showNegativeBalanceModal}
                    onClose={() => setShowNegativeBalanceModal(false)}
                />
            )}
        </div>
    )
}

export default ProfileDropdown

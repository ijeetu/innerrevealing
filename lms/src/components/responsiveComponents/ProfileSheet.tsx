'use client'
import { logoutLocalSession } from "@/utils/localAuth";
import { setCartData } from "@/redux/reducers/cartSlice";
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess, userDataSelector } from '@/redux/reducers/userSlice';
import { logoutSuccess as logoutSuccessCoupon } from "@/redux/reducers/couponSlice";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from '@/components/instructor/courses/types'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
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
import { FaAngleRight, FaRegCreditCard } from 'react-icons/fa';
import Link from 'next/link';
import { RiEdit2Line } from 'react-icons/ri';
import { BiBookAlt, BiLogOut } from 'react-icons/bi';
import { BsBell, BsBookmark, BsCart3 } from 'react-icons/bs';
import { useTranslation } from '@/hooks/useTranslation';
import { resetTeamMemberData } from '@/redux/instructorReducers/teamMemberSlice';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import { clearBillingDetails } from '@/redux/reducers/billingDeatilsSlice';


interface ProfileSheetProps {
    setIsOpen: (isOpen: boolean) => void
}

const ProfileSheet: React.FC<ProfileSheetProps> = ({ setIsOpen }) => {

    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);

    const userData = useSelector(userDataSelector) as User
    const navigate = useRouter()
    const dispatch = useDispatch()


    const [logoutConfrm, setLogoutConfrm] = useState<boolean>(false)
    const [imageError, setImageError] = useState<boolean>(false)

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

    // Handle image loading error
    const handleImageError = () => {
        setImageError(true);
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
                        navigate.push('/')
                        setLogoutConfrm(false)
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

    const handleAlert = () => setLogoutConfrm(true);

    // Check if we should show fallback avatar
    const shouldShowFallback = !userData?.profile || imageError;

    return (
        <div className="w-full">
            <Sheet>
                <SheetTrigger className="w-full">
                    <div className="sectionBg p-2 rounded-[8px] flex items-center gap-2 cursor-pointer">
                        <div className="h-12 w-14 rounded-full border borderColor p-1 flex items-center justify-center overflow-hidden">
                            {shouldShowFallback ? (
                                <FallbackAvatar name={userData?.name || 'User'} />
                            ) : (
                                <Image
                                    src={userData?.profile}
                                    alt="user"
                                    width={48}
                                    height={48}
                                    className='rounded-full'
                                    onError={handleImageError}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-1 justify-between w-full">
                            <span className="font-medium flex items-center gap-1">
                                {userData?.name}
                            </span>
                            <span className='float-end block'>
                                <FaAngleRight className='text-gray-500' />
                            </span>
                        </div>
                    </div>
                </SheetTrigger>
                <SheetContent side="left" className='px-4'>
                    <SheetTitle className="hidden">{t("sort_by")}</SheetTitle>
                    <div className="mt-14 pt-4 border-t borderColor">
                        <div className='space-y-2 border-b borderColor pb-2 mb-3'>
                            <div className="text-gray-500 font-normal">
                                {t("profile_section")}
                            </div>
                            <SheetClose asChild className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:!primaryColor" onClick={() => setIsOpen(false)}>
                                <Link href={`/edit-profile?lang=${currentLanguageCode}`} title={t('edit_profile')} className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <RiEdit2Line size={18} />
                                    </span>
                                    <span>{t('edit_profile')}</span>
                                </Link>
                            </SheetClose>
                            <SheetClose asChild className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:!primaryColor" onClick={() => setIsOpen(false)}>
                                <Link href={`/transaction-history?lang=${currentLanguageCode}`} title={t('transaction_history')} className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <FaRegCreditCard size={18} />
                                    </span>
                                    <span>{t('transaction_history')}</span>
                                </Link>
                            </SheetClose>
                        </div>

                        <div className='space-y-2 border-b borderColor pb-2 mb-3'>
                            <div className="text-gray-500 font-normal">
                                {t("activities_section")}
                            </div>
                            <SheetClose asChild className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:!primaryColor" onClick={() => setIsOpen(false)}>
                                <Link href={`/my-learnings?lang=${currentLanguageCode}`} title={t('my_learnings')} className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <BiBookAlt size={18} />
                                    </span>
                                    <span>{t('my_learnings')}</span>
                                </Link>
                            </SheetClose>
                            <SheetClose asChild className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:!primaryColor" onClick={() => setIsOpen(false)}>
                                <Link href={`/cart?lang=${currentLanguageCode}`} title={t('my_cart')} className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <BsCart3 size={18} />
                                    </span>
                                    <span>{t('my_cart')}</span>
                                </Link>
                            </SheetClose>
                            <SheetClose asChild className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:!primaryColor" onClick={() => setIsOpen(false)}>
                                <Link href={`/my-wishlist?lang=${currentLanguageCode}`} title={t('my_wishlist')} className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <BsBookmark size={18} />
                                    </span>
                                    <span>{t('my_wishlist')}</span>
                                </Link>
                            </SheetClose>
                            <SheetClose asChild className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:!primaryColor" onClick={() => setIsOpen(false)}>
                                <Link href={`/notifications?lang=${currentLanguageCode}`} title={t('notifications')} className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <BsBell size={18} />
                                    </span>
                                    <span>{t('notifications')}</span>
                                </Link>
                            </SheetClose>
                        </div>

                        <div className="space-y-2 border-b borderColor pb-3 mb-3">
                            {[{ href: "/account-security", label: "Account security" }, { href: "/delete-account", label: "Delete account" }].map((item) => (
                                <SheetClose asChild key={item.href} onClick={() => setIsOpen(false)}>
                                    <Link href={item.href} className="flex items-center justify-between py-2 font-medium hover:primaryColor">{item.label}<FaAngleRight size={12} /></Link>
                                </SheetClose>
                            ))}
                        </div>

                        <div className='space-y-2'>
                            <div className="text-gray-500 font-normal">
                                {t("logout_section")}
                            </div>
                            <div className="flex items-center gap-2 py-2 font-semibold cursor-pointer hover:primaryColor" onClick={() => handleAlert()}>
                                <div className='flex items-center justify-start gap-2'>
                                    <span className="">
                                        <BiLogOut size={18} />
                                    </span>
                                    <span>{t('logout_section')}</span>
                                </div>

                            </div>
                        </div>


                    </div>
                </SheetContent>
            </Sheet>
            <div>
                {/* logout alert */}
                <AlertDialog open={logoutConfrm} onOpenChange={setLogoutConfrm}>
                    <AlertDialogContent className='bg-white'>
                        <AlertDialogHeader>
                            <AlertDialogTitle className='hidden'></AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                            {t('logout_confirm')}
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogAction className='primaryBg text-white' onClick={() => handleSignOut()}>{t('yes_button')}</AlertDialogAction>
                            <AlertDialogCancel onClick={() => setLogoutConfrm(false)}>{t('cancel_button')}</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>


            </div>
        </div>
    );
};

export default ProfileSheet;

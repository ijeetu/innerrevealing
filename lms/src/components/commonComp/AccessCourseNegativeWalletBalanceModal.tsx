"use client";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogOverlay
} from "@/components/ui/dialog";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelector } from "react-redux";
import { isLoginSelector, userDataSelector } from "@/redux/reducers/userSlice";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface Props {
    forceOpen?: boolean;
    onClose?: () => void;
}


export default function AccessCourseNegativeWalletBalanceModal({ forceOpen, onClose }: Props) {
    const { t, currentLanguage } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();

    const shouldHideClose =
        pathname.startsWith("/course-details") ||
        pathname.startsWith("/my-learning") ||
        pathname.startsWith("/cart");



    const isLogin = useSelector(isLoginSelector);
    const userData = useSelector(userDataSelector) as UserDetails;

    const [open, setOpen] = useState(false);

    const total_balance = userData?.total_balance ?? null;

    const isRestricted = isLogin && total_balance !== null && total_balance < 0;

    useEffect(() => {
        if (isRestricted || forceOpen) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [isRestricted, forceOpen]);

    const handleGoHome = () => {
        const homePath = currentLanguage ? `/?lang=${currentLanguage}` : "/";
        router.replace(homePath);
        setOpen(false);
        if (onClose) onClose();
    };

    const handleClose = () => {
        setOpen(false);
        if (onClose) onClose();
    };

    // Don't render anything if user is not logged in
    if (!isLogin) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogOverlay className="bg-black/20 backdrop-blur-xs" />
            <DialogContent
                className="sm:max-w-2xl p-6 sm:p-12 rounded-[8px] overflow-hidden gap-0 border-none shadow-2xl bg-white flex flex-col items-center outline-none [&>.closeBtn]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Close Button — top right */}
                {!shouldHideClose && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="flex flex-col items-center text-center gap-6">
                    {/* Icon Container */}
                    <div className="w-[72px] h-[72px] bg-[#FEF2F2] flex items-center justify-center rounded-[8px]">
                        <AlertTriangle className="w-[40px] h-[40px] text-[#DD4B39]" strokeWidth={2.5} />
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                        <h2 className="sectionTitle">
                            {t("wallet_balance_negative")}
                        </h2>
                        <p className="font-normal text-base text-[#010211]">
                            {t("wallet_balance_negative_description")}
                        </p>
                    </div>

                    {/* Buttons Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">


                        {/* Go Home Button */}
                        <button
                            onClick={handleGoHome}
                            className="w-full sm:w-auto px-8 py-3 primaryBg text-white font-medium text-base rounded-[8px] hover:secondaryBg transition-colors duration-200"
                        >
                            {t("go_to_home")}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
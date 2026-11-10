"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";

interface LayoutContentProps {
    children: React.ReactNode;
}

const LayoutContent = ({ children }: LayoutContentProps) => {
    const currentLangCode = useSelector(currentLanguageSelector);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname === '/') {
            if (currentLangCode && currentLangCode !== null && currentLangCode !== undefined) {
                router.replace(`${pathname}?lang=${currentLangCode}`);
            }
        }
        const urlLangCode = searchParams.get('lang');
        if (currentLangCode && currentLangCode !== null && currentLangCode !== undefined && urlLangCode && urlLangCode !== currentLangCode) {
            router.replace(`${pathname}?lang=${currentLangCode}`);
        }
    }, [currentLangCode, pathname, router, searchParams]);

    return <>{children}</>;
};

export default LayoutContent;

"use client";
import React from "react";
import pageNotFoundImage from "@/assets/images/states-imgs/page-not-found.svg";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import EmptyStatesContent from "@/components/commonComp/EmptyStatesContent";
import ThemeSvg from "@/components/commonComp/customImage/ThemeSvg";

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen gap-12">
        <ThemeSvg
          src={pageNotFoundImage}
          alt="Page Not Found"
          className="emptyStatesImg"
          colorMap={{
            "#5A5BB5": "var(--primary-color)",
            "#04294C": "var(--hover-color)",
            "#EEF2FA": "var(--primary-light-color)",
          }}
        />
        <EmptyStatesContent title={t("page_not_found")} description={t("page_not_found_desc")} />
        <button
          onClick={handleGoBack}
          className="bg-black text-white px-4 py-2 rounded-md  w-full max-w-[280px] h-auto text-center hover:bg-gray-800 transition-all duration-300"
        >
          {t("go_back")}
        </button>
      </div>
    </>
  );
}

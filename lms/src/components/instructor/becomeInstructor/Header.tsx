"use client";
import React from "react";
import { IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";

const Header = () => {

  const settings = useSelector(settingsSelector);
  const logo = settings?.data?.horizontal_logo;
  const router = useRouter();
  const { t } = useTranslation();
  // Function to handle closing the instructor page
  const handleClose = () => {
    router.push("/become-instructor");
  };

  return (
    <div className="container">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 sm:gap-12">
          <Link href={"/"}>
            <div className="w-[112px] max-h-[48px] sm:w-[250px] sm:max-h-[64px] md:max-h-[80px] h-auto">
              <CustomImageTag
                src={logo}
                alt={t("logo")}
                className="w-full h-full"
              />
            </div>
          </Link>

          {/* Text */}
          <h1 className="text-sm sm:text-lg font-medium text-gray-900">
            {t("become_an_instructor")}
          </h1>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="p-1 rounded-sm hover:bg-gray-100"
          aria-label="Close"
        >
          <IoClose className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default Header;

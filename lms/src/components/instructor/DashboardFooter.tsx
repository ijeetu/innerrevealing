"use client";
import { useTranslation } from "@/hooks/useTranslation";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import RichTextContent from "../commonComp/RichText";

const DashboardFooter = () => {
  const { t } = useTranslation();
  const settings = useSelector(settingsSelector);
  const copyrightText = settings?.data?.website_copyright;

  const currentYear = new Date().getFullYear();
  const companyName = process.env.NEXT_PUBLIC_WEB_NAME || 'Inner Revealing';

  return (
    <footer className="bg-[#010211] text-white p-4 text-center text-sm">
      {
        copyrightText ? (
          <div className="text-gray-300 [&_a]:!text-white [&_a]:!font-semibold [&_a]:!underline">
            <RichTextContent content={copyrightText} />
          </div>
        ) : (
          <p className="text-gray-300">
            {t('copyright')}  ©  {currentYear} {t('all_rights_reserved')} <Link href='https://www.innerrevealing.com' title={companyName} target='_blank' rel='noopener noreferrer' className='text-white font-semibold underline'> {companyName}</Link>
          </p>
        )
      }
    </footer>
  );
};

export default DashboardFooter;

"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import RichTextContent from "@/components/commonComp/RichText";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {

  const { t } = useTranslation();
  const settings = useSelector(settingsSelector);
  const copyrightText = settings?.data?.website_copyright;

  const currentYear = new Date().getFullYear();
  const companyName = process.env.NEXT_PUBLIC_WEB_NAME || 'Inner Revealing';

  return (
    <div className="px-4 py-5 secondaryBg border-t text-center text-sm text-gray-500">
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
    </div>
  );
};

export default Footer;

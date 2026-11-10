'use client'
import React from 'react';
import Link from 'next/link';
import { HiOutlineLocationMarker } from "react-icons/hi";
import { RiMailSendLine } from "react-icons/ri";
import { FiExternalLink, FiPhoneCall } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';
import RichTextContent from '../commonComp/RichText';
import { getDirection } from '@/utils/helpers';


const Footer: React.FC = () => {

  const { t } = useTranslation();
  const settings = useSelector(settingsSelector);
  const socialMedias = settings?.data?.social_media;
  const currentYear = new Date().getFullYear();
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const companyName = process.env.NEXT_PUBLIC_WEB_NAME || 'Inner Revealing';
  const socialIcons = { Facebook: FaFacebookF, Instagram: FaInstagram, YouTube: FaYoutube };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const copyrightText = settings?.data?.website_copyright;

  if (!isMounted) {
    return null;
  }

  return (
    <footer className={`bg-[#2d2039] text-gray-300 pt-12 space-y-8 md:space-y-12 lg:space-y-16 `} dir={getDirection() as "ltr" | "rtl"}>
      {/* Contact Information */}
      <div className="container space-y-8 md:space-y-12 lg:space-y-16">
        <div className="bg-[#3b2c49] rounded-2xl p-6 md:p-10 grid lg:grid-cols-3 gap-y-6 lg:gap-16">
          <div className="flex items-center lg:pr-6 lg:ltr:border-r lg:rtl:border-l border-[#9797a547] border-b pb-3 lg:border-b-0 lg:pb-0">
            <div className="bg-[#FFFFFF1F] p-3 rounded-full ltr:mr-4 rtl:ml-4">
              <HiOutlineLocationMarker className="text-white" size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-white sm:text-xl">{t('address')}</h3>
              <p className="text-sm">{settings?.data?.contact_address}</p>
            </div>
          </div>

          <div className="flex items-center lg:pr-6 lg:ltr:border-r lg:rtl:border-none border-[#9797a547] border-b pb-3 lg:border-b-0 lg:pb-0">
            <div className="bg-[#FFFFFF1F] p-3 rounded-full ltr:mr-4 rtl:ml-4">
              <RiMailSendLine className="text-white" size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-white sm:text-xl">{t('mail_us')}</h3>
              <Link href={`mailto:${settings?.data?.contact_email}`} className="text-sm">{settings?.data?.contact_email}</Link>
            </div>
          </div>

          <div className="flex items-center lg:pr-6 lg:ltr:border-none lg:rtl:border-r border-[#9797a547] border-b pb-3 lg:border-b-0 lg:pb-0">
            <div className="bg-[#FFFFFF1F] p-3 rounded-full ltr:mr-4 rtl:ml-4">
              <FiPhoneCall className="text-white" size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-white sm:text-xl">{t('call_us')}</h3>
              <Link href={`tel:${settings?.data?.contact_phone}`} className="text-sm">{settings?.data?.contact_phone}</Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className='space-y-6'>
            <h2 className="text-white font-semibold text-lg mb-6">{t('about_us')}</h2>
            <p className="text-sm ">
              {settings?.data?.footer_description}
            </p>
            <div>
              <h3 className="text-white font-medium mb-2">{t('follow_us')}</h3>
              <div className="flex space-x-3 text-white">
                {
                  socialMedias?.map((social) => {
                    const SocialIcon = socialIcons[social.name as keyof typeof socialIcons] || FiExternalLink;
                    return <Link href={social.url || ''} key={social.id} target='_blank' rel='noopener noreferrer' aria-label={`${companyName} on ${social.name}`} className="bg-[#FFFFFF1F] p-2 rounded-full">
                      <SocialIcon className='w-4 h-4' aria-hidden='true' />
                    </Link>;
                  })
                }
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-6">{t('useful_links')}</h2>
            <ul className="space-y-4">
              <li>
                <Link href={`/?lang=${currentLanguageCode}`} className="">{t('home')}</Link>
              </li>
              <li>
                <Link href='https://www.innerrevealing.com' target='_blank' rel='noopener noreferrer'>Our centre</Link>
              </li>
              <li>
                <Link href={`/courses?lang=${currentLanguageCode}`} className="">Meditation practices</Link>
              </li>
              <li>
                <Link href='/courses/search/yoga'>Yoga &amp; breathwork</Link>
              </li>
              <li>
                <Link href='/courses/search/mindfulness'>Personal growth</Link>
              </li>
              <li>
                <Link href={`/contact-us?lang=${currentLanguageCode}`} className="">{t('contact_us')}</Link>
              </li>
              <li>
                <Link href='https://www.innerrevealing.com' target='_blank' rel='noopener noreferrer'>Inner Revealing website</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-6">{t('legal_policies')}</h2>
            <ul className="space-y-4">
              <li>
                <Link href={`/cookies-policy?lang=${currentLanguageCode}`} className="">{t('cookie_policy')}</Link>
              </li>
              <li>
                <Link href={`/privacy-policy?lang=${currentLanguageCode}`} className="">{t('privacy_policy')}</Link>
              </li>
              <li>
                <Link href={`/terms-and-conditions?lang=${currentLanguageCode}`} className="">{t('terms_condition')}</Link>
              </li>
              <li>
                <Link href={`/refund-policy?lang=${currentLanguageCode}`} className="">{t('refund_policy')}</Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#3b2c49] py-4 md:py-6">
        <div className="text-center">
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
      </div>
    </footer>
  );
};

export default Footer;

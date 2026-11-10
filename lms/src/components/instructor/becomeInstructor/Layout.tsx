'use client';
import Header from './Header';
import Footer from './Footer';
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { currentLanguageSelector, languagesSelector } from '@/redux/reducers/languageSlice';

export default function Layout({ children }: { children: React.ReactNode }) {

  const settings = useSelector(settingsSelector);
  const languages = useSelector(languagesSelector);
  const currentLangCode = useSelector(currentLanguageSelector);
  const router = useRouter();

  const pathname = usePathname();


  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--primary-color', settings?.data?.system_color || '#5a5bb5')
      // Set favicon from settings API
      if (settings?.data?.favicon) {
        const favicon: HTMLLinkElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement("link") as HTMLLinkElement;
        favicon.rel = "icon";
        favicon.href = settings?.data?.favicon;
        if (!document.querySelector('link[rel="icon"]')) {
          document.head.appendChild(favicon);
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    router.replace(`${pathname + `?lang=${currentLangCode}`}`)
  }, [pathname, currentLangCode]);

  // Get current language display info
  const getCurrentLanguageInfo = () => {
    const currentLang = languages.find(lang => lang.code === currentLangCode);
    return {
      name: currentLang?.name || 'English',
      code: currentLangCode || 'EN',
      flag: currentLang?.image || '',
      isRtl: currentLang?.is_rtl
    };
  };

  const currentLangInfo = getCurrentLanguageInfo();

  useEffect(() => {
    if (currentLangInfo && currentLangInfo?.isRtl) {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = `${currentLangInfo && currentLangInfo?.code}`
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = `${currentLangInfo && currentLangInfo?.code}`
    }
  }, [currentLangInfo])


  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

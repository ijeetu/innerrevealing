"use client";

import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from "@/components/ui/drawer";
import { translate } from '@/utils/helpers';
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { usePathname, useSearchParams } from 'next/navigation';
import { MdOutlineClose } from "react-icons/md";

const OpenInAppPopUp: React.FC = () => {
  // Get settings data from Redux store
  const settings = useSelector(settingsSelector);

  // Get current pathname for deep linking
  const path = usePathname();
  const searchParams = useSearchParams();
  
  // Check if share parameter exists and equals 'true' in URL
  // Example: ?share=true
  const shareParam = searchParams.get('share');
  const isShare = shareParam === 'true';

  // Extract company name from settings
  const schema = settings?.data?.schema || '';
  const appName = settings?.data?.app_name || '';

  const [IsOpenInApp, setIsOpenInApp] = useState(false);

  useEffect(() => {
    // Check if share parameter is true and if on mobile device
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      
      // Show popup if share=true and on mobile device
      if (isShare && isMobile) {
        setIsOpenInApp(true);
      } else {
        setIsOpenInApp(false);
      }
    }
  }, [isShare, searchParams])

  // Handle opening the app with deep linking
  const handleOpenInApp = (): void => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Get app store links from settings
    const androidAppStoreLink = settings?.data?.android_app_link;
    const iosAppStoreLink = settings?.data?.ios_app_link;

    // Detect device type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroid = /android/i.test(userAgent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    // Build app scheme URL for deep linking
    // Using app_name to create the scheme
    if (!schema) {
      console.warn('Company name not found in settings');
      return;
    }
    
    const appSchemeName = schema.trim().toLowerCase().replace(/\s+/g, '-');
    const appScheme = `${appSchemeName}://${window.location.hostname}${path}`;

    // Determine which app store link to use
    const appStoreLink = isAndroid ? androidAppStoreLink : (isIOS ? iosAppStoreLink : androidAppStoreLink);

    // Close the popup first, then attempt to open the app
    setIsOpenInApp(false);

    // Handle iOS app opening
    if (isIOS) {
      // Set a flag in sessionStorage to track redirect attempt
      sessionStorage.setItem('appRedirectAttempt', Date.now().toString());

      // Attempt to open the app using deep link
      window.location.href = appScheme;

      // Check if we redirected successfully by seeing if this code runs after a delay
      setTimeout(() => {
        const redirectAttempt = sessionStorage.getItem('appRedirectAttempt');
        const now = Date.now();

        // If less than 2 seconds passed, app didn't open (user is still on the page)
        if (redirectAttempt && (now - parseInt(redirectAttempt)) < 2000) {
          // Ask user if they want to go to app store
          if (confirm(`${translate('appNotInstalled')}`)) {
            if (iosAppStoreLink) {
              window.location.href = iosAppStoreLink;
            }
          }
        }

        // Clear the flag
        sessionStorage.removeItem('appRedirectAttempt');
      }, 2000);
    } else {
      // Handle Android app opening
      window.location.href = appScheme;

      // Check if app opened after a delay
      setTimeout(() => {
        // If page is still visible, app didn't open
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(document.hidden || (document as any).webkitHidden)) {
          // Ask user if they want to go to app store
          if (confirm(`${translate('appNotInstalled')} `)) {
            if (appStoreLink) {
              window.location.href = appStoreLink;
            }
          }
        }
      }, 1000);
    }
  };

  return (
    <div className='openInAppPopUp'>
      <Drawer open={IsOpenInApp} onOpenChange={setIsOpenInApp}>
        <DrawerContent>
          <div className='flex items-center justify-between py-4 px-6'>
            <div className='flex items-center gap-3'>
              <DrawerClose>
                <MdOutlineClose size={22} color='gray' />
              </DrawerClose>
              <div>
                <h6 className='font-[600]'>
                  {`${translate('viewIn')} ${appName} ${translate('app')}`}
                </h6>
              </div>
            </div>
            <div>
              <button
                className='commonBtn'
                onClick={handleOpenInApp}
                type="button"
              >
                {translate('open')}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default OpenInAppPopUp;

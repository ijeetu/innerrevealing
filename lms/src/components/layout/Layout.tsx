"use client";
import React, { useEffect, useState, Suspense } from "react";
import Header from "./header/Header";
import Footer from "./Footer";
import Stripe from "./Stripe";
import { useDispatch, useSelector } from "react-redux";
import { setSettings, setSettingsLastFetch, settingsSelector } from "@/redux/reducers/settingsSlice";
import moment from "moment";
import toast from "react-hot-toast";
import { setUserData, tokenSelector, userLastFetchSelector, setUserLastFetch } from "@/redux/reducers/userSlice";
import MainLoader from "../Loaders/MainLoader";
import { getSettings, WebSettings } from "@/utils/api/general/getSettings";
import { extractErrorMessage } from "@/utils/helpers";
import { getUserDetails, UserDetails } from "@/utils/api/user/getUserDetails";
import { CourseLanguage, getCourseLanguages } from "@/utils/api/general/getCourseLanguages";
import { lastFetchSelector, setCourseLanguageData, setCourseLanguageLastFetch } from "@/redux/reducers/courseLanguageSlice";
import { fetchUserDeatilsSelector, isInstructorFromResubmitSelector, setFetchUserDeatils, setIsInstructorFromResubmit } from "@/redux/reducers/helpersReducer";
import MaintenanceMode from "../commonComp/MaintenanceMode";
import LayoutContent from "./LayoutContent";


const Layout = ({ children }: { children: React.ReactNode }) => {

  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const settings = useSelector(settingsSelector);

  const isMaintenanceMode = settings?.data?.maintaince_mode;

  const token = useSelector(tokenSelector);

  const shouldFetchUserDeatils = useSelector(fetchUserDeatilsSelector);

  const isInstructorFromResubmit = useSelector(isInstructorFromResubmitSelector);

  const userLastFetch = useSelector(userLastFetchSelector);

  const userDiffInMinutes = userLastFetch ? moment().diff(moment(userLastFetch), 'minutes') : process.env.NEXT_PUBLIC_LOAD_MIN! + 1;

  const courseLanguageLastFetch = useSelector(lastFetchSelector);

  const courseLanguageDiffInMinutes = courseLanguageLastFetch ? moment().diff(moment(courseLanguageLastFetch), 'minutes') : process.env.NEXT_PUBLIC_LOAD_MIN! + 1;

  // settings
  const firstLoadSettings = typeof window !== 'undefined' ? sessionStorage.getItem('firstLoad_Settings') : null
  const manualRefreshSettings = typeof window !== 'undefined' ? sessionStorage.getItem('manualRefresh_Settings') : null
  const shouldFetchSettingsData = !firstLoadSettings || manualRefreshSettings === 'true'


  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('manualRefresh_Settings', 'true')
    })

    window.addEventListener('load', () => {
      // Check if this is a manual refresh by checking if lastFetch is set
      if (!sessionStorage.getItem('lastFetch_Settings')) {
        sessionStorage.setItem('manualRefresh_Settings', 'true')
      }
    })
  }


  // user
  const firstLoadUser = typeof window !== 'undefined' ? sessionStorage.getItem('firstLoad_User') : null
  const manualRefreshUser = typeof window !== 'undefined' ? sessionStorage.getItem('manualRefresh_User') : null
  const shouldFetchUserData = !firstLoadUser || manualRefreshUser === 'true'
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('manualRefresh_User', 'true')
    })

    window.addEventListener('load', () => {
      // Check if this is a manual refresh by checking if lastFetch is set
      if (!sessionStorage.getItem('lastFetch_User')) {
        sessionStorage.setItem('manualRefresh_User', 'true')
      }
    })
  }


  // course language
  const firstLoadCourseLanguage = typeof window !== 'undefined' ? sessionStorage.getItem('firstLoad_CourseLanguage') : null
  const manualRefreshCourseLanguage = typeof window !== 'undefined' ? sessionStorage.getItem('manualRefresh_CourseLanguage') : null
  const shouldFetchCourseLanguage = !firstLoadCourseLanguage || manualRefreshCourseLanguage === 'true'

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('manualRefresh_CourseLanguage', 'true')
    })

    window.addEventListener('load', () => {
      // Check if this is a manual refresh by checking if lastFetch is set
      if (!sessionStorage.getItem('lastFetch_CourseLanguage')) {
        sessionStorage.setItem('manualRefresh_CourseLanguage', 'true')
      }
    })
  }

  const fetchSettingsData = async () => {
    try {
      setIsLoading(true);
      const response = await getSettings();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            const data: WebSettings = response.data;
            dispatch(setSettings(data));
            dispatch(setSettingsLastFetch(Date.now()));
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('lastFetch_Settings', Date.now().toString())
            }
          } else {
            console.warn('No settings data found in response');
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch settings");
        }
      } else {
        console.log("response is null in component", response);
        toast.error("Failed to fetch settings");
      }
    } catch (error) {
      extractErrorMessage(error);
      toast.error("An unexpected error occurred while fetching settings");
    } finally {
      setIsLoading(false);
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await getUserDetails();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data) {
            const data: UserDetails = response.data;
            // Update user data in Redux store
            dispatch(setUserData(data));
            dispatch(setUserLastFetch(Date.now()));

            if (isInstructorFromResubmit) {
              dispatch(setIsInstructorFromResubmit(false));
              console.log("from fetchUserData: ", isInstructorFromResubmit);
            }
          } else {
            console.log('No user details data found in response');
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch user details");
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    }
    finally {
      dispatch(setFetchUserDeatils(false));
    }
  };

  // fetch course languages
  const fetchLanguages = async () => {
    try {
      const response = await getCourseLanguages();

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data && response.data.length > 0) {
            const data: CourseLanguage[] = response.data;
            dispatch(setCourseLanguageData(data));
            dispatch(setCourseLanguageLastFetch(Date.now()));
          } else {
            console.log("No course languages found in response");
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch languages");
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    }
  }

  useEffect(() => {
    if (shouldFetchSettingsData) {
      fetchSettingsData()
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('manualRefresh_Settings')
        // Set firstLoad flag to prevent subsequent calls
        sessionStorage.setItem('firstLoad_Settings', 'true')
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      if ((userDiffInMinutes > process.env.NEXT_PUBLIC_LOAD_MIN!) || shouldFetchUserData || isInstructorFromResubmit || shouldFetchUserDeatils) {
        fetchUserData()
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('manualRefresh_User')
          // Set firstLoad flag to prevent subsequent calls
          sessionStorage.setItem('firstLoad_User', 'true')
        }
      }
    }
  }, [token, userDiffInMinutes, isInstructorFromResubmit, shouldFetchUserDeatils])

  useEffect(() => {
    if ((courseLanguageDiffInMinutes > process.env.NEXT_PUBLIC_LOAD_MIN!) || shouldFetchCourseLanguage) {
      fetchLanguages()
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('manualRefresh_CourseLanguage')
        // Set firstLoad flag to prevent subsequent calls
        sessionStorage.setItem('firstLoad_CourseLanguage', 'true')
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--loader-color', process.env.NEXT_PUBLIC_LOADER_COLOR || '#5a5bb5')
    if (settings) {
      document.documentElement.style.setProperty('--primary-color', settings?.data?.system_color || '#5a5bb5')
      document.documentElement.style.setProperty('--primary-light-color', settings?.data?.system_light_colour || '#5A5BB514')
      document.documentElement.style.setProperty('--hover-color', settings?.data?.hover_color || '#4D4E9B')
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

  return (
    isLoading ? <MainLoader /> :
      isMaintenanceMode === "1" ?
        <MaintenanceMode />
        :
        <div>
          {
            settings?.data?.announcement_bar &&
            <Stripe />
          }
          <Header />
          <Suspense fallback={null}>
            <LayoutContent>
              {children}
            </LayoutContent>
          </Suspense>
          <Footer />
        </div>
  );
};

export default Layout;

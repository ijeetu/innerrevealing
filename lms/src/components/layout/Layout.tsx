"use client";
import React, { useEffect, useState, Suspense } from "react";
import Header from "./header/Header";
import Footer from "./Footer";
import Stripe from "./Stripe";
import { useDispatch, useSelector } from "react-redux";
import { setSettings, setSettingsLastFetch, settingsSelector } from "@/redux/reducers/settingsSlice";
import { setUserData, tokenSelector, setUserLastFetch } from "@/redux/reducers/userSlice";
import { getSettings } from "@/utils/api/general/getSettings";
import { getUserDetails } from "@/utils/api/user/getUserDetails";
import { getCourseLanguages } from "@/utils/api/general/getCourseLanguages";
import { setCourseLanguageData, setCourseLanguageLastFetch } from "@/redux/reducers/courseLanguageSlice";
import { fetchUserDeatilsSelector, setFetchUserDeatils } from "@/redux/reducers/helpersReducer";
import MaintenanceMode from "../commonComp/MaintenanceMode";
import LayoutContent from "./LayoutContent";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const settings = useSelector(settingsSelector);
  const token = useSelector(tokenSelector);
  const refreshUser = useSelector(fetchUserDeatilsSelector);
  const [settingsError, setSettingsError] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([getSettings(), getCourseLanguages()]).then(([configuration, languages]) => {
      if (!active) return;
      if (configuration?.data && !configuration.error) {
        dispatch(setSettings(configuration.data));
        dispatch(setSettingsLastFetch(Date.now()));
      } else {
        setSettingsError(true);
      }
      if (languages?.data && !languages.error) {
        dispatch(setCourseLanguageData(languages.data));
        dispatch(setCourseLanguageLastFetch(Date.now()));
      }
    }).catch(() => { if (active) setSettingsError(true); });
    return () => { active = false; };
  }, [dispatch]);

  useEffect(() => {
    if (!token || !refreshUser) return;
    let active = true;
    void getUserDetails().then((response) => {
      if (active && response?.data && !response.error) {
        dispatch(setUserData(response.data));
        dispatch(setUserLastFetch(Date.now()));
      }
    }).finally(() => { if (active) dispatch(setFetchUserDeatils(false)); });
    return () => { active = false; };
  }, [dispatch, token, refreshUser]);

  useEffect(() => {
    document.documentElement.style.setProperty('--loader-color', '#5700b8');
    document.documentElement.style.setProperty('--primary-color', settings.data.system_color || '#5700b8');
    document.documentElement.style.setProperty('--primary-light-color', settings.data.system_light_colour || '#f3ebfa');
    document.documentElement.style.setProperty('--hover-color', settings.data.hover_color || '#450092');
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = '/inner-revealing-logo.png';
    if (!favicon.isConnected) document.head.appendChild(favicon);
  }, [settings]);

  if (settings.data.maintaince_mode === "1") return <MaintenanceMode />;
  return (
    <div>
      {settings.data.announcement_bar && <Stripe />}
      <Header />
      {settingsError && <p role="status" className="container py-3 text-sm">Some site settings are temporarily unavailable. Please try again shortly.</p>}
      <Suspense fallback={null}><LayoutContent>{children}</LayoutContent></Suspense>
      <Footer />
    </div>
  );
};

export default Layout;

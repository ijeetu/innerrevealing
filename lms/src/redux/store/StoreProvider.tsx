"use client";
import { persistor, store } from './index';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { logoutSuccess, setToken, setUserData } from '../reducers/userSlice';
import type { UserDetails } from '@/utils/api/user/getUserDetails';

export function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    let disposed = false;
    let started = false;
    try { localStorage.removeItem('persist:e-lms'); } catch { /* Storage may be disabled. */ }
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (/^(firstLoad_|manualRefresh_|lastFetch_)/.test(key)) sessionStorage.removeItem(key);
      }
    } catch { /* Storage may be disabled. */ }
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          const script = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || '';
          if (script && new URL(script).pathname === '/firebase-messaging-sw.js') void registration.unregister();
        }
      }).catch(() => {});
    }
    const restoreSession = async () => {
      if (started || !persistor.getState().bootstrapped) return;
      started = true;
      const tokenAtStart = store.getState().user.token;
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        const payload = await response.json() as { data?: { user?: UserDetails | null } };
        if (disposed || store.getState().user.token !== tokenAtStart) return;
        if (response.ok && payload.data?.user) {
          store.dispatch(setToken('web-session'));
          store.dispatch(setUserData(payload.data.user));
        } else {
          store.dispatch(logoutSuccess());
        }
      } catch {
        if (!disposed && store.getState().user.token === tokenAtStart) store.dispatch(logoutSuccess());
      }
    };
    const unsubscribe = persistor.subscribe(() => { void restoreSession(); });
    void restoreSession();
    return () => { disposed = true; unsubscribe(); };
  }, []);
  return <Provider store={store}>{children}</Provider>;
}

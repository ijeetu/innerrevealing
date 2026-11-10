"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import { webRequest } from '@/utils/webApi';
import { notificationLink, type CentreNotification, type NotificationPage } from '@/utils/notifications';
export default function NotificationDropdown(_props: { isMobileNav?: boolean }) {
  const loggedIn = useSelector(isLoginSelector);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [error, setError] = useState('');
  const refresh = () => webRequest<NotificationPage>('/api/notifications?per_page=5').then(setData).catch(error => setError(error.message));
  useEffect(() => { if (loggedIn) void refresh(); else setData(null); }, [loggedIn]);
  const read = (item: CentreNotification) => { if (!item.is_read) void webRequest('/api/notifications/mark-read', { method: 'POST', body: { notification_id: item.id } }).then(() => refresh()).catch(() => {}); };
  if (!loggedIn) return null;
  return <details className="relative" onToggle={event => { if (event.currentTarget.open) void refresh(); }}>
    <summary aria-label="Your notifications" className="list-none cursor-pointer p-2 relative"><Bell size={23} />{(data?.unread_count || 0) > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full primaryBg text-white text-[10px] flex items-center justify-center px-1">{data!.unread_count}</span>}</summary>
    <div className="absolute right-0 top-full mt-3 z-50 w-72 sm:w-80 rounded-2xl border borderColor shadow-lg bg-white p-4 space-y-3 max-h-[70vh] overflow-auto">
      <p className="font-semibold">Your updates</p>{error && <p className="text-xs text-red-700">{error}</p>}
      {!data ? <p className="text-sm text-gray-500">Loading updates…</p> : data.data.length ? data.data.map(item => <Link key={item.id} href={notificationLink(item)} onClick={() => read(item)} className={`block rounded-xl p-3 ${item.is_read ? 'bg-gray-50' : 'primaryLightBg'}`}><p className="text-sm font-semibold">{item.title}</p><p className="text-xs leading-5 text-gray-600 mt-1">{item.message}</p><p className="text-[10px] text-gray-500 mt-2">{item.time_ago}</p></Link>) : <p className="text-sm text-gray-500 py-3">You have no updates yet.</p>}
      <Link className="block primaryColor text-sm pt-2 border-t borderColor" href="/notifications">View all updates →</Link>
    </div>
  </details>;
}

"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { isLoginSelector } from '@/redux/reducers/userSlice';
import AccountPanel from '@/components/profile/AccountPanel';
import { webRequest } from '@/utils/webApi';
import { notificationLink, type NotificationPage } from '@/utils/notifications';
export default function NotificationsPanel() {
  const loggedIn = useSelector(isLoginSelector);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [page, setPage] = useState(1), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const refresh = () => webRequest<NotificationPage>(`/api/notifications?page=${page}&per_page=20`).then(setData);
  useEffect(() => { if (loggedIn) void refresh().catch(error => setError(error.message)); }, [loggedIn, page]);
  const read = async (id?: string) => {
    setBusy(true); setError('');
    try { await webRequest(id ? '/api/notifications/mark-read' : '/api/notifications/mark-all-read', { method: 'POST', body: id ? { notification_id: id } : {} }); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update notifications.'); }
    finally { setBusy(false); }
  };
  return <AccountPanel title="Your updates" description="Course access, payment updates and messages from the centre.">
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    {!data ? <p role="status">Loading your updates…</p> : <div className="space-y-5">
      {data.unread_count > 0 && <button onClick={() => read()} disabled={busy} className="primaryColor text-sm underline">Mark all as read</button>}
      {data.data.length ? <ul className="space-y-4">{data.data.map(item => <li key={item.id} className={`rounded-2xl border borderColor p-5 space-y-2 ${item.is_read ? '' : 'primaryLightBg'}`}><Link href={notificationLink(item)} className="font-semibold" onClick={() => { void read(item.id); }}>{item.title}</Link><p className="text-sm text-gray-600 leading-6">{item.message}</p><div className="flex items-center justify-between gap-3"><span className="text-xs text-gray-500">{item.time_ago}</span>{!item.is_read && <button onClick={() => read(item.id)} disabled={busy} className="text-xs primaryColor underline">Mark as read</button>}</div></li>)}</ul> : <p className="py-10 text-center text-gray-500">You have no updates yet.</p>}
      <div className="flex justify-between text-sm">{page > 1 ? <button onClick={() => setPage(page - 1)} className="primaryColor">← Previous</button> : <span />}{page < data.last_page && <button onClick={() => setPage(page + 1)} className="primaryColor">Next →</button>}</div>
    </div>}
  </AccountPanel>;
}

"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { userDataSelector, logoutSuccess } from '@/redux/reducers/userSlice';
import { setCartData } from '@/redux/reducers/cartSlice';
import { logoutLocalSession } from '@/utils/localAuth';

export const learnerNavigation = [
  { href: '/my-learnings', label: 'My learning' },
  { href: '/my-wishlist', label: 'Saved practices' },
  { href: '/cart', label: 'My cart' },
  { href: '/transaction-history', label: 'Purchases' },
  { href: '/notifications', label: 'Your updates' },
  { href: '/edit-profile', label: 'My profile' },
  { href: '/account-security', label: 'Password & security' },
  { href: '/delete-account', label: 'Delete account' },
];

export default function ProfileSidebar(_props: { myLearning?: boolean }) {
  const user = useSelector(userDataSelector) as { name?: string; role?: string };
  const pathname = usePathname(), router = useRouter(), dispatch = useDispatch();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const logout = async () => {
    setBusy(true); setError('');
    try { await logoutLocalSession(); dispatch(logoutSuccess()); dispatch(setCartData(null)); router.push('/'); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not sign out.'); }
    finally { setBusy(false); }
  };
  return <nav aria-label="Your account" className="w-full lg:w-60 lg:shrink-0 rounded-2xl border borderColor bg-white p-3 space-y-1">
    {learnerNavigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={`block rounded-xl px-4 py-3 text-sm ${pathname === item.href ? 'primaryLightBg primaryColor font-semibold' : 'hover:bg-gray-50'}`}>{item.label}</Link>)}
    {user.role && ['admin', 'superadmin'].includes(user.role) && <Link href="/admin" className="block rounded-xl px-4 py-3 text-sm primaryColor font-semibold">Manage learning centre</Link>}
    <button onClick={logout} disabled={busy} className="w-full text-left rounded-xl px-4 py-3 text-sm text-gray-600">{busy ? 'Signing out…' : 'Sign out'}</button>
    {error && <p role="alert" className="text-xs text-red-700 p-3">{error}</p>}
  </nav>;
}

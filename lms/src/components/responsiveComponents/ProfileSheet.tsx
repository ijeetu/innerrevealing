"use client";
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { userDataSelector } from '@/redux/reducers/userSlice';
import { learnerNavigation } from '@/components/profile/ProfileSidebar';
export default function ProfileSheet({ setIsOpen }: { setIsOpen: (open: boolean) => void }) {
  const user = useSelector(userDataSelector) as { name?: string; role?: string };
  return <div className="w-full space-y-3 py-3"><p className="font-semibold">{user.name || 'Your account'}</p><nav aria-label="Your account" className="grid gap-2">{learnerNavigation.filter(item => item.href !== '/delete-account').map(item => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="py-2 text-sm">{item.label}</Link>)}{user.role && ['admin', 'superadmin'].includes(user.role) && <Link href="/instructor/dashboard" onClick={() => setIsOpen(false)} className="py-2 text-sm primaryColor font-semibold">Manage learning centre</Link>}</nav></div>;
}

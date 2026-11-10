"use client";
import { useSelector } from 'react-redux';
import { userDataSelector } from '@/redux/reducers/userSlice';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { UserRound, ChevronDown } from 'lucide-react';
export default function ProfileDropdown(_props: { isInstructor?: boolean }) {
  const user = useSelector(userDataSelector) as { name?: string };
  return <details className="relative group">
    <summary className="list-none cursor-pointer flex items-center gap-2 rounded-full border borderColor px-4 py-2.5 text-sm" aria-label="Your account menu"><UserRound size={18} /><span className="max-w-28 truncate">{user.name || 'Your account'}</span><ChevronDown size={15} /></summary>
    <div className="absolute right-0 top-full pt-3 z-50 w-64 shadow-lg rounded-2xl"><ProfileSidebar /></div>
  </details>;
}

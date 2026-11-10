"use client";
import { useEffect, useState, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import InstructorSidebar from '@/components/instructor/InstructorSidebar';
import DashboardHeader from '@/components/instructor/DashboardHeader';
import DashboardFooter from '@/components/instructor/DashboardFooter';
import { SidebarProvider } from '@/components/ui/sidebar';
import { isRTLSelector } from '@/redux/reducers/languageSlice';
import { setToken, setUserData } from '@/redux/reducers/userSlice';
import { setSettings, setSettingsLastFetch } from '@/redux/reducers/settingsSlice';
import { getSettings } from '@/utils/api/general/getSettings';
import { getTeamMembers, type TeamMemberDataType } from '@/utils/api/instructor/team-member/getTeamMembers';
import { getInvitors } from '@/utils/api/instructor/team-member/getInvitor';
import { isNewMemberAddedSelector, IsLoadMoreTeamMembers, setTeamMemberData, teamMemberDataSelector, teamMemberLimit, teamMemberPage, updateTotalTeamMembers } from '@/redux/instructorReducers/teamMemberSlice';
import { setInvitorsData } from '@/redux/reducers/invitorsSlice';
import type { UserDetails } from '@/utils/api/user/getUserDetails';
import { staffRole } from './staffAccess';
import './instructor.css';

export default function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isRTL = useSelector(isRTLSelector);
  const memberPage = useSelector(teamMemberPage);
  const memberLimit = useSelector(teamMemberLimit);
  const newMemberAdded = useSelector(isNewMemberAddedSelector);
  const appendMembers = useSelector(IsLoadMoreTeamMembers);
  const members = useSelector(teamMemberDataSelector) as TeamMemberDataType[];
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setAccess('checking');
    setError('');
    const restoreStaffSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
        const result = await response.json();
        if (controller.signal.aborted) return;
        const account = result.data?.user as UserDetails | undefined;
        if (!response.ok || !staffRole(account)) {
          setAccess('denied');
          router.replace('/admin/login');
          return;
        }
        dispatch(setToken('web-session'));
        dispatch(setUserData(account!));
        setAccess('allowed');
        const settings = await getSettings();
        if (!controller.signal.aborted && settings && !settings.error && settings.data) {
          dispatch(setSettings(settings.data));
          dispatch(setSettingsLastFetch(Date.now()));
        }
      } catch {
        if (!controller.signal.aborted) setError('We could not check your staff session. Please try again.');
      }
    };
    void restoreStaffSession();
    return () => controller.abort();
  }, [attempt, dispatch, router]);

  useEffect(() => {
    if (access !== 'allowed') return;
    let disposed = false;
    getTeamMembers({ page: memberPage, per_page: memberLimit }).then((response) => {
      if (disposed || !response || response.error) return;
      const rows = response.data?.data || [];
      const next = appendMembers ? [...members, ...rows].filter((member, index, all) => all.findIndex((item) => item.id === member.id) === index) : rows;
      dispatch(setTeamMemberData(next));
      dispatch(updateTotalTeamMembers({ data: response.data?.total || 0 }));
    });
    return () => { disposed = true; };
  }, [access, memberPage, memberLimit, newMemberAdded, dispatch]);

  useEffect(() => {
    if (access !== 'allowed') return;
    let disposed = false;
    getInvitors().then((response) => {
      if (!disposed && response && !response.error) dispatch(setInvitorsData(response.data || []));
    });
    return () => { disposed = true; };
  }, [access, newMemberAdded, dispatch]);

  if (access !== 'allowed') return <div className="ir-instructor-access" role="status">
    {error ? <><p role="alert">{error}</p><button type="button" className="commonBtn" onClick={() => setAttempt((value) => value + 1)}>Try again</button></> : <p>Opening your LMS dashboard…</p>}
  </div>;

  return <SidebarProvider>
    <div className={`ir-instructor-panel flex min-h-screen w-full ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <InstructorSidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <DashboardHeader />
        <main className="flex-1 sectionBg px-4 md:px-6 py-4">{children}</main>
        <DashboardFooter />
      </div>
    </div>
  </SidebarProvider>;
}

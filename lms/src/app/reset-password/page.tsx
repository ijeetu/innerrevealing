import PasswordRecovery from '@/components/auth/PasswordRecovery';
export const metadata = { title: 'Reset password · Inner Revealing', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default function Page() { return <PasswordRecovery reset />; }

export type StaffRole = 'admin' | 'superadmin';
export function staffRole(user: unknown): StaffRole | null {
  if (!user || typeof user !== 'object') return null;
  const role = (user as { role?: unknown }).role;
  return role === 'admin' || role === 'superadmin' ? role : null;
}
export function staffLoginDestination(candidate: string | null): string {
  const fallback = '/instructor/dashboard';
  if (!candidate || candidate.includes('\\')) return fallback;
  try {
    const url = new URL(candidate, 'https://innerrevealing.invalid');
    if (url.origin !== 'https://innerrevealing.invalid' || !/^\/admin(?:\/|$)/.test(url.pathname) || /^\/admin\/login(?:\/|$)/.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}

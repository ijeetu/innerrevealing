'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { if (reset) setToken(new URLSearchParams(window.location.search).get('token') || ''); }, [reset]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    if (reset && password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${reset ? 'reset-password' : 'forgot-password'}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reset ? { token, password, confirm_password: confirm } : { email }) });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.message || 'Please try again.');
      setMessage(result.message); setPassword(''); setConfirm('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  return <Layout><main className='container py-16 min-h-[65vh]'><section className='max-w-md mx-auto rounded-3xl border borderColor bg-white p-8 space-y-6'><div><p className='primaryColor text-xs uppercase tracking-widest mb-2'>Inner Revealing</p><h1 className='text-3xl font-semibold'>{reset ? 'Choose a new password' : 'Recover your account'}</h1><p className='sectionPara mt-3'>{reset ? 'Your link is valid for 30 minutes and can be used once.' : 'Enter the email address you use to sign in.'}</p></div>{message ? <div role='status' className='rounded-xl bg-green-50 p-4 text-green-900'>{message}</div> : <form onSubmit={submit} className='space-y-4'>{!reset ? <label className='block text-sm font-medium'>Email<input className='mt-2 w-full border borderColor rounded-xl p-3' type='email' autoComplete='email' value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} /></label> : <><label className='block text-sm font-medium'>New password<input className='mt-2 w-full border borderColor rounded-xl p-3' type='password' autoComplete='new-password' value={password} onChange={e => setPassword(e.target.value)} required minLength={10} maxLength={128} /></label><label className='block text-sm font-medium'>Confirm password<input className='mt-2 w-full border borderColor rounded-xl p-3' type='password' autoComplete='new-password' value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={10} maxLength={128} /></label></>}{error && <p role='alert' className='text-sm text-red-700'>{error}</p>}<button className='ir-lms-register w-full disabled:opacity-50' disabled={busy}>{busy ? 'Please wait…' : reset ? 'Update password' : 'Request reset link'}</button></form>}<div className='flex justify-between gap-4 text-sm primaryColor'><Link href='/'>Back to website</Link><Link href='/contact-us'>Contact the centre</Link></div></section></main></Layout>;
}

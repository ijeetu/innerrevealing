"use client";
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Faqs from './sections/Faqs';
export default function HelpSupport() {
  return <Layout><main className="commonGap pb-16"><section className="container py-12 md:py-20 space-y-5 max-w-3xl"><p className="primaryColor text-sm uppercase tracking-widest">We are here to help</p><h1 className="text-3xl md:text-5xl font-semibold">A little guidance for your journey.</h1><p className="text-lg leading-8 text-gray-600">Find answers from Inner Revealing below. For help with a course, your account or a payment, send our team an enquiry.</p><Link href="/contact-us" className="commonBtn inline-flex">Contact our team</Link></section><Faqs /></main></Layout>;
}

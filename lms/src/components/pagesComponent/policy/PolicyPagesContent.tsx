"use client";
import Breadcrumb from '@/components/commonComp/Breadcrumb';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Page } from '@/utils/api/general/getPages';

interface PageResponse { error: string | null; message: string | null; data: Page | null; code?: number }

export default function PolicyPagesContent(_props: { pagesResponse: PageResponse | null }) {
  const { slug } = useParams<{ slug: string }>();
  const isAbout = slug === 'about-us';
  const titles: Record<string, string> = {
    'about-us': 'About Inner Revealing',
    'privacy-policy': 'Privacy policy',
    'cookies-policy': 'Cookie policy',
    'terms-and-conditions': 'Terms and conditions',
    'refund-policy': 'Refund policy',
  };
  const title = titles[slug] || 'Information unavailable';
  return (
    <div className="commonGap">
      <Breadcrumb title={title} firstElement={title} />
      <section className="container my-12 max-w-3xl space-y-5">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {isAbout ? <p className="sectionPara">Inner Revealing is a meditation, psychological counselling and healing centre in Kolkata. Explore meditation, yoga and personal growth with our team.</p> :
          <p className="sectionPara">This policy has not been published for this learning website yet. Please contact Inner Revealing for the current information before making a purchase or sharing sensitive information.</p>}
        <Link href="/contact-us" className="commonBtn inline-flex">Contact Inner Revealing</Link>
      </section>
    </div>
  );
}

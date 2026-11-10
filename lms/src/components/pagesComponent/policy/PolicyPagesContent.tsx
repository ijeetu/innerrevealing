"use client";
import Breadcrumb from '@/components/commonComp/Breadcrumb';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RichTextContent from '@/components/commonComp/RichText';

export default function PolicyPagesContent({ page }: { page: { title: string; content: string } | null }) {
  const { slug } = useParams<{ slug: string }>();
  const isAbout = slug === 'about-us';
  const titles: Record<string, string> = {
    'about-us': 'About Inner Revealing',
    'privacy-policy': 'Privacy policy',
    'cookies-policy': 'Cookie policy',
    'terms-and-conditions': 'Terms and conditions',
    'refund-policy': 'Refund policy',
  };
  const title = page?.title || titles[slug] || 'Information unavailable';
  return (
    <div className="commonGap">
      <Breadcrumb title={title} firstElement={title} />
      <section className="container my-12 max-w-3xl space-y-5">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {page ? <div className="whitespace-pre-wrap leading-8"><RichTextContent content={page.content} /></div> : isAbout ? <p className="sectionPara">Inner Revealing is a meditation, psychological counselling and healing centre in Kolkata. Explore meditation, yoga and personal growth with our team.</p> :
          <p className="sectionPara">This policy has not been published for this learning website yet. Please contact Inner Revealing for the current information before making a purchase or sharing sensitive information.</p>}
        <Link href="/contact-us" className="commonBtn inline-flex">Contact Inner Revealing</Link>
      </section>
    </div>
  );
}

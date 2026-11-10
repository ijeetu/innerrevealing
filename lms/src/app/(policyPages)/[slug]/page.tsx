import Layout from "@/components/layout/Layout";
import PolicyPagesContent from "@/components/pagesComponent/policy/PolicyPagesContent";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const pageTitles: Record<string, string> = {
  'about-us': 'About Inner Revealing',
  'privacy-policy': 'Privacy policy',
  'cookies-policy': 'Cookie policy',
  'terms-and-conditions': 'Terms and conditions',
  'refund-policy': 'Refund policy',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${pageTitles[slug] || 'Page unavailable'} · Inner Revealing`, robots: { index: slug === 'about-us', follow: true } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!pageTitles[slug]) notFound();
  return <Layout><PolicyPagesContent pagesResponse={null} /></Layout>;
}

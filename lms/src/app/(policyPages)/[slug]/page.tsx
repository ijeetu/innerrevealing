import Layout from "@/components/layout/Layout";
import PolicyPagesContent from "@/components/pagesComponent/policy/PolicyPagesContent";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { RowDataPacket } from "mysql2/promise";
import { database } from "@/server/db";
import { safeContent } from "@/server/admin/core";

const pageTitles: Record<string, string> = {
  'about-us': 'About Inner Revealing', 'privacy-policy': 'Privacy policy',
  'cookies-policy': 'Cookie policy', 'terms-and-conditions': 'Terms and conditions', 'refund-policy': 'Refund policy',
};
const getPage = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{1,150}$/.test(slug)) return null;
  const [rows] = await database().execute<RowDataPacket[]>("SELECT title,content FROM ir_pages WHERE slug=? AND status='published' LIMIT 1", [slug]);
  return rows[0] ? { title: String(rows[0].title), content: safeContent(rows[0].content, "Page content") } : null;
});
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params, page = await getPage(slug);
  return { title: `${page?.title || pageTitles[slug] || 'Page unavailable'} · Inner Revealing`, robots: { index: !!page || slug === 'about-us', follow: true } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, page = await getPage(slug);
  if (!page && !pageTitles[slug]) notFound();
  return <Layout><PolicyPagesContent page={page} /></Layout>;
}

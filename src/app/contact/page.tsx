import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import ContactPage from "@/components/ContactPage";

const title = "Contact & Book a Free Demo | Inner Revealing";
const description = "Book a free meditation demo in Kalighat, Kolkata or online. Contact Inner Revealing for counselling, coaching, kids meditation and guided sessions.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/contact" }, openGraph: { title, description, url: "/contact" } };

export default async function Contact({ searchParams }: { searchParams: Promise<{ interest?: string | string[] }> }) {
  const query = await searchParams;
  const interest = typeof query.interest === "string" ? query.interest : "free-demo";
  return <SiteShell><ContactPage key={interest} initialInterest={interest} /></SiteShell>;
}

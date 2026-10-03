import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { PageCTA, PageHero } from "@/components/PageHero";
import { AboutContent } from "@/components/AboutMediaPages";

const description = "Discover Inner Revealing Meditation Centre in Kolkata and the journeys of meditation facilitators Hiren Kapadia and Rupa Jhunjhunwala.";
export const metadata: Metadata = {
  title: "About Us | Inner Revealing Meditation Centre",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: "About Us | Inner Revealing Meditation Centre", description, url: "/about", type: "website", locale: "en_IN", siteName: "Inner Revealing Meditation Centre", images: [{ url: "/images/inner-revealing/hiren-kapadia.jpg", width: 1400, height: 1400, alt: "Hiren Kapadia, meditation facilitator" }] },
};

export default function AboutPage() {
  return <SiteShell><PageHero eyebrow="ABOUT INNER REVEALING" title={<>A space to discover<br /><em>yourself.</em></>} description="Behind every session is a simple wish: to help you find the peace, joy and inner power that are already within you." image="/images/inner-revealing/more-session-3.jpg" imageAlt="Hiren Kapadia and meditation participants sharing a joyful moment in nature" note="ROOTED IN KOLKATA. CONNECTED ACROSS INDIA." /><AboutContent /><PageCTA title={<>Your own journey<br /><em>can begin here.</em></>} description="Meet us in a free demo session and take your first step towards meditation." /></SiteShell>;
}

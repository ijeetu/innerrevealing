import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { PageCTA, PageHero } from "@/components/PageHero";
import { GalleryContent } from "@/components/AboutMediaPages";

const description = "Explore photos and videos of Inner Revealing meditation sessions, children's camps, school workshops and community activities in Kolkata.";
export const metadata: Metadata = {
  title: "Gallery | Inner Revealing Meditation Centre",
  description,
  alternates: { canonical: "/gallery" },
  openGraph: { title: "Gallery | Inner Revealing Meditation Centre", description, url: "/gallery", type: "website", locale: "en_IN", siteName: "Inner Revealing Meditation Centre", images: [{ url: "/images/inner-revealing/south-city-school.jpg", width: 1280, height: 720, alt: "Yoga and meditation at South City International School" }] },
};

export default function GalleryPage() {
  return <SiteShell><PageHero eyebrow="OUR GALLERY" title={<>Let your inner flower<br /><em>forever bloom.</em></>} description="Real people, shared moments and the joy of discovering meditation together. Explore glimpses of life at Inner Revealing." image="/images/inner-revealing/south-city-school-frame-3.jpg" imageAlt="Yoga and meditation session for teachers and staff at South City International School" note="MEDITATION. CONNECTION. CELEBRATION." /><GalleryContent /><PageCTA title={<>Be part of<br /><em>our next moment.</em></>} description="Experience a session for yourself. Your first demo session is free." /></SiteShell>;
}

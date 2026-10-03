import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { PageCTA, PageHero } from "@/components/PageHero";
import { TestimonialsContent } from "@/components/AboutMediaPages";

const description = "Hear personal experiences from participants of Inner Revealing meditation sessions, online groups and children's activities.";
export const metadata: Metadata = {
  title: "Testimonials | Inner Revealing Meditation Centre",
  description,
  alternates: { canonical: "/testimonials" },
  openGraph: { title: "Testimonials | Inner Revealing Meditation Centre", description, url: "/testimonials", type: "website", locale: "en_IN", siteName: "Inner Revealing Meditation Centre", images: [{ url: "/images/inner-revealing/testimonial-heart-chakra.jpg", width: 1280, height: 720, alt: "A participant shares her meditation experience" }] },
};

export default function TestimonialsPage() {
  return <SiteShell><PageHero eyebrow="TESTIMONIALS" title={<>A little stillness.<br /><em>So many stories.</em></>} description="Holistically transform yourself. Listen to the people who have joined our sessions as they share their personal experiences." image="/images/inner-revealing/more-session-1.jpg" imageAlt="Hiren Kapadia with participants from the Inner Revealing meditation community" note="EXPERIENCES FROM OUR INNER REVEALING FAMILY." /><TestimonialsContent /><PageCTA title={<>Make room for<br /><em>your own experience.</em></>} description="Begin with a free demo session and discover how meditation feels for you." /></SiteShell>;
}

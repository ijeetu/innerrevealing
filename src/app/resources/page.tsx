import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { PageHero, PageCTA } from "@/components/PageHero";
import { FreeResourceLibrary } from "@/components/ResourcePages";

const title = "Free Meditation Videos, Breathing Guides & Books | Inner Revealing";
const description = "Begin your practice with free guided meditation videos, a pranayama guide, a nine-topic course by Inner Revealing and reading for your inner journey.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resources" },
  openGraph: { title, description, url: "/resources", type: "website", siteName: "Inner Revealing Meditation Centre", locale: "en_IN", images: [{ url: "/images/inner-revealing/meditation-in-nature.jpg", alt: "Inner Revealing meditation in nature" }] },
};

export default function ResourcesPage() {
  return <SiteShell><PageHero eyebrow="FREE RESOURCES" title={<>A little practice.<br /><em>A deeper connection.</em></>} description="A library of meditations, breathing practices, conversations and books to accompany your inner journey. Begin wherever you are." image="/images/inner-revealing/meditation-in-nature.jpg" imageAlt="Inner Revealing group meditation and activities in nature" note="Learn. Explore. Come within." /><FreeResourceLibrary /><PageCTA title={<>Go deeper,<br /><em>with a little guidance.</em></>} description="A free demo session is a gentle way to discover what a guided practice can feel like. We’d love to help you begin." /></SiteShell>;
}

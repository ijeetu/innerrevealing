import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { PageHero, PageCTA } from "@/components/PageHero";
import { RecordedMeditationCatalog } from "@/components/ResourcePages";

const title = "Recorded Meditations with Lifetime Access | Inner Revealing";
const description = "Explore guided recorded meditations for mornings, self love, sleep, breath awareness and inner reflection. Practise at your convenience with lifetime access.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/recorded-meditations" },
  openGraph: { title, description, url: "/recorded-meditations", type: "website", siteName: "Inner Revealing Meditation Centre", locale: "en_IN", images: [{ url: "/images/inner-revealing/pyramid-meditation.jpg", alt: "Meditation at Inner Revealing" }] },
};

export default function RecordedMeditationsPage() {
  return <SiteShell><PageHero eyebrow="RECORDED MEDITATIONS" title={<>Your quiet space.<br /><em>Anytime, anywhere.</em></>} description="Guided meditations for the many moments of your life. Choose a practice, return to it as often as you like, and make stillness part of your everyday." image="/images/inner-revealing/pyramid-meditation.jpg" imageAlt="Meditation practice in a pyramid at Inner Revealing" note="Lifetime access. Your pace." /><RecordedMeditationCatalog /><PageCTA title={<>Find your way <em>within.</em></>} description="Need a little guidance choosing a meditation? Speak with us and find a practice that feels right for you." /></SiteShell>;
}

import type { Metadata } from "next";
import { ServicesOverview } from "@/components/ServicePages";

const title = "Services & Meditation Programs | Inner Revealing";
const description = "Explore counselling, the Inner Reset Program, live and recorded meditations, life coaching, kids meditation and coach training in Kolkata or online.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: { title, description, url: "/services", type: "website", locale: "en_IN", siteName: "Inner Revealing Meditation Centre", images: [{ url: "/logo.png", alt: "Inner Revealing Meditation Centre" }] },
};

export default function ServicesPage() {
  return <ServicesOverview />;
}

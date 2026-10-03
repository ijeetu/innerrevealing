import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/ServicePages";
import { getProgram, programs } from "@/lib/programs";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return programs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return { title: "Program Not Found | Inner Revealing", robots: { index: false, follow: false } };
  const title = `${program.title} | Inner Revealing`;
  const url = `/services/${program.slug}`;
  return {
    title,
    description: program.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: program.description,
      url,
      type: "website",
      locale: "en_IN",
      siteName: "Inner Revealing Meditation Centre",
      images: [{ url: program.heroImage ?? "/logo.png", alt: program.heroImageAlt ?? "Inner Revealing Meditation Centre" }],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();
  return <ServiceDetail program={program} />;
}

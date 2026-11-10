import HomePage from "@/components/home/HomePage";
import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";

interface HomePageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the home page
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();

  return generateMetaInfo({
    page: "home",
    language_code: languageFromQuery || "en",
  });
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();

  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({
    page: "home",
    language_code: languageFromQuery || "en",
  });

  return (
    <>
      <HomePage />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </>
  );
}

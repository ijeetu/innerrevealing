import ContactUs from "@/components/pagesComponent/contact/ContactUs";
import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";

interface ContactPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the contact page
export async function generateMetadata({ searchParams }: ContactPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  return generateMetaInfo({ page: "contact_us", language_code: languageFromQuery || "en" });
}

export default async function Page({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({ page: "contact_us", language_code: languageFromQuery || "en" });
  return (
    <div>
      <ContactUs />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </div>
  );
}

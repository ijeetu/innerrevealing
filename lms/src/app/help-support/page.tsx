import React from "react";
import HelpSupport from "@/components/pagesComponent/help-support/HelpSupport";
import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";

interface HelpSupportPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the help & support page
export async function generateMetadata({ searchParams }: HelpSupportPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  return generateMetaInfo({ page: "help_and_support", language_code: languageFromQuery || "en" });
}

const Page = async ({ searchParams }: HelpSupportPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({ page: "help_and_support", language_code: languageFromQuery || "en" });
  return (
    <div>
      <HelpSupport />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </div>
  );
};

export default Page;

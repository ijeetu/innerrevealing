import CourseSearch from "@/components/pagesComponent/courseSearch/CourseSearch";
import React from "react";
import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";

interface SearchPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the search page
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  return generateMetaInfo({ page: "search_page", language_code: languageFromQuery || "en" });
}

const Page = async ({ searchParams }: SearchPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();

  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({ page: "search_page", language_code: languageFromQuery || "en" });

  return (
    <div>
      <CourseSearch />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </div>
  );
};

export default Page;

import AllCategories from "@/components/pagesComponent/allCategories/AllCategories";
import React from "react";
import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";

interface AllCategoriesPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the all categories page
export async function generateMetadata({ searchParams }: AllCategoriesPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  return generateMetaInfo({ page: "all_categories", language_code: languageFromQuery || "en" });
}

const Page = async ({ searchParams }: AllCategoriesPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({ page: "all_categories", language_code: languageFromQuery || "en" });
  return (
    <div>
      <AllCategories />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </div>
  );
};

export default Page;
import Courses from "@/components/pagesComponent/courses/Courses";
import React from "react";

import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";

interface CoursesPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the courses page
export async function generateMetadata({ searchParams }: CoursesPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  return generateMetaInfo({ page: "courses", language_code: languageFromQuery || "en" });
}

const Page = async ({ searchParams }: CoursesPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();

  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({ page: "courses", language_code: languageFromQuery || "en" });
  return (
    <div>
      <Courses />
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </div>
  );
};

export default Page;
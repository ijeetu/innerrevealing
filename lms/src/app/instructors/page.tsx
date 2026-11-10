import Instructor from "@/components/pagesComponent/instructor/Instructor";
import React, { Suspense } from "react";
import { generateMetaInfo, getSchemaMarkup } from "@/utils/generateMetaInfo";
import { Metadata } from "next";
import JsonLd from "@/components/Schema/JsonLd";
import InstructorPageSkeleton from "@/components/skeletons/InstructorPageSkeleton";

interface InstructorsPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

// Generate metadata for the instructor page
export async function generateMetadata({ searchParams }: InstructorsPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  return generateMetaInfo({ page: "instructor", language_code: languageFromQuery || "en" });
}


const Page = async ({ searchParams }: InstructorsPageProps) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
  // Fetch schema markup for SEO
  const schemaMarkup = await getSchemaMarkup({ page: "instructor", language_code: languageFromQuery || "en" });
  return (
    <div>
      <Suspense fallback={<InstructorPageSkeleton />}>
        <Instructor />
      </Suspense>
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </div>
  )
}

export default Page

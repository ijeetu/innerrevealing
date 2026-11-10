import Layout from "@/components/layout/Layout";
import PolicyPagesContent from "@/components/pagesComponent/policy/PolicyPagesContent";
import React from "react";
import { Metadata } from "next";
import { getPages } from "@/utils/api/general/getPages";
import type { Page } from "@/utils/api/general/getPages";

interface SearchParamsProps {
  lang?: string;
}

// Fetches all pages and filters by slug since API doesn't support slug filtering directly
async function fetchPageData(slug: string, languageCode?: string) {
    try {

        // Fetch pages from the API
        // Note: API doesn't support slug filtering, so we fetch all and filter client-side
        const response = await getPages({
            language_code: languageCode || "en",
            type: slug,
        });

        if (response) {
            // Check if API returned an error (error: true in response)
            if (!response.error) {
                if (response.data && Array.isArray(response.data)) {
                    // Find the page with matching slug
                    const page = response.data.find((p: Page) => p.page_type === slug);
                    if (page) {
                        return { ...response, data: page };
                    } else {
                        console.log(`No page found with slug: ${slug}`);
                        return null;
                    }
                } else {
                    console.log('No page data found in response');
                    return null;
                }
            } else {
                console.log("API error:", response.message);
                return null;
            }
        } else {
            console.log("response is null in fetchPageData", response);
            return null;
        }
    } catch (error) {
        console.error("Error fetching page data:", error);
        return null;
    }
}

// Generate metadata for the policy page
export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<SearchParamsProps>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const { slug } = resolvedParams;
    const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase();
    const pageData = await fetchPageData(slug, languageFromQuery);

    if (!pageData || pageData.error || !pageData.data) {
        return {
            title: process.env.NEXT_PUBLIC_TITEL,
            description: process.env.NEXT_PUBLIC_DESCRIPTION,
            keywords: process.env.NEXT_PUBLIC_KEYWORDS,
        };
    }

    const page = pageData.data as Page;
    return {
        title: page?.meta_title || page?.title || process.env.NEXT_PUBLIC_TITEL,
        description: page?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
        keywords: page?.meta_keywords || process.env.NEXT_PUBLIC_KEYWORDS,
        openGraph: {
            title: page?.meta_title || page?.title || process.env.NEXT_PUBLIC_TITEL,
            description: page?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: page?.og_image ? [page.og_image] : undefined,
        },
    }
}

const Page = async ({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<SearchParamsProps>;
}) => {
    const resolvedParams = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const { slug } = resolvedParams;
    const languageFromQuery = resolvedSearchParams?.lang?.toLowerCase() || "en";

    // Fetch pages and filter by slug
    const pageData = await fetchPageData(slug, languageFromQuery);

    return (
        <Layout>
            <PolicyPagesContent pagesResponse={pageData} />
        </Layout>
    )
}

export default Page

import type { Metadata } from "next";
import { getSeoSettings } from "@/utils/api/general/getSeoSettings";

// Interface for the generateMetadata parameters
interface GenerateMetaInfoParams {
  page: string; // SEO settings page type (e.g., 'home', 'about', 'contact', etc.)
  language_code?: string; // Optional language code (e.g., 'en', 'es', 'fr'), defaults to 'en'
  canonicalUrl?: string; // Optional canonical URL, defaults to base URL
  fallbackTitle?: string; // Optional fallback title
  fallbackDescription?: string; // Optional fallback description
  fallbackKeywords?: string; // Optional fallback keywords
}

// Parameters for fetching schema markup
interface GetSchemaMarkupParams {
  page: string; // SEO settings page type (e.g., 'home', 'about', 'contact', etc.)
  language_code?: string; // Optional language code (e.g., 'en', 'es', 'fr'), defaults to 'en'
}

/**
 * Generate metadata for any page using SEO settings from API
 * Fetches SEO settings from the API and maps them to Next.js Metadata format
 * @param params - Parameters for generating metadata
 * @returns Promise with Next.js Metadata object
 * 
 * Example usage:
 * const metadata = await generateMetaInfo({ page: "home", language_code: "en" });
 */
export async function generateMetaInfo(params: GenerateMetaInfoParams): Promise<Metadata> {
  const {
    page,
    language_code = "en", // Default to English if not provided
    fallbackTitle = process.env.NEXT_PUBLIC_TITLE!,
    fallbackDescription = process.env.NEXT_PUBLIC_DESCRIPTION!,
    fallbackKeywords = process.env.NEXT_PUBLIC_META_KEYWORD!
  } = params;

  let pageType;
  switch (page) {
    case 'courses':
      pageType = 'courses';
      break;
    case 'instructor':
      pageType = 'instructors';
      break;
    case 'help_and_support':
      pageType = 'help-support';
      break;
    case 'all_categories':
      pageType = 'all-categories';
      break;
    case 'search_page':
      pageType = 'home';
      break;
    case 'contact_us':
      pageType = 'contact-us';
      break;
    default:
      pageType = 'home';
      break;
  }

  try {
    // Fetch SEO settings from API with type and language_code
    const response = await getSeoSettings({
      type: page,
      language_code: language_code
    });

    // Check if response exists and is valid
    if (!response || response.error || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn(`No SEO data found for page: ${page} with language: ${language_code}, using fallback metadata`);

      // Return fallback metadata when no SEO data is available
      return {
        title: fallbackTitle,
        description: fallbackDescription,
        keywords: fallbackKeywords,
        openGraph: {
          title: fallbackTitle,
          description: fallbackDescription,
          type: "website",
          siteName: "WRTeam",
          locale: "en_US",
        },
        twitter: {
          card: "summary_large_image",
          title: fallbackTitle,
          description: fallbackDescription,
        },
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: pageType !== 'home'
            ? `${process.env.NEXT_PUBLIC_WEB_URL!}/${pageType}?lang=${language_code}`
            : `${process.env.NEXT_PUBLIC_WEB_URL!}?lang=${language_code}`,
        },
      };
    }

    // Get the first SEO setting from the array (API returns array of settings)
    const seo = response.data[0];

    // Return metadata with SEO data from API
    // Map API field names (meta_title, meta_description, etc.) to Next.js Metadata format
    return {
      title: seo.meta_title || fallbackTitle,
      description: seo.meta_description || fallbackDescription,
      keywords: seo.meta_keywords || fallbackKeywords,
      openGraph: {
        title: seo.meta_title || fallbackTitle,
        description: seo.meta_description || fallbackDescription,
        images: seo.og_image ? [seo.og_image] : [],
        type: "website",
        siteName: "WRTeam",
        locale: seo.language_code === "en" ? "en_US" : `${seo.language_code}_${seo.language_code.toUpperCase()}`,
      },
      twitter: {
        card: "summary_large_image",
        title: seo.meta_title || fallbackTitle,
        description: seo.meta_description || fallbackDescription,
        images: seo.og_image ? [seo.og_image] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: pageType !== 'home'
          ? `${process.env.NEXT_PUBLIC_WEB_URL!}/${pageType}?lang=${language_code}`
          : `${process.env.NEXT_PUBLIC_WEB_URL!}?lang=${language_code}`,
      },
    };

  } catch (error) {
    console.error(`Error generating metadata for page "${page}":`, error);

    // Return fallback metadata on error
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      keywords: fallbackKeywords,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        type: "website",
        siteName: "WRTeam",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: pageType !== 'home'
          ? `${process.env.NEXT_PUBLIC_WEB_URL!}/${pageType}?lang=${language_code}`
          : `${process.env.NEXT_PUBLIC_WEB_URL!}?lang=${language_code}`,
      },
    };
  }
}

/**
 * Get schema markup (JSON-LD) for any page using SEO settings from API
 * Fetches SEO settings and parses the schema_markup JSON string
 * Returns parsed schema markup that can be used with JsonLd component
 * @param params - Parameters for fetching schema markup
 * @returns Promise with parsed schema markup object or null
 * 
 * Example usage:
 * const schemaMarkup = await getSchemaMarkup({ page: "home", language_code: "en" });
 * {schemaMarkup && <JsonLd data={schemaMarkup as unknown as SchemaJsonLdType} />}
 */
export async function getSchemaMarkup(
  params: GetSchemaMarkupParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any> | null> {
  const {
    page,
    language_code = "en", // Default to English if not provided
  } = params;

  try {
    // Fetch SEO settings from API with type and language_code
    const response = await getSeoSettings({
      type: page,
      language_code: language_code,
    });

    // Check if response exists and is valid
    if (
      !response ||
      response.error ||
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      console.warn(
        `No SEO data found for page: ${page} with language: ${language_code}, no schema markup available`
      );
      return null;
    }

    // Get the first SEO setting from the array (API returns array of settings)
    const seo = response.data[0];

    // Parse schema_markup JSON string if available
    // The schema_markup from API is a JSON string that needs to be parsed
    if (seo.schema_markup) {
      try {
        // Parse the JSON string to get the schema markup object
        const parsedSchema = JSON?.parse(seo?.schema_markup || "");
        return parsedSchema;
      } catch (parseError) {
        console.warn(
          `Failed to parse schema_markup for page: ${page}`,
          parseError
        );
        return null;
      }
    }

    // No schema markup available
    return null;
  } catch (error) {
    console.error(`Error fetching schema markup for page "${page}":`, error);
    return null;
  }
}

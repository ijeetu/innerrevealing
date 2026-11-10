import type { Metadata } from "next";

interface GenerateMetaInfoParams {
  page: string;
  language_code?: string;
  canonicalUrl?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackKeywords?: string;
}

const pages: Record<string, { path: string; title: string }> = {
  home: { path: "", title: "Inner Revealing · Meditation, Yoga & Personal Growth" },
  courses: { path: "/courses", title: "Courses & Practices · Inner Revealing" },
  instructor: { path: "/instructors", title: "Teachers · Inner Revealing" },
  help_and_support: { path: "/help-support", title: "Help & Support · Inner Revealing" },
  all_categories: { path: "/all-categories", title: "Practice Areas · Inner Revealing" },
  search_page: { path: "/courses", title: "Find Your Practice · Inner Revealing" },
  contact_us: { path: "/contact-us", title: "Contact · Inner Revealing" },
};

export async function generateMetaInfo(params: GenerateMetaInfoParams): Promise<Metadata> {
  const page = pages[params.page] || pages.home;
  const title = params.fallbackTitle || page.title;
  const description = params.fallbackDescription || process.env.NEXT_PUBLIC_DESCRIPTION ||
    "Explore meditation, yoga and personal growth with Inner Revealing Meditation Centre in Kolkata.";
  const origin = process.env.NEXT_PUBLIC_WEB_URL || "https://ir.vishwalabs.com";
  const canonical = params.canonicalUrl || new URL(page.path || "/", origin).href;
  return {
    title,
    description,
    keywords: params.fallbackKeywords || process.env.NEXT_PUBLIC_KEYWORDS,
    alternates: { canonical },
    openGraph: { title, description, type: "website", siteName: "Inner Revealing", locale: "en_IN", url: canonical },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// The centre can add structured data after supplying verified schema content.
export async function getSchemaMarkup(_params: { page: string; language_code?: string }): Promise<Record<string, unknown> | null> {
  return null;
}

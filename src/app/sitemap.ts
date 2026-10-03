import type { MetadataRoute } from "next";
import { programs } from "@/lib/programs";
import { siteLinks } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...siteLinks.map((link) => link.href), ...programs.map((program) => `/services/${program.slug}`)].map((path) => ({
    url: `https://www.innerrevealing.com${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path.startsWith("/services/") ? .7 : .8,
  }));
}

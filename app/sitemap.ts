import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://organnical.pe";

  const blogRoutes = getAllSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogRoutes,
    { url: `${base}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/registro"],
    },
    sitemap: "https://organnical.pe/sitemap.xml",
  };
}

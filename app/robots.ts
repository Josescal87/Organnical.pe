import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/agendar", "/login", "/registro", "/recuperar-password", "/nueva-password"],
    },
    sitemap: "https://organnical.pe/sitemap.xml",
  };
}

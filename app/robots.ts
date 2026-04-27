import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  if (host.startsWith("sami.")) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://sami.organnical.pe/sitemap.xml",
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/agendar", "/login", "/registro", "/recuperar-password", "/nueva-password"],
    },
    sitemap: "https://organnical.pe/sitemap.xml",
  };
}

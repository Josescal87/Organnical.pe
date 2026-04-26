import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe";
const SPECIALTIES = ["sueno", "dolor-cronico", "ansiedad", "salud-femenina"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogRoutes = getAllSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const specialtyRoutes = SPECIALTIES.map((slug) => ({
    url: `${BASE}/especialidades/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const supabase = await createClient();
  const { data: productos } = await supabase
    .from("productos")
    .select("sku")
    .eq("activo", true);

  const catalogoRoutes = (productos ?? []).map(({ sku }) => ({
    url: `${BASE}/catalogo/${sku}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/catalogo`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...catalogoRoutes,
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...specialtyRoutes,
    ...blogRoutes,
    { url: `${BASE}/preguntas-frecuentes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/devoluciones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacidad`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/libro-reclamaciones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/verificar-receta`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}

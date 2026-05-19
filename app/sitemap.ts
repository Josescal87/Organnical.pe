import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://organnical.pe";
const SPECIALTIES = ["sueno", "dolor-cronico", "ansiedad", "salud-femenina"];

async function getProductSlugs(): Promise<string[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("productos")
      .select("slug_publico")
      .eq("activo", true)
      .not("slug_publico", "is", null);
    return (data ?? []).map((r) => r.slug_publico as string).filter(Boolean);
  } catch {
    return [];
  }
}

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

  const productSlugs = await getProductSlugs();
  const productRoutes = productSlugs.map((slug) => ({
    url: `${BASE}/productos/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/tienda`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...specialtyRoutes,
    ...productRoutes,
    ...blogRoutes,
    { url: `${BASE}/preguntas-frecuentes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/devoluciones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacidad`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/libro-reclamaciones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/verificar-receta`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}

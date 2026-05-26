import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.mercadopago.com https://*.mlstatic.com https://unpkg.com https://connect.facebook.net https://*.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.mlstatic.com",
      "font-src 'self' https://fonts.gstatic.com https://*.mlstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://api.whereby.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://www.facebook.com https://*.clarity.ms",
      "frame-src https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://*.whereby.com https://meet.google.com https://www.facebook.com",
      "media-src 'self' blob: https://jeomfjulczuimrmonmom.supabase.co",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // ── Catálogo store viejo: ahora se sirve 410 Gone vía route handlers
      // en app/{producto,product-tag,product-category,c,marca,catalogos-post}/[...slug]/route.ts
      // Antes redirigía con 301 a "/" — Google lo leía como soft-404 y desindexaba lento.
      // 410 acelera la desindexación limpia. Decisión 2026-05-26: descontinuar cannabis SEO.
      //
      // Old WordPress core files (Google ya los entiende como junk; mantenemos redirect simple)
      { source: "/wp-content/:path*",        destination: "/",          permanent: true },
      { source: "/wp-admin/:path*",          destination: "/",          permanent: true },
      { source: "/wp-includes/:path*",       destination: "/",          permanent: true },
      { source: "/wp-json/:path*",           destination: "/",          permanent: true },
      { source: "/wp-login.php",             destination: "/",          permanent: true },
      { source: "/wp-cron.php",              destination: "/",          permanent: true },
      // Old WordPress blog taxonomy → blog (destino legítimo, OK)
      { source: "/tag/:path*",               destination: "/blog",      permanent: true },
      { source: "/category/:path*",          destination: "/blog",      permanent: true },
      // Old WordPress patient/doctor profile pages → /cuenta (destino legítimo)
      { source: "/pacientes/:path*",         destination: "/cuenta",    permanent: true },
      // Old citas-médicas URLs → /agendar (destino legítimo)
      { source: "/cita-medica",              destination: "/agendar",   permanent: true },
      { source: "/citas-medicas",            destination: "/agendar",   permanent: true },
      { source: "/citas-medicas/:path*",     destination: "/agendar",   permanent: true },
      // Old blog post URLs (migrated slugs → current blog)
      { source: "/que-son-los-cannabinoides",                                                               destination: "/blog",      permanent: true },
      { source: "/inteligencia-artificial-en-la-medicina-del-peru-una-nueva-era-de-salud-personalizada",    destination: "/blog",      permanent: true },
      // Old privacy policy URL → current
      { source: "/politicas-privacidad",     destination: "/privacidad", permanent: true },
      // Dashboard médico/paciente → nueva ruta unificada /cuenta
      { source: "/dashboard",                destination: "/cuenta",     permanent: true },
      { source: "/dashboard/paciente",       destination: "/cuenta",     permanent: true },
      { source: "/dashboard/paciente/:path*", destination: "/cuenta",    permanent: true },
      // Catálogo antiguo → tienda
      { source: "/catalogo",                 destination: "/tienda",     permanent: true },
      { source: "/catalogo/:path*",          destination: "/tienda",     permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "jeomfjulczuimrmonmom.supabase.co",
      },
      {
        protocol: "https",
        hostname: "organnical.pe",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "organnical",
  project: "javascript-nextjs",
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
});

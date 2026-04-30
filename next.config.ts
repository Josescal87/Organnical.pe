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
      "media-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old WordPress product pages → current catalog
      { source: "/producto/:path*",          destination: "/catalogo",  permanent: true },
      { source: "/tienda/:path*",            destination: "/catalogo",  permanent: true },
      { source: "/product-tag/:path*",       destination: "/catalogo",  permanent: true },
      { source: "/product-category/:path*",  destination: "/catalogo",  permanent: true },
      { source: "/c/:path*",                 destination: "/catalogo",  permanent: true },
      // Old WordPress checkout
      { source: "/checkout",                 destination: "/catalogo",  permanent: true },
      // Old WordPress-specific pages
      { source: "/cita-medica",              destination: "/",          permanent: true },
      { source: "/prescripciones-antiguas",  destination: "/catalogo",  permanent: true },
      { source: "/sisven-2-0",               destination: "/",          permanent: true },
      { source: "/themencode-pdf-viewer-sc", destination: "/",          permanent: true },
      { source: "/suscripcion-al-erp",       destination: "/",          permanent: true },
      // Old WordPress core files (prevent 404 noise)
      { source: "/wp-content/:path*",        destination: "/",          permanent: true },
      { source: "/wp-admin/:path*",          destination: "/",          permanent: true },
      { source: "/wp-login.php",             destination: "/",          permanent: true },
      { source: "/wp-cron.php",              destination: "/",          permanent: true },
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

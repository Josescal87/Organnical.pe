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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.mercadopago.com https://*.mlstatic.com https://unpkg.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.mlstatic.com",
      "font-src 'self' https://fonts.gstatic.com https://*.mlstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://api.whereby.com https://live-mt-server.wati.io https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://www.facebook.com",
      "frame-src https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://*.whereby.com https://meet.google.com https://www.facebook.com",
      "media-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
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

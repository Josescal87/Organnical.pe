import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import CookieBanner from "@/components/CookieBanner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Organnical — Medicina Integrativa Online · Perú",
  description:
    "Consultas médicas especializadas en bienestar y tratamientos personalizados basados en evidencia. Sueño, dolor crónico, ansiedad y salud femenina. Agenda tu teleconsulta hoy.",
  openGraph: {
    title: "Organnical — Medicina que te escucha de verdad",
    description:
      "Telemedicina integrativa en Perú. Médicos certificados MINSA. Primera cita en menos de 48 horas.",
    url: "https://organnical.pe",
    siteName: "Organnical",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "https://organnical.pe/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Organnical — Medicina Integrativa Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Organnical — Medicina Integrativa Online · Perú",
    description:
      "Telemedicina integrativa en Perú. Médicos certificados MINSA. Primera cita en menos de 48h.",
    images: ["https://organnical.pe/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": "https://organnical.pe/#business",
      name: "Organnical",
      url: "https://organnical.pe",
      logo: "https://organnical.pe/logo.png",
      description: "Plataforma de telemedicina integrativa en Perú. Médicos certificados MINSA. Sueño, dolor crónico, ansiedad y salud femenina.",
      telephone: "+51952476574",
      email: "reservas@organnical.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. La Mar 750, Of. 510",
        addressLocality: "Miraflores",
        addressRegion: "Lima",
        postalCode: "15074",
        addressCountry: "PE",
      },
      geo: { "@type": "GeoCoordinates", latitude: -12.1211, longitude: -77.0282 },
      openingHours: "Mo-Fr 09:00-18:00",
      priceRange: "S/.",
      currenciesAccepted: "PEN",
      paymentAccepted: "Tarjeta de crédito, débito, billetera digital",
      availableService: [
        { "@type": "MedicalTherapy", name: "Teleconsulta médica general" },
        { "@type": "MedicalTherapy", name: "Manejo de trastornos del sueño" },
        { "@type": "MedicalTherapy", name: "Tratamiento de dolor crónico" },
        { "@type": "MedicalTherapy", name: "Manejo de ansiedad" },
        { "@type": "MedicalTherapy", name: "Salud femenina y hormonal" },
      ],
      sameAs: ["https://www.instagram.com/organnical"],
    },
    {
      "@type": "MedicalClinic",
      "@id": "https://organnical.pe/#clinic",
      name: "Organnical — Clínica de Telemedicina",
      url: "https://organnical.pe",
      medicalSpecialty: ["GeneralPractice", "InternalMedicine"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#1a1a1a]">
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster position="top-right" richColors closeButton />
        <CookieBanner />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

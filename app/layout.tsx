import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Nunito } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "organnical — medicina integrativa",
  description:
    "Consultas médicas especializadas en bienestar y tratamientos personalizados basados en evidencia. Agenda tu teleconsulta hoy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}

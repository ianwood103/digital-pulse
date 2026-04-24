import type { Metadata, Viewport } from "next";
import { EB_Garamond, DM_Mono } from "next/font/google";
import PortfolioEffects from "./portfolio-effects";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Ian Wood",
  description:
    "A living snapshot of Ian Wood's work, writing, reading, running, and current projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${dmMono.variable}`}>
      <body>
        <PortfolioEffects />
        {children}
      </body>
    </html>
  );
}

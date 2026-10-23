import type { Metadata } from "next";
import {
  Archivo,
  Barlow_Condensed,
  Cormorant_Garamond,
  IBM_Plex_Sans,
  Outfit,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nav = Space_Grotesk({
  variable: "--font-nav",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const product = Archivo({
  variable: "--font-product",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const admin = IBM_Plex_Sans({
  variable: "--font-admin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const kicker = Barlow_Condensed({
  variable: "--font-kicker",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Da-Liquorstore",
    template: "%s · Da-Liquorstore",
  },
  description: "Fine spirits and wine — hold online, pick up in store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${nav.variable} ${product.variable} ${admin.variable} ${kicker.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

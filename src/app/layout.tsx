import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pinkpepper.io"),
  title: "PinkPepper | AI Food Safety Assistant for EU & UK Businesses",
  description:
    "PinkPepper helps food businesses generate HACCP plans, SOPs, monitoring logs, allergen documentation, and traceability procedures.",
  icons: {
    icon: [
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/logo/favicon-128x128.png", sizes: "128x128", type: "image/png" },
    ],
    apple: [
      { url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/logo/favicon.ico"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}

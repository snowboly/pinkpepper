import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
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
      { url: "/logo/LogoV2.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/LogoV2.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/logo/LogoV2.png", sizes: "1024x1024", type: "image/png" }],
    shortcut: ["/logo/LogoV2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { CookieBanner } from "@/components/site/CookieBanner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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
  alternates: {
    canonical: "https://pinkpepper.io",
  },
  title: "PinkPepper | AI Food Safety Assistant for EU & UK Businesses",
  description:
    "PinkPepper helps food businesses generate HACCP plans, SOPs, monitoring logs, allergen documentation, and traceability procedures.",
  openGraph: {
    title: "PinkPepper | AI Food Safety Assistant for EU & UK Businesses",
    description:
      "Generate HACCP plans, SOPs, allergen docs, and audit-ready compliance documentation with an AI trained for EU and UK food safety law.",
    url: "https://pinkpepper.io",
    siteName: "PinkPepper",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PinkPepper — AI Food Safety Assistant for EU & UK Businesses",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PinkPepper | AI Food Safety Assistant",
    description:
      "Generate HACCP plans, SOPs, and allergen docs with an AI trained for EU & UK food safety compliance.",
    images: ["/og-image.png"],
  },
  manifest: "/logo/site.webmanifest",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PinkPepper",
  url: "https://pinkpepper.io",
  logo: "https://pinkpepper.io/logo/android-chrome-512x512.png",
  description:
    "AI food safety assistant for EU and UK food businesses. Generate HACCP plans, allergen documentation, SOPs, and audit-ready compliance packs.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@pinkpepper.io",
    contactType: "customer support",
    availableLanguage: ["English", "German", "French", "Spanish", "Portuguese", "Italian"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PinkPepper",
  url: "https://pinkpepper.io",
  description:
    "Specialised AI food safety assistant for HACCP plans, allergen management, SOP generation, and EU/UK compliance documentation.",
  inLanguage: ["en", "de", "fr", "es", "pt", "it"],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

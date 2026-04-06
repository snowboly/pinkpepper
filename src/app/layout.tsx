import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieBanner } from "@/components/site/CookieBanner";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pinkpepper.io"),
  alternates: {
    canonical: "https://www.pinkpepper.io",
  },
  title: "PinkPepper | AI HACCP & Food Safety Software for EU & UK Businesses",
  description:
    "Generate HACCP plans, allergen records, SOPs & audit-ready documents in minutes. AI food safety software grounded in 35+ EU & UK regulations. Start free.",
    openGraph: {
      title: "PinkPepper | AI HACCP & Food Safety Software for EU & UK Businesses",
      description:
        "Generate HACCP plans, allergen records, SOPs & audit-ready documents in minutes. Save 10+ hours/week on compliance. Grounded in 35+ EU & UK regulations.",
      url: "https://www.pinkpepper.io",
    siteName: "PinkPepper",
    images: [
      {
        url: "https://www.pinkpepper.io/hero-bg.jpg",
        width: 5184,
        height: 3456,
        alt: "PinkPepper - AI Food Safety Compliance Software for EU and UK Businesses",
      },
    ],
    type: "website",
  },
    twitter: {
      card: "summary_large_image",
      title: "PinkPepper | AI HACCP & Food Safety Software — EU & UK",
      description:
        "HACCP plans, allergen records, SOPs & audit-ready documents in minutes. AI food safety software grounded in 35+ EU & UK regulations. Try free.",
      images: ["https://www.pinkpepper.io/hero-bg.jpg"],
  },
  manifest: "/logo/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/logo/favicon-128x128.png", sizes: "128x128", type: "image/png" },
    ],
    apple: [{ url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/logo/favicon.ico"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PinkPepper",
  url: "https://www.pinkpepper.io",
  logo: "https://www.pinkpepper.io/logo/android-chrome-512x512.png",
  description:
    "AI food safety compliance software for EU and UK food businesses. Generate HACCP plans, allergen documentation, SOPs, and audit-ready compliance packs.",
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
  url: "https://www.pinkpepper.io",
  description:
    "AI food safety compliance software for HACCP plans, allergen management, SOP generation, and EU/UK compliance documentation.",
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

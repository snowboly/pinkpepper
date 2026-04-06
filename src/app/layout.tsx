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
  metadataBase: new URL("https://pinkpepper.io"),
  alternates: {
    canonical: "https://pinkpepper.io",
  },
  title: "PinkPepper | AI Food Safety Compliance Software for EU & UK Businesses",
  description:
    "PinkPepper is AI food safety compliance software for EU and UK food businesses that need HACCP plans, allergen documentation, SOPs, audit prep, and food safety records.",
  openGraph: {
    title: "PinkPepper | AI Food Safety Compliance Software for EU & UK Businesses",
    description:
      "Generate HACCP plans, allergen documentation, SOPs, and audit-ready compliance records with AI food safety compliance software built for EU and UK businesses.",
    url: "https://pinkpepper.io",
    siteName: "PinkPepper",
    images: [
      {
        url: "/logo/LogoV3.png",
        width: 512,
        height: 512,
        alt: "PinkPepper - AI Food Safety Compliance Software for EU and UK Businesses",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PinkPepper | AI Food Safety Compliance Software",
    description:
      "Generate HACCP plans, allergen documentation, SOPs, and audit-ready records with AI food safety compliance software for EU and UK businesses.",
    images: ["/logo/LogoV3.png"],
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
  url: "https://pinkpepper.io",
  logo: "https://pinkpepper.io/logo/android-chrome-512x512.png",
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
  url: "https://pinkpepper.io",
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

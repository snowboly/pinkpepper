import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieBanner } from "@/components/site/CookieBanner";
import { LegalSiteFooter, LegalSiteHeader, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { RouteChrome } from "@/components/site/RouteChrome";
import { PUBLIC_PATHNAME_HEADER, shouldInjectGoogleAnalytics } from "@/lib/google-analytics";
import { getCspNonce } from "@/lib/security/csp";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E11D48",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pinkpepper.io"),
  alternates: {
    canonical: "https://pinkpepper.io",
  },
  title: "AI Food Safety Consultant for EU & UK Businesses | PinkPepper",
  description:
    "Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.",
  openGraph: {
    title: "AI Food Safety Consultant for EU & UK Businesses | PinkPepper",
    description:
      "Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.",
    url: "https://pinkpepper.io",
    siteName: "PinkPepper",
    locale: "en_GB",
    images: [
      {
        url: "https://pinkpepper.io/social-card.png",
        width: 1200,
        height: 630,
        alt: "PinkPepper - AI Food Safety Consultant for HACCP and compliance",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Food Safety Consultant for EU & UK Businesses | PinkPepper",
    description:
      "Get AI-powered food safety support with optional human consultant review. Create HACCP documents, SOPs, allergen records, and compliance workflows for EU and UK food businesses.",
    images: ["https://pinkpepper.io/social-card.png"],
  },
  manifest: "/logo/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
    "AI food safety consultant for EU and UK food businesses, with optional human food safety consultant support for HACCP documents, SOPs, allergen records, and compliance workflows.",
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
    "AI food safety consultant for EU and UK food businesses, combining fast AI drafting with optional human food safety consultant review for higher-risk work.",
  inLanguage: ["en", "de", "fr", "pt"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://pinkpepper.io/articles?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const nonce = await getCspNonce();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const requestHeaders = await headers();
  const pathname = requestHeaders.get(PUBLIC_PATHNAME_HEADER) ?? "/";
  const shouldRenderGoogleAnalytics = Boolean(measurementId) && shouldInjectGoogleAnalytics(pathname);

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <RouteChrome
            legalFooter={<LegalSiteFooter />}
            legalHeader={<LegalSiteHeader />}
            siteFooter={<SiteFooter />}
            siteHeader={<SiteHeader />}
          >
            {children}
          </RouteChrome>
          <CookieBanner
            nonce={nonce}
            googleAnalyticsMeasurementId={shouldRenderGoogleAnalytics ? measurementId : undefined}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieBanner } from "@/components/site/CookieBanner";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
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
  title: "PinkPepper | AI Food Safety Consultant for HACCP & Compliance",
  description:
    "AI food safety consultant for HACCP and compliance. Generate food safety documents, build HACCP paperwork, and get answers to food safety questions.",
  openGraph: {
    title: "PinkPepper | AI Food Safety Consultant for HACCP & Compliance",
    description:
      "AI food safety consultant for HACCP and compliance. Generate food safety documents, build HACCP paperwork, and get answers to food safety questions.",
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
    title: "PinkPepper | AI Food Safety Consultant for HACCP & Compliance",
    description:
      "AI food safety consultant for HACCP and compliance. Generate food safety documents, build HACCP paperwork, and get answers to food safety questions.",
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
    "AI food safety consultant for food businesses. Generate HACCP documents, allergen paperwork, SOPs, and answers to food safety compliance questions.",
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
    "AI food safety consultant for HACCP plans, food safety documents, compliance questions, and EU/UK compliance workflows.",
  inLanguage: ["en", "de", "fr", "es", "pt", "it"],
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
          <SiteHeader />
          {children}
          <SiteFooter />
          <CookieBanner
            nonce={nonce}
            googleAnalyticsMeasurementId={shouldRenderGoogleAnalytics ? measurementId : undefined}
          />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

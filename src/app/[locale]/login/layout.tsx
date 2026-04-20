import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const loginMetadata = {
  title: "Log In | PinkPepper",
  description:
    "Sign in to your PinkPepper account to access your food safety compliance documents, HACCP plans, and audit workflows.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return {
    ...buildPublicMetadata(locale, "/login", loginMetadata),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LocalizedLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

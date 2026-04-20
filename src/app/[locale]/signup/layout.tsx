import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const signupMetadata = {
  title: "Start Free | PinkPepper - AI Food Safety Assistant",
  description:
    "Create a free PinkPepper account and start generating HACCP plans, allergen documents, and audit-ready compliance packs for your EU or UK food business.",
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
    ...buildPublicMetadata(locale, "/signup", signupMetadata),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LocalizedSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

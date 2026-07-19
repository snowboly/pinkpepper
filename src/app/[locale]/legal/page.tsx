import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalHub } from "@/components/legal/LegalHub";
import { getLegalAlternates, isLegalLocale } from "@/lib/legal/routes";

export function generateStaticParams() { return ["fr", "de", "es", "it", "pt"].map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLegalLocale(locale) || locale === "en") return {}; return { title: "Legal Policies | PinkPepper", description: "Localized PinkPepper legal policies.", alternates: { canonical: "https://pinkpepper.io/" + locale + "/legal", languages: getLegalAlternates() }, robots: { index: false, follow: true } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLegalLocale(locale) || locale === "en") notFound(); return <LegalHub locale={locale} />; }

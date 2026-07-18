import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPolicyPage } from "@/components/legal/LegalPolicyPage";
import { getLegalDocument } from "@/lib/legal/content";
import { LEGAL_POLICY_SLUGS } from "@/lib/legal/config";
import { getLegalAlternates, isLegalLocale } from "@/lib/legal/routes";
import type { LegalPolicySlug } from "@/lib/legal/types";

function isPolicy(value: string): value is LegalPolicySlug { return (LEGAL_POLICY_SLUGS as readonly string[]).includes(value); }
export function generateStaticParams() { return ["fr", "de", "es", "it", "pt"].flatMap((locale) => LEGAL_POLICY_SLUGS.map((policy) => ({ locale, policy }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; policy: string }> }): Promise<Metadata> { const { locale, policy } = await params; if (!isLegalLocale(locale) || locale === "en" || !isPolicy(policy)) return {}; const document = getLegalDocument(policy, locale); return { title: document.title + " | PinkPepper", description: document.description, alternates: { canonical: "https://pinkpepper.io/" + locale + "/legal/" + policy, languages: getLegalAlternates(policy) }, robots: ["dpa", "refund", "cookies", "acceptable-use"].includes(policy) ? { index: false, follow: true } : { index: true, follow: true } }; }
export default async function Page({ params }: { params: Promise<{ locale: string; policy: string }> }) { const { locale, policy } = await params; if (!isLegalLocale(locale) || locale === "en" || !isPolicy(policy)) notFound(); return <LegalPolicyPage document={getLegalDocument(policy, locale)} />; }

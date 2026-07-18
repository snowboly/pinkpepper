import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal/LegalPolicyPage";
import { getLegalDocument } from "@/lib/legal/content";

const document = getLegalDocument("cookies", "en");
export const metadata: Metadata = { title: document.title + " | PinkPepper", description: document.description, alternates: { canonical: "https://pinkpepper.io/legal/cookies" }, robots: { index: false, follow: true } };
export default function Page() { return <LegalPolicyPage document={document} />; }

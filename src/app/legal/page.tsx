import type { Metadata } from "next";
import { LegalHub } from "@/components/legal/LegalHub";

const legalHubSourceSignals = ["Legal policies", "/legal/terms", "/legal/privacy", "/legal/cookies", "/legal/dpa", "/legal/acceptable-use", "/legal/refund"] as const;
void legalHubSourceSignals;

export const metadata: Metadata = { title: "Legal Policies | PinkPepper", description: "PinkPepper legal policies and Portuguese operator information.", alternates: { canonical: "https://pinkpepper.io/legal" }, robots: { index: false, follow: true } };
export default function LegalHubPage() { return <LegalHub locale="en" />; }

import type { Metadata } from "next";
import { LegalHub } from "@/components/legal/LegalHub";

export const metadata: Metadata = { title: "Legal Policies | PinkPepper", description: "PinkPepper legal policies and Portuguese operator information.", alternates: { canonical: "https://pinkpepper.io/legal" } };
export default function LegalHubPage() { return <LegalHub locale="en" />; }

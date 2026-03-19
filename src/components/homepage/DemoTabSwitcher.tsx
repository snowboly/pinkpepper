"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type DemoMode = "haccp" | "allergen" | "audit";

const demoMap: Record<
  DemoMode,
  {
    label: string;
    prompt: string;
    rawNotes: string;
    title: string;
    checklist: string[];
    tags: string[];
  }
> = {
  haccp: {
    label: "HACCP (Cafe)",
    prompt: "Create a HACCP plan for a 40-seat cafe serving soups, sandwiches, and chilled desserts.",
    rawNotes: "Fridge checks happen daily. Team cools soups and stores desserts in display fridge.",
    title: "Audit-ready HACCP controls",
    checklist: [
      "CCP: Chilled storage at 5 C or below",
      "Monitoring: Every 4 hours + opening and closing checks",
      "Corrective action: Isolate batch, assess exposure time, discard if unsafe, log incident",
      "Records: Temperature log, corrective action register, calibration checks",
    ],
    tags: ["EC 852/2004", "FSA Guidance", "Audit-ready"],
  },
  allergen: {
    label: "Allergen Matrix",
    prompt: "Create an allergen matrix for bakery products with cross-contact controls.",
    rawNotes: "Nut toppings used at the pastry station. Shared utensils between plain and nut products.",
    title: "Allergen cross-contact controls",
    checklist: [
      "Separate utensils and storage bins for allergen ingredients",
      "Color-coded prep tools and verified end-of-shift sanitation",
      "Label verification before service with supervisor sign-off",
      "Daily allergen training reminder for front-of-house handoff",
    ],
    tags: ["EU 1169/2011", "Kitchen SOP"],
  },
  audit: {
    label: "Audit Pack",
    prompt: "Prepare an audit-ready checklist for monthly internal food safety review.",
    rawNotes: "Need one place for SOP files, temperature logs, and open corrective actions.",
    title: "Inspection checklist and evidence set",
    checklist: [
      "SOP evidence bundle with latest revision dates",
      "Temperature record spot-check with signed verifier",
      "Corrective action table with owner, due date, and closure proof",
      "Traceability sample run with supplier and batch references",
    ],
    tags: ["BRCGS Ready", "Traceability"],
  },
};

export function DemoTabSwitcher() {
  const [demoMode, setDemoMode] = useState<DemoMode>("haccp");
  const demo = demoMap[demoMode];

  return (
    <div className="pp-glass-card rounded-3xl p-4 md:p-5">
      <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="rounded-md bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#64748B]">
          pinkpepper.io/live-preview
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(demoMap) as DemoMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDemoMode(mode)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                demoMode === mode
                  ? "bg-[#0F172A] text-white"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              {demoMap[mode].label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#334155]">
          <div className="mb-2 font-semibold text-[#0F172A]">User prompt</div>
          {demo.prompt}
        </div>

        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#78350F]">
          <div className="mb-2 font-semibold text-[#92400E]">Raw notes (before)</div>
          {demo.rawNotes}
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-all duration-500">
          <div className="mb-2 text-sm font-semibold text-[#0F172A]">{demo.title}</div>
          <ul className="space-y-2 text-sm leading-relaxed text-[#475569]">
            {demo.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {demo.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#475569]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

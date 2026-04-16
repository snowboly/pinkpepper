"use client";

import { useEffect, useState } from "react";
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

const DEMO_ORDER: DemoMode[] = ["haccp", "allergen", "audit"];
const TYPE_SPEED_MS = 22;
const NOTES_DELAY_MS = 450;
const OUTPUT_DELAY_MS = 550;
const ITEM_STAGGER_MS = 380;
const HOLD_BEFORE_NEXT_MS = 3200;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DemoTabSwitcher() {
  const [demoMode, setDemoMode] = useState<DemoMode>("haccp");
  const [typedChars, setTypedChars] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [revealedItems, setRevealedItems] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const demo = demoMap[demoMode];

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setTypedChars(demo.prompt.length);
      setShowNotes(true);
      setShowOutput(true);
      setRevealedItems(demo.checklist.length);
      return;
    }
    setTypedChars(0);
    setShowNotes(false);
    setShowOutput(false);
    setRevealedItems(0);
  }, [demoMode, reduceMotion, demo.prompt.length, demo.checklist.length]);

  useEffect(() => {
    if (reduceMotion) return;
    if (typedChars >= demo.prompt.length) {
      const id = setTimeout(() => setShowNotes(true), NOTES_DELAY_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setTypedChars((n) => n + 1), TYPE_SPEED_MS);
    return () => clearTimeout(id);
  }, [typedChars, demo.prompt.length, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !showNotes) return;
    const id = setTimeout(() => setShowOutput(true), OUTPUT_DELAY_MS);
    return () => clearTimeout(id);
  }, [showNotes, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !showOutput) return;
    if (revealedItems < demo.checklist.length) {
      const id = setTimeout(() => setRevealedItems((n) => n + 1), ITEM_STAGGER_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      const nextIndex = (DEMO_ORDER.indexOf(demoMode) + 1) % DEMO_ORDER.length;
      setDemoMode(DEMO_ORDER[nextIndex]);
    }, HOLD_BEFORE_NEXT_MS);
    return () => clearTimeout(id);
  }, [showOutput, revealedItems, demo.checklist.length, demoMode, reduceMotion]);

  const typedPrompt = demo.prompt.slice(0, typedChars);
  const isTyping = !reduceMotion && typedChars < demo.prompt.length;

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
          {DEMO_ORDER.map((mode) => (
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
          <span>{typedPrompt}</span>
          {isTyping && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-4 w-[2px] -mb-0.5 bg-[#0F172A] animate-pulse"
            />
          )}
        </div>

        <div
          className={`rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#78350F] transition-all duration-500 ${
            showNotes ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          aria-hidden={!showNotes}
        >
          <div className="mb-2 font-semibold text-[#92400E]">Raw notes (before)</div>
          {demo.rawNotes}
        </div>

        <div
          className={`rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-all duration-500 ${
            showOutput ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          aria-hidden={!showOutput}
        >
          <div className="mb-2 text-sm font-semibold text-[#0F172A]">{demo.title}</div>
          <ul className="space-y-2 text-sm leading-relaxed text-[#475569]">
            {demo.checklist.map((item, i) => (
              <li
                key={item}
                className={`flex gap-2 transition-all duration-500 ${
                  i < revealedItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                }`}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div
            className={`mt-3 flex flex-wrap gap-2 transition-opacity duration-500 ${
              revealedItems >= demo.checklist.length ? "opacity-100" : "opacity-0"
            }`}
          >
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

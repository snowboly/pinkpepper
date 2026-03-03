"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

type DemoMode = "haccp" | "allergen" | "audit";

const demoMap: Record<
  DemoMode,
  {
    label: string;
    prompt: string;
    title: string;
    body: string;
    tags: string[];
  }
> = {
  haccp: {
    label: "HACCP",
    prompt: "Build a HACCP plan for a 25-seat cafe with hot and chilled service in Dublin.",
    title: "Hazard Analysis and CCP setup",
    body: "CCP 1: chilled storage at 5C or below. Monitor every 4 hours with digital probe logs and corrective action workflow.",
    tags: ["EC 852/2004", "FSA Aligned"],
  },
  allergen: {
    label: "Allergen Matrix",
    prompt: "Create an allergen matrix for bakery products with cross-contact controls.",
    title: "Allergen cross-contact controls",
    body: "Define ingredient traces, color-code risk levels, and assign cleaning verification checkpoints by station.",
    tags: ["EU 1169/2011", "Kitchen SOP"],
  },
  audit: {
    label: "Audit Pack",
    prompt: "Prepare an audit-ready checklist for monthly internal food safety review.",
    title: "Inspection checklist and evidence set",
    body: "Compile SOP evidence, temperature records, and corrective action closure table with owner and due date.",
    tags: ["BRCGS Ready", "Traceability"],
  },
};

export default function HomePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [demoMode, setDemoMode] = useState<DemoMode>("haccp");

  const demo = demoMap[demoMode];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = encodeURIComponent(inputValue || "Create a HACCP plan for my food business");
    router.push(`/signup?prompt=${prompt}`);
  };

  const handleInputClick = () => {
    if (!inputValue) router.push("/signup");
  };

  return (
    <main className="overflow-hidden">
      <section className="relative overflow-hidden pb-20 pt-16 md:pb-24 md:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF6F1] via-[#FFE8DF] to-[#FFDACA]" />
          <div className="absolute -left-44 -top-40 h-[620px] w-[620px] animate-pulse rounded-full bg-gradient-to-br from-[#EF4444]/35 to-[#DC2626]/10 blur-[110px]" />
          <div
            className="absolute -right-28 top-12 h-[520px] w-[520px] animate-pulse rounded-full bg-gradient-to-bl from-[#FB7185]/30 to-[#F97316]/15 blur-[110px]"
            style={{ animationDelay: "1200ms" }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-[420px] w-[420px] animate-pulse rounded-full bg-gradient-to-tr from-[#DC2626]/18 to-[#F97316]/8 blur-[80px]"
            style={{ animationDelay: "2200ms" }}
          />
        </div>

        <div className="pp-container relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#FCA5A5] bg-white/90 px-5 py-2.5 text-sm font-semibold text-[#B91C1C] shadow-sm">
                <Sparkles className="h-4 w-4" />
                AI-powered food safety compliance
              </div>

              <h1 className="pp-display mb-6 max-w-3xl text-5xl leading-[1.04] tracking-[-0.02em] text-[#1C1010] md:text-6xl lg:text-7xl">
                Create compliance docs{" "}
                <span className="bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#7F1D1D] bg-clip-text text-transparent">
                  with red-hot velocity
                </span>
              </h1>

              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#4A3A3A] md:text-xl">
                Generate HACCP plans, SOPs, and audit packs for EU and UK food businesses.
                Regulation-grounded outputs, built for real inspection workflows.
              </p>

              <form onSubmit={handleChatSubmit} className="w-full max-w-2xl">
                <div
                  className={`group relative overflow-hidden rounded-2xl border-2 bg-white/95 shadow-2xl shadow-red-600/10 transition-all duration-300 ${
                    isFocused ? "border-[#DC2626] shadow-red-600/20" : "border-[#FECACA] hover:border-[#FCA5A5]"
                  }`}
                >
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#DC2626]/10 via-transparent to-[#F97316]/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-center gap-3 p-3 md:gap-4 md:p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEE2E2] to-[#FECACA]">
                      <MessageSquare className="h-5 w-5 text-[#DC2626]" />
                    </div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onClick={handleInputClick}
                      placeholder="Create a HACCP plan for a cafe in Dublin..."
                      className="flex-1 bg-transparent text-base text-[#1A1A1A] placeholder-[#8A7A7A] outline-none md:text-lg"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#B91C1C] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:shadow-xl hover:shadow-red-600/35 md:px-5 md:py-3 md:text-base"
                    >
                      <span className="hidden sm:inline">Start free</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm text-[#635252] lg:justify-start">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  EU and UK regulations
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  PDF and Word export
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E8D6CC] bg-white/95 p-4 shadow-[0_25px_60px_rgba(127,29,29,0.14)] md:p-5">
              <div className="flex items-center gap-3 border-b border-[#EFE2D8] pb-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="rounded-md bg-[#F8F4EF] px-3 py-1 text-xs font-medium text-[#6C5B5B]">
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
                          ? "bg-[#DC2626] text-white"
                          : "bg-[#F9EEE8] text-[#6E4E4E] hover:bg-[#F6E3DA]"
                      }`}
                    >
                      {demoMap[mode].label}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl bg-[#FDF9F6] p-4 text-sm text-[#3D2F2F]">
                  <div className="mb-2 font-semibold text-[#281818]">User prompt</div>
                  {demo.prompt}
                </div>

                <div className="rounded-2xl border border-[#F1DED3] bg-white p-4 transition-all duration-500">
                  <div className="mb-1 text-sm font-semibold text-[#221313]">{demo.title}</div>
                  <p className="text-sm leading-relaxed text-[#524141]">{demo.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#F0D7CA] bg-[#FFF7F2] px-2.5 py-1 text-xs font-medium text-[#6A4444]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#EFDFD5] bg-[#FFFDFC] py-24">
        <div className="pp-container">
          <div className="mb-14 max-w-xl">
            <h2 className="pp-display text-4xl font-semibold tracking-[-0.01em] text-[#1C1111] md:text-5xl">
              Built for operators, not just prompts
            </h2>
            <p className="mt-4 text-lg text-[#584747]">
              PinkPepper combines practical generation with traceable references and export-ready structure.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="group rounded-2xl border border-[#ECDCD2] bg-gradient-to-br from-white to-[#FFF8F4] p-7 transition-all hover:-translate-y-0.5 hover:border-[#F5A7A7] hover:shadow-xl hover:shadow-red-500/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] text-[#DC2626]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#201313]">Regulation-grounded</h3>
                <p className="text-[#5C4A4A]">
                  Responses anchored in EC 852/2004, UK FSA guidance, and Codex HACCP references.
                </p>
              </div>

              <div className="group rounded-2xl border border-[#ECDCD2] bg-gradient-to-br from-white to-[#FFF8F4] p-7 transition-all hover:-translate-y-0.5 hover:border-[#F5A7A7] hover:shadow-xl hover:shadow-red-500/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] text-[#DC2626]">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#201313]">HACCP in minutes</h3>
                <p className="text-[#5C4A4A]">
                  Build hazard analysis, CCPs, monitoring logic, and corrective controls quickly.
                </p>
              </div>

              <div className="group rounded-2xl border border-[#ECDCD2] bg-gradient-to-br from-white to-[#FFF8F4] p-7 transition-all hover:-translate-y-0.5 hover:border-[#F5A7A7] hover:shadow-xl hover:shadow-red-500/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] text-[#DC2626]">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#201313]">Audit-ready exports</h3>
                <p className="text-[#5C4A4A]">
                  Export structured PDF and Word files with clean formatting and traceable sections.
                </p>
              </div>

              <div className="group rounded-2xl border border-[#ECDCD2] bg-gradient-to-br from-white to-[#FFF8F4] p-7 transition-all hover:-translate-y-0.5 hover:border-[#F5A7A7] hover:shadow-xl hover:shadow-red-500/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] text-[#DC2626]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#201313]">Expert review loop</h3>
                <p className="text-[#5C4A4A]">
                  Route drafts to qualified reviewers before inspection or supplier audits.
                </p>
              </div>
            </div>

            <div className="relative rounded-3xl border border-[#E9D4C6] bg-gradient-to-b from-[#FFF1EB] to-[#FFE6DD] p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#A12A2A]">
                <Shield className="h-3.5 w-3.5" />
                Compliance cockpit
              </div>
              <h3 className="pp-display mb-4 text-3xl leading-tight text-[#2A1414]">
                One workspace for plans, proof, and progress
              </h3>
              <p className="text-[#5F4A4A]">
                Keep recurring tasks visible, generate missing documents, and maintain evidence trails in one flow.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-[#4A3939]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Monthly hygiene and temperature checklists
                </li>
                <li className="flex items-center gap-2 text-sm text-[#4A3939]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Auto-linked sources in assistant responses
                </li>
                <li className="flex items-center gap-2 text-sm text-[#4A3939]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Team workflows across multiple sites
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2E2E] via-[#8A3530] to-[#9B4333]" />
          <div className="absolute left-0 top-0 h-[620px] w-[620px] rounded-full bg-gradient-to-r from-[#FCA5A5]/25 to-transparent blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[560px] w-[560px] rounded-full bg-gradient-to-l from-[#FDBA74]/25 to-transparent blur-[120px]" />
        </div>

        <div className="pp-container relative z-10">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="pp-display mb-4 text-4xl text-white md:text-5xl">Simple pricing, clear upgrades</h2>
            <p className="text-lg text-[#F6DEDE]">Choose the tier that matches your document volume and review needs.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#B45959] bg-[#8D3A3A]/70 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Free</h3>
              <div className="mt-2 text-5xl font-bold text-white">EUR 0</div>
              <p className="mt-2 text-sm text-[#F8D7D7]">Perfect for validating fit and testing workflow.</p>
              <ul className="mt-6 space-y-3 text-sm text-[#FFEAEA]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />15 messages per day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />Basic food safety Q and A</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />10 saved conversations</li>
              </ul>
              <Link href="/signup" className="mt-7 block rounded-xl bg-white py-3 text-center font-semibold text-[#7F1D1D]">
                Get started
              </Link>
            </div>

            <div className="relative rounded-3xl border-2 border-[#FFE1E1] bg-gradient-to-b from-[#EF4444] to-[#B91C1C] p-8 shadow-2xl shadow-red-900/30 lg:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold uppercase tracking-wide text-[#B91C1C]">
                <Star className="mr-1 inline h-3 w-3" />
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-white">Plus</h3>
              <div className="mt-2 text-5xl font-bold text-white">EUR 15</div>
              <p className="mt-2 text-sm text-[#FFE3E3]">Core plan for operators building recurring compliance packs.</p>
              <ul className="mt-6 space-y-3 text-sm text-white">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />80 messages per day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />HACCP plan generation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />2 human reviews per month</li>
              </ul>
              <Link href="/pricing" className="mt-7 block rounded-xl bg-white py-3 text-center font-semibold text-[#B91C1C]">
                Choose Plus
              </Link>
            </div>

            <div className="rounded-3xl border border-[#B45959] bg-[#8D3A3A]/70 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Pro</h3>
              <div className="mt-2 text-5xl font-bold text-white">EUR 69</div>
              <p className="mt-2 text-sm text-[#F8D7D7]">For teams running advanced, multi-site operations.</p>
              <ul className="mt-6 space-y-3 text-sm text-[#FFEAEA]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />250 messages per day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />Word and PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />Multi-site profiles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FED7D7]" />Priority support</li>
              </ul>
              <Link href="/pricing" className="mt-7 block rounded-xl border border-[#DAA2A2] bg-[#7A2E2E] py-3 text-center font-semibold text-white">
                Choose Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF6F1] via-[#FFEADF] to-[#FFDDCF]" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#F87171]/30 to-[#FDBA74]/30 blur-[100px]" />

        <div className="pp-container text-center">
          <h2 className="pp-display mx-auto mb-5 max-w-3xl text-4xl text-[#1C1111] md:text-5xl">
            Ready to run compliance with less friction?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#594848]">
            Start generating practical food safety documentation today, then scale with exports and review workflows.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#DC2626] to-[#991B1B] px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-red-600/25 transition-all hover:shadow-2xl hover:shadow-red-600/35"
          >
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

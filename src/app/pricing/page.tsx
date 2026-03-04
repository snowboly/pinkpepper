import PricingActions from "@/components/pricing/PricingActions";
import { CheckCircle2, XCircle } from "lucide-react";

type MetricRow = {
  label: string;
  value: number;
  display: string;
  pct: number;
};

function MetricBar({ label, display, pct, barColor }: MetricRow & { barColor: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[7.5rem] shrink-0 text-xs">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums">{display}</span>
    </div>
  );
}

const freeMetrics: MetricRow[] = [
  { label: "Daily queries", value: 25, display: "25", pct: 2.5 },
  { label: "Doc generations", value: 0, display: "0", pct: 0 },
  { label: "Image uploads", value: 1, display: "1", pct: 5 },
  { label: "Human reviews/mo", value: 0, display: "0", pct: 0 },
];

const plusMetrics: MetricRow[] = [
  { label: "Daily queries", value: 100, display: "100", pct: 10 },
  { label: "Doc generations", value: 3, display: "3", pct: 15 },
  { label: "Image uploads", value: 3, display: "3", pct: 15 },
  { label: "Human reviews/mo", value: 1, display: "1", pct: 17 },
];

const proMetrics: MetricRow[] = [
  { label: "Daily queries", value: 1000, display: "1,000", pct: 100 },
  { label: "Doc generations", value: 20, display: "20", pct: 100 },
  { label: "Image uploads", value: 20, display: "20", pct: 100 },
  { label: "Human reviews/mo", value: 6, display: "6", pct: 100 },
];

export default function PricingPage() {
  return (
    <main>
      <section className="py-16 text-center">
        <div className="pp-container max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-[#2B2B2B] md:text-5xl">Pricing</h1>
          <p className="mt-4 text-lg text-[#6B6B6B]">
            Start with Free, then unlock exports and advanced documentation workflows as your compliance needs grow.
          </p>
          <p className="mt-3 text-sm text-[#8F8080]">
            Entitlements are enforced server-side via Supabase tier data synchronized with Stripe webhook events.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#241F1F] py-20 text-white">
        <div className="pp-container">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Free ── */}
            <article className="flex flex-col rounded-[2.5rem] border border-[#3A3333] bg-[#1E1A1A] p-8 shadow-2xl">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-black">Free</h2>
                <span className="text-4xl font-black">EUR0</span>
                <p className="mt-3 text-sm font-medium text-[#9F9191]">AI food safety assistant — no export, no human review.</p>
              </div>

              {/* Metric bars */}
              <div className="mb-6 space-y-2 text-[#C9BBBB]">
                {freeMetrics.map((m) => (
                  <MetricBar key={m.label} {...m} barColor="bg-[#E11D48]" />
                ))}
              </div>

              <ul className="mb-8 flex-1 space-y-3 text-sm text-[#C9BBBB]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> 25 daily queries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> 1 image upload/day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> 10 saved conversations</li>
                <li className="flex items-center gap-2 text-[#6B5E5E]"><XCircle className="h-4 w-4 text-[#6B5E5E]" /> No export</li>
                <li className="flex items-center gap-2 text-[#6B5E5E]"><XCircle className="h-4 w-4 text-[#6B5E5E]" /> No human review</li>
              </ul>
              <p className="rounded-xl border border-[#4A4343] bg-[#2B2525] px-4 py-3 text-center text-sm font-bold text-[#D7CACA]">
                Included at signup
              </p>
            </article>

            {/* ── Plus ── */}
            <article className="relative z-10 flex flex-col rounded-[2.5rem] border-2 border-[#EAA7A7] bg-[#D96C6C] p-8 shadow-2xl lg:scale-110">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#F6D1A8] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#5A3B1E]">
                Most Popular
              </div>
              <div className="mb-6 pt-4">
                <h2 className="mb-2 text-xl font-black text-white">Plus</h2>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-white">EUR19</span>
                  <span className="ml-2 font-bold text-[#F8D8D8]">+ VAT</span>
                </div>
                <p className="mt-3 text-sm font-medium text-[#FFE8E8]">PDF export + 1 expert human review/month.</p>
              </div>

              {/* Metric bars */}
              <div className="mb-6 space-y-2 text-white">
                {plusMetrics.map((m) => (
                  <MetricBar key={m.label} {...m} barColor="bg-white/60" />
                ))}
              </div>

              <ul className="mb-8 flex-1 space-y-3 text-sm font-bold text-white">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> 100 daily queries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> 3 image uploads/day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> 3 document generations/day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> 1 expert human review/month (72 h turnaround)</li>
              </ul>
            </article>

            {/* ── Pro ── */}
            <article className="flex flex-col rounded-[2.5rem] border border-[#4A4343] bg-[#2B2525] p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-black text-white">Pro</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-white">EUR99</span>
                  <span className="ml-2 font-bold text-[#9F9191]">+ VAT</span>
                </div>
                <p className="mt-3 text-sm font-medium text-[#B8ABAB]">Word &amp; PDF export + 6 expert human reviews/month. Full HACCP plan reviews available.</p>
              </div>

              {/* Metric bars */}
              <div className="mb-6 space-y-2 text-[#D7CACA]">
                {proMetrics.map((m) => (
                  <MetricBar key={m.label} {...m} barColor="bg-emerald-400" />
                ))}
              </div>

              <ul className="mb-8 flex-1 space-y-3 text-sm text-[#D7CACA]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 1,000 daily queries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 20 image uploads/day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 20 document generations/day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Word &amp; PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 6 expert human reviews/month (72 h turnaround)</li>
                <li className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Full HACCP plan reviews — Pro only
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="pp-container">
          <div className="pp-card p-6 md:p-8">
            <h2 className="text-2xl font-black text-[#2B2B2B]">Tier gating summary</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#E8DADA] bg-white p-4">
                <h3 className="font-semibold">Free</h3>
                <p className="mt-2 text-sm text-[#6B6B6B]">No export, no human review. 25 daily queries, 1 image upload/day.</p>
              </div>
              <div className="rounded-xl border border-[#E8DADA] bg-white p-4">
                <h3 className="font-semibold">Plus</h3>
                <p className="mt-2 text-sm text-[#6B6B6B]">PDF export enabled with 1 expert human review/month and higher daily limits.</p>
              </div>
              <div className="rounded-xl border border-[#E8DADA] bg-white p-4">
                <h3 className="font-semibold">Pro</h3>
                <p className="mt-2 text-sm text-[#6B6B6B]">Word and PDF export, 6 expert human reviews/month, and highest daily limits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="pp-container max-w-2xl">
          <PricingActions />
        </div>
      </section>
    </main>
  );
}

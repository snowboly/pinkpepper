import PricingActions from "@/components/pricing/PricingActions";
import { CheckCircle2 } from "lucide-react";

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
            <article className="flex flex-col rounded-[2.5rem] border border-[#3A3333] bg-[#1E1A1A] p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="mb-2 text-xl font-black">Free</h2>
                <span className="text-4xl font-black">EUR0</span>
                <p className="mt-4 text-sm font-medium text-[#9F9191]">Basic food safety chat and preview outputs.</p>
              </div>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-[#C9BBBB]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> Limited monthly queries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> Basic food safety Q&A</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> Limited document previews</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#D96C6C]" /> No export</li>
              </ul>
              <p className="rounded-xl border border-[#4A4343] bg-[#2B2525] px-4 py-3 text-center text-sm font-bold text-[#D7CACA]">
                Included at signup
              </p>
            </article>

            <article className="relative z-10 flex flex-col rounded-[2.5rem] border-2 border-[#EAA7A7] bg-[#D96C6C] p-8 shadow-2xl lg:scale-110">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#F6D1A8] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#5A3B1E]">
                Most Popular
              </div>
              <div className="mb-8 pt-4">
                <h2 className="mb-2 text-xl font-black text-white">Plus</h2>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-white">EUR19</span>
                  <span className="ml-2 font-bold text-[#F8D8D8]">+ VAT</span>
                </div>
                <p className="mt-4 text-sm font-medium text-[#FFE8E8]">Structured generation with PDF export.</p>
              </div>
              <ul className="mb-8 flex-1 space-y-3 text-sm font-bold text-white">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> Increased query limits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> HACCP plan generation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> SOP generation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#FFE8E8]" /> PDF export</li>
              </ul>
            </article>

            <article className="flex flex-col rounded-[2.5rem] border border-[#4A4343] bg-[#2B2525] p-8 shadow-lg">
              <div className="mb-8">
                <h2 className="mb-2 text-xl font-black text-white">Pro</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-white">EUR99</span>
                  <span className="ml-2 font-bold text-[#9F9191]">+ VAT</span>
                </div>
                <p className="mt-4 text-sm font-medium text-[#B8ABAB]">Full compliance documentation suite.</p>
              </div>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-[#D7CACA]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> High query limits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Advanced templates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Monitoring and allergen docs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Word and PDF export</li>
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
                <p className="mt-2 text-sm text-[#6B6B6B]">No export, limited generation, no advanced templates.</p>
              </div>
              <div className="rounded-xl border border-[#E8DADA] bg-white p-4">
                <h3 className="font-semibold">Plus</h3>
                <p className="mt-2 text-sm text-[#6B6B6B]">PDF export enabled with standard templates and higher limits.</p>
              </div>
              <div className="rounded-xl border border-[#E8DADA] bg-white p-4">
                <h3 className="font-semibold">Pro</h3>
                <p className="mt-2 text-sm text-[#6B6B6B]">Word and PDF export, advanced templates, and highest limits.</p>
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

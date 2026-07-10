"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import PricingActions, { type BillingInterval } from "@/components/pricing/PricingActions";

type Props = {
  isLoggedIn: boolean;
  signupHref: string;
  ctaNeutral: string;
  ctaSecondary: string;
  ctaPrimary: string;
};

const plus = {
  monthly: { price: "19", suffix: "/month + VAT", note: "Monthly billing", cta: "Choose Plus" },
  annual: { price: "205", suffix: "/year + VAT", note: "Billed yearly · Save 10% · Best for ongoing compliance work", cta: "Choose Plus annual" },
};

const pro = {
  monthly: { price: "99", suffix: "/month + VAT", note: "Monthly billing", cta: "Choose Pro" },
  annual: { price: "1,129", suffix: "/year + VAT", note: "Billed yearly · Save 5% as a small commitment discount", cta: "Choose Pro annual" },
};

export default function PricingPlans({ isLoggedIn, signupHref, ctaNeutral, ctaSecondary, ctaPrimary }: Props) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const plusPrice = plus[interval];
  const proPrice = pro[interval];

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-[#E2E8F0] bg-[#F8FAFC] p-1" aria-label="Billing interval">
          {(["monthly", "annual"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${interval === value ? "bg-[#E11D48] text-white shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
              aria-pressed={interval === value}
            >
              {value === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-3xl border border-[#E2E8F0] bg-[#FCFDFE] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Free</h2>
          <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">Best for testing fit on live questions and everyday checks before you commit.</p>
          <div className="mt-6 flex items-baseline gap-1"><span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">EUR </span>0</span><span className="text-base text-[#94A3B8]">/month</span></div>
          <div className="my-6 border-t border-[#F1F5F9]" />
          <PlanList items={["Chat on web and mobile (app coming soon)", "Write, edit, and create food safety content", "Analyze text and images", "Access to curated knowledge base", "Everyday compliance guidance"]} muted />
          <Link href={signupHref} className={ctaNeutral}>Get started free</Link>
        </div>

        <div className="relative flex flex-col rounded-3xl border-2 border-[#E11D48] bg-white p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E11D48] px-4 py-1 text-xs font-bold text-white">Most Popular</div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Plus</h2>
          <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">For teams that use PinkPepper daily for HACCP, SOPs, allergen records, and downloadable templates.</p>
          {interval === "annual" && <p className="mt-4 inline-flex w-fit rounded-full bg-[#FFF1F2] px-3 py-1 text-xs font-bold text-[#BE123C]">Save 10%</p>}
          <Price price={plusPrice.price} suffix={plusPrice.suffix} note={plusPrice.note} />
          <div className="my-6 border-t border-[#FCE7F3]" />
          <PlanList items={["Everything in Free", "Heavier day-to-day Consultant use", "Higher daily usage limits", "Unlimited saved conversations and projects", "Access to downloadable templates"]} />
          <PricingActions isLoggedIn={isLoggedIn} plan="plus" interval={interval} label={plusPrice.cta} className={ctaSecondary} />
        </div>

        <div className="flex flex-col rounded-3xl border border-[#F9A8D4] bg-[#FFF8FB] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BE123C]">Pro</h2>
          <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">For teams that want both AI modes, stronger audit workflows, and careful human food safety consultancy for higher-risk work.</p>
          {interval === "annual" && <p className="mt-4 inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-[#BE123C]">Save 5%</p>}
          <Price price={proPrice.price} suffix={proPrice.suffix} note={proPrice.note} />
          <div className="my-6 border-t border-[#F1F5F9]" />
          <PlanList items={["Everything in Plus", "More capacity for higher-risk work", "Highest daily usage limits", "Access to Auditor mode", "2h/month of human food safety consultancy", "Priority support"]} />
          <PricingActions isLoggedIn={isLoggedIn} plan="pro" interval={interval} label={proPrice.cta} className={ctaPrimary} />
        </div>
      </div>
    </div>
  );
}

function Price({ price, suffix, note }: { price: string; suffix: string; note: string }) {
  return <><div className="mt-6 flex items-baseline gap-1"><span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">EUR </span>{price}</span><span className="text-base text-[#94A3B8]">{suffix}</span></div><p className="mt-2 min-h-5 text-xs font-medium text-[#64748B]">{note}</p></>;
}

function PlanList({ items, muted = false }: { items: string[]; muted?: boolean }) {
  return <ul className="flex-1 space-y-3.5 text-sm text-[#475569]">{items.map((item) => <li key={item} className="flex items-start gap-2.5"><CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${muted ? "text-[#CBD5E1]" : "text-[#E11D48]"}`} />{item}</li>)}</ul>;
}

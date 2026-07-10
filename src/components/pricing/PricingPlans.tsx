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
      <div className="mx-auto grid max-w-5xl items-stretch gap-6 lg:grid-cols-3">
        <div className="flex h-full flex-col rounded-3xl border border-[#E2E8F0] bg-[#FCFDFE] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Free</h2>
          <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">For trying PinkPepper on everyday food safety questions before upgrading.</p>
          <div className="mt-4 min-h-7" aria-hidden="true" />
          <div className="mt-6 flex items-baseline gap-1"><span className="text-5xl font-bold tracking-tight text-[#0F172A]"><span className="text-2xl align-super">EUR </span>0</span><span className="text-base text-[#94A3B8]">/month</span></div>
          <div className="my-6 border-t border-[#F1F5F9]" />
          <PlanList items={["Chat on web and mobile", "Create food safety drafts", "Analyze text and images", "Access curated food safety guidance", "Basic usage limits"]} muted />
          <Link href={signupHref} className={`${ctaNeutral} mt-auto`}>Get started free</Link>
        </div>

        <div className="relative flex h-full flex-col rounded-3xl border-2 border-[#E11D48] bg-white p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E11D48] px-4 py-1 text-xs font-bold text-white">Most Popular</div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Plus</h2>
          <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">For small food teams using PinkPepper daily for HACCP, SOPs, records, and templates.</p>
          <div className="mt-4 min-h-7">{interval === "annual" && <p className="inline-flex w-fit rounded-full bg-[#FFF1F2] px-3 py-1 text-xs font-bold text-[#BE123C]">Save 10%</p>}</div>
          <Price price={plusPrice.price} suffix={plusPrice.suffix} note={plusPrice.note} />
          <div className="my-6 border-t border-[#FCE7F3]" />
          <PlanList items={["Everything in Free", "Higher daily usage limits", "Saved conversations and projects", "Downloadable templates", "Best for daily compliance work"]} />
          <PricingActions isLoggedIn={isLoggedIn} plan="plus" interval={interval} label={plusPrice.cta} className={`${ctaSecondary} mt-auto`} />
        </div>

        <div className="flex h-full flex-col rounded-3xl border border-[#F9A8D4] bg-[#FFF8FB] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BE123C]">Pro</h2>
          <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#64748B]">For higher-risk teams needing stronger AI workflows plus human food safety consultancy.</p>
          <div className="mt-4 min-h-7">{interval === "annual" && <p className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-[#BE123C]">Save 5%</p>}</div>
          <Price price={proPrice.price} suffix={proPrice.suffix} note={proPrice.note} />
          <div className="my-6 border-t border-[#F1F5F9]" />
          <PlanList items={["Everything in Plus", "Highest usage limits", "Auditor mode access", "2h/month human consultancy", "Priority support"]} />
          <PricingActions isLoggedIn={isLoggedIn} plan="pro" interval={interval} label={proPrice.cta} className={`${ctaPrimary} mt-auto`} />
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

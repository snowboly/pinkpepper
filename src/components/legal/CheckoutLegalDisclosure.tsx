"use client";

import Link from "next/link";

type Props = { plan: string; interval: string; accepted: boolean; onAcceptedChange: (accepted: boolean) => void };

export function CheckoutLegalDisclosure({ plan, interval, accepted, onAcceptedChange }: Props) {
  return <div className="my-3 rounded-xl border border-[#E2E8F0] bg-white p-3 text-left text-xs leading-5 text-[#475569]"><p>You are starting a recurring {interval} {plan} subscription. VAT may be calculated at checkout. You can cancel future renewal from the billing portal. Private consumers receive a full unconditional 14-day refund on the initial subscription purchase.</p><label className="mt-2 flex gap-2"><input type="checkbox" checked={accepted} onChange={(event) => onAcceptedChange(event.target.checked)} /><span>I agree to the <Link href="/legal/terms" className="text-[#E11D48] underline">Terms</Link> and acknowledge the <Link href="/legal/privacy" className="text-[#E11D48] underline">Privacy Policy</Link> and <Link href="/legal/refund" className="text-[#E11D48] underline">Refund Policy</Link>.</span></label></div>;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | PinkPepper",
  description: "PinkPepper's refund and cancellation policy for subscription plans.",
  alternates: { canonical: "https://pinkpepper.io/legal/refund" },
};

export default function RefundPage() {
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <h1 className="text-4xl font-semibold text-[#0F172A]">Refund Policy</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Last updated: March 2026</p>
      </div>

      <div className="space-y-10 text-[#374151] leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">1. General rule</h2>
          <p>
            PinkPepper subscription fees are charged in advance at the start of each billing period.
            Subscription payments are generally non-refundable once a billing cycle has started, as access
            to the full features of your plan is granted immediately upon payment.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">2. Cancellation</h2>
          <p>
            You may cancel your subscription at any time from the billing portal in your dashboard or by
            emailing{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
            Cancellation takes effect at the end of the current billing period. You will retain access to
            paid features until that date; no partial-period refunds are issued.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">3. Exceptions — when we will issue a refund</h2>
          <p className="mb-3">We will issue a full or partial refund in the following circumstances:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Billing errors:</strong> a duplicate charge or an incorrect amount was billed due to a
              technical error on our side.
            </li>
            <li>
              <strong>14-day cooling-off period (EU/UK statutory right):</strong> if you are an EU or UK
              consumer and have not used any paid features (exports, document review) since subscribing, you
              may cancel and request a full refund within 14 days of your first payment under your statutory
              right of withdrawal. By using paid features before the 14-day period ends, you acknowledge that
              the service has been partially delivered and waive this right to the extent permitted by law.
            </li>
            <li>
              <strong>Service unavailability:</strong> if PinkPepper was materially unavailable for an
              extended period due to our fault, we may issue a pro-rata credit or refund at our discretion.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">4. Downgrading</h2>
          <p>
            If you downgrade from a paid plan to a lower tier or to the free plan, no refund is issued for
            the remainder of the current billing period. The downgrade takes effect at the start of your next
            billing cycle.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">5. Consultancy hours</h2>
          <p>
            Consultancy hours (included in the Pro plan) reset monthly and do not carry over or attract
            individual refunds. If your subscription is cancelled mid-month, unused consultancy hours are
            forfeited.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">6. How to request a refund</h2>
          <p>
            To request a refund under one of the exceptions above, email{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>{" "}
            within 14 days of the relevant charge, with your account email address and a brief description
            of the issue. We will review your request and respond within 5 business days.
          </p>
          <p className="mt-3">
            Approved refunds are returned to your original payment method within 5–10 business days,
            depending on your bank or card provider.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">7. VAT</h2>
          <p>
            Refunds for EU/UK customers include any VAT paid on the refunded amount. VAT refund processing
            times depend on your local tax authority.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">8. Contact</h2>
          <p>
            For billing or refund questions, contact{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PinkPepper",
  description: "Terms governing your use of the PinkPepper AI food safety compliance platform.",
  alternates: { canonical: "https://pinkpepper.io/legal/terms" },
};

export default function TermsPage() {
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <h1 className="text-4xl font-semibold text-[#0F172A]">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Last updated: March 2026</p>
      </div>

      <div className="space-y-10 text-[#374151] leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">1. Acceptance of terms</h2>
          <p>
            By creating an account or using PinkPepper (&quot;Service&quot;), you agree to these Terms of Service
            (&quot;Terms&quot;). If you are using PinkPepper on behalf of an organisation, you confirm that you have
            authority to bind that organisation to these Terms.
          </p>
          <p className="mt-3">
            If you do not agree to these Terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">2. Service description</h2>
          <p>
            PinkPepper is an AI-assisted drafting and reference tool for food safety compliance workflows, including
            HACCP plans, SOPs, allergen management documentation, and audit preparation. The Service is provided by
            PinkPepper.io (&quot;PinkPepper&quot;, &quot;we&quot;, &quot;us&quot;).
          </p>
          <p className="mt-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#78350F]">
            <strong>Important:</strong> PinkPepper generates AI-assisted drafts for review. Outputs are not legal
            advice. Your business remains responsible for implementing, verifying, and maintaining compliance with all
            applicable food safety regulations. Always have outputs reviewed by a qualified food safety professional
            before operational use.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">3. Account responsibilities</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>You must provide accurate and complete information when registering.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must notify us immediately at{" "}
              <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>{" "}
              if you suspect unauthorised access to your account.
            </li>
            <li>Each account is for a single user. Account sharing is not permitted.</li>
            <li>You must be at least 16 years old to use the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">4. Acceptable use</h2>
          <p>
            Your use of the Service is subject to our{" "}
            <a href="/legal/acceptable-use" className="text-[#E11D48] hover:underline">Acceptable Use Policy</a>,
            which is incorporated into these Terms by reference. In summary, you may not use the Service for
            illegal, abusive, or harmful purposes, or attempt to bypass usage limits or disrupt the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">5. Subscriptions, fees, and billing</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>PinkPepper offers a free tier and paid subscription plans (&quot;Plus&quot; and &quot;Pro&quot;). Pricing is displayed on the{" "}
              <a href="/pricing" className="text-[#E11D48] hover:underline">Pricing page</a>.
            </li>
            <li>Prices are stated exclusive of VAT. VAT is applied at checkout based on your location.</li>
            <li>Subscriptions are billed monthly in advance via Stripe. Your subscription renews automatically at the end of each billing period.</li>
            <li>You authorise PinkPepper to charge your payment method on file for all applicable fees.</li>
            <li>Failed payments may result in downgrade to the free tier after a grace period.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">6. Cancellation and refunds</h2>
          <p>
            You may cancel your subscription at any time from the billing portal in your dashboard. Cancellation
            takes effect at the end of the current billing period. Your refund rights are set out in our{" "}
            <a href="/legal/refund" className="text-[#E11D48] hover:underline">Refund Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">7. Intellectual property</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Platform:</strong> PinkPepper and all associated software, design, trademarks, and underlying
              AI models are owned by or licensed to PinkPepper.io. Nothing in these Terms grants you a right to use
              our intellectual property beyond what is necessary to use the Service.
            </li>
            <li>
              <strong>Your content:</strong> You retain ownership of the inputs you submit and the outputs generated
              for you. By using the Service you grant PinkPepper a limited licence to process your inputs and outputs
              solely to provide the Service.
            </li>
            <li>
              <strong>Feedback:</strong> If you provide feedback or suggestions, you grant PinkPepper a royalty-free
              licence to use that feedback to improve the Service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">8. Disclaimer of warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
            OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR
            FREE FROM HARMFUL COMPONENTS.
          </p>
          <p className="mt-3">
            AI-generated content may be inaccurate, incomplete, or out of date. PinkPepper does not guarantee
            that any output will satisfy inspection requirements, regulatory standards, or legal obligations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">9. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PINKPEPPER AND ITS OFFICERS, EMPLOYEES, AND LICENSORS
            SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING
            LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY — ARISING FROM YOUR USE OF OR INABILITY TO USE
            THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="mt-3">
            IN NO EVENT SHALL PINKPEPPER&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING UNDER THESE TERMS EXCEED THE
            GREATER OF (A) THE AMOUNTS YOU PAID TO PINKPEPPER IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) €100.
          </p>
          <p className="mt-3">
            Nothing in these Terms limits liability that cannot be excluded under applicable law, including liability
            for death or personal injury caused by our negligence, or for fraud.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold PinkPepper and its affiliates, officers, employees, and agents harmless
            from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your
            use of the Service in violation of these Terms or applicable law.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">11. Termination and suspension</h2>
          <p>
            You may close your account at any time from your account settings or by emailing{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
          <p className="mt-3">
            PinkPepper may suspend or terminate your account immediately if you breach these Terms or our Acceptable
            Use Policy, if required by law, or if continued operation would harm other users or the platform.
            Where possible, we will give notice before suspension.
          </p>
          <p className="mt-3">
            Upon termination, your access to the Service ceases. Data deletion follows the schedule in our{" "}
            <a href="/legal/privacy" className="text-[#E11D48] hover:underline">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">12. Changes to the Service and Terms</h2>
          <p>
            We may modify or discontinue any part of the Service at any time. We will give reasonable notice of
            material changes.
          </p>
          <p className="mt-3">
            We may update these Terms from time to time. We will notify you of material changes by email or an
            in-app notice at least 30 days before they take effect. Continued use of the Service after that date
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">13. Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of the Republic of Ireland. Any disputes shall be subject to the
            exclusive jurisdiction of the courts of Ireland, without prejudice to any mandatory consumer protection
            rights you may have under the law of your country of residence.
          </p>
          <p className="mt-3">
            Before initiating any formal proceedings, we ask that you contact us at{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>{" "}
            to attempt to resolve the dispute informally.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">14. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

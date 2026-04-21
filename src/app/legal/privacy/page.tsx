import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PinkPepper",
  description: "How PinkPepper collects, uses, and protects your personal data under GDPR and UK GDPR.",
  alternates: { canonical: "https://pinkpepper.io/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <h1 className="text-4xl font-semibold text-[#0F172A]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Last updated: March 2026</p>
      </div>

      <div className="space-y-10 text-[#374151] leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">1. Who we are</h2>
          <p>
            PinkPepper.io (&quot;PinkPepper&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the data controller for the personal data
            processed through this website and service. PinkPepper is an AI-assisted food safety compliance
            platform for EU and UK food businesses.
          </p>
          <p className="mt-3">
            If you have any privacy questions or wish to exercise your rights, contact us at{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">2. Data we collect</h2>
          <p className="mb-3">We collect the following categories of personal data:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Account data:</strong> email address, name, and password (hashed) when you register.</li>
            <li><strong>Billing data:</strong> payment method details and billing address, processed by Stripe. We do not store card numbers.</li>
            <li><strong>Usage data:</strong> chat messages, uploaded images, generated documents, conversation history, and usage counters (message counts, export counts).</li>
            <li><strong>Technical data:</strong> IP address, browser type, device identifiers, log data, and cookies. See our <Link href="/legal/cookies" className="text-[#E11D48] hover:underline">Cookie Policy</Link>.</li>
            <li><strong>Communications:</strong> messages you send to us via the contact form or email.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">3. How we use your data</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left">
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Lawful basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                <tr>
                  <td className="px-4 py-3">Provide and maintain the service (account, chat, exports)</td>
                  <td className="px-4 py-3">Contract performance</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Process subscription payments</td>
                  <td className="px-4 py-3">Contract performance</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Send transactional emails (account confirmation, billing receipts)</td>
                  <td className="px-4 py-3">Contract performance</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Enforce usage limits and detect abuse</td>
                  <td className="px-4 py-3">Legitimate interests</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Improve the service and troubleshoot issues</td>
                  <td className="px-4 py-3">Legitimate interests</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Comply with legal obligations (e.g., tax records)</td>
                  <td className="px-4 py-3">Legal obligation</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Respond to your support or review requests</td>
                  <td className="px-4 py-3">Contract performance / Legitimate interests</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">4. Data retention</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Free accounts:</strong> chat messages and conversations are retained for 30 days from creation, then automatically deleted.</li>
            <li><strong>Plus and Pro accounts:</strong> chat messages and conversations are retained for the lifetime of the account.</li>
            <li><strong>Account data:</strong> retained while your account is active. Upon verified deletion, your account and associated data are removed within 30 days.</li>
            <li><strong>Billing records:</strong> retained for 7 years to comply with financial and tax obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">5. Who we share your data with</h2>
          <p className="mb-3">We use the following third-party processors to deliver the service:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left">
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Processor</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                <tr>
                  <td className="px-4 py-3">Supabase</td>
                  <td className="px-4 py-3">Database, authentication, file storage</td>
                  <td className="px-4 py-3">EU (Frankfurt)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Vercel</td>
                  <td className="px-4 py-3">Hosting and edge delivery</td>
                  <td className="px-4 py-3">EU / Global CDN</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Groq</td>
                  <td className="px-4 py-3">AI language model inference (chat)</td>
                  <td className="px-4 py-3">US (covered by SCCs)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">OpenAI</td>
                  <td className="px-4 py-3">Embeddings and image analysis</td>
                  <td className="px-4 py-3">US (covered by SCCs)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Stripe</td>
                  <td className="px-4 py-3">Payment processing</td>
                  <td className="px-4 py-3">US / EU (covered by SCCs)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Resend</td>
                  <td className="px-4 py-3">Transactional email delivery</td>
                  <td className="px-4 py-3">US (covered by SCCs)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#64748B]">
            We do not sell your personal data. We do not share your data with third parties for advertising or marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">6. International transfers</h2>
          <p>
            Some of our processors (Groq, OpenAI, Stripe, Resend) are based in the United States. Where personal data
            is transferred outside the European Economic Area or the UK, we rely on one or more of the following legal
            mechanisms, whichever is appropriate for the receiving processor:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>EU-US Data Privacy Framework (DPF)</strong> and the UK Extension to the DPF, where the receiving
              processor is self-certified under the Framework (as recognised by Commission Implementing Decision (EU)
              2023/1795 and the UK adequacy regulations of October 2023).
            </li>
            <li>
              <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission under Commission
              Implementing Decision (EU) 2021/914.
            </li>
            <li>
              <strong>UK International Data Transfer Agreement (IDTA)</strong> or the UK Addendum to the EU SCCs, as
              approved by the Information Commissioner&apos;s Office.
            </li>
          </ul>
          <p className="mt-3">
            Where required, we carry out a Transfer Impact Assessment (TIA) to evaluate the destination country&apos;s
            legal regime and apply supplementary measures (e.g., encryption, access controls) if necessary.
          </p>
          <p className="mt-3">
            Groq and OpenAI process your prompts and outputs solely for the purpose of generating responses; neither
            provider uses your inputs or outputs to train their models under our API agreements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">7. Automated decision-making and AI processing</h2>
          <p>
            PinkPepper uses AI language models (Groq, OpenAI) to generate drafts, answer questions, and analyse
            uploaded images. This processing assists with the creation of food safety documentation but does{" "}
            <strong>not</strong> constitute automated decision-making producing legal or similarly significant effects
            within the meaning of Article 22 of the GDPR or UK GDPR.
          </p>
          <p className="mt-3">
            All AI-generated outputs are drafts intended for human review. Decisions about the adoption,
            implementation, or submission of any output remain with you and the competent personnel in your
            organisation. PinkPepper does not use your personal data for profiling or to make automated decisions
            about you (for example, eligibility, creditworthiness, or behavioural scoring).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">8. Your rights</h2>
          <p className="mb-3">
            Under GDPR and UK GDPR you have the following rights regarding your personal data:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> ask us to correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> request deletion of your personal data (&quot;right to be forgotten&quot;), subject to our legal retention obligations.</li>
            <li><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
            <li><strong>Restriction:</strong> ask us to restrict processing of your data in certain circumstances.</li>
            <li><strong>Objection:</strong> object to processing based on legitimate interests.</li>
            <li><strong>Withdrawal of consent:</strong> where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
            We will respond within one month. We may need to verify your identity before acting on a request.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">9. Children&apos;s data</h2>
          <p>
            PinkPepper is not directed at children under the age of 16. We do not knowingly collect personal data from
            children. If you believe a child has provided us with personal data, contact us at{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>{" "}
            and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">10. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data including
            TLS encryption in transit, AES-256 encryption at rest, row-level security in our database, and restricted
            access controls. See our <Link href="/security" className="text-[#E11D48] hover:underline">Security page</Link> for
            full details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">11. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management, and a preference cookie to store your
            cookie consent choice. See our{" "}
            <Link href="/legal/cookies" className="text-[#E11D48] hover:underline">Cookie Policy</Link> for the full inventory.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">12. Right to complain</h2>
          <p>
            If you are unhappy with how we handle your personal data, you have the right to lodge a complaint with a
            supervisory authority:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Ireland (EU):</strong>{" "}
              <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">
                Data Protection Commission (DPC)
              </a>
            </li>
            <li>
              <strong>United Kingdom:</strong>{" "}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">
                Information Commissioner&apos;s Office (ICO)
              </a>
            </li>
          </ul>
          <p className="mt-3">
            We would appreciate the opportunity to address your concerns before you contact a regulator, so please reach
            out to us first at{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">13. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by email or via
            an in-app notice at least 14 days before they take effect. The &quot;Last updated&quot; date at the top of this page
            reflects the most recent revision.
          </p>
        </section>

      </div>
    </main>
  );
}

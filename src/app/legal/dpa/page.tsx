import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement | PinkPepper",
  description: "PinkPepper's Data Processing Agreement for customers acting as data controllers under GDPR.",
  alternates: { canonical: "https://pinkpepper.io/legal/dpa" },
};

export default function DpaPage() {
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <h1 className="text-4xl font-semibold text-[#0F172A]">Data Processing Agreement</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Last updated: March 2026</p>
      </div>

      <div className="mb-8 rounded-xl border border-[#E0F2FE] bg-[#F0F9FF] p-5 text-sm text-[#0369A1]">
        <strong>Note for customers requiring a signed DPA:</strong> This page sets out the standard terms
        under which PinkPepper acts as a data processor. If your organisation requires a countersigned DPA
        for compliance purposes, email{" "}
        <a href="mailto:support@pinkpepper.io" className="underline">support@pinkpepper.io</a> and we will
        arrange execution.
      </div>

      <div className="space-y-10 text-[#374151] leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">1. Parties and definitions</h2>
          <p>
            This Data Processing Agreement (&quot;DPA&quot;) is between PinkPepper.io (&quot;Processor&quot;) and the
            customer using the PinkPepper service (&quot;Controller&quot;).
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li><strong>Applicable Data Protection Law:</strong> GDPR (EU) 2016/679 and UK GDPR as applicable.</li>
            <li><strong>Personal Data:</strong> any information relating to an identified or identifiable natural person processed through the Service.</li>
            <li><strong>Processing:</strong> any operation performed on personal data as defined in applicable law.</li>
            <li><strong>Subprocessor:</strong> a third party engaged by PinkPepper to assist in providing the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">2. Subject matter and duration</h2>
          <p>
            PinkPepper processes personal data on behalf of the Controller solely to provide the PinkPepper
            service as described in the{" "}
            <a href="/legal/terms" className="text-[#E11D48] hover:underline">Terms of Service</a>. Processing
            continues for the duration of the Controller&apos;s subscription and ceases when the account is closed
            or this DPA is terminated.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">3. Nature and purpose of processing</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Storing user accounts, authentication credentials, and profile data.</li>
            <li>Processing chat messages and uploaded files to generate AI-assisted responses.</li>
            <li>Storing conversation history and generated documents.</li>
            <li>Processing billing information (via Stripe) to manage subscriptions.</li>
            <li>Sending transactional emails (via Resend) in connection with account activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">4. Categories of data subjects and data types</h2>
          <p className="mb-3">Data subjects: employees, agents, and end-users of the Controller who use the Service.</p>
          <p>Data types processed:</p>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>Identifiers: email address, name, account ID.</li>
            <li>Authentication credentials (hashed passwords, session tokens).</li>
            <li>Content data: chat messages, uploaded images, generated documents.</li>
            <li>Usage data: usage counts, timestamps, subscription tier.</li>
            <li>Billing data: billing name, address (card data is processed directly by Stripe).</li>
            <li>Technical data: IP address, browser type, log data.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">5. Controller obligations</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>The Controller warrants that it has a lawful basis for providing personal data to PinkPepper for processing.</li>
            <li>The Controller is responsible for providing required notices to data subjects.</li>
            <li>The Controller will promptly respond to data subject requests that require Controller action.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">6. Processor obligations</h2>
          <p className="mb-3">PinkPepper will:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Process personal data only on documented instructions from the Controller (i.e., use of the Service), unless required by law.</li>
            <li>Ensure that persons authorised to process personal data are bound by confidentiality obligations.</li>
            <li>Implement appropriate technical and organisational security measures as described in our{" "}
              <a href="/security" className="text-[#E11D48] hover:underline">Security page</a>.
            </li>
            <li>Not engage new subprocessors without giving the Controller prior notice (at least 14 days) and an opportunity to object.</li>
            <li>Assist the Controller in responding to data subject rights requests to the extent technically feasible.</li>
            <li>Notify the Controller without undue delay (within 72 hours of becoming aware) of a personal data breach affecting Controller data.</li>
            <li>Provide reasonable assistance with the Controller&apos;s GDPR obligations including DPIAs where applicable.</li>
            <li>Upon termination, delete or return all personal data in accordance with our{" "}
              <a href="/legal/privacy" className="text-[#E11D48] hover:underline">Privacy Policy</a> retention schedules.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">7. Subprocessors</h2>
          <p className="mb-3">
            PinkPepper uses the following subprocessors. All are bound by data processing agreements and
            appropriate transfer mechanisms:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left">
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Subprocessor</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                <tr>
                  <td className="px-4 py-3">
                    <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">Supabase</a>
                  </td>
                  <td className="px-4 py-3">Database, authentication, storage</td>
                  <td className="px-4 py-3">EU (Frankfurt)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">Vercel</a>
                  </td>
                  <td className="px-4 py-3">Application hosting</td>
                  <td className="px-4 py-3">EU / Global CDN</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">Groq</a>
                  </td>
                  <td className="px-4 py-3">LLM inference (chat responses)</td>
                  <td className="px-4 py-3">US (SCCs)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <a href="https://openai.com/enterprise-privacy" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">OpenAI</a>
                  </td>
                  <td className="px-4 py-3">Embeddings and image analysis</td>
                  <td className="px-4 py-3">US (SCCs)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">Stripe</a>
                  </td>
                  <td className="px-4 py-3">Payment processing</td>
                  <td className="px-4 py-3">US / EU (SCCs)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#E11D48] hover:underline">Resend</a>
                  </td>
                  <td className="px-4 py-3">Transactional email delivery</td>
                  <td className="px-4 py-3">US (SCCs)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">8. International transfers</h2>
          <p>
            Where personal data is transferred to subprocessors located outside the EEA or UK, PinkPepper
            relies on Standard Contractual Clauses (SCCs) approved by the European Commission and, for UK
            transfers, the UK International Data Transfer Agreement (IDTA).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">9. Security measures</h2>
          <p>
            PinkPepper implements technical and organisational measures including TLS 1.2+ encryption in
            transit, AES-256 encryption at rest, row-level security for data isolation, and access controls.
            Full details are available on our{" "}
            <a href="/security" className="text-[#E11D48] hover:underline">Security page</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">10. Governing law</h2>
          <p>
            This DPA is governed by the laws of the Republic of Ireland and the provisions of the GDPR as
            applicable. For UK customers, the UK GDPR and Data Protection Act 2018 apply in parallel.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">11. Contact</h2>
          <p>
            For DPA enquiries or to request a countersigned copy, contact{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

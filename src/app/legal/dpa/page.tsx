import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Processing Agreement | PinkPepper",
  description: "PinkPepper's Data Processing Agreement for customers acting as data controllers under GDPR.",
  alternates: { canonical: "https://pinkpepper.io/legal/dpa" },
  robots: { index: false, follow: false },
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
            <Link href="/legal/terms" className="text-[#E11D48] hover:underline">Terms of Service</Link>. Processing
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
              <Link href="/security" className="text-[#E11D48] hover:underline">Security page</Link>.
            </li>
            <li>Not engage new subprocessors without giving the Controller prior notice (at least 14 days) and an opportunity to object.</li>
            <li>Assist the Controller in responding to data subject rights requests to the extent technically feasible.</li>
            <li>Notify the Controller without undue delay (within 72 hours of becoming aware) of a personal data breach affecting Controller data.</li>
            <li>Provide reasonable assistance with the Controller&apos;s GDPR obligations including DPIAs where applicable.</li>
            <li>Upon termination, delete or return all personal data in accordance with our{" "}
              <Link href="/legal/privacy" className="text-[#E11D48] hover:underline">Privacy Policy</Link> retention schedules.
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
          <p className="mb-3">
            In accordance with Article 32 GDPR, PinkPepper implements the following technical and
            organisational measures to ensure a level of security appropriate to the risk:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Encryption in transit:</strong> TLS 1.2 or higher for all connections to the Service.</li>
            <li><strong>Encryption at rest:</strong> AES-256 for stored database records, file storage, and backups.</li>
            <li><strong>Access controls:</strong> role-based access for PinkPepper personnel; principle of least privilege; MFA on all administrative accounts.</li>
            <li><strong>Data isolation:</strong> row-level security policies in the database enforce per-account tenant isolation.</li>
            <li><strong>Credential protection:</strong> passwords stored as one-way hashes; session tokens rotated; no plaintext credential storage.</li>
            <li><strong>Logging and monitoring:</strong> security-relevant events logged; anomaly alerts on administrative access.</li>
            <li><strong>Vulnerability management:</strong> dependency scanning and timely patching of security advisories.</li>
            <li><strong>Personnel:</strong> confidentiality obligations and security training for staff with access to personal data.</li>
            <li><strong>Backup and recovery:</strong> regular encrypted backups with documented restoration procedures.</li>
            <li><strong>Subprocessor due diligence:</strong> executed DPAs and appropriate transfer mechanisms with every subprocessor listed in Section 7.</li>
          </ul>
          <p className="mt-3">
            Further detail is available on our{" "}
            <Link href="/security" className="text-[#E11D48] hover:underline">Security page</Link>. PinkPepper will
            review these measures periodically and update them to reflect the evolving state of the art and
            the risks posed to the rights and freedoms of data subjects.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">10. Audits and information rights</h2>
          <p>
            In accordance with Article 28(3)(h) GDPR, PinkPepper will make available to the Controller all
            information reasonably necessary to demonstrate compliance with the obligations set out in this
            DPA and in Article 28 GDPR.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Standing documentation:</strong> PinkPepper satisfies its information duty by making
              available the Privacy Policy, this DPA, the Security page, and current subprocessor list. The
              Controller may request reasonable additional information by emailing{" "}
              <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
            </li>
            <li>
              <strong>Audit request:</strong> once per 12-month period, or more frequently if required by a
              competent supervisory authority or following a personal data breach affecting the Controller,
              the Controller (or an independent auditor bound by confidentiality and mandated by the
              Controller) may audit PinkPepper&apos;s compliance with this DPA.
            </li>
            <li>
              <strong>Procedure:</strong> audits shall be conducted on at least 30 days&apos; prior written
              notice, during PinkPepper&apos;s normal business hours, in a manner that does not unreasonably
              interfere with PinkPepper&apos;s operations, and subject to the auditor signing reasonable
              confidentiality undertakings. PinkPepper may satisfy audit requests by providing a recent
              third-party attestation report (for example, an ISO 27001 or SOC 2 report) covering the
              requested scope, where available.
            </li>
            <li>
              <strong>Costs:</strong> the Controller bears its own audit costs. PinkPepper may charge
              reasonable fees for time spent supporting the audit in excess of what is required by applicable
              law.
            </li>
            <li>
              <strong>Regulator co-operation:</strong> PinkPepper will co-operate with requests from competent
              supervisory authorities relating to the processing carried out under this DPA.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">11. Governing law</h2>
          <p>
            This DPA is governed by the laws of the Republic of Ireland and the provisions of the GDPR as
            applicable. For UK customers, the UK GDPR and Data Protection Act 2018 apply in parallel.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">12. Contact</h2>
          <p>
            For DPA enquiries or to request a countersigned copy, contact{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

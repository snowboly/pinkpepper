import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security & Trust | PinkPepper Food Safety Compliance Software",
  description:
    "How PinkPepper protects food safety compliance data for EU and UK businesses across infrastructure, encryption, AI data handling, subprocessors, and GDPR alignment.",
  alternates: {
    canonical: "https://pinkpepper.io/security",
  },
};

const subprocessors = [
  {
    name: "Supabase",
    role: "Database, authentication & file storage",
    location: "AWS (EU region)",
    link: "https://supabase.com/security",
  },
  {
    name: "Vercel",
    role: "Application hosting & edge delivery",
    location: "Global CDN (EU nodes available)",
    link: "https://vercel.com/security",
  },
  {
    name: "Groq",
    role: "AI language model inference (text chat)",
    location: "United States",
    link: "https://groq.com/privacy-policy/",
  },
  {
    name: "OpenAI",
    role: "Embeddings (RAG) & image analysis",
    location: "United States",
    link: "https://openai.com/security",
  },
  {
    name: "Stripe",
    role: "Payment processing & billing",
    location: "United States / EU",
    link: "https://stripe.com/docs/security",
  },
  {
    name: "Resend",
    role: "Transactional email delivery",
    location: "United States",
    link: "https://resend.com/security",
  },
];

export default function SecurityPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="pp-container max-w-3xl">

        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#E11D48]">
            Security & Trust
          </p>
          <h1 className="pp-display mb-5 text-4xl font-bold text-[#0F172A] md:text-5xl">
            Your compliance data is safe with us
          </h1>
          <p className="text-lg leading-relaxed text-[#475569]">
            PinkPepper is built for regulated food businesses. We take the
            security of your HACCP plans, SOPs, and operational records
            seriously — because your auditors do too.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-[#475569]">
            <Link href="/pricing" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              View pricing
            </Link>
            <Link href="/contact" className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]">
              Contact support
            </Link>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-14">

          {/* Infrastructure */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Infrastructure</h2>
            <div className="space-y-3 text-[#475569] leading-relaxed">
              <p>
                PinkPepper is hosted on <strong className="text-[#0F172A]">Supabase</strong> (database,
                authentication, and file storage) running on AWS infrastructure in the <strong className="text-[#0F172A]">EU region</strong>.
                Application delivery is handled by <strong className="text-[#0F172A]">Vercel</strong>, with
                edge nodes serving EU traffic locally where possible.
              </p>
              <p>
                Both Supabase and Vercel maintain ISO 27001-aligned security programmes and publish
                their own security documentation. You can review their policies via the subprocessor
                table below.
              </p>
            </div>
          </section>

          {/* Encryption */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Encryption</h2>
            <ul className="space-y-3 text-[#475569] leading-relaxed">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">In transit:</strong> All traffic between your
                  browser and PinkPepper is encrypted using TLS 1.2 or higher. Connections to
                  third-party AI providers are also TLS-encrypted.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">At rest:</strong> All data stored in Supabase
                  (Postgres and object storage) is encrypted at rest using AES-256, managed by AWS.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">Passwords:</strong> We do not store passwords.
                  Authentication is handled by Supabase Auth, which uses industry-standard
                  bcrypt hashing and supports magic-link email sign-in.
                </span>
              </li>
            </ul>
          </section>

          {/* Access Control */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Access Control & Data Isolation</h2>
            <div className="space-y-3 text-[#475569] leading-relaxed">
              <p>
                Every database query in PinkPepper is subject to{" "}
                <strong className="text-[#0F172A]">Row Level Security (RLS)</strong> enforced at the
                database level by Supabase. This means that even if application-layer logic had a
                bug, users cannot access another user&apos;s conversations, documents, or account data.
              </p>
              <p>
                Admin access to PinkPepper infrastructure requires authenticated Supabase credentials
                and is restricted to authorised personnel only.
              </p>
            </div>
          </section>

          {/* AI Data Handling */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">AI Data Handling</h2>
            <div className="space-y-3 text-[#475569] leading-relaxed">
              <p>
                PinkPepper uses two AI providers for its core features:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                  <span>
                    <strong className="text-[#0F172A]">Groq</strong> (text chat responses) — accessed
                    via API. Per Groq&apos;s API terms,{" "}
                    <strong className="text-[#0F172A]">
                      your prompts and outputs are not used to train AI models
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                  <span>
                    <strong className="text-[#0F172A]">OpenAI</strong> (image analysis and semantic
                    search embeddings) — accessed via API. Per OpenAI&apos;s API data usage policy,{" "}
                    <strong className="text-[#0F172A]">
                      API inputs and outputs are not used to train OpenAI models
                    </strong>{" "}
                    by default.
                  </span>
                </li>
              </ul>
              <p>
                Conversation content sent to AI providers is processed in memory for that request only
                and is not retained by those providers beyond their standard API logging windows.
                Your HACCP plans and SOPs remain yours.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Data Retention & Deletion</h2>
            <ul className="space-y-3 text-[#475569] leading-relaxed">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">Free plan:</strong> Conversations are retained
                  for 30 days, then automatically deleted.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">Plus / Pro plans:</strong> Conversations are
                  retained for the life of the account.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">Account deletion:</strong> You can request
                  deletion of your account and all associated data at any time by contacting us.
                  We will action verified deletion requests within 30 days.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
                <span>
                  <strong className="text-[#0F172A]">Uploaded images:</strong> Images uploaded for
                  analysis are stored temporarily and purged automatically after processing.
                </span>
              </li>
            </ul>
          </section>

          {/* GDPR */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">GDPR & UK GDPR</h2>
            <div className="space-y-3 text-[#475569] leading-relaxed">
              <p>
                PinkPepper is designed to comply with both the EU General Data Protection Regulation
                (GDPR) and the UK GDPR. Our{" "}
                <Link href="/legal/privacy" className="text-[#E11D48] underline decoration-[#E11D48]/30 underline-offset-2 hover:decoration-[#E11D48]">
                  Privacy Policy
                </Link>{" "}
                describes what personal data we collect, why, and how long we retain it.
              </p>
              <p>
                For businesses that process personal data using PinkPepper (for example, storing
                employee records or customer complaint logs in conversations), a{" "}
                <Link href="/legal/dpa" className="text-[#E11D48] underline decoration-[#E11D48]/30 underline-offset-2 hover:decoration-[#E11D48]">
                  Data Processing Agreement (DPA)
                </Link>{" "}
                is available on request. Contact us at{" "}
                <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] underline decoration-[#E11D48]/30 underline-offset-2 hover:decoration-[#E11D48]">
                  support@pinkpepper.io
                </a>
                .
              </p>
            </div>
          </section>

          {/* Subprocessors */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Subprocessors</h2>
            <p className="mb-6 text-[#475569] leading-relaxed">
              PinkPepper uses the following third-party subprocessors to deliver its service. Each
              has been selected for its security posture and, where available, GDPR-compliant data
              processing terms.
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Provider</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Purpose</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {subprocessors.map((sp) => (
                    <tr key={sp.name} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#0F172A]">
                        <a
                          href={sp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E11D48] hover:underline"
                        >
                          {sp.name}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-[#475569]">{sp.role}</td>
                      <td className="px-4 py-3 text-[#475569]">{sp.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Security Contact */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Report a Security Issue</h2>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFF1F2] p-6">
              <p className="text-[#475569] leading-relaxed">
                If you discover a potential security vulnerability in PinkPepper, please report it
                responsibly by emailing{" "}
                <a
                  href="mailto:support@pinkpepper.io"
                  className="font-semibold text-[#E11D48] hover:underline"
                >
                  support@pinkpepper.io
                </a>{" "}
                with the subject line <em>&quot;Security Disclosure&quot;</em>. We will acknowledge
                receipt within 48 hours and work to resolve confirmed issues promptly. We ask that
                you give us reasonable time to address the issue before any public disclosure.
              </p>
            </div>
          </section>

          {/* Last updated */}
          <p className="text-sm text-[#94A3B8]">Last updated: March 2026</p>

        </div>
      </div>
    </main>
  );
}

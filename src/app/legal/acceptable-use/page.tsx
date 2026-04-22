import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | PinkPepper",
  description: "Rules governing acceptable use of the PinkPepper platform.",
  alternates: { canonical: "https://pinkpepper.io/legal/acceptable-use" },
  robots: { index: false, follow: false },
};

export default function AcceptableUsePage() {
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <h1 className="text-4xl font-semibold text-[#0F172A]">Acceptable Use Policy</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Last updated: March 2026</p>
      </div>

      <div className="space-y-10 text-[#374151] leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">1. Purpose</h2>
          <p>
            This Acceptable Use Policy (&quot;AUP&quot;) sets out the rules for using PinkPepper. It applies to all users
            and is incorporated into our{" "}
            <Link href="/legal/terms" className="text-[#E11D48] hover:underline">Terms of Service</Link>. Using PinkPepper
            means you agree to this AUP.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">2. Permitted uses</h2>
          <p className="mb-3">You may use PinkPepper for:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Drafting and reviewing food safety documentation (HACCP plans, SOPs, cleaning schedules, allergen matrices, traceability records).</li>
            <li>Preparing for food safety inspections and internal audits.</li>
            <li>Training and learning about EU and UK food safety regulations.</li>
            <li>Business use within your own organisation.</li>
            <li>Exporting documents for review by qualified food safety professionals.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">3. Prohibited uses</h2>
          <p className="mb-3">You must not use PinkPepper to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Violate any applicable law or regulation.</li>
            <li>Submit content that is harmful, threatening, defamatory, obscene, or otherwise objectionable.</li>
            <li>Infringe the intellectual property rights of others.</li>
            <li>Attempt to bypass, circumvent, or disable usage limits, subscription tier restrictions, or security controls.</li>
            <li>Automate access to the Service in a way that places unreasonable load on our infrastructure, or to scrape content at scale.</li>
            <li>Resell, sublicense, or white-label the Service without prior written permission from PinkPepper.</li>
            <li>Impersonate any person or organisation.</li>
            <li>Introduce malware, viruses, or other harmful code.</li>
            <li>Probe, scan, or test the vulnerability of the Service without prior written consent.</li>
            <li>Use outputs as final compliance documentation without review by a qualified food safety professional.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">4. Account sharing</h2>
          <p>
            Each account is for a single named user. You must not share your account credentials with others
            or allow others to access the Service through your account. Team access plans may be offered in
            future; check the{" "}
            <Link href="/pricing" className="text-[#E11D48] hover:underline">Pricing page</Link> for current options.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">5. Content you submit</h2>
          <p>
            You are solely responsible for the content you submit to PinkPepper, including prompts, uploaded
            images, and files. Do not submit personally identifiable information about third parties unless
            you have a lawful basis to do so. Do not submit confidential information belonging to others
            without authorisation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">6. Enforcement</h2>
          <p>
            Violations of this AUP may result in:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>A warning and request to stop the prohibited activity.</li>
            <li>Temporary suspension of your account.</li>
            <li>Permanent termination of your account.</li>
            <li>Referral to law enforcement where required by law.</li>
          </ul>
          <p className="mt-3">
            We reserve the right to act immediately and without prior notice where we determine there is an
            ongoing risk to the Service, other users, or third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">7. Reporting violations</h2>
          <p>
            If you become aware of any use of PinkPepper that violates this AUP, please report it to{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

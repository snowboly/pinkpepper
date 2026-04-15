import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | PinkPepper",
  description: "How PinkPepper uses cookies and similar technologies.",
  alternates: { canonical: "https://www.pinkpepper.io/legal/cookies" },
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <main className="pp-container max-w-4xl py-16">
      <div className="mb-8 border-b border-[#F1F5F9] pb-8">
        <h1 className="text-4xl font-semibold text-[#0F172A]">Cookie Policy</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Last updated: March 2026</p>
      </div>

      <div className="space-y-10 text-[#374151] leading-relaxed">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">1. What are cookies?</h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to
            make websites work, remember your preferences, and provide information to site owners. Similar
            technologies such as local storage and session tokens serve comparable purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">2. How we use cookies</h2>
          <p>
            PinkPepper uses cookies for two purposes only: authentication (so you stay logged in) and storing
            your cookie consent preference. We do not use advertising cookies or sell data to advertisers.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">3. Cookie inventory</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left">
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Name</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Duration</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Provider</th>
                  <th className="px-4 py-3 font-semibold text-[#0F172A]">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">sb-auth-token</td>
                  <td className="px-4 py-3">Supabase authentication session token — keeps you logged in</td>
                  <td className="px-4 py-3">Session</td>
                  <td className="px-4 py-3">PinkPepper / Supabase</td>
                  <td className="px-4 py-3">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">sb-refresh-token</td>
                  <td className="px-4 py-3">Supabase refresh token — renews your session without re-login</td>
                  <td className="px-4 py-3">Up to 60 days</td>
                  <td className="px-4 py-3">PinkPepper / Supabase</td>
                  <td className="px-4 py-3">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">pp-cookie-consent</td>
                  <td className="px-4 py-3">Stores your cookie consent choice so the banner is not shown repeatedly</td>
                  <td className="px-4 py-3">365 days</td>
                  <td className="px-4 py-3">PinkPepper</td>
                  <td className="px-4 py-3">Functional</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">__stripe_mid</td>
                  <td className="px-4 py-3">Stripe fraud prevention — identifies the browser during payment sessions</td>
                  <td className="px-4 py-3">1 year</td>
                  <td className="px-4 py-3">Stripe</td>
                  <td className="px-4 py-3">Essential (payment)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">__stripe_sid</td>
                  <td className="px-4 py-3">Stripe fraud prevention — identifies the browser during a payment session</td>
                  <td className="px-4 py-3">30 minutes</td>
                  <td className="px-4 py-3">Stripe</td>
                  <td className="px-4 py-3">Essential (payment)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#64748B]">
            We do not currently use analytics, tracking, or advertising cookies. If this changes we will update
            this policy and, where required, seek your consent before setting such cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">4. Your consent</h2>
          <p>
            When you first visit PinkPepper, a cookie banner informs you of our use of cookies. Authentication
            and payment cookies are strictly necessary for the Service to function and do not require consent
            under the ePrivacy Directive. The <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-xs">pp-cookie-consent</code> preference cookie
            is set only after you interact with the banner.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">5. How to manage cookies</h2>
          <p className="mb-3">
            You can control cookies through your browser settings. Disabling essential cookies will prevent
            you from logging in or using paid features.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm">
            <li>
              <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
            </li>
            <li>
              <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
            </li>
            <li>
              <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[#0F172A]">6. Contact</h2>
          <p>
            For questions about our use of cookies, contact us at{" "}
            <a href="mailto:support@pinkpepper.io" className="text-[#E11D48] hover:underline">support@pinkpepper.io</a>.
          </p>
        </section>

      </div>
    </main>
  );
}

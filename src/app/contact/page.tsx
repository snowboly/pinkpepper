import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact & Support | PinkPepper",
};

export default function ContactPage() {
  return (
    <main>
      <section className="py-16 text-center">
        <div className="pp-container max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-[#2B2B2B] md:text-5xl">
            Contact &amp; Support
          </h1>
          <p className="mt-4 text-lg text-[#6B6B6B]">
            We&apos;re here to help with food safety compliance questions, account issues, and feedback.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="pp-container max-w-xl">
          <div className="rounded-2xl border border-[#E8DADA] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F2]">
              <Mail className="h-6 w-6 text-[#E11D48]" />
            </div>
            <a
              href="mailto:support@pinkpepper.io"
              className="text-lg font-semibold text-[#E11D48] underline underline-offset-2 transition-colors hover:text-[#BE123C]"
            >
              support@pinkpepper.io
            </a>
            <p className="mt-3 text-sm text-[#6B6B6B]">
              We aim to reply within 1 business day.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-[#6B6B6B]">
            Pro subscribers receive priority support for compliance questions.
          </p>
        </div>
      </section>
    </main>
  );
}

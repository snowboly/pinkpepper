import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free | PinkPepper - AI Food Safety Assistant",
  description:
    "Create a free PinkPepper account and start generating HACCP plans, allergen documents, and audit-ready compliance packs for your EU or UK food business.",
  alternates: {
    canonical: "https://www.pinkpepper.io/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

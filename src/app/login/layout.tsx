import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | PinkPepper",
  description:
    "Sign in to your PinkPepper account to access your food safety compliance documents, HACCP plans, and audit workflows.",
  alternates: {
    canonical: "https://www.pinkpepper.io/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

"use client";

import dynamic from "next/dynamic";

export const DemoTabSwitcherIsland = dynamic(
  () => import("@/components/homepage/DemoTabSwitcher").then((mod) => mod.DemoTabSwitcher),
  {
    ssr: false,
    loading: () => <div className="min-h-[28rem] rounded-[2rem] border border-[#E2E8F0] bg-white/60" aria-hidden="true" />,
  },
);

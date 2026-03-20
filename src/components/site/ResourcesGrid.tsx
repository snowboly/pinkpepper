"use client";

import Link from "next/link";
import { useState } from "react";

export type ResourceEntry = {
  href: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
};

const CATEGORY_COLORS: Record<string, { badge: string; dot: string }> = {
  haccp:       { badge: "bg-[#FFF1F2] text-[#BE123C]",   dot: "bg-[#E11D48]" },
  allergen:    { badge: "bg-[#FFF7ED] text-[#C2410C]",   dot: "bg-[#EA580C]" },
  cleaning:    { badge: "bg-[#F0FDF4] text-[#15803D]",   dot: "bg-[#16A34A]" },
  monitoring:  { badge: "bg-[#EFF6FF] text-[#1D4ED8]",   dot: "bg-[#2563EB]" },
  traceability:{ badge: "bg-[#F5F3FF] text-[#6D28D9]",   dot: "bg-[#7C3AED]" },
  supplier:    { badge: "bg-[#ECFEFF] text-[#0E7490]",   dot: "bg-[#0891B2]" },
  audit:       { badge: "bg-[#F8FAFC] text-[#475569]",   dot: "bg-[#64748B]" },
  training:    { badge: "bg-[#FEF9C3] text-[#A16207]",   dot: "bg-[#CA8A04]" },
};

const ALL_LABEL = "All templates";

type Props = {
  resources: ResourceEntry[];
};

export function ResourcesGrid({ resources }: Props) {
  const [active, setActive] = useState<string>("all");

  const categories = [
    { key: "all",          label: ALL_LABEL },
    { key: "haccp",        label: "HACCP" },
    { key: "allergen",     label: "Allergen" },
    { key: "cleaning",     label: "Cleaning" },
    { key: "monitoring",   label: "Monitoring" },
    { key: "traceability", label: "Traceability" },
    { key: "supplier",     label: "Supplier" },
    { key: "audit",        label: "Audit" },
    { key: "training",     label: "Training" },
  ];

  const visible = active === "all" ? resources : resources.filter((r) => r.category === active);

  return (
    <div>
      {/* Category filter tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => {
            const isActive = active === cat.key;
            const colors = CATEGORY_COLORS[cat.key];
            return (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className={[
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
                ].join(" ")}
              >
                {colors && !isActive && (
                  <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
                )}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="mt-6 text-sm text-[#94A3B8]">
        {visible.length} {visible.length === 1 ? "template" : "templates"}
      </p>

      {/* Template cards */}
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((resource) => {
          const colors = CATEGORY_COLORS[resource.category] ?? CATEGORY_COLORS.audit;
          return (
            <Link
              key={resource.href}
              href={resource.href}
              className="group flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
            >
              <span
                className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
              >
                {resource.categoryLabel}
              </span>
              <p className="mt-4 text-base font-semibold leading-snug text-[#0F172A] group-hover:text-[#E11D48] transition-colors">
                {resource.title}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#475569]">
                {resource.description}
              </p>
              <span className="mt-4 text-xs font-semibold text-[#E11D48]">
                View template →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

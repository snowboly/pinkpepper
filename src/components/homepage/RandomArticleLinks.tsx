"use client";

import Link from "next/link";
import { useState } from "react";

type ArticleLink = {
  href: string;
  category: string;
  title: string;
};

const ARTICLE_POOL: ArticleLink[] = [
  { href: "/articles/how-to-create-a-haccp-plan-step-by-step", category: "Guide", title: "How to Create a HACCP Plan Step by Step" },
  { href: "/articles/haccp-plan-example-restaurant", category: "Template", title: "HACCP Plan Example: Restaurant" },
  { href: "/articles/identifying-critical-control-points-in-food-safety", category: "Guide", title: "Identifying Critical Control Points in Food Safety" },
  { href: "/articles/how-to-perform-a-hazard-analysis-correctly", category: "Guide", title: "How to Perform a Hazard Analysis Correctly" },
  { href: "/articles/temperature-control-in-haccp-limits-and-monitoring", category: "Compliance", title: "Temperature Control in HACCP: Limits and Monitoring" },
  { href: "/articles/allergen-management-within-haccp-plans", category: "Compliance", title: "Allergen Management Within HACCP Plans" },
  { href: "/articles/top-reasons-haccp-plans-fail-during-audits", category: "Audit", title: "Top Reasons HACCP Plans Fail During Audits" },
  { href: "/articles/the-biggest-haccp-mistakes-we-see-in-professional-reviews", category: "Audit", title: "The Biggest HACCP Mistakes in Professional Reviews" },
  { href: "/articles/what-regulators-really-expect-from-small-food-businesses", category: "Compliance", title: "What Regulators Really Expect from Small Food Businesses" },
  { href: "/articles/when-to-hire-a-haccp-consultant", category: "Guide", title: "When to Hire a HACCP Consultant" },
  { href: "/articles/haccp-checklist-for-new-food-businesses", category: "Checklist", title: "HACCP Checklist for New Food Businesses" },
  { href: "/articles/how-to-keep-haccp-practical-not-bureaucratic", category: "Guide", title: "How to Keep HACCP Practical, Not Bureaucratic" },
  { href: "/articles/correcting-non-conformities-in-haccp", category: "Compliance", title: "Correcting Non-Conformities in HACCP" },
  { href: "/articles/biological-hazards-in-haccp-examples-and-controls", category: "Guide", title: "Biological Hazards in HACCP: Examples and Controls" },
  { href: "/articles/physical-hazards-in-haccp-and-how-to-control-them", category: "Guide", title: "Physical Hazards in HACCP and How to Control Them" },
  { href: "/articles/cooling-and-reheating-haccp-high-risk-steps", category: "Compliance", title: "Cooling and Reheating: HACCP High-Risk Steps" },
  { href: "/articles/haccp-for-food-trucks", category: "Use Case", title: "HACCP for Food Trucks" },
  { href: "/articles/haccp-for-fine-dining-restaurants-eu", category: "Use Case", title: "HACCP for Fine Dining Restaurants" },
  { href: "/articles/haccp-for-school-canteens-eu", category: "Use Case", title: "HACCP for School Canteens" },
  { href: "/articles/haccp-for-dark-kitchens-and-ghost-kitchens-eu", category: "Use Case", title: "HACCP for Dark Kitchens and Ghost Kitchens" },
  { href: "/articles/haccp-for-pop-up-restaurants-eu", category: "Use Case", title: "HACCP for Pop-Up Restaurants" },
  { href: "/articles/haccp-for-meal-prep-services-eu", category: "Use Case", title: "HACCP for Meal Prep Services" },
  { href: "/articles/haccp-for-care-home-kitchens-eu", category: "Use Case", title: "HACCP for Care Home Kitchens" },
  { href: "/articles/haccp-for-event-catering-eu", category: "Use Case", title: "HACCP for Event Catering" },
  { href: "/articles/haccp-vs-brcgs-vs-ifs", category: "Compliance", title: "HACCP vs BRCGS vs IFS: What's the Difference?" },
  { href: "/articles/failed-haccp-inspection-consequences-uk", category: "Audit", title: "Failed HACCP Inspection: Consequences in the UK" },
  { href: "/articles/haccp-monitoring-record-templates", category: "Template", title: "HACCP Monitoring Record Templates" },
  { href: "/resources/haccp-plan-template", category: "Template", title: "HACCP Plan Template (Free Download)" },
  { href: "/resources/allergen-matrix-template", category: "Template", title: "Allergen Matrix Template" },
  { href: "/resources/food-safety-audit-checklist", category: "Checklist", title: "Food Safety Audit Checklist" },
  { href: "/resources/food-safety-management-system-template", category: "Template", title: "Food Safety Management System Template" },
  { href: "/resources/temperature-monitoring-log-template", category: "Template", title: "Temperature Monitoring Log Template" },
  { href: "/resources/cleaning-and-disinfection-sop", category: "Template", title: "Cleaning and Disinfection SOP" },
  { href: "/resources/corrective-action-log-template", category: "Template", title: "Corrective Action Log Template" },
  { href: "/features/haccp-plan-generator", category: "Feature", title: "AI HACCP Plan Generator" },
  { href: "/features/allergen-documentation", category: "Feature", title: "Allergen Documentation" },
  { href: "/features/food-safety-audit-prep", category: "Feature", title: "Food Safety Audit Prep" },
  { href: "/features/food-safety-sop-generator", category: "Feature", title: "SOP Generator" },
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function RandomArticleLinks() {
  const [links] = useState<ArticleLink[]>(() => pickRandom(ARTICLE_POOL, 3));

  if (links.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="pp-interactive group rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 transition-all hover:border-[#CBD5E1] hover:shadow-md hover:shadow-black/[0.04]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E11D48]">{link.category}</p>
          <p className="mt-2 text-sm font-semibold leading-snug text-[#0F172A] group-hover:text-[#1E293B]">{link.title}</p>
        </Link>
      ))}
    </div>
  );
}

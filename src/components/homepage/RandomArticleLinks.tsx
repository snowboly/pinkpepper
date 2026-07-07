import Link from "next/link";

type ArticleLink = {
  href: string;
  category: string;
  title: string;
};

const ARTICLE_POOL: ArticleLink[] = [
  {
    href: "/articles/building-a-haccp-process-flow-diagram",
    category: "Guide",
    title: "How to Build a HACCP Process Flow Diagram",
  },
  {
    href: "/articles/haccp-ccp-examples-uk-eu",
    category: "Compliance",
    title: "HACCP CCP Examples for EU and UK Food Businesses",
  },
  {
    href: "/resources/haccp-plan-template",
    category: "Template",
    title: "HACCP Plan Template (Free Download)",
  },
];

export default function RandomArticleLinks() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ARTICLE_POOL.map((link) => (
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

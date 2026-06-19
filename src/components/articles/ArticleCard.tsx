import Image from "next/image";
import Link from "next/link";

type ArticleCardProps = {
  category: string;
  excerpt: string;
  href: string;
  image?: string;
  publishedAt: string;
  title: string;
};

export function ArticleCard({
  category,
  excerpt,
  href,
  image,
  publishedAt,
  title,
}: ArticleCardProps) {
  return (
    <article className="group/article-card flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#E2E8F0] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-[#E2E8F0] bg-[#F8FAFC]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover/article-card:scale-[1.02]"
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_#FFE4E6,_#F8FAFC_62%)]">
            <span className="text-sm font-medium text-[#64748B]">Article image coming soon</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">{category}</p>
        <h2 className="mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0F172A] md:text-[2rem]">
          <Link href={href} className="transition-colors hover:text-[#BE123C]">
            {title}
          </Link>
        </h2>
        <p className="mt-3 text-sm font-medium text-[#64748B]">{publishedAt}</p>
        <p className="mt-4 flex-1 text-[15px] leading-7 text-[#475569]">{excerpt}</p>
        <div className="mt-6 border-t border-[#F1F5F9] pt-4">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
          >
            <span>Read article</span>
            <span aria-hidden="true">+</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;

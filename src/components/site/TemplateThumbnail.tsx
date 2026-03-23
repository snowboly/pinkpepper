import Image from "next/image";
import { createAdminClient } from "@/utils/supabase/admin";
import { BUCKETS } from "@/lib/storage";

type Props = {
  slug: string;
  alt: string;
};

export async function TemplateThumbnail({ slug, alt }: Props) {
  const admin = createAdminClient();

  const { data } = await admin.storage
    .from(BUCKETS.templates)
    .createSignedUrl(`Thumbnails/${slug}.png`, 300); // 5-min expiry

  if (!data?.signedUrl) {
    // Fall back to the local SVG placeholder if no PNG yet
    return (
      <Image
        src={`/templates/thumbnails/${slug}.svg`}
        alt={alt}
        width={600}
        height={780}
        className="w-full h-auto"
        priority
      />
    );
  }

  return (
    <Image
      src={data.signedUrl}
      alt={alt}
      width={600}
      height={780}
      className="w-full h-auto"
      priority
      unoptimized
    />
  );
}

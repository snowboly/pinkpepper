import type { ReactNode } from "react";
import { getCspNonce } from "@/lib/security/csp";

const resourcesBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://pinkpepper.io" },
    { "@type": "ListItem", position: 2, name: "Resources", item: "https://pinkpepper.io/resources" },
  ],
};

export default async function ResourcesLayout({ children }: { children: ReactNode }) {
  const nonce = await getCspNonce();
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resourcesBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}

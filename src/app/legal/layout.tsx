import type { ReactNode } from "react";
import { getCspNonce } from "@/lib/security/csp";

// Shared breadcrumb for all /legal/* pages.
// Each page's own title/description metadata handles the leaf name;
// this provides Home → Legal as the BreadcrumbList for search engines.
const legalBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://pinkpepper.io",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Legal",
      item: "https://pinkpepper.io/legal",
    },
  ],
};

export default async function LegalLayout({ children }: { children: ReactNode }) {
  const nonce = await getCspNonce();
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}

import type { ReactNode } from "react";

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

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}

/**
 * Registry of all downloadable food safety template files.
 * - slug: matches the URL path segment and the storage object name (slug.docx)
 * - title: human-readable name shown in download UI
 * - category: used for grouping in the workspace dropdown
 */

export type TemplateEntry = {
  slug: string;
  title: string;
  category: string;
  fileType?: "docx" | "xlsx";
};

export type TemplateGroup = {
  category: string;
  templates: TemplateEntry[];
};

export const TEMPLATES: TemplateEntry[] = [
  // HACCP
  { slug: "haccp-plan-template_hazzards",         title: "HACCP hazards register",                 category: "HACCP" },
  { slug: "haccp-plan-template_steps",            title: "HACCP step descriptions",                category: "HACCP" },
  { slug: "corrective-action-log-template",       title: "Corrective action log",                  category: "HACCP" },
  { slug: "product-recall-procedure-template",    title: "Product recall procedure",               category: "HACCP" },
  // Allergen
  { slug: "allergen-matrix-template",             title: "Allergen matrix template",               category: "Allergen" },
  // Cleaning
  { slug: "cleaning-and-disinfection-sop",        title: "Cleaning and disinfection SOP",          category: "Cleaning" },
  // Monitoring
  { slug: "temperature-monitoring-log-template",  title: "Temperature monitoring log",             category: "Monitoring" },
  { slug: "pest-control-log-template",            title: "Pest control log",                       category: "Monitoring" },
  { slug: "waste-management-log-template",        title: "Waste management log",                   category: "Monitoring" },
  { slug: "waste-management-sop-template",        title: "Waste management SOP",                   category: "Monitoring" },
  // Traceability
  { slug: "traceability-log-template",            title: "Traceability log",                       category: "Traceability" },
  // Supplier
  { slug: "supplier-approval-questionnaire",      title: "Supplier approval questionnaire",        category: "Supplier" },
  // Audit
  { slug: "food-safety-audit-checklist",          title: "Food safety audit checklist",            category: "Audit" },
  { slug: "food-safety-document-checklist",       title: "EU and UK document checklist",           category: "Audit" },
  { slug: "food-safety-management-system-template", title: "Food safety management system",        category: "Audit" },
  // Training
  { slug: "employee-food-safety-training-record", title: "Employee training record",               category: "Training" },
  { slug: "personal-hygiene-policy-template",     title: "Personal hygiene policy",                category: "Training" },
  // Goods receiving
  { slug: "incoming-goods-template",              title: "Incoming goods inspection record",       category: "Traceability" },
  // Quality
  { slug: "customer-complaint-log-template",      title: "Customer complaint log",                 category: "HACCP",        fileType: "xlsx" },
  // Calibration
  { slug: "equipment-calibration-log-template",   title: "Equipment calibration log",              category: "Monitoring",   fileType: "xlsx" },
];

export const TEMPLATE_SLUGS = new Set(TEMPLATES.map((t) => t.slug));

export function isValidTemplateSlug(slug: string): boolean {
  return TEMPLATE_SLUGS.has(slug);
}

export function getGroupedTemplates(): TemplateGroup[] {
  const sorted = [...TEMPLATES].sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) {
      return categoryCompare;
    }
    return a.title.localeCompare(b.title);
  });

  const grouped = new Map<string, TemplateEntry[]>();
  for (const template of sorted) {
    const items = grouped.get(template.category) ?? [];
    items.push(template);
    grouped.set(template.category, items);
  }

  return Array.from(grouped.entries()).map(([category, templates]) => ({
    category,
    templates,
  }));
}

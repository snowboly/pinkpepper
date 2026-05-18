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
  storageName?: string;
};

export type TemplateGroup = {
  category: string;
  templates: TemplateEntry[];
};

export const TEMPLATES: TemplateEntry[] = [
  // HACCP
  { slug: "haccp-plan-template_hazzards",         title: "HACCP Hazards Register Template",        category: "HACCP",        storageName: "haccp-plan-template_hazards" },
  { slug: "haccp-plan-template_steps",            title: "HACCP Step Descriptions Template",       category: "HACCP" },
  { slug: "corrective-action-log-template",       title: "Corrective Action Log Template",         category: "HACCP" },
  { slug: "product-recall-procedure-template",    title: "Product Recall Procedure Template",      category: "HACCP" },
  // Allergen
  { slug: "allergen-matrix-template",             title: "Allergen Matrix Template",               category: "Allergen" },
  // Cleaning
  { slug: "cleaning-and-disinfection-sop",        title: "Cleaning and Disinfection SOP Template", category: "Cleaning" },
  // Monitoring
  { slug: "temperature-monitoring-log-template",  title: "Temperature Monitoring Log Template",    category: "Monitoring" },
  { slug: "pest-control-log-template",            title: "Pest Control Log Template",              category: "Monitoring" },
  { slug: "waste-management-log-template",        title: "Waste Management Log Template",          category: "Monitoring" },
  { slug: "waste-management-sop-template",        title: "Waste Management SOP Template",          category: "Monitoring" },
  // Traceability
  { slug: "traceability-log-template",            title: "Traceability Log Template",              category: "Traceability" },
  // Supplier
  { slug: "supplier-approval-questionnaire",      title: "Supplier Approval Questionnaire Template", category: "Supplier" },
  // Training
  { slug: "employee-food-safety-training-record", title: "Employee Training Record Template",      category: "Training" },
  { slug: "personal-hygiene-policy-template",     title: "Personal Hygiene Policy Template",       category: "Training" },
  // Goods receiving
  { slug: "incoming-goods-template",              title: "Incoming Goods Inspection Record Template", category: "Traceability" },
  // Quality
  { slug: "customer-complaint-log-template",      title: "Customer Complaint Log Template",        category: "HACCP",        fileType: "xlsx" },
  // Calibration
  { slug: "equipment-calibration-log-template",   title: "Equipment Calibration Log Template",     category: "Monitoring",   fileType: "xlsx" },
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

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
  fileType?: "docx" | "xlsx" | "png";
  storageName?: string;
};

export type TemplateGroup = {
  category: string;
  templates: TemplateEntry[];
};

export const TEMPLATES: TemplateEntry[] = [
  // HACCP
  { slug: "haccp-plan-template_hazzards",         title: "HACCP hazards register",                 category: "HACCP",        storageName: "haccp-plan-template_hazards" },
  { slug: "haccp-plan-template_steps",            title: "HACCP step descriptions",                category: "HACCP" },
  { slug: "hazard-analysis-template",             title: "Hazard analysis template",               category: "HACCP" },
  { slug: "corrective-action-log-template",       title: "Corrective action log",                  category: "HACCP" },
  { slug: "food-safety-audit-checklist",          title: "Food safety audit checklist",            category: "HACCP" },
  { slug: "food-safety-document-checklist",       title: "EU and UK document checklist",           category: "HACCP" },
  { slug: "food-safety-management-system-template", title: "Food safety management system",        category: "HACCP" },
  { slug: "foreign-body-poster",                  title: "Foreign body prevention poster",          category: "HACCP",        fileType: "png" },
  { slug: "glass-brittle-poster",                 title: "Glass and brittle plastic control poster", category: "HACCP",      fileType: "png" },
  { slug: "product-recall-procedure-template",    title: "Product recall procedure",               category: "HACCP" },
  // Allergen
  { slug: "allergen-checklist-poster",            title: "Allergen checklist poster",             category: "Allergen",     fileType: "png" },
  { slug: "allergen-matrix-template",             title: "Allergen matrix template",               category: "Allergen" },
  // Cleaning
  { slug: "cleaning-and-disinfection-sop",        title: "Cleaning and disinfection SOP",          category: "Cleaning" },
  { slug: "cleaning-safety-poster",               title: "Cleaning safety poster",                 category: "Cleaning",     fileType: "png" },
  // Monitoring
  { slug: "chill-chain-poster",                   title: "Chill chain poster",                     category: "Monitoring",   fileType: "png" },
  { slug: "chilled-storage-poster",               title: "Chilled storage checklist poster",       category: "Monitoring",   fileType: "png" },
  { slug: "cooking-monitoring-log-template",      title: "Cooking monitoring log",                 category: "Monitoring" },
  { slug: "date-coding-poster",                   title: "Date coding poster",                     category: "Monitoring",   fileType: "png" },
  { slug: "food-temperature-poster",              title: "Food temperature poster",                category: "Monitoring",   fileType: "png" },
  { slug: "label-check-poster",                   title: "Label check poster",                     category: "Monitoring",   fileType: "png" },
  { slug: "temperature-monitoring-log-template",  title: "Temperature monitoring log",             category: "Monitoring" },
  { slug: "food-safety-opening-and-closing-checklist", title: "Food safety opening and closing checklist", category: "Monitoring", fileType: "xlsx", storageName: "Food Safety Opening and Closing Checklist" },
  { slug: "hygiene-inspection-poster",            title: "Pre-operational hygiene inspection poster", category: "Monitoring", fileType: "png" },
  { slug: "pest-control-log-template",            title: "Pest control log",                       category: "Monitoring" },
  { slug: "probe-calibration-poster",             title: "Probe thermometer calibration poster",   category: "Monitoring",   fileType: "png" },
  { slug: "restaurant-closing-checklist",         title: "Restaurant closing checklist",           category: "Monitoring",   fileType: "xlsx" },
  { slug: "restaurant-opening-checklist",         title: "Restaurant opening checklist",           category: "Monitoring",   fileType: "xlsx" },
  { slug: "restaurant-opening-poster",            title: "Restaurant opening poster",              category: "Monitoring",   fileType: "png" },
  { slug: "waste-management-log-template",        title: "Waste management log",                   category: "Monitoring" },
  { slug: "waste-management-sop-template",        title: "Waste management SOP",                   category: "Monitoring" },
  // Traceability
  { slug: "traceability-recall-poster",           title: "Traceability and recall readiness poster", category: "Traceability", fileType: "png" },
  { slug: "traceability-log-template",            title: "Traceability log",                       category: "Traceability" },
  // Supplier
  { slug: "supplier-approval-poster",             title: "Supplier approval checklist poster",     category: "Supplier",     fileType: "png" },
  { slug: "food-spec-template",                   title: "Food specification template",            category: "Supplier",     storageName: "food_spec_template" },
  { slug: "supplier-approval-questionnaire",      title: "Supplier approval questionnaire",        category: "Supplier" },
  { slug: "supplier-registration-log",            title: "Supplier registration log",              category: "Supplier",     fileType: "xlsx", storageName: "supplier-registration-template" },
  // Training
  { slug: "employee-food-safety-training-record", title: "Employee training record",               category: "Training" },
  { slug: "food-safety-culture-poster",           title: "Food safety culture poster",             category: "Training",     fileType: "png" },
  { slug: "gmp-poster",                           title: "GMP poster",                             category: "Training",     fileType: "png" },
  { slug: "halal-compliance-poster",              title: "Halal compliance poster",                category: "Training",     fileType: "png" },
  { slug: "handwashing-poster",                   title: "Handwashing poster",                     category: "Training",     fileType: "png" },
  { slug: "kosher-compliance-poster",             title: "Kosher compliance poster",               category: "Training",     fileType: "png" },
  { slug: "personal-hygiene-poster",              title: "Personal hygiene checklist poster",      category: "Training",     fileType: "png" },
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

export const faqs = [
  {
    question: "What is PinkPepper?",
    answer:
      "PinkPepper is AI-powered food safety compliance software built for EU and UK food businesses. It helps you create and maintain HACCP plans, allergen documentation, SOPs, corrective action records, and audit-ready evidence packs — grounding every output in verified, up-to-date EU and UK food safety legislation.",
  },
  {
    question: "Who is PinkPepper designed for?",
    answer:
      "PinkPepper is designed for restaurants, cafés, catering operations, food manufacturers, and food retailers operating under EU or UK food hygiene regulations — particularly teams that lack a dedicated compliance officer or food safety manager.",
  },
  {
    question: "Is PinkPepper just another ChatGPT wrapper?",
    answer:
      "No. PinkPepper uses a retrieval-augmented generation (RAG) system purpose-built for food safety compliance. Every response is grounded in a curated knowledge base covering 35+ EU and UK food safety regulations, FSA/FSS official guidance, best-practice SOPs, and certification standards including BRCGS, ISO 22000, SALSA, and SQF. It is not a general-purpose chatbot — it will not respond to questions outside its food safety scope.",
  },
  {
    question: "What regulations does PinkPepper cover?",
    answer:
      "PinkPepper's knowledge base covers 35+ EU and UK regulations, including: EC 178/2002 (General Food Law), EC 852/2004 and EC 853/2004 (food hygiene), EU 1169/2011 (allergen labelling, including Natasha's Law), EC 2073/2005 (microbiological criteria), EU 2023/915 (contaminant limits for heavy metals, mycotoxins, and process contaminants), EC 1935/2004 and EU 2025/351 (food contact materials), EU 2015/2283 (novel foods), EC 1829/2003 (GMOs), EU 2018/848 (organic production), and UK-retained equivalents post-Brexit. Coverage spans HACCP, allergen management, traceability, temperature control, pest control, microbiological testing, and more.",
  },
  {
    question: "Where does PinkPepper's regulation data come from, and how current is it?",
    answer:
      "Primary legislation is sourced directly from EUR-Lex CELLAR — the official open-data repository of the Publications Office of the European Union. PinkPepper automatically syncs with EUR-Lex on a monthly basis, using content hashing to detect amendments as soon as they are published, so the knowledge base always reflects the most recent consolidated versions. UK retained law equivalents and FSA/FSS official guidance documents are maintained separately. Amendment detection runs independently of EUR-Lex metadata timestamps, ensuring accuracy even when EUR-Lex does not update modification dates for consolidated texts.",
  },
  {
    question: "Can I rely on PinkPepper output for legal compliance?",
    answer:
      "PinkPepper outputs are grounded in authoritative regulation text and official guidance, but they do not constitute legal advice. Regulatory requirements vary by business type, jurisdiction, premises, and local enforcement practice. You must review all outputs against your specific operational context and local legal obligations. Where legal certainty is required, consult a qualified food safety professional or legal adviser. PinkPepper is a documentation tool — not a compliance guarantee.",
  },
  {
    question: "Who is responsible for final documents and decisions?",
    answer:
      "Your business retains full legal responsibility for all food safety documentation, decisions, and operational controls. PinkPepper accelerates the drafting process, but the final review, sign-off, verification, and implementation of all compliance documents must be carried out by accountable, competent personnel within your organisation. Generating a document in PinkPepper does not fulfil a legal obligation — acting on it does.",
  },
  {
    question: "Does PinkPepper replace a food safety consultant?",
    answer:
      "No. PinkPepper reduces the time spent on initial documentation drafts, but it is not a substitute for site-specific professional assessment, hands-on verification, or qualified food safety advice. Many businesses use PinkPepper alongside a consultant — preparing working drafts quickly on the platform, then having a professional review and validate the final outputs.",
  },
  {
    question: "Can I try PinkPepper before subscribing?",
    answer:
      "Yes. You can create an account and explore the platform before committing to a paid plan. Visit the pricing page for current plan details and trial options.",
  },
];

/** Curated subset shown on the homepage — focused on trust, scope, and accountability. */
export const homepageFaqs = faqs.filter((faq) =>
  [
    "Is PinkPepper just another ChatGPT wrapper?",
    "What regulations does PinkPepper cover?",
    "Where does PinkPepper's regulation data come from, and how current is it?",
    "Can I rely on PinkPepper output for legal compliance?",
    "Who is responsible for final documents and decisions?",
  ].includes(faq.question),
);

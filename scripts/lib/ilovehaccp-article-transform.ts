type SourceArticle = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image?: string;
  content: string;
  publishedAt: string;
};

type MigratedFrontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
  source: "ilovehaccp";
};

export type MigratedArticle = {
  frontmatter: MigratedFrontmatter;
  body: string;
  migrationFlags: string[];
};

const ENCODING_REPLACEMENTS: Array<[string, string]> = [
  ["\u00e2\u2030\u00a4", "\u2264"],
  ["\u00e2\u2030\u00a5", "\u2265"],
  ["\u00e2\u2020\u2019", "\u2192"],
  ["\u00e2\u20ac\u2122", "\u2019"],
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00c2", ""],
];

const SCOPE_REPLACEMENTS: Array<[RegExp, string]> = [
  [
    /The FDA also requires food establishments to implement a HACCP plan as part of their food safety regulations\./gi,
    "Food businesses should maintain HACCP-based controls and supporting records that reflect the regulatory requirements and guidance relevant to their market.",
  ],
  [
    /Similarly, the FDA recommends that foods be stored at temperatures below <strong>5°C<\/strong> or above <strong>60°C<\/strong> to prevent bacterial growth\./gi,
    "Food should be stored and handled within validated temperature controls that suit the product, process, and applicable legal guidance.",
  ],
  [
    /According to the FDA Food Code, cooked foods should be cooled from 57°C to 21°C within two hours and to 4°C or below within four hours\./gi,
    "Cooling controls should be validated against the product, process, and the guidance that applies in your market.",
  ],
  [/regulatory bodies such as the FDA and the Codex Alimentarius/gi, "relevant authorities and Codex Alimentarius guidance"],
  [/The FDA's Food Safety Modernization Act \(FSMA\) emphasizes the importance of preventive controls, which include identifying and correcting non-conformities\./gi, "Preventive control systems depend on identifying non-conformities quickly and correcting them before they create a wider food safety issue."],
  [/the requirements of regulatory agencies such as the FDA and Codex Alimentarius Commission/gi, "the requirements of the relevant competent authorities and Codex Alimentarius guidance"],
  [/The FDA and many international food safety standards recommend the implementation of HACCP principles to ensure a proactive approach to food safety\./gi, "HACCP principles are widely used across food safety standards to support a proactive approach to hazard control."],
  [/The FDA also mandates HACCP for certain segments of the food industry, such as juice and seafood processing\./gi, "Some sectors work under more specific HACCP requirements, but the core discipline is keeping the system practical, current, and usable in daily operations."],
  [/According to the FDA's guidelines under <strong>21 CFR 117<\/strong>, /gi, ""],
  [/According to the <strong>FDA's regulation 21 CFR 117<\/strong>, /gi, ""],
  [/regulatory frameworks such as <strong>21 CFR 117<\/strong> in the United States and <strong>EC 852\/2004<\/strong> in the European Union/gi, "frameworks such as <strong>EC 852/2004</strong> and related national guidance"],
  [/The FDA and other regulatory bodies recommend a multi-step approach that includes:/gi, "A practical multi-step approach often includes:"],
  [/including by regulatory bodies such as the FDA in the United States and the European Food Safety Authority \(EFSA\) in Europe/gi, "including by food businesses and regulators across multiple markets"],
  [/The FDA guidelines emphasize the importance of accurately determining CCPs based on the hazard analysis\./gi, "CCPs should be determined carefully from the hazard analysis so controls are focused where they matter most."],
  [/The HACCP regulation \(21 CFR Part 120\) by the FDA requires that all monitoring and corrective actions be documented\./gi, "Monitoring and corrective actions should be documented clearly so the HACCP system can be reviewed and verified."],
  [/The Codex Alimentarius Commission and the US Food and Drug Administration \(FDA\) recommend HACCP plans as a key component of a food safety management system\./gi, "Codex Alimentarius guidance and market-specific requirements both treat HACCP planning as a central part of food safety management."],
  [/The FDA recommends that CCPs be established for each hazard identified in the hazard analysis, and that control measures be implemented to ensure that each CCP is under control\./gi, "Each hazard analysis should lead to clear control measures, and every CCP should remain under control through defined monitoring and response."],
  [/The Codex Alimentarius, a collection of internationally recognized standards, and the FDA's Food Safety Modernization Act \(FSMA\) provide guidelines for food businesses to follow\./gi, "Codex Alimentarius guidance and applicable local rules give food businesses the framework they need to operate safely and consistently."],
  [/The FDA's Model Food Code provides guidelines for sanitation and hygiene practices, including the importance of separating raw and ready-to-eat foods, and the use of sanitizers and cleaning agents\./gi, "Sanitation and hygiene controls should cover raw and ready-to-eat separation, validated cleaning methods, and the correct use of sanitizers."],
  [/The FDA's FSMA requires food businesses to have a supplier verification program in place, which includes auditing and evaluating suppliers, and taking corrective actions when necessary\./gi, "Supplier verification should include suitable approval checks, ongoing review, and corrective action when suppliers fall short."],
  [/The FDA's Model Food Code provides guidelines for employee training, including the importance of training on food safety principles, and the use of training records to document employee knowledge\./gi, "Training should cover practical food safety responsibilities and leave a clear record that staff have been trained."],
  [/By following the guidelines and standards outlined in the Codex Alimentarius and the FDA's FSMA, /gi, "By following Codex guidance and the rules that apply in their market, "],
  [/<li>FDA's Food Safety Modernization Act \(FSMA\):[\s\S]*?<\/li>/gi, ""],
  [/<li>FDA's Model Food Code:[\s\S]*?<\/li>/gi, ""],
  [/Food and Drug Administration \(FDA\)/gi, "relevant authorities"],
  [/FDA Food Code/gi, "relevant food safety guidance"],
  [/\bU\.S\.\s*FDA\b/gi, "relevant authorities"],
  [/\bFDA\b/gi, "relevant authorities"],
  [/\bFSMA\b/gi, "applicable food safety requirements"],
  [/\b21 CFR(?: Part)? ?\d+(?:\.\d+)?\b/gi, "applicable local requirements"],
  [/United States/gi, "the relevant market"],
];

function normalizePublishedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
}

export function transformIloveHaccpArticle(article: SourceArticle): MigratedArticle {
  const migrationFlags: string[] = [];
  const pushFlag = (flag: string) => {
    if (!migrationFlags.includes(flag)) {
      migrationFlags.push(flag);
    }
  };

  let body = article.content.replace(/<!--\s*Written by Dr\. Margarida\s*-->/gi, "").trim();
  let excerpt = article.excerpt;

  if (body.includes("https://ilovehaccp.com/builder")) {
    body = body.replaceAll("https://ilovehaccp.com/builder", "/pricing");
    body = body.replaceAll("ilovehaccp.com/builder", "PinkPepper pricing");
    pushFlag("legacy_cta_rewritten");
  }

  if (body.includes('href="/builder"')) {
    body = body.replaceAll('href="/builder"', 'href="/pricing"');
    pushFlag("legacy_cta_rewritten");
  }

  if (body.includes("\\'")) {
    body = body.replaceAll("\\'", "'");
    pushFlag("escape_normalized");
  }

  const beforePromoCleanup = body;
  body = body.replace(
    /<h3>Further Reading &amp; Tools<\/h3>[\s\S]*$/i,
    "",
  );
  body = body.replace(
    /<p>For practical implementation, review[\s\S]*?<\/p>/gi,
    "",
  );
  body = body.replace(
    /<p>(?:Generate|Build|Create|Review)[\s\S]*?(?:PinkPepper pricing|<\/a>)[\s\S]*?<\/p>/gi,
    "",
  );
  body = body.replace(
    /<li>\s*<a href="\/pricing">(?:Build|Create|Generate|Review)[\s\S]*?<\/a>\s*<\/li>/gi,
    "",
  );
  body = body.replace(
    /<h4>What you'll learn<\/h4>\s*<ul>\s*<li>How this HACCP topic applies in real-world operations<\/li>\s*<li>Common hazards and practical controls to reduce risk<\/li>\s*<li>Records and monitoring that auditors expect to see<\/li>\s*<\/ul>/gi,
    "",
  );
  body = body.replace(/<ul>\s*<\/ul>/gi, "");

  if (body !== beforePromoCleanup) {
    pushFlag("promo_block_removed");
  }

  let encodingTouched = false;
  for (const [from, to] of ENCODING_REPLACEMENTS) {
    if (body.includes(from)) {
      body = body.replaceAll(from, to);
      encodingTouched = true;
    }
  }

  if (encodingTouched) {
    pushFlag("encoding_normalized");
  }

  const beforeScopeCleanup = body;
  for (const [pattern, replacement] of SCOPE_REPLACEMENTS) {
    body = body.replace(pattern, replacement);
  }

  if (body !== beforeScopeCleanup) {
    pushFlag("scope_reference_rewritten");
  }

  const beforeExcerptScopeCleanup = excerpt;
  for (const [pattern, replacement] of SCOPE_REPLACEMENTS) {
    excerpt = excerpt.replace(pattern, replacement);
  }

  if (excerpt !== beforeExcerptScopeCleanup) {
    pushFlag("scope_reference_rewritten");
  }

  return {
    frontmatter: {
      title: article.title,
      slug: article.slug,
      excerpt,
      category: article.category,
      publishedAt: normalizePublishedAt(article.publishedAt),
      image: article.image,
      source: "ilovehaccp",
    },
    body,
    migrationFlags,
  };
}

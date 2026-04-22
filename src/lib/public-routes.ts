import { publicLaunchLocales, publicRoutePaths, type PublicLocale } from "@/i18n/public";

type PublicMessages = Record<string, unknown>;
type PageMeta = { title: string; description: string };

export type PublicMessagesDictionary = {
  chrome: {
    nav: {
      resources: string;
      freeTemplates: string;
      articles: string;
      faqs: string;
      pricing: string;
      about: string;
      contact: string;
      login: string;
      getStarted: string;
    };
    footer: {
      brandBlurb: string;
      productHeading: string;
      resourcesHeading: string;
      legalHeading: string;
      createAccount: string;
      contactSupport: string;
      security: string;
      terms: string;
      privacy: string;
      cookies: string;
      dpa: string;
      acceptableUse: string;
      refund: string;
      rightsReserved: string;
    };
    localeSwitcher: {
      label: string;
      current: string;
    };
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroDescription: string;
    eurLexLabel: string;
    trustCards: {
      groundedTitle: string;
      groundedBody: string;
      timeSavedTitle: string;
      timeSavedBody: string;
      humanTitle: string;
      humanBody: string;
    };
    workflows: {
      eyebrow: string;
      title: string;
      body: string;
      answerTitle: string;
      answerBody: string;
      buildTitle: string;
      buildBody: string;
      reuseTitle: string;
      reuseBody: string;
      switchTitle: string;
      switchBody: string;
    };
    value: {
      eyebrow: string;
      title: string;
      body: string;
      consultantTitle: string;
      consultantSubtitle: string;
      consultantBody: string;
      timeSavedTitle: string;
      timeSavedSubtitle: string;
      timeSavedBody: string;
      savingsTitle: string;
      savingsSubtitle: string;
      savingsBody: string;
    };
    pricing: {
      title: string;
      body: string;
      fullPricingLabel: string;
      freeDescription: string;
      plusDescription: string;
      proDescription: string;
      monthLabel: string;
      monthVatLabel: string;
      freeFeatures: string[];
      plusFeatures: string[];
      proFeatures: string[];
      freeCta: string;
      plusCta: string;
      proCta: string;
      mostPopular: string;
    };
    library: {
      eyebrow: string;
      title: string;
      haccpLinkLabel: string;
      browseAllLabel: string;
    };
    specialists: {
      eyebrow: string;
      title: string;
      body: string;
      subBody: string;
      supportive: string;
      direct: string;
      methodical: string;
      mentor: string;
      reassuring: string;
      proBadge: string;
      leadAuditor: string;
      leadAuditorBody: string;
    };
    faq: {
      title: string;
      body: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
    cta: {
      title: string;
      body: string;
      button: string;
    };
  };
  pages: {
    home: PageMeta;
    pricing: PageMeta;
    about: PageMeta;
    articles: PageMeta;
    faqs: PageMeta;
    contact: PageMeta;
    features: {
      haccpPlanGenerator: PageMeta;
      allergenDocumentation: PageMeta;
      foodSafetySopGenerator: PageMeta;
    };
  };
};

export function isPublicLocale(value: string): value is PublicLocale {
  return publicLaunchLocales.includes(value as PublicLocale);
}

export function localizePublicPath(locale: PublicLocale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function getPublicPageHref(locale: PublicLocale, path: string) {
  return publicRoutePaths.includes(path as (typeof publicRoutePaths)[number])
    ? localizePublicPath(locale, path)
    : path;
}

export function switchPublicLocale(currentPath: string, locale: PublicLocale) {
  const segments = currentPath.split("/").filter(Boolean);
  const hasLocalePrefix = segments.length > 0 && isPublicLocale(segments[0] ?? "");
  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}` || "/"
    : currentPath || "/";

  return getPublicPageHref(locale, pathWithoutLocale);
}

function mergeMessages(base: PublicMessages, override: PublicMessages): PublicMessages {
  const merged: PublicMessages = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      merged[key] = mergeMessages(baseValue as PublicMessages, value as PublicMessages);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

export async function getPublicMessages(locale: PublicLocale): Promise<PublicMessagesDictionary> {
  const english = (await import("@/i18n/messages/public/en.json")).default as PublicMessagesDictionary;
  if (locale === "en") {
    return english;
  }

  const localized = (await import(`@/i18n/messages/public/${locale}.json`)).default as PublicMessages;
  return mergeMessages(english as PublicMessages, localized) as PublicMessagesDictionary;
}

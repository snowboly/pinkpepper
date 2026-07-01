import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("settings profile surface", () => {
  it("fetches profile identity, marketing preferences, and subscription timing", () => {
    const settingsPage = readPage("src/app/dashboard/settings/page.tsx");

    expect(settingsPage).toContain("first_name");
    expect(settingsPage).toContain("last_name");
    expect(settingsPage).toContain("company_name");
    expect(settingsPage).toContain("marketing_email_opt_in");
    expect(settingsPage).toContain("current_period_end");
  });

  it("renders profile fields and marketing preference controls", () => {
    const settingsForm = readPage("src/components/dashboard/SettingsForm.tsx");
    const englishMessages = readPage("src/i18n/messages/en.json");

    expect(settingsForm).toContain('t("firstName")');
    expect(settingsForm).toContain('t("lastName")');
    expect(settingsForm).toContain('t("companyName")');
    expect(settingsForm).toContain('t("marketingEmails")');
    expect(settingsForm).toContain('t("transactionalEmailsNotice")');
    expect(settingsForm).toContain('t("cancelAtPeriodEnd")');
    expect(englishMessages).toContain('"firstName": "First name"');
    expect(englishMessages).toContain('"lastName": "Surname"');
    expect(englishMessages).toContain('"companyName": "Company name (optional)"');
    expect(englishMessages).toContain('"marketingEmails": "Marketing emails"');
    expect(englishMessages).toContain('"marketingEmailsDescription": "I would like to receive occasional product updates, new document templates, and relevant offers from PinkPepper. I can unsubscribe at any time."');
    expect(englishMessages).toContain('"transactionalEmailsNotice":');
    expect(englishMessages).toContain('"cancelAtPeriodEnd":');
  });
});

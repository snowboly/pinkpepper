import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("settings billing surface", () => {
  it("shows explicit manage and cancel subscription actions in settings", () => {
    const settingsForm = readPage("src/components/dashboard/SettingsForm.tsx");

    expect(settingsForm).toContain("<ManageBillingButton />");
    expect(settingsForm).toContain('<ManageBillingButton variant="cancel" />');
    expect(settingsForm).toContain('variant?: "manage" | "cancel"');
    expect(settingsForm).toContain('isCancel ? t("cancelSubscription") : t("manageBilling")');
    expect(settingsForm).toContain('fetch("/api/billing/portal", { method: "POST" })');
  });

  it("ships cancel subscription copy across supported locales", () => {
    const localeFiles = [
      "src/i18n/messages/en.json",
      "src/i18n/messages/de.json",
      "src/i18n/messages/es.json",
      "src/i18n/messages/fr.json",
      "src/i18n/messages/it.json",
      "src/i18n/messages/pt.json",
    ];

    for (const file of localeFiles) {
      const content = readPage(file);
      expect(content).toContain('"cancelSubscription":');
    }
  });
});

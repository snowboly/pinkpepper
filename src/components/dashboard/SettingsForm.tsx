"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { locales, type Locale } from "@/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  pt: "Português",
};

type SettingsFormProps = {
  email: string;
  tier: string;
  isAdmin: boolean;
  chatLanguage: string;
  usage: number;
  usageLimit: number | null;
  expertUsage: number;
  expertUsageLimit: number | null;
  imageUsage: number;
  imageUsageLimit: number | null;
};

export default function SettingsForm({
  email,
  tier,
  isAdmin,
  chatLanguage: initialChatLanguage,
  usage,
  usageLimit,
  expertUsage,
  expertUsageLimit,
  imageUsage,
  imageUsageLimit,
}: SettingsFormProps) {
  const t = useTranslations("settings");
  const currentLocale = useLocale() as Locale;
  const [chatLanguage, setChatLanguage] = useState(initialChatLanguage);
  const [chatLangSaving, setChatLangSaving] = useState(false);
  const [chatLangMsg, setChatLangMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const supabase = createClient();

  const tierColour =
    isAdmin
      ? "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]"
      : tier === "pro"
      ? "border-[#059669] bg-[#ECFDF5] text-[#047857]"
      : tier === "plus"
      ? "border-[#D97706] bg-[#FFFBEB] text-[#92400E]"
      : "border-[#E2E8F0] bg-white text-[#64748B]";

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: t("passwordTooShort") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: t("passwordsDoNotMatch") });
      return;
    }

    setPasswordLoading(true);
    try {
      // Re-authenticate with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        setPasswordMsg({ type: "error", text: t("currentPasswordIncorrect") });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg({ type: "error", text: error.message });
        return;
      }
      setPasswordMsg({ type: "success", text: t("passwordUpdated") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg({ type: "error", text: t("unexpectedError") });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSignOut() {
    setSignOutLoading(true);
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setDeleteError(data.error ?? t("unexpectedError"));
        return;
      }
      window.location.href = "/";
    } catch {
      setDeleteError(t("unexpectedError"));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">{t("profile")}</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#64748B] mb-1">{t("emailAddress")}</p>
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#334155]">{email}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1">{t("plan")}</p>
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${tierColour}`}>
              {isAdmin ? "Admin" : tier}
            </span>
          </div>
        </div>
      </div>

      {/* Usage card */}
      {!isAdmin && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-1">{t("usage")}</h2>
          <p className="text-xs text-[#94A3B8] mb-4">Resets daily · reviews reset monthly</p>
          <div className="space-y-4">
            <UsageBar
              label={t("dailyMessages")}
              used={usage}
              limit={usageLimit}
              color="#E11D48"
            />
            <UsageBar
              label={t("dailyExpertAnswers")}
              used={expertUsage}
              limit={expertUsageLimit}
              color="#2563EB"
            />
            <UsageBar
              label={t("dailyImageAnalyses")}
              used={imageUsage}
              limit={imageUsageLimit}
              color="#0F766E"
            />
          </div>
        </div>
      )}

      {/* Language card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">{t("language")}</h2>
        <p className="text-xs text-[#64748B] mb-3">{t("languageDescription")}</p>
        <select
          value={currentLocale}
          onChange={async (e) => {
            const newLocale = e.target.value as Locale;
            document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
            try {
              await supabase.from("profiles").update({ locale: newLocale } as Record<string, string>).eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
            } catch {
              // Non-blocking — cookie is the primary source
            }
            window.location.reload();
          }}
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {LOCALE_LABELS[loc]}
            </option>
          ))}
        </select>
      </div>

      {/* Chatbot language card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-1">{t("chatbotLanguage")}</h2>
        <p className="text-xs text-[#64748B] mb-3">{t("chatbotLanguageDescription")}</p>
        <div className="flex items-center gap-3">
          <select
            value={chatLanguage}
            onChange={(e) => setChatLanguage(e.target.value)}
            className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
          >
            {locales.map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_LABELS[loc]}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              setChatLangSaving(true);
              setChatLangMsg(null);
              try {
                const { data: { user } } = await supabase.auth.getUser();
                const { error } = await supabase
                  .from("profiles")
                  .update({ chat_language: chatLanguage } as Record<string, string>)
                  .eq("id", user?.id ?? "");
                if (error) throw error;
                setChatLangMsg({ type: "success", text: t("chatbotLanguageSaved") });
              } catch {
                setChatLangMsg({ type: "error", text: t("unexpectedError") });
              } finally {
                setChatLangSaving(false);
              }
            }}
            disabled={chatLangSaving}
            className="rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {chatLangSaving ? t("saving") : t("save")}
          </button>
        </div>
        {chatLangMsg && (
          <p className={`mt-2 text-xs ${chatLangMsg.type === "success" ? "text-[#059669]" : "text-[#E11D48]"}`}>
            {chatLangMsg.text}
          </p>
        )}
      </div>

      {/* Change password card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">{t("changePassword")}</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-[#64748B] mb-1" htmlFor="current-password">
              {t("currentPassword")}
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              placeholder={t("passwordPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1" htmlFor="new-password">
              {t("newPassword")}
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              placeholder={t("atLeast8Chars")}
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1" htmlFor="confirm-password">
              {t("confirmNewPassword")}
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              placeholder={t("passwordPlaceholder")}
            />
          </div>

          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.type === "success" ? "text-[#059669]" : "text-[#E11D48]"}`}>
              {passwordMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {passwordLoading ? t("updating") : t("updatePassword")}
          </button>
        </form>
      </div>

      {/* Billing card */}
      {!isAdmin && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">{t("billing")}</h2>
          <p className="text-xs text-[#64748B] mb-3">
            {t("billingDescription")}
          </p>
          <div className="flex gap-2">
            <a
              href="/pricing"
              className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
            >
              {t("viewPlans")}
            </a>
            {tier !== "free" && (
              <ManageBillingButton />
            )}
          </div>
        </div>
      )}

      {/* Account / Danger zone */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">{t("account")}</h2>
        <button
          onClick={handleSignOut}
          disabled={signOutLoading}
          className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] disabled:opacity-50 transition-colors"
        >
          {signOutLoading ? t("signingOut") : t("signOut")}
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-[#FCA5A5] bg-[#FFF5F5] p-6">
        <h2 className="text-sm font-semibold text-[#B91C1C] mb-1">{t("dangerZone")}</h2>
        <p className="text-xs text-[#EF4444] mb-4">{t("deleteAccountDescription")}</p>
        <button
          onClick={() => { setDeleteError(null); setShowDeleteConfirm(true); }}
          className="rounded-xl border border-[#EF4444] bg-white px-4 py-2 text-sm font-medium text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
        >
          {t("deleteAccount")}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-[#0F172A] mb-2">{t("deleteAccountConfirmTitle")}</h3>
            <p className="text-sm text-[#64748B] mb-5">{t("deleteAccountConfirmBody")}</p>
            {deleteError && (
              <p className="mb-3 text-xs text-[#E11D48]">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB] disabled:opacity-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? t("deleting") : t("deleteAccountConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({ label, used, limit, color }: { label: string; used: number; limit: number | null; color: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <span>{label}</span>
        <span className="font-medium text-[#0F172A]">{used} / {limit ?? "∞"}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ManageBillingButton() {
  const t = useTranslations("settings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? t("unableToOpenPortal"));
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        className="rounded-xl bg-[#0F172A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E293B] disabled:opacity-40 transition-colors"
      >
        {loading ? t("opening") : t("manageBilling")}
      </button>
      {error && <p className="mt-1 text-xs text-[#E11D48]">{error}</p>}
    </div>
  );
}

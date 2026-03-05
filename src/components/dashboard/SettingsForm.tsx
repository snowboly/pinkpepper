"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type SettingsFormProps = {
  email: string;
  tier: string;
  isAdmin: boolean;
};

export default function SettingsForm({ email, tier, isAdmin }: SettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

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
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
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
        setPasswordMsg({ type: "error", text: "Current password is incorrect." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg({ type: "error", text: error.message });
        return;
      }
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSignOut() {
    setSignOutLoading(true);
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#64748B] mb-1">Email address</p>
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#334155]">{email}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1">Plan</p>
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${tierColour}`}>
              {isAdmin ? "Admin" : tier}
            </span>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-[#64748B] mb-1" htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-colors"
              placeholder="••••••••"
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
            {passwordLoading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>

      {/* Billing card */}
      {!isAdmin && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Billing</h2>
          <p className="text-xs text-[#64748B] mb-3">
            Manage your subscription, update payment methods, or cancel.
          </p>
          <div className="flex gap-2">
            <a
              href="/pricing"
              className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB] transition-colors"
            >
              View plans
            </a>
            {tier !== "free" && (
              <ManageBillingButton />
            )}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Account</h2>
        <button
          onClick={handleSignOut}
          disabled={signOutLoading}
          className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] disabled:opacity-50 transition-colors"
        >
          {signOutLoading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}

function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error.");
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
        {loading ? "Opening..." : "Manage billing"}
      </button>
      {error && <p className="mt-1 text-xs text-[#E11D48]">{error}</p>}
    </div>
  );
}

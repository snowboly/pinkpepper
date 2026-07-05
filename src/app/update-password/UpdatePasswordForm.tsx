"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { validatePassword } from "@/lib/password";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage("Password updated. You can now use your new password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-2 text-sm">{message}</p>}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#2B2B2B]">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </>
  );
}

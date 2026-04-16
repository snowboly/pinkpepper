import type { ChangeEventHandler, MouseEventHandler } from "react";

export function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export function getLoginFlashErrorMessage(error: string | null): string | null {
  if (!error) return null;

  if (error === "cross_device_link") {
    return "Please open the confirmation link on the same device and browser where you signed up.";
  }

  if (error === "invalid_or_expired_link") {
    return "Your email code or login link is invalid or expired. Request a new code below.";
  }

  return error;
}

type LoginEmailCodePanelProps = {
  email: string;
  code: string;
  codeSent: boolean;
  codeLoading: boolean;
  verifyLoading: boolean;
  resendLoading: boolean;
  onCodeChange?: ChangeEventHandler<HTMLInputElement>;
  onSendCode?: MouseEventHandler<HTMLButtonElement>;
  onVerifyCode?: MouseEventHandler<HTMLButtonElement>;
  onResendCode?: MouseEventHandler<HTMLButtonElement>;
  onUseDifferentEmail?: MouseEventHandler<HTMLButtonElement>;
};

export function LoginEmailCodePanel({
  email,
  code,
  codeSent,
  codeLoading,
  verifyLoading,
  resendLoading,
  onCodeChange,
  onSendCode,
  onVerifyCode,
  onResendCode,
  onUseDifferentEmail,
}: LoginEmailCodePanelProps) {
  if (!codeSent) {
    return (
      <button
        type="button"
        disabled={codeLoading}
        onClick={onSendCode}
        className="w-full rounded-xl border border-[#E8DADA] bg-[#FAF6F5] py-3 text-sm font-semibold text-[#2B2B2B] transition-colors hover:bg-[#F2E8E8] disabled:opacity-70"
      >
        {codeLoading ? "Sending code..." : "Send email code"}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#E8DADA] bg-[#FAF6F5] px-3 py-3">
      <p className="text-center text-sm text-[#2B2B2B]">
        Enter the code we sent to <strong>{email}</strong>.
      </p>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={onCodeChange}
        readOnly={!onCodeChange}
        className="w-full rounded-xl border border-[#E8DADA] bg-white px-3 py-2.5 outline-none ring-[#D96C6C]/20 focus:ring-4"
        placeholder="Enter code"
      />
      <button
        type="button"
        disabled={verifyLoading}
        onClick={onVerifyCode}
        className="w-full rounded-xl bg-[#D96C6C] py-3 font-bold text-white transition-colors hover:bg-[#C95A5A] disabled:opacity-70"
      >
        {verifyLoading ? "Verifying..." : "Verify code"}
      </button>
      <div className="flex items-center justify-between text-sm text-[#6B6B6B]">
        <button
          type="button"
          disabled={resendLoading}
          onClick={onResendCode}
          className="underline disabled:opacity-70"
        >
          {resendLoading ? "Resending..." : "Resend code"}
        </button>
        <button
          type="button"
          onClick={onUseDifferentEmail}
          className="underline"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}

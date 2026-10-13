"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  role: "customer" | "admin";
  loginHref: string;
  backHref: string;
  backLabel: string;
};

function ResetForm({ role, loginHref, backHref, backLabel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(searchParams.get("devOtp"));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      setError("Missing email. Start again from Forgot password.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const otp = String(form.get("otp") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, otp, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not reset the password.");
      return;
    }
    router.push(`${loginHref}?reset=1`);
  }

  async function resend() {
    if (!email) return;
    setResending(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setResending(false);
    if (!res.ok) {
      setError(data.error || "Could not resend");
      return;
    }
    if (data.devOtp) setDevOtp(data.devOtp);
    setMessage(data.message || "Code sent.");
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Reset password</h1>
      <p className="lede">
        Enter the 6-digit code sent to {email || "your email"}, then choose a new password.
      </p>

      {devOtp ? (
        <p className="mt-4 border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink-muted)]">
          Email is not configured. Your code is{" "}
          <span className="text-[var(--ink)]">{devOtp}</span>
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="label">
          Reset code
          <input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="000000"
            className="field tracking-[0.2em]"
          />
        </label>
        <label className="label">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="field"
          />
        </label>
        <label className="label">
          Confirm password
          <input
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="field"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--ink-muted)]">{message}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>

      <button
        type="button"
        onClick={resend}
        disabled={resending || !email}
        className="mt-3 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>

      <p className="mt-4 text-sm">
        <Link href={backHref} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
          {backLabel}
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm(props: Props) {
  return (
    <Suspense>
      <ResetForm {...props} />
    </Suspense>
  );
}

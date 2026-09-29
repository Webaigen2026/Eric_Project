"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(
    searchParams.get("devOtp")
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      setError("Missing email. Start again from registration.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const otp = String(form.get("otp") || "").trim();

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Verification failed");
      setLoading(false);
      return;
    }

    const pendingPassword = sessionStorage.getItem("pendingPassword");
    if (pendingPassword) {
      const signInRes = await signIn("credentials", {
        email,
        password: pendingPassword,
        role: "customer",
        redirect: false,
      });
      sessionStorage.removeItem("pendingPassword");
      setLoading(false);
      if (signInRes?.error) {
        setMessage("Email verified. Please sign in.");
        router.push("/login");
        return;
      }
      router.push("/account");
      router.refresh();
      return;
    }

    setLoading(false);
    setMessage("Email verified. Please sign in.");
    router.push("/login");
  }

  async function resend() {
    if (!email) return;
    setResending(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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
      <h1 className="page-title">Verify your email</h1>
      <p className="lede">
        Enter the 6-digit code sent to {email || "your email"}.
      </p>

      {devOtp ? (
        <p className="mt-4 border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink-muted)]">
          Email is not configured. Your code is{" "}
          <span className="text-[var(--ink)]">{devOtp}</span>
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="label">
          Verification code
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
        {error ? <p className="form-error">{error}</p> : null}
        {message ? (
          <p className="text-sm text-[var(--ink-muted)]">{message}</p>
        ) : null}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Verifying…" : "Verify email"}
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
        <Link href="/register" className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
          Back to registration
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}

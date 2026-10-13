"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  role: "customer" | "admin";
  resetPath: string;
  backHref: string;
  backLabel: string;
  title?: string;
  lede?: string;
  showStoreLink?: boolean;
};

export function ForgotPasswordForm({
  role,
  resetPath,
  backHref,
  backLabel,
  title = "Forgot password",
  lede = "Enter the email on your account. We will send a 6-digit code.",
  showStoreLink = false,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") || "").trim();

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not send a reset code.");
      return;
    }

    const params = new URLSearchParams({ email });
    if (data.devOtp) params.set("devOtp", data.devOtp);
    router.push(`${resetPath}?${params.toString()}`);
  }

  return (
    <div className="page page-narrow">
      {showStoreLink ? (
        <Link href="/" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
          Back to store
        </Link>
      ) : null}
      <h1 className={showStoreLink ? "page-title mt-6" : "page-title"}>{title}</h1>
      <p className="lede">{lede}</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="label">
          Email
          <input name="email" type="email" required className="field" />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Sending…" : "Send reset code"}
        </button>
      </form>
      <p className="mt-5 text-sm">
        <Link href={backHref} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
          {backLabel}
        </Link>
      </p>
    </div>
  );
}

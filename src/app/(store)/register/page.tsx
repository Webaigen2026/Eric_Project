"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create account");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("pendingPassword", payload.password);
    const params = new URLSearchParams({ email: payload.email });
    if (data.devOtp) params.set("devOtp", data.devOtp);
    router.push(`/verify-email?${params.toString()}`);
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Create account</h1>
      <p className="lede">
        We&apos;ll email you a code to verify your address, then use your name
        and phone at pickup.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="label">
          Full name
          <input name="name" required className="field" />
        </label>
        <label className="label">
          Phone
          <input name="phone" type="tel" required className="field" />
        </label>
        <label className="label">
          Email
          <input name="email" type="email" required className="field" />
        </label>
        <label className="label">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="field"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Sending code…" : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-sm text-[var(--ink-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--ink)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

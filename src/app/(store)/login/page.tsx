"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const checkRes = await fetch("/api/auth/login-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const check = await checkRes.json();
    if (check.status === "unverified") {
      sessionStorage.setItem("pendingPassword", password);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      return;
    }
    if (check.status !== "ok") {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      role: "customer",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Sign in</h1>
      <p className="lede">
        Sign in so we know who you are when you pick up your reservation.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="label">
          Email
          <input name="email" type="email" required className="field" />
        </label>
        <label className="label">
          Password
          <input name="password" type="password" required className="field" />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-sm text-[var(--ink-muted)]">
        New here?{" "}
        <Link href="/register" className="text-[var(--ink)] hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Store staff?{" "}
        <Link href="/admin/login" className="text-[var(--ink)] hover:underline">
          Staff login
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <CustomerLoginForm />
    </Suspense>
  );
}
